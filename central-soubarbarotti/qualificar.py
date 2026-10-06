"""
QUALIFICAR com IA, já com os dados reais do Instagram.
  triar()    modelo rápido: nota de 0 a 100 e motivo
  escrever() modelo melhor: ângulo, teaser e as mensagens (Instagram, WhatsApp e follow-ups)
"""
import json
import time

import anthropic

import config

_cliente = None


def cliente():
    global _cliente
    if _cliente is None:
        _cliente = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    return _cliente


CONTEXTO = f"""{config.NOME_COMPLETO} ({config.INSTAGRAM}), 21 anos, de Palhoça/SC, é diretor de vídeo
cinematográfico com IA generativa. Atende o Brasil todo. Site: {config.SITE}.
Ele dirige o vídeo inteiro (roteiro, storyboard, personagem consistente, image-to-video, upscaling e
color grade), sem set, câmera ou elenco. Ticket: R$1.500 a R$5.000 por projeto."""

CRITERIOS = """CRITÉRIOS (some até 100):
- Verba (0 a 30): Pixel da Meta ou Google Ads no site valem muito. Posicionamento premium, muitas
  avaliações e perfil com muitos seguidores também contam.
- Lacuna de vídeo (0 a 25): pct_video baixo no Instagram (poucos Reels), sem vídeo no site = nota alta.
  Perfil que já posta muito Reels bem produzido = nota baixa.
- Encaixe visual (0 a 25): imóvel de alto padrão, lançamento, prato autoral, ambiente de clínica = alto.
- Ativo e acessível (0 a 20): posta com frequência, engaja, tem WhatsApp ou DM aberto, dono acessível.
  Rede grande com agência = baixo.
Se o Instagram não foi verificado (verificado=false), avalie pelo resto e seja mais conservador.
Classe A: nota >= 85. Classe B: 70 a 84. Classe C: abaixo de 70."""

SISTEMA_TRIAGEM = f"""{CONTEXTO}

Avalie se UM negócio é lead para ele. Use só os dados fornecidos.
{CRITERIOS}
Responda APENAS com JSON: {{"nota": 0, "classe": "A|B|C", "motivo": "até 25 palavras, concreto"}}"""

SISTEMA_MENSAGENS = f"""{CONTEXTO}

Escreva a prospecção de UM negócio já aprovado como lead.

PROVAS QUE PODEM SER CITADAS (só estas): {"; ".join(config.PROVAS_CONFIRMADAS) or "nenhuma"}.

REGRAS:
- Use só os dados fornecidos. Nunca invente fato sobre o negócio nem resultado do {config.NOME}.
- Se houver legendas recentes do Instagram, cite UM post real de forma natural ("vi o post de vocês
  sobre ..."). Não invente post.
- Português do Brasil, primeira pessoa, tom de diretor criativo acessível: direto, curto, sem hype,
  no máximo 1 emoji, sem travessão.
- Não vende e não fala preço no primeiro contato. Elogia algo específico, aponta a oportunidade de
  vídeo e oferece um teaser de 5 segundos feito para a marca, sem compromisso.
- mensagem_instagram: DM, até 380 caracteres, informal, sem link.
- mensagem_whatsapp: até 450 caracteres, se apresenta ("Aqui é o {config.NOME}, do {config.INSTAGRAM}"),
  inclui o link do portfólio que vier nos dados e termina com uma saída educada
  ("se não fizer sentido, é só me avisar").
- Estética: nada de antes e depois nem promessa de resultado de procedimento.
- Imobiliário: o imóvel mostrado é o real; a IA cria o clima e o movimento de cinema.

Responda APENAS com JSON válido, sem markdown:
{{
  "verba": "evidência curta",
  "lacuna_video": "frase curta",
  "angulo": "o gancho de venda específico",
  "ideia_teaser": "teaser de 5 a 8 s: o que aparece, câmera, luz, clima",
  "mensagem_instagram": "...",
  "mensagem_whatsapp": "...",
  "followup_1": "2 dias depois, curto",
  "followup_2": "5 dias depois, entregando o teaser pronto",
  "mensagem_despedida": "dia 10, leve e sem pressão"
}}"""

CAMPOS = ["nome", "nicho", "tipo", "cidade_busca", "nota_google", "avaliacoes", "faixa_preco", "site_ok",
          "titulo_site", "descricao_site", "tem_pixel_meta", "tem_google_ads", "tem_video_site",
          "whatsapp_provavel", "email"]
CAMPOS_IG = ["verificado", "username", "bio", "seguidores", "posts", "dias_ultimo_post", "posts_30d",
             "pct_video", "engajamento", "legendas_recentes"]


def _dados(n: dict, com_link=False) -> str:
    d = {c: n.get(c) for c in CAMPOS}
    ig = n.get("ig") or {}
    d["instagram"] = {c: ig.get(c) for c in CAMPOS_IG}
    if com_link:
        d["link_portfolio"] = config.LINK_POR_NICHO.get(n.get("nicho"), config.SITE)
    return json.dumps(d, ensure_ascii=False)


def _json(texto: str) -> dict:
    t = texto.replace("```json", "").replace("```", "").strip()
    return json.loads(t[t.find("{"): t.rfind("}") + 1])


def _chamar(modelo, sistema, conteudo, max_tokens, tentativas=4) -> dict | None:
    for t in range(tentativas):
        try:
            r = cliente().messages.create(model=modelo, max_tokens=max_tokens, system=sistema,
                                          messages=[{"role": "user", "content": conteudo}])
            return _json("".join(b.text for b in r.content if b.type == "text"))
        except anthropic.RateLimitError:
            time.sleep(15 * (t + 1))
        except anthropic.AuthenticationError:
            raise
        except (json.JSONDecodeError, anthropic.APIError, ValueError):
            time.sleep(3 * (t + 1))
    return None


def triar(n: dict) -> dict:
    return _chamar(config.MODELO_TRIAGEM, SISTEMA_TRIAGEM, _dados(n), 250) or \
        {"nota": 0, "classe": "C", "motivo": "a IA não conseguiu avaliar"}


def escrever(n: dict) -> dict | None:
    return _chamar(config.MODELO_MENSAGENS, SISTEMA_MENSAGENS, _dados(n, com_link=True), 1800)
