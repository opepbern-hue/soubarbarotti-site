"""
VALIDAR O INSTAGRAM (primeira coisa que acontece com cada negócio)

Usa a Business Discovery, da API oficial da Meta: lê o perfil público de contas
comerciais ou de criador. Nada de scraping, nada de login falso.

O perfil é aprovado se: existe, é comercial, postou nos últimos IG_MAX_DIAS_SEM_POSTAR dias
e tem seguidores dentro da faixa do config. Os números viram munição para a IA.
"""
import re
from datetime import datetime, timezone

import requests

import config


class LimiteInstagram(Exception):
    """A Meta pediu para esperar. A rotina para de validar e avisa."""


class TokenInvalido(Exception):
    """Token vencido ou sem permissão. Rode python configurar_instagram.py de novo."""


CAMPOS = (
    "business_discovery.username({u}){{username,name,biography,website,followers_count,"
    "follows_count,media_count,profile_picture_url,"
    "media.limit(12){{caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink}}}}"
)

RE_WA = re.compile(r"(?:wa\.me/|api\.whatsapp\.com/send/?\?phone=)(\d{10,13})")
RE_TEL = re.compile(r"\(?\b(\d{2})\)?\s?9\s?\d{4}[-\s]?\d{4}\b")


def conectado() -> bool:
    return bool(config.META_TOKEN and config.IG_USER_ID)


def dias_para_expirar() -> int | None:
    if not config.TOKEN_EXPIRA:
        return None
    try:
        return (datetime.fromisoformat(config.TOKEN_EXPIRA).date() - datetime.now().date()).days
    except ValueError:
        return None


def _consultar(handle: str) -> dict:
    url = f"https://graph.facebook.com/{config.GRAPH_VERSION}/{config.IG_USER_ID}"
    r = requests.get(url, params={"fields": CAMPOS.format(u=handle), "access_token": config.META_TOKEN}, timeout=25)
    j = r.json()
    if "error" in j:
        e = j["error"]
        codigo = e.get("code")
        if codigo in (4, 17, 32, 613) or e.get("error_subcode") in (2207051,):
            raise LimiteInstagram(e.get("message", "limite de chamadas"))
        if codigo == 190 or codigo == 10 or codigo == 200:
            raise TokenInvalido(e.get("message", "token inválido"))
        return {}  # 100/110: perfil não existe, é pessoal ou privado
    return j.get("business_discovery") or {}


def _metricas(bd: dict) -> dict:
    midias = (bd.get("media") or {}).get("data") or []
    agora = datetime.now(timezone.utc)
    datas = []
    for m in midias:
        try:
            datas.append(datetime.strptime(m["timestamp"], "%Y-%m-%dT%H:%M:%S%z"))
        except (KeyError, ValueError):
            pass
    ultimo = min(((agora - d).days for d in datas), default=None)
    ult_30 = sum(1 for d in datas if (agora - d).days <= 30)
    videos = sum(1 for m in midias if m.get("media_type") == "VIDEO" or m.get("media_product_type") == "REELS")
    seguidores = bd.get("followers_count") or 0
    interacoes = [(m.get("like_count") or 0) + (m.get("comments_count") or 0) for m in midias
                  if m.get("like_count") is not None]
    engaj = round(100 * (sum(interacoes) / len(interacoes)) / seguidores, 2) if interacoes and seguidores else None
    bio = bd.get("biography") or ""
    wa = RE_WA.search(bio + " " + (bd.get("website") or ""))
    tel = RE_TEL.search(bio)
    return {
        "verificado": True,
        "username": bd.get("username"),
        "nome": bd.get("name") or "",
        "bio": bio[:300],
        "site_bio": bd.get("website") or "",
        "foto": bd.get("profile_picture_url") or "",
        "seguidores": seguidores,
        "posts": bd.get("media_count") or 0,
        "dias_ultimo_post": ultimo,
        "posts_30d": ult_30,
        "pct_video": round(100 * videos / len(midias)) if midias else 0,
        "engajamento": engaj,
        "legendas_recentes": [(m.get("caption") or "")[:180] for m in midias[:4] if m.get("caption")],
        "post_recente": midias[0].get("permalink") if midias else "",
        "whatsapp_bio": wa.group(1) if wa else (re.sub(r"\D", "", tel.group(0)) if tel else ""),
    }


def validar(handle: str) -> dict:
    """
    Devolve {"ok": True/False/None, "motivo": str, ...métricas}.
    ok=None significa "não deu para validar automaticamente" (Instagram não conectado):
    o lead aparece no painel pedindo a sua conferência.
    """
    if not handle:
        return {"ok": False, "motivo": "sem Instagram encontrado"}
    if not conectado():
        return {"ok": None, "verificado": False, "username": handle, "motivo": "conferir à mão"}

    bd = _consultar(handle)
    if not bd:
        return {"ok": False, "verificado": True, "username": handle,
                "motivo": "perfil não encontrado, pessoal ou privado"}
    m = _metricas(bd)
    if m["dias_ultimo_post"] is None:
        return {**m, "ok": False, "motivo": "perfil sem posts"}
    if m["dias_ultimo_post"] > config.IG_MAX_DIAS_SEM_POSTAR:
        return {**m, "ok": False, "motivo": f"parado há {m['dias_ultimo_post']} dias"}
    if m["seguidores"] < config.IG_MIN_SEGUIDORES:
        return {**m, "ok": False, "motivo": f"só {m['seguidores']} seguidores"}
    if m["seguidores"] > config.IG_MAX_SEGUIDORES:
        return {**m, "ok": False, "motivo": "conta grande demais (provável agência)"}
    return {**m, "ok": True, "motivo": "perfil ativo"}
