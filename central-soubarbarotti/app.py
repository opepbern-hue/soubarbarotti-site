"""
Central de Prospecção do @soubarbarotti

    python app.py

Abre sozinho no navegador em http://localhost:8765. Roda só no seu computador.
"""
import csv
import io
import json
import os
import re
import sqlite3
import webbrowser
from datetime import date, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

import anthropic

import assistente
import banco
import config
import instagram
import proposta
import rotina

WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web", "index.html")
ETAPAS = ["novo", "chamado", "respondeu", "call", "proposta", "fechado", "perdido"]
NOMES_ETAPA = {"novo": "Para chamar", "chamado": "Chamado", "respondeu": "Respondeu", "call": "Call marcada",
               "proposta": "Proposta enviada", "fechado": "Fechado", "perdido": "Perdido"}
ENVIOS = {"abordagem": "Primeira mensagem", "fu1": "Follow-up 1", "fu2": "Follow-up 2", "despedida": "Despedida"}


def _lead_publico(l: dict) -> dict:
    n = l["dados"]
    ig = n.get("ig") or {}
    return {
        "id": l["id"], "etapa": l["etapa"], "dia": l["dia"], "crm": l["crm"],
        "nome": n.get("nome"), "nicho": n.get("nicho"), "cidade": (n.get("cidade_busca") or "").rsplit(" ", 1)[0],
        "endereco": n.get("endereco"), "site": n.get("site"), "maps": n.get("maps"), "email": n.get("email"),
        "whatsapp": n.get("whatsapp"), "whatsapp_provavel": n.get("whatsapp_provavel"),
        "anuncios": n.get("link_anuncios"), "nota_google": n.get("nota_google"), "avaliacoes": n.get("avaliacoes"),
        "tem_pixel": bool(n.get("tem_pixel_meta") or n.get("tem_google_ads")),
        "ig": {k: ig.get(k) for k in ("ok", "verificado", "conferido", "username", "nome", "bio", "foto",
                                      "seguidores", "posts", "dias_ultimo_post", "posts_30d", "pct_video",
                                      "engajamento", "post_recente", "motivo")},
        "triagem": n.get("triagem") or {}, "ia": n.get("ia") or {},
        "tem_notas": bool(l["crm"].get("notas")),
    }


def _estado() -> dict:
    hoje = date.today().isoformat()
    return {
        "nome": config.NOME, "nome_completo": config.NOME_COMPLETO, "instagram": config.INSTAGRAM,
        "site": config.SITE, "hoje": hoje, "leads_por_dia": config.LEADS_POR_DIA,
        "ig_conectado": instagram.conectado(), "ig_dias_expirar": instagram.dias_para_expirar(),
        "places_ok": bool(config.GOOGLE_PLACES_API_KEY), "ia_ok": bool(config.ANTHROPIC_API_KEY),
        "fila": banco.tamanho_fila(), "contagem": banco.contagem_status(),
        "leads_hoje": banco.leads_do_dia(hoje), "dias_trabalhados": banco.dias_trabalhados(),
        "nichos": config.NOME_NICHO, "etapas": [{"id": e, "nome": NOMES_ETAPA[e]} for e in ETAPAS],
        "rotina": rotina.publico(),
    }


def _atualizar_lead(id_: str, corpo: dict) -> dict:
    l = banco.pegar(id_)
    if not l or l["status"] != "lead":
        raise KeyError("lead não encontrado")
    crm, dados, campos = l["crm"], l["dados"], {}
    crm.setdefault("historico", [])
    crm.setdefault("fu", [])
    crm.setdefault("msg", {})
    hoje = date.today().isoformat()

    def hist(texto):
        crm["historico"].append({"data": banco.agora(), "texto": texto})

    if corpo.get("etapa") in ETAPAS and corpo["etapa"] != l["etapa"]:
        campos["etapa"] = corpo["etapa"]
        hist(f"Movido para {NOMES_ETAPA[corpo['etapa']]}")
        if corpo["etapa"] == "chamado" and not crm.get("data_contato"):
            crm["data_contato"] = hoje
    if "enviado" in corpo:
        tipo, canal = corpo["enviado"].get("tipo"), corpo["enviado"].get("canal", "")
        if tipo == "abordagem":
            crm["data_contato"], crm["canal"] = hoje, canal
            if l["etapa"] == "novo":
                campos["etapa"] = "chamado"
        elif tipo in ENVIOS and tipo not in crm["fu"]:
            crm["fu"].append(tipo)
        hist(f"{ENVIOS.get(tipo, 'Mensagem')} enviada" + (f" pelo {canal}" if canal else ""))
    for k in ("notas", "valor", "proximo_passo", "teaser"):
        if k in corpo:
            crm[k] = corpo[k]
            if k == "teaser" and corpo[k]:
                hist("Teaser pronto")
    if isinstance(corpo.get("msg"), dict):
        crm["msg"].update({k: str(v)[:2000] for k, v in corpo["msg"].items()})
    if "ig_conferido" in corpo:
        ig = dados.setdefault("ig", {})
        if corpo["ig_conferido"]:
            ig.update(ok=True, conferido=True)
            hist("Instagram conferido: ativo")
            campos["dados"] = dados
        else:
            campos.update(status="descartado", motivo="Instagram conferido à mão: inativo")
    if corpo.get("descartar"):
        campos.update(status="descartado", motivo=f"descartado por você: {corpo['descartar']}")
    campos["crm"] = crm
    banco.atualizar(id_, **campos)
    novo = banco.pegar(id_)
    return _lead_publico(novo) if novo["status"] == "lead" else {"id": id_, "removido": True}


def _csv() -> bytes:
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=";")
    w.writerow(["dia", "negocio", "nicho", "cidade", "etapa", "nota", "instagram", "seguidores",
                "whatsapp", "email", "site", "data_contato", "valor", "notas"])
    for l in map(_lead_publico, banco.leads()):
        w.writerow([l["dia"], l["nome"], config.NOME_NICHO.get(l["nicho"], l["nicho"]), l["cidade"],
                    NOMES_ETAPA.get(l["etapa"]), l["triagem"].get("nota"), l["ig"].get("username"),
                    l["ig"].get("seguidores"), l["whatsapp"], l["email"], l["site"],
                    l["crm"].get("data_contato", ""), l["crm"].get("valor", ""), l["crm"].get("notas", "")])
    return ("\ufeff" + buf.getvalue()).encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _enviar(self, codigo, corpo, tipo="application/json; charset=utf-8", extra=None):
        dados = corpo if isinstance(corpo, bytes) else json.dumps(corpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(dados)))
        self.send_header("Cache-Control", "no-store")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(dados)

    def _corpo(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"{}") if n else {}

    def do_GET(self):
        p = urlparse(self.path).path
        if p in ("/", "/index.html"):
            with open(WEB, "rb") as f:
                return self._enviar(200, f.read(), "text/html; charset=utf-8")
        if p == "/api/estado":
            return self._enviar(200, _estado())
        if p == "/api/leads":
            return self._enviar(200, [_lead_publico(l) for l in banco.leads()])
        if p == "/api/rotina":
            return self._enviar(200, rotina.publico())
        m = re.match(r"^/proposta/([\w\-]+)$", p)
        if m:
            l = banco.pegar(m.group(1))
            if not l or not l["crm"].get("proposta"):
                return self._enviar(404, "<p>Proposta ainda não gerada. Gere pela ficha do lead.</p>".encode(), "text/html; charset=utf-8")
            return self._enviar(200, proposta.pagina(l).encode("utf-8"), "text/html; charset=utf-8")
        if p == "/api/exportar.csv":
            nome = f"leads-soubarbarotti-{date.today()}.csv"
            return self._enviar(200, _csv(), "text/csv; charset=utf-8",
                                {"Content-Disposition": f'attachment; filename="{nome}"'})
        self._enviar(404, {"erro": "não encontrado"})

    def do_POST(self):
        # só aceita chamadas do próprio painel
        origem = self.headers.get("Origin") or ""
        if origem and not re.match(rf"^https?://(localhost|127\.0\.0\.1):{config.PORTA}$", origem):
            return self._enviar(403, {"erro": "origem não permitida"})
        p = urlparse(self.path).path
        try:
            corpo = self._corpo()
            if p == "/api/rotina/comecar":
                qtd = max(1, min(int(corpo.get("quantidade") or config.LEADS_POR_DIA), 100))
                ok = rotina.comecar(qtd)
                return self._enviar(200 if ok else 409, rotina.publico())
            if p == "/api/rotina/parar":
                rotina.parar()
                return self._enviar(200, rotina.publico())
            m = re.match(r"^/api/leads/([\w\-]+)$", p)
            if m:
                return self._enviar(200, _atualizar_lead(m.group(1), corpo))
            m = re.match(r"^/api/leads/([\w\-]+)/(teaser|responder|proposta)$", p)
            if m:
                return self._enviar(200, _assistente(m.group(1), m.group(2), corpo))
        except KeyError as e:
            return self._enviar(404, {"erro": str(e)})
        except (ValueError, json.JSONDecodeError):
            return self._enviar(400, {"erro": "pedido inválido"})
        except anthropic.AuthenticationError:
            return self._enviar(502, {"erro": "a ANTHROPIC_API_KEY do .env está inválida"})
        except anthropic.APIError as e:
            return self._enviar(502, {"erro": f"a IA não respondeu ({getattr(e, 'status_code', '')}). Tente de novo."})
        except RuntimeError as e:
            return self._enviar(502, {"erro": str(e)})
        self._enviar(404, {"erro": "não encontrado"})


def _assistente(id_: str, qual: str, corpo: dict) -> dict:
    l = banco.pegar(id_)
    if not l or l["status"] != "lead":
        raise KeyError("lead não encontrado")
    n, crm = l["dados"], l["crm"]
    crm.setdefault("historico", [])
    if qual == "teaser":
        crm["teaser_prompt"] = assistente.prompt_teaser(n)
        banco.atualizar(id_, crm=crm)
        return {"teaser_prompt": crm["teaser_prompt"]}
    if qual == "responder":
        texto = (corpo.get("texto") or "").strip()
        if not texto:
            raise ValueError("sem texto")
        r = assistente.sugerir_resposta(n, crm, texto, l["etapa"])
        if not r:
            raise RuntimeError("A IA não conseguiu sugerir agora. Tente de novo.")
        crm["historico"].append({"data": banco.agora(), "texto": "Cliente: " + texto[:280]})
        crm["ultima_sugestao"] = r
        banco.atualizar(id_, crm=crm)
        return {**r, "lead": _lead_publico(banco.pegar(id_))}
    # proposta
    r = assistente.texto_proposta(n, crm)
    if not r:
        raise RuntimeError("A IA não conseguiu montar a proposta agora. Tente de novo.")
    crm["proposta"] = r
    crm["historico"].append({"data": banco.agora(), "texto": "Proposta montada"})
    banco.atualizar(id_, crm=crm)
    return {"url": f"/proposta/{id_}", "lead": _lead_publico(banco.pegar(id_))}


def backup():
    """Uma cópia do banco por dia em dados/backups, guardando os últimos BACKUP_DIAS."""
    pasta = os.path.join(os.path.dirname(config.BANCO), "backups")
    os.makedirs(pasta, exist_ok=True)
    destino = os.path.join(pasta, f"central-{date.today()}.db")
    if not os.path.exists(destino):
        with sqlite3.connect(destino) as d:
            banco.con().backup(d)
    limite = (date.today() - timedelta(days=config.BACKUP_DIAS)).isoformat()
    for f in os.listdir(pasta):
        if f.startswith("central-") and f[8:18] < limite:
            os.remove(os.path.join(pasta, f))


def main():
    banco.con()
    backup()
    srv = ThreadingHTTPServer(("127.0.0.1", config.PORTA), Handler)
    url = f"http://localhost:{config.PORTA}"
    print(f"\n  Central do {config.INSTAGRAM} rodando em {url}\n  (feche esta janela para desligar)\n")
    if not os.environ.get("SEM_NAVEGADOR"):
        webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
