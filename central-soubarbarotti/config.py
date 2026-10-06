"""
Configuração da Central de Prospecção do @soubarbarotti.
Tudo que você vai querer ajustar mora aqui.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------- chaves
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
META_TOKEN = os.getenv("META_TOKEN", "")
IG_USER_ID = os.getenv("IG_USER_ID", "")
TOKEN_EXPIRA = os.getenv("TOKEN_EXPIRA", "")          # AAAA-MM-DD
GRAPH_VERSION = os.getenv("GRAPH_VERSION", "v25.0")
MODELO_TRIAGEM = os.getenv("MODELO_TRIAGEM", "claude-haiku-4-5-20251001")
MODELO_MENSAGENS = os.getenv("MODELO_MENSAGENS", "claude-sonnet-5-5")

# ---------------------------------------------------------------- você
NOME_COMPLETO = os.getenv("NOME_COMPLETO", "Pedro Barbarotti Berben")
NOME = os.getenv("NOME", "Pedro")
INSTAGRAM = os.getenv("INSTAGRAM", "@soubarbarotti")
SITE = os.getenv("SITE", "https://soubarbarotti.com.br").rstrip("/")
WHATSAPP = os.getenv("WHATSAPP", "")        # seu número, aparece na proposta
EMAIL = os.getenv("EMAIL", "")              # seu e-mail, aparece na proposta

# ---------------------------------------------------------------- o dia
LEADS_POR_DIA = 25        # quantos negócios novos o botão "Começar o dia" entrega
NOTA_MINIMA = 70          # nota da IA para virar lead (0 a 100)

# Mistura de nichos em cada dia (o imobiliário é a tese do plano de SEO)
MIX_NICHOS = {"imobiliario": 0.5, "estetica": 0.25, "gastronomia": 0.25}

# ---------------------------------------------------------------- Instagram
EXIGIR_INSTAGRAM = True          # sem @ encontrado, o negócio nem entra na fila
IG_MAX_DIAS_SEM_POSTAR = 45      # perfil parado há mais tempo que isso = descartado
IG_MIN_SEGUIDORES = 500          # abaixo disso, negócio pequeno demais para o ticket
IG_MAX_SEGUIDORES = 200_000      # acima disso, quase sempre tem agência grande
IG_PAUSA = 1.5                   # segundos entre consultas (respeita o limite da Meta)

# ---------------------------------------------------------------- onde buscar
# A busca vai de camada em camada, só quando a fila de candidatos acaba.
CAMADAS_CIDADES = [
    ["Florianópolis SC", "São José SC", "Palhoça SC", "Balneário Camboriú SC",
     "Itapema SC", "Itajaí SC", "Porto Belo SC", "Bombinhas SC"],
    ["Joinville SC", "Blumenau SC", "Criciúma SC", "Chapecó SC", "Jaraguá do Sul SC",
     "Brusque SC", "Tubarão SC", "Garopaba SC"],
    ["Curitiba PR", "Porto Alegre RS", "Gramado RS", "Londrina PR", "Maringá PR",
     "São Paulo SP", "Campinas SP", "Belo Horizonte MG", "Goiânia GO"],
]

NICHOS = {
    "imobiliario": ["imobiliária alto padrão", "incorporadora", "construtora de alto padrão",
                    "imóveis de luxo", "lançamento imobiliário"],
    "estetica": ["clínica de estética", "harmonização facial", "clínica de dermatologia estética"],
    "gastronomia": ["restaurante sofisticado", "restaurante contemporâneo", "restaurante japonês premium"],
}

NOME_NICHO = {"imobiliario": "Imobiliário", "estetica": "Estética", "gastronomia": "Gastronomia"}

# Página do site que cada nicho recebe na mensagem.
# Troque pelas páginas de serviço do plano de SEO quando estiverem no ar.
LINK_POR_NICHO = {
    "imobiliario": f"{SITE}/portfolio",
    "estetica": f"{SITE}/portfolio",
    "gastronomia": f"{SITE}/portfolio",
}

# O que a IA pode citar como prova. Só o que você confirmou.
PROVAS_CONFIRMADAS = [
    "vídeos com IA para a Echo Labs",
    "vídeos para um negócio na Polinésia Francesa",
]

# ---------------------------------------------------------------- proposta
# Sugestão de partida dentro da faixa de R$1.500 a R$5.000. Ajuste ao seu custo real.
PACOTES = [
    {"nome": "Essencial", "preco": 1500, "entrega": "1 vídeo de 15 a 30 s e 2 cortes para Reels",
     "ajustes": "1 rodada de ajuste", "prazo": "7 dias"},
    {"nome": "Campanha", "preco": 3200, "entrega": "1 vídeo-manifesto de 30 a 45 s e 6 criativos de anúncio de 15 s",
     "ajustes": "2 rodadas de ajuste", "prazo": "10 dias"},
    {"nome": "Presença", "preco": 2500, "mensal": True, "entrega": "4 vídeos por mês",
     "ajustes": "1 rodada por vídeo", "prazo": "mensal, mínimo de 3 meses"},
]
PROPOSTA_VALIDADE_DIAS = 7
BACKUP_DIAS = 14           # quantos dias de backup do banco guardar

# ---------------------------------------------------------------- filtros baratos
FILTRO_MIN_AVALIACOES = 20
FILTRO_MIN_NOTA_GOOGLE = 4.2
BUSCAS_POR_RODADA = 6      # combinações termo+cidade por vez quando a fila acaba
THREADS_SITES = 8
TIMEOUT_SITE = 12

# ---------------------------------------------------------------- app
PORTA = 8765
BANCO = os.path.join("dados", "central.db")
