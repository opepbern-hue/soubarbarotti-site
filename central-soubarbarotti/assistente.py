"""
ASSISTENTE: as partes que decidem a venda.
  prompt_teaser()    prompt de Seedance para o teaser de 5 a 8 s do lead (formato de blocos da sua skill)
  sugerir_resposta() o cliente respondeu: o que ele quis dizer e o que responder, seguindo o playbook
  texto_proposta()   diagnóstico e recomendação personalizados para a página de proposta
"""
import json

import config
from qualificar import CONTEXTO, _chamar, cliente

# ---------------------------------------------------------------- teaser
SISTEMA_TEASER = f"""{CONTEXTO}

Você escreve prompts para o Seedance 2.0 (Higgsfield) no formato de blocos do {config.NOME}.
O pedido é o TEASER de prospecção de um negócio: 6 a 8 segundos, vertical 9:16, feito a partir de
UMA foto real do lugar ou produto que ele vai pegar no Instagram do negócio.

FORMATO DE SAÍDA (nada além disso, sem markdown, sem cercas de código):
Linha 1: Seedance 2.0 · [6 ou 8]s · 9:16 · refs: @[tag] = [que foto pegar no Instagram deles, bem específico]
Linha 2 em branco.
Depois o prompt EM INGLÊS, com os cabeçalhos em MAIÚSCULAS numa linha própria, nesta ordem:
SCENE CONTEXT, ACTIVE REFERENCES, LOCATION MAP, FIRST FRAME / BLOCKING, FORMAT MODE,
PHASE 1 — [nome curto]: ..., OPTICS, CAMERA, ACTION, PHYSICS, LIGHTING, AUDIO, STYLE, POSITIVE LOCKS.
(PERFORMANCE só se houver pessoa; prefira cenas SEM pessoas, no máximo mãos.)
Última linha, opcional: Assumi: ... (em português)

REGRAS:
- SCENE CONTEXT conta o plano inteiro e diz EXPLICITAMENTE como termina (hero frame segurado).
- Uma fase, 2 a 4 beats. One continuous shot, one location throughout.
- ACTIVE REFERENCES: "@tag — [3 a 5 elementos-assinatura do lugar]. 100% matches the reference;
  architecture, layout and materials stay exactly as the reference, nothing added or removed."
  O lugar é REAL: a IA só cria luz, movimento de câmera e atmosfera. Imóvel nunca muda de planta.
- FIRST FRAME já com algo se movendo (cortina, vapor, reflexo na água, poeira na luz).
- OPTICS: FOV em graus só destes degraus: 107°, 84°, 63°, 47°, 29°, 18°, 12°. "No drift."
- CAMERA: movimento motivado de operador real (dolly, slider, drone em km/h com altura em metros).
- ACTION: "Strict order of events: ... → ... → END."
- PHYSICS com peso e fluidos reais. LIGHTING com fontes reais e temperatura em Kelvin.
- AUDIO: só som ambiente diegético do lugar. "No music."
- STYLE: "Photoreal live-action, fine film grain, real [tipo] language, one unbroken take, 8K master."
- POSITIVE LOCKS: 5 a 7 frases curtas (formato, abertura, locação idêntica à referência, final no hero frame).
- MAIÚSCULAS só em direções, contagens e ENDS. Esquerda/direita a partir da câmera.
- Proibido: nome de diretor, filme ou equipamento; "cinematic" solto, "epic", "stunning", "masterpiece",
  "hyper-detailed", "3D render", "CGI". Nenhum texto, logo ou letreiro gerado na imagem.
- Estética: nada de rosto de paciente nem antes e depois; mostre o ambiente, a luz, os detalhes.
- Parta da ideia de teaser fornecida e do que o Instagram mostra; não invente o que o lugar tem."""


def prompt_teaser(n: dict) -> str:
    ig = n.get("ig") or {}
    dados = {
        "negocio": n.get("nome"), "nicho": n.get("nicho"), "cidade": n.get("cidade_busca"),
        "ideia_teaser": (n.get("ia") or {}).get("ideia_teaser"),
        "angulo": (n.get("ia") or {}).get("angulo"),
        "bio_instagram": ig.get("bio"), "legendas_recentes": ig.get("legendas_recentes"),
        "site": n.get("titulo_site"),
    }
    r = cliente().messages.create(
        model=config.MODELO_MENSAGENS, max_tokens=2500, system=SISTEMA_TEASER,
        messages=[{"role": "user", "content": json.dumps(dados, ensure_ascii=False)}],
    )
    texto = "".join(b.text for b in r.content if b.type == "text").strip()
    return texto.replace("```", "").strip()


# ---------------------------------------------------------------- resposta ao cliente
SISTEMA_RESPOSTA = f"""{CONTEXTO}

O {config.NOME} prospectou um negócio e o cliente respondeu. Diga o que o cliente quis dizer e escreva a
resposta que o {config.NOME} vai mandar, no mesmo canal.

O OBJETIVO da conversa é marcar uma call de 20 minutos (ou visita, se o negócio for da Grande
Florianópolis). Não tente fechar pelo direct.

COMO RESPONDER (playbook dele):
- Interessado / "manda o teaser": agradeça curto, diga quando manda o teaser e proponha a call com 2 opções de dia.
- Pediu preço: "Projetos começam em R$1.500. Pra eu não te passar um número no chute, me conta: é pra
  anúncio, pro perfil ou pra lançamento?" e puxe a call.
- "Vídeo de IA parece falso": parece quando é mal feito; ele trabalha como diretor, e é o color grade e a
  direção de câmera que tiram o look artificial. Ofereça mostrar o teaser.
- "Já tenho agência / social media": ele não substitui, entrega a peça de cinema que a agência não produz,
  e a agência distribui.
- "Tá caro": compare com uma produtora (diária, equipe, locação) e ofereça começar pelo pacote Essencial.
- "Vou pensar": pergunte com leveza o que falta para ter certeza (preço, prazo ou resultado).
- Pediu mais trabalhos: mande {config.SITE}/portfolio.
- Estética: não mostra antes e depois nem promete resultado; o vídeo vende a experiência e o ambiente.
- Pediu para parar / não tem interesse: agradeça, respeite, sem insistir, e sugira a etapa "perdido".

TOM: primeira pessoa, curto, direto, diretor criativo acessível, no máximo 1 emoji, sem travessão, sem hype.
Use só o que está nos dados; nunca invente resultado, cliente ou número.

Responda APENAS com JSON:
{{"leitura": "o que o cliente quis dizer, em 1 frase",
  "resposta": "a mensagem pronta",
  "etapa_sugerida": "chamado|respondeu|call|proposta|fechado|perdido",
  "dica": "o próximo passo do {config.NOME}, em 1 frase"}}"""


def sugerir_resposta(n: dict, crm: dict, texto_cliente: str, etapa: str) -> dict | None:
    ig = n.get("ig") or {}
    dados = {
        "negocio": n.get("nome"), "nicho": n.get("nicho"), "cidade": n.get("cidade_busca"),
        "etapa_atual": etapa, "canal": crm.get("canal") or "instagram",
        "angulo": (n.get("ia") or {}).get("angulo"), "ideia_teaser": (n.get("ia") or {}).get("ideia_teaser"),
        "teaser_pronto": bool(crm.get("teaser")), "anotacoes": crm.get("notas", ""),
        "instagram": {k: ig.get(k) for k in ("seguidores", "pct_video", "bio")},
        "resposta_do_cliente": texto_cliente[:3000],
    }
    return _chamar(config.MODELO_MENSAGENS, SISTEMA_RESPOSTA, json.dumps(dados, ensure_ascii=False), 900)


# ---------------------------------------------------------------- proposta
SISTEMA_PROPOSTA = f"""{CONTEXTO}

Escreva as partes personalizadas de uma proposta comercial de uma página para um negócio que já fez
a call de diagnóstico com o {config.NOME}. Os pacotes e os preços já estão definidos; você só escolhe
o recomendado e explica.

REGRAS:
- Use as anotações da call como fonte principal. Se não houver anotação, use os dados do negócio e seja
  mais genérico, sem inventar.
- Nunca invente número, resultado, prazo diferente, depoimento ou cliente.
- Escreva para o cliente ("vocês"), primeira pessoa do {config.NOME} ("eu"), curto e concreto, sem hype,
  sem travessão.

Responda APENAS com JSON:
{{"diagnostico": "2 a 3 frases: como eles usam vídeo hoje e a oportunidade",
  "objetivo": "1 frase: o que o vídeo precisa fazer por eles",
  "recomendado": "nome exato de um dos pacotes",
  "por_que": "1 a 2 frases: por que esse pacote serve para eles",
  "ideias": ["3 ideias concretas de cena ou peça para eles, cada uma com até 20 palavras"]}}"""


def texto_proposta(n: dict, crm: dict) -> dict | None:
    ig = n.get("ig") or {}
    dados = {
        "negocio": n.get("nome"), "nicho": n.get("nicho"), "cidade": n.get("cidade_busca"),
        "anotacoes_da_call": crm.get("notas", ""), "valor_combinado": crm.get("valor"),
        "motivo_lead": (n.get("triagem") or {}).get("motivo"),
        "angulo": (n.get("ia") or {}).get("angulo"), "ideia_teaser": (n.get("ia") or {}).get("ideia_teaser"),
        "instagram": {k: ig.get(k) for k in ("seguidores", "pct_video", "bio", "legendas_recentes")},
        "pacotes": config.PACOTES,
    }
    return _chamar(config.MODELO_MENSAGENS, SISTEMA_PROPOSTA, json.dumps(dados, ensure_ascii=False), 1200)
