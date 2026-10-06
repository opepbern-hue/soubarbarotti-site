"""
ENRIQUECER: abre só a página inicial pública do site e procura sinais de compra e o @ do Instagram.
Sem scraping de Instagram nem do Maps.
"""
import re
from urllib.parse import quote_plus, urlparse

import requests

import config

UA = {"User-Agent": "Mozilla/5.0 (compatible; pesquisa-comercial/1.0)"}
IG_IGNORAR = {"p", "reel", "reels", "explore", "stories", "tv", "accounts", "sharer", "share", "direct"}
RE_IG = re.compile(r"instagram\.com/([A-Za-z0-9_.]{2,30})", re.I)
RE_EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
RE_WA = re.compile(r"(?:wa\.me/|api\.whatsapp\.com/send/?\?phone=)(\d{10,13})", re.I)
EMAIL_LIXO = ("sentry", "wixpress", "example", ".png", ".jpg", ".webp", "@2x", "domain.com")
GENERICOS = {"instagram.com", "facebook.com", "linktr.ee", "wa.me", "api.whatsapp.com",
             "linkin.bio", "beacons.ai", "bio.link", "sites.google.com", "google.com"}


def dominio(url: str) -> str:
    try:
        d = urlparse(url or "").netloc.lower()
        return d[4:] if d.startswith("www.") else d
    except ValueError:
        return ""


def limpar_handle(h: str) -> str:
    h = (h or "").strip().strip("@./").lower().split("?")[0].split("/")[0]
    return "" if h in IG_IGNORAR else h


def _primeiro(regex, html, filtro=lambda x: True):
    for m in regex.findall(html):
        if filtro(m):
            return m
    return ""


def analisar_site(url: str) -> dict:
    try:
        r = requests.get(url, headers=UA, timeout=config.TIMEOUT_SITE, allow_redirects=True)
        if r.status_code >= 400:
            return {"site_ok": False}
        html = r.text[:600_000]
    except requests.RequestException:
        return {"site_ok": False}
    baixo = html.lower()
    titulo = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    desc = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', html, re.I | re.S)
    return {
        "site_ok": True,
        "titulo_site": re.sub(r"\s+", " ", titulo.group(1)).strip()[:150] if titulo else "",
        "descricao_site": desc.group(1).strip()[:300] if desc else "",
        "instagram": limpar_handle(_primeiro(RE_IG, html, lambda h: limpar_handle(h) != "")),
        "email": _primeiro(RE_EMAIL, html, lambda e: not any(x in e.lower() for x in EMAIL_LIXO)),
        "whatsapp_site": _primeiro(RE_WA, html),
        "tem_pixel_meta": "fbq(" in baixo or "connect.facebook.net" in baixo,
        "tem_google_ads": "googleadservices" in baixo or "'aw-" in baixo or '"aw-' in baixo,
        "tem_video_site": any(x in baixo for x in ("<video", "youtube.com/embed", "player.vimeo", "youtu.be/")),
    }


def numero_whatsapp(n: dict) -> tuple[str, bool]:
    """(número 55DDDNNNNNNNNN, parece celular). Prioriza o WhatsApp publicado pela empresa."""
    for fonte in (n.get("whatsapp_bio"), n.get("whatsapp_site")):
        d = re.sub(r"\D", "", fonte or "")
        if d:
            return (d if d.startswith("55") else "55" + d), True
    d = re.sub(r"\D", "", n.get("telefone_intl") or n.get("telefone") or "")
    if not d:
        return "", False
    d = d if d.startswith("55") else "55" + d
    return d, len(d) == 13 and d[4] == "9"


def enriquecer(n: dict) -> dict:
    site = n.get("site", "")
    dom = dominio(site)
    if dom == "instagram.com":
        n["instagram"] = limpar_handle(urlparse(site).path)
        n["site_ok"] = False
    elif site and dom not in GENERICOS:
        n.update(analisar_site(site))
    else:
        n["site_ok"] = False
    n["whatsapp"], n["whatsapp_provavel"] = numero_whatsapp(n)
    nome = quote_plus(n["nome"])
    n["link_anuncios"] = ("https://www.facebook.com/ads/library/?active_status=active&ad_type=all"
                          f"&country=BR&q={nome}")
    return n


def chaves(n: dict) -> list[str]:
    out = []
    if dominio(n.get("site")) not in GENERICOS | {""}:
        out.append("d:" + dominio(n["site"]))
    if n.get("instagram"):
        out.append("ig:" + n["instagram"])
    if n.get("whatsapp"):
        out.append("t:" + n["whatsapp"])
    return out


def filtro(n: dict) -> str:
    """Devolve '' se passou, ou o motivo do corte."""
    if n.get("status") not in ("", "OPERATIONAL"):
        return "fechado ou temporariamente fechado"
    if (n.get("avaliacoes") or 0) < config.FILTRO_MIN_AVALIACOES:
        return f"menos de {config.FILTRO_MIN_AVALIACOES} avaliações no Google"
    if (n.get("nota_google") or 0) < config.FILTRO_MIN_NOTA_GOOGLE:
        return f"nota no Google abaixo de {config.FILTRO_MIN_NOTA_GOOGLE}"
    return ""


def prioridade(n: dict, camada: int) -> float:
    """Quem mostra sinal de verba e está mais perto vem primeiro na fila."""
    p = 0.0
    p += 40 if (n.get("tem_pixel_meta") or n.get("tem_google_ads")) else 0
    p += 15 if not n.get("tem_video_site") else 0
    p += min((n.get("avaliacoes") or 0) / 20, 25)
    p += 20 - camada * 7
    return round(p, 1)
