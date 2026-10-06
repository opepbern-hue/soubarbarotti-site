"""
A ROTINA DO BOTÃO "COMEÇAR O DIA"

Para cada negócio, nesta ordem:
  1. Instagram primeiro: o perfil existe, é comercial, está ativo? Se não, descarta.
  2. IA dá a nota com os dados do Instagram + site + Google. Abaixo do corte, descarta.
  3. IA escreve as mensagens. O negócio entra no seu funil como lead de hoje.
Quando a fila de candidatos acaba, busca mais no Google Maps (perto primeiro).
Os leads aparecem no painel conforme ficam prontos.
"""
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import date

import anthropic

import banco
import config
import enriquecer as enr
import instagram
import qualificar
from prospectar import buscar, normalizar

estado = {
    "rodando": False, "inicio": None, "fim": None, "passo": "", "alvo": 0, "feitos": 0,
    "analisados": 0, "descartados": 0, "log": [], "erro": "", "_parar": False,
}
_trava = threading.Lock()


def log(msg: str, tipo: str = "info"):
    estado["log"].append({"t": time.strftime("%H:%M:%S"), "msg": msg, "tipo": tipo})
    estado["log"] = estado["log"][-60:]
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")


def publico() -> dict:
    return {k: v for k, v in estado.items() if not k.startswith("_")}


# ---------------------------------------------------------------- abastecer a fila
def _combinacoes(nicho: str):
    for camada, cidades in enumerate(config.CAMADAS_CIDADES):
        for cidade in cidades:
            for termo in config.NICHOS[nicho]:
                yield camada, termo, cidade


def abastecer(nicho: str) -> bool:
    """Roda as próximas buscas do nicho. False quando não há mais o que buscar."""
    if not config.GOOGLE_PLACES_API_KEY:
        raise RuntimeError("Falta a GOOGLE_PLACES_API_KEY no .env para buscar negócios novos.")
    pendentes = [c for c in _combinacoes(nicho) if not banco.busca_feita(f"{c[1]}|{c[2]}")]
    if not pendentes:
        return False
    novos = []
    for camada, termo, cidade in pendentes[: config.BUSCAS_POR_RODADA]:
        estado["passo"] = f"Buscando {termo} em {cidade.rsplit(' ', 1)[0]}"
        log(estado["passo"])
        for p in buscar(termo, cidade):
            n = normalizar(p, nicho, cidade)
            if n["id"] and not banco.existe(n["id"]) and all(x["id"] != n["id"] for x, _ in novos):
                novos.append((n, camada))
        banco.marcar_busca(f"{termo}|{cidade}")
    if not novos:
        return True

    estado["passo"] = f"Lendo o site de {len(novos)} negócios"
    log(estado["passo"])
    with ThreadPoolExecutor(max_workers=config.THREADS_SITES) as ex:
        list(ex.map(lambda item: enr.enriquecer(item[0]), novos))

    na_fila = 0
    for n, camada in novos:
        ch = enr.chaves(n)
        if banco.duplicado(ch):
            continue  # outra unidade da mesma rede
        motivo = enr.filtro(n)
        if motivo:
            banco.inserir(n, "filtrado", motivo, chaves=ch)
        elif not n.get("instagram") and config.EXIGIR_INSTAGRAM:
            banco.inserir(n, "sem_instagram", "nenhum @ encontrado", enr.prioridade(n, camada), ch)
        else:
            banco.inserir(n, "pool", "", enr.prioridade(n, camada), ch)
            na_fila += 1
    log(f"{na_fila} entraram na fila com Instagram para validar")
    return True


def _proximo(hoje_por_nicho: dict) -> dict | None:
    ordem = sorted(config.MIX_NICHOS, key=lambda k: hoje_por_nicho.get(k, 0) / config.MIX_NICHOS[k])
    for nicho in ordem:
        while True:
            c = banco.proximo_da_fila(nicho)
            if c:
                return c
            if estado["_parar"] or not abastecer(nicho):
                break
    return banco.proximo_da_fila(None)


# ---------------------------------------------------------------- processar um negócio
def _descartar(id_, n, motivo):
    banco.atualizar(id_, status="descartado", motivo=motivo, dados=n)
    estado["descartados"] += 1
    log(f"Fora: {n['nome']} ({motivo})", "fora")


def _processar(c: dict, hoje: str) -> bool:
    n = c["dados"]
    estado["analisados"] += 1
    estado["passo"] = f"Validando o Instagram @{n.get('instagram')}"
    ig = instagram.validar(n.get("instagram", ""))
    n["ig"] = ig
    if ig.get("whatsapp_bio"):
        n["whatsapp_bio"] = ig["whatsapp_bio"]
        n["whatsapp"], n["whatsapp_provavel"] = enr.numero_whatsapp(n)
    if ig.get("ok") is False:
        _descartar(c["id"], n, f"Instagram: {ig.get('motivo')}")
        return False
    if instagram.conectado():
        time.sleep(config.IG_PAUSA)

    estado["passo"] = f"Avaliando {n['nome']}"
    tri = qualificar.triar(n)
    n["triagem"] = tri
    if tri.get("nota", 0) < config.NOTA_MINIMA:
        _descartar(c["id"], n, f"nota {tri.get('nota', 0)}: {tri.get('motivo', '')}")
        return False

    estado["passo"] = f"Escrevendo as mensagens para {n['nome']}"
    ia = qualificar.escrever(n)
    if not ia:
        banco.atualizar(c["id"], status="descartado", motivo="a IA falhou ao escrever; tente de novo", dados=n)
        return False
    n["ia"] = ia
    crm = {"historico": [{"data": banco.agora(), "texto": "Entrou no funil"}], "fu": [], "msg": {}}
    banco.atualizar(c["id"], status="lead", etapa="novo", dia=hoje, dados=n, crm=crm,
                    prioridade=tri.get("nota", 0))
    estado["feitos"] += 1
    log(f"Lead: {n['nome']} (nota {tri.get('nota')})", "lead")
    return True


# ---------------------------------------------------------------- o dia
def _rodar(quantidade: int):
    hoje = date.today().isoformat()
    ja = banco.leads_do_dia(hoje)
    estado.update(alvo=quantidade, feitos=0, analisados=0, descartados=0, erro="", log=[],
                  inicio=time.time(), fim=None)
    log(f"Começando: {quantidade} negócios novos para hoje" + (f" (já tem {ja})" if ja else ""))
    if not instagram.conectado():
        log("Instagram não conectado: os leads vão chegar marcados para você conferir o perfil", "aviso")
    hoje_por_nicho = {}
    try:
        while estado["feitos"] < quantidade and not estado["_parar"]:
            c = _proximo(hoje_por_nicho)
            if not c:
                log("Acabaram as buscas configuradas. Adicione cidades ou nichos no config.py.", "aviso")
                break
            if _processar(c, hoje):
                hoje_por_nicho[c["nicho"]] = hoje_por_nicho.get(c["nicho"], 0) + 1
    except instagram.LimiteInstagram:
        estado["erro"] = "A Meta pediu uma pausa nas consultas do Instagram. Tente de novo daqui a 1 hora."
    except instagram.TokenInvalido:
        estado["erro"] = "O acesso ao Instagram venceu. Rode python configurar_instagram.py e reinicie."
    except anthropic.AuthenticationError:
        estado["erro"] = "A ANTHROPIC_API_KEY do .env está inválida."
    except RuntimeError as e:
        estado["erro"] = str(e)
    except Exception as e:  # mostra no painel em vez de morrer calado
        estado["erro"] = f"Erro inesperado: {e}"
    finally:
        if estado["erro"]:
            log(estado["erro"], "erro")
        parou = " (parado por você)" if estado["_parar"] else ""
        log(f"Fim: {estado['feitos']} leads novos, {estado['descartados']} descartados{parou}")
        estado.update(rodando=False, passo="", fim=time.time(), _parar=False)


def comecar(quantidade: int) -> bool:
    with _trava:
        if estado["rodando"]:
            return False
        if not config.ANTHROPIC_API_KEY:
            estado["erro"] = "Falta a ANTHROPIC_API_KEY no .env."
            return False
        estado.update(rodando=True, _parar=False)
    threading.Thread(target=_rodar, args=(quantidade,), daemon=True).start()
    return True


def parar():
    estado["_parar"] = True
