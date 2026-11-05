import { IdeasChecklist, type IdeaGroup } from '@/components/admin/IdeasChecklist';
import { Card, PageHead } from '@/components/admin/ui';

export const metadata = { title: 'Ideias' };

const FIRST_THREE = [
  { title: 'WhatsApp no hero, no header e numa barra fixa no celular.', text: 'Ataca o ponto onde o visitante desiste hoje.' },
  { title: 'Prova social real.', text: 'Depoimento ou print de conversa do Calebe e de outros clientes, com autorização.' },
  { title: 'Preço ou faixa de preço visível.', text: 'Filtra curioso e atrai quem tem orçamento.' },
];

const GROUPS: IdeaGroup[] = [
  {
    key: 'conv',
    title: '10 para melhorar e converter',
    ideas: [
      { id: 'c1', title: 'Botão de WhatsApp no hero e no header', text: 'Quem quer contratar vídeo no Brasil prefere WhatsApp a formulário. Use uma mensagem pré-preenchida, como "Oi Barbarotti, vi seu portfólio e quero um vídeo para…".' },
      { id: 'c2', title: 'Mostrar o preço ou uma faixa', text: 'O componente de planos já existe no código, mas a home não o usa. Mesmo um "a partir de R$ X" ajuda.' },
      { id: 'c3', title: 'Formulário em 2 etapas que qualifica o lead', text: 'Peça tipo de projeto (comercial, imobiliário, marca pessoal), faixa de orçamento, prazo e WhatsApp. O painel de leads já tem estrutura para isso.' },
      { id: 'c4', title: 'Prova social real', text: '2 ou 3 prints de conversa ou depoimentos em vídeo, com autorização. É o que mais falta num site de serviço.' },
      { id: 'c5', title: 'Um case com número', text: 'Ex.: "vídeo imobiliário gerou X visitas" ou o antes e depois do custo de produção. Hoje o portfólio mostra o que você fez, não o resultado do cliente.' },
      { id: 'c6', title: 'CTA no fim de cada projeto', text: '"Quer um assim? Me chama", com WhatsApp e o nome do projeto já na mensagem.' },
      { id: 'c7', title: 'Hero com a oferta em uma frase', text: 'O "BARBAROTTI." gigante é forte, mas a promessa fica pequena. Algo como "Filme de marca com IA em X dias, sem set".' },
      { id: 'c8', title: 'Barra fixa de CTA no mobile', text: 'Um botão "Falar no WhatsApp" que acompanha a rolagem. A maior parte do tráfego vem do Instagram, ou seja, do celular.' },
      { id: 'c9', title: 'FAQ que quebra objeção', text: '"A IA não parece falsa?", "quanto tempo leva?", "posso usar comercialmente?", "como funcionam as revisões?". Ajuda também no SEO.' },
      { id: 'c10', title: 'Resposta automática em até 1 minuto', text: 'Quando alguém envia o formulário, confirme por e-mail ou WhatsApp e diga quando você responde. Hoje o aviso só chega para você.' },
    ],
  },
  {
    key: 'alc',
    title: '10 para alcançar mais gente',
    ideas: [
      { id: 'a1', title: 'Recortar cada projeto em Reels, Shorts e TikTok', text: 'Cada case vira 3 a 5 cortes com link para a página. O vídeo já existe, é só reaproveitar.' },
      { id: 'a2', title: 'Série de bastidores do processo', text: 'Roteiro, storyboard e erros à mostra, como a sua bio promete. Diferencia de quem só posta resultado.' },
      { id: 'a3', title: 'Páginas de SEO local e por nicho', text: '"Vídeo com IA para imobiliária em Florianópolis", "vídeo institucional em Santa Catarina". O sitemap hoje só tem home, portfólio e galerias.' },
      { id: 'a4', title: 'Blog ou guias curtos', text: '"Quanto custa um vídeo com IA?" e "IA vs. produtora tradicional" são buscas reais de quem está perto de comprar.' },
      { id: 'a5', title: 'Parcerias com imobiliárias e corretores', text: 'Ofereça um vídeo-piloto de um imóvel. Imobiliária compra recorrente, e um fechamento vira vários.' },
      { id: 'a6', title: 'Link na bio que converte', text: 'O Instagram leva para uma página com WhatsApp, portfólio e plano, e o tráfego cai direto onde converte.' },
      { id: 'a7', title: 'Colaborações com outros criadores', text: 'Faça um vídeo cinematográfico para um criador, com crédito e marcação. Você ganha o público dele e portfólio novo.' },
      { id: 'a8', title: 'LinkedIn e YouTube longo', text: 'Um making of de 5 a 8 minutos de um projeto. O YouTube traz gente por anos e o LinkedIn alcança dono de empresa.' },
      { id: 'a9', title: 'Dados estruturados e busca por IA', text: 'Você já tem JSON-LD e uma frase de entidade. Ampliar com FAQ, serviços e avaliações ajuda a aparecer no Google e em assistentes de IA.' },
      { id: 'a10', title: 'Anúncios pequenos de remarketing', text: 'Pixel no site e público de quem assistiu metade de um Reel. Com R$ 10 por dia você reconquista quem quase contratou.' },
    ],
  },
];

export default function Ideias() {
  return (
    <>
      <PageHead
        title="Ideias"
        intro="20 ideias para converter mais e chegar em mais gente. Marque cada uma quando fizer. As marcações ficam salvas neste navegador."
      />
      <div className="flex max-w-[860px] flex-col gap-12">
        <Card>
          <h2 className="font-display text-[22px] font-bold tracking-[-0.02em] text-carvao">Se for escolher só 3</h2>
          <ol className="mt-5 grid gap-4">
            {FIRST_THREE.map((t, i) => (
              <li key={t.title} className="flex items-baseline gap-4">
                <span className="flex-none rounded-md bg-[#ff6a00] px-2 py-0.5 font-mono text-[13px] font-semibold text-black">{i + 1}</span>
                <span className="min-w-0 text-[15px] leading-[1.45] text-fumaca">
                  <strong className="font-semibold text-carvao">{t.title}</strong> {t.text}
                </span>
              </li>
            ))}
          </ol>
        </Card>
        <IdeasChecklist groups={GROUPS} />
      </div>
    </>
  );
}
