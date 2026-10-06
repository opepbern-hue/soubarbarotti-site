"""
PÁGINA DE PROPOSTA: uma página com a sua marca, pronta para salvar em PDF (A4) e mandar.
Abre em http://localhost:8765/proposta/<id>
"""
from datetime import date, timedelta
from html import escape

import config

PROCESSO = [
    ("Roteiro e storyboard", "Planejo o vídeo inteiro antes de gerar qualquer imagem."),
    ("Imagem-chave", "Crio os quadros principais com o seu espaço e o seu produto como referência."),
    ("Movimento", "Cada imagem-chave vira um clipe com movimento de câmera de cinema."),
    ("Upscaling", "Levo a resolução final para 4K."),
    ("Color grade", "Unifico tudo numa cor só. É aqui que nasce o look de cinema."),
]


def _reais(v) -> str:
    return "R$ " + f"{int(v):,}".replace(",", ".")


def pagina(lead: dict) -> str:
    n, crm = lead["dados"], lead["crm"]
    p = crm.get("proposta") or {}
    e = lambda s: escape(str(s or ""))
    hoje = date.today()
    validade = hoje + timedelta(days=config.PROPOSTA_VALIDADE_DIAS)
    recomendado = p.get("recomendado", "")

    pacotes = []
    for pk in config.PACOTES:
        rec = pk["nome"] == recomendado
        preco = _reais(pk["preco"]) + ("<small>/mês</small>" if pk.get("mensal") else "")
        pacotes.append(f"""
        <div class="pacote{' rec' if rec else ''}">
          {'<span class="selo">Recomendado para vocês</span>' if rec else ''}
          <h3>{e(pk['nome'])}</h3>
          <p class="preco">{preco}</p>
          <ul><li>{e(pk['entrega'])}</li><li>{e(pk['ajustes'])}</li><li>Prazo: {e(pk['prazo'])}</li></ul>
        </div>""")

    ideias = "".join(f"<li>{e(i)}</li>" for i in (p.get("ideias") or []))
    etapas = "".join(f"<li><strong>{e(t)}</strong><span>{e(d)}</span></li>" for t, d in PROCESSO)
    contato = " &nbsp; ".join(x for x in (
        e(config.INSTAGRAM), e(config.SITE.replace("https://", "")),
        e(config.WHATSAPP) if config.WHATSAPP else "", e(config.EMAIL) if config.EMAIL else "") if x)

    return f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Proposta · {e(n.get('nome'))} · soubarbarotti</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root{{--carvao:#241C16;--fumaca:#75685E;--linha:#EFE5DC;--nevoa:#FFF2E8;--laranja:#FF6A00;--brasa:#C24100}}
*{{box-sizing:border-box}}
body{{margin:0;background:#EFE5DC;font:400 13px/1.45 Inter,system-ui,Arial,sans-serif;color:var(--carvao)}}
.folha{{width:210mm;min-height:297mm;margin:24px auto;background:#fff;padding:13mm 18mm 11mm;position:relative;
  background:radial-gradient(ellipse 70% 38% at 88% 0%,rgba(255,106,0,.22),rgba(255,166,43,.1) 45%,rgba(255,166,43,0) 100%),#fff}}
h1,h2,h3,.logo,.preco{{font-family:"Space Grotesk","Helvetica Neue",Arial,sans-serif}}
.topo{{display:flex;justify-content:space-between;align-items:baseline}}
.logo{{font-weight:700;font-size:18px;letter-spacing:-.03em}}.logo i{{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--laranja);margin-left:2px}}
.meta{{font-size:12.5px;color:var(--fumaca);text-align:right}}
h1{{font-size:32px;line-height:1.02;letter-spacing:-.04em;margin:16px 0 10px;font-weight:600}}
h1 span{{display:block;color:var(--fumaca)}}
h2{{font-size:16px;font-weight:600;margin:16px 0 6px;letter-spacing:-.01em}}
p{{margin:0 0 8px}}
.duas{{display:grid;grid-template-columns:1.3fr 1fr;gap:26px}}
ul.ideias{{margin:0;padding-left:18px}}ul.ideias li{{margin-bottom:2px}}
.pacotes{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:10px}}
.pacote{{border:1px solid var(--linha);border-radius:12px;padding:14px 14px 10px;position:relative}}
.pacote.rec{{border:2px solid var(--carvao)}}
.pacote h3{{margin:0;font-size:16px;font-weight:600}}
.preco{{font-size:24px;font-weight:600;margin:4px 0 8px;color:var(--brasa)}}.preco small{{font-size:13px;color:var(--fumaca)}}
.pacote ul{{margin:0;padding-left:16px;font-size:12px}}
.selo{{position:absolute;top:-10px;left:14px;background:var(--laranja);color:var(--carvao);font:600 11px/1 "Space Grotesk",Arial;padding:5px 9px;border-radius:999px}}
.porque{{margin-top:10px;font-size:13px;color:var(--fumaca)}}
ol.processo{{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(5,1fr);gap:10px;counter-reset:e}}
ol.processo li{{counter-increment:e;font-size:12px;border-top:2px solid var(--carvao);padding-top:8px}}
ol.processo li::before{{content:counter(e);font:600 12px "Space Grotesk",Arial;color:var(--brasa);display:block}}
ol.processo strong{{display:block;font-size:12.5px}}ol.processo span{{color:var(--fumaca)}}
.condicoes{{background:var(--nevoa);border-radius:12px;padding:12px 16px;font-size:12.5px;margin-top:16px}}
.condicoes p{{margin:0 0 4px}}
.assina{{margin-top:16px;display:flex;justify-content:space-between;align-items:flex-end;font-size:12.5px;color:var(--fumaca)}}
.assina strong{{display:block;font:600 15px "Space Grotesk",Arial;color:var(--carvao)}}
.imprimir{{position:fixed;right:24px;bottom:24px;background:var(--brasa);color:#fff;border:0;border-radius:999px;padding:12px 20px;font:500 14px "Space Grotesk",Arial;cursor:pointer}}
@page{{size:A4;margin:0}}
@media print{{html,body{{margin:0;background:#fff}}.folha{{margin:0;min-height:0}}.imprimir{{display:none}}
  *{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}}}
@media screen and (max-width:820px){{.folha{{width:auto;min-height:0;margin:0;padding:28px 20px}}.duas,.pacotes,ol.processo{{grid-template-columns:1fr}}}}
</style></head><body>
<div class="folha">
  <div class="topo"><span class="logo">soubarbarotti<i></i></span>
    <span class="meta">Proposta para {e(n.get('nome'))}<br>{hoje:%d/%m/%Y}, válida até {validade:%d/%m/%Y}</span></div>
  <h1>um vídeo com cara de cinema<span>para a {e(n.get('nome'))}.</span></h1>
  <div class="duas">
    <div><h2>O que eu vi</h2><p>{e(p.get('diagnostico'))}</p>
      <h2>O objetivo</h2><p>{e(p.get('objetivo'))}</p></div>
    <div><h2>Ideias para vocês</h2><ul class="ideias">{ideias}</ul></div>
  </div>
  <h2>Formas de trabalhar comigo</h2>
  <div class="pacotes">{''.join(pacotes)}</div>
  {f'<p class="porque">{e(p.get("por_que"))}</p>' if p.get('por_que') else ''}
  <h2>Como eu faço</h2>
  <ol class="processo">{etapas}</ol>
  <div class="condicoes">
    <p><strong>Pagamento:</strong> 50% na aprovação e 50% na entrega, por Pix ou cartão.</p>
    <p><strong>Direitos:</strong> vocês podem usar os vídeos em redes, site e anúncios pagos. Eu posso mostrar o trabalho no meu portfólio.</p>
    <p><strong>Validade:</strong> esta proposta vale até {validade:%d/%m/%Y}.</p>
  </div>
  <div class="assina"><div><strong>{e(config.NOME_COMPLETO)}</strong>Diretor de vídeo com IA generativa, Palhoça (SC)</div><div>{contato}</div></div>
</div>
<button class="imprimir" onclick="window.print()">Salvar como PDF</button>
<script>
// garante uma página só: se o texto ficar comprido, reduz a escala na impressão
function caber(){{ const f = document.querySelector(".folha"); f.style.zoom = 1;
  const alvo = 1122; const h = f.getBoundingClientRect().height; if (h > alvo) f.style.zoom = (alvo / h).toFixed(3); }}
function soltar(){{ document.querySelector(".folha").style.zoom = 1; }}
window.addEventListener("beforeprint", caber); window.addEventListener("afterprint", soltar);
const mq = matchMedia("print"); mq.addEventListener && mq.addEventListener("change", e => e.matches ? caber() : soltar());
if (mq.matches) caber();
</script>
</body></html>"""
