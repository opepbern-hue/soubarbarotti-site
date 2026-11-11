'use client';

import Image from 'next/image';
import { useState } from 'react';
import { parseEmbed } from '@/lib/media-shared';
import { ScrollReveal, SplitText } from './ScrollReveal';

// ---------------------------------------------------------------------------
// IFSC · Módulo Prático de Fotografia
// Regra deste arquivo: só entra no site material real e aprovado pelo Pedro.
// O que ainda falta aparece como [PREENCHER], nunca como foto ou crédito inventado.
// ---------------------------------------------------------------------------

type Status = 'concluido' | 'aguardando_aprovacao' | 'pendente';

export type ActivityPhoto = {
  src: string;
  /** Nome do arquivo original (ordem do disparo) */
  file: string;
  alt: string;
  modality?: 'Light painting' | 'Congelamento' | 'Fundo desfocado';
  title?: string;
  iso?: string;
  aperture?: string;
  shutter?: string;
  favorite?: boolean;
  /** Foto deitada (16:9); o padrão é em pé (2:3) */
  landscape?: boolean;
  /** Foto de celular em pé (9:16) */
  tall?: boolean;
  /** Foto em destaque (grande, ocupa a linha toda) */
  highlight?: boolean;
  comment: string;
  /** Só fotos aprovadas pelo Pedro aparecem no site */
  approved: boolean;
  credits?: string;
};

export type ActivityCardData = {
  id: string;
  n: number;
  title: string;
  theme: string;
  status: Status;
  shortDescription: string;
  details?: { label: string; text: string }[];
  /** O que falta para fechar a atividade (mostrado como [PREENCHER]) */
  missing?: string[];
  photos?: ActivityPhoto[];
  video?: { title: string; author: string; duration: string; url?: string; file?: string; poster?: string };
};

const STATUS_LABEL: Record<Status, string> = {
  concluido: 'Concluída',
  aguardando_aprovacao: 'Aguardando aprovação',
  pendente: 'Em produção',
};

// Valores de exposição da Atividade 5: estimados pela imagem (as cópias não trazem EXIF).
// Troque pelos valores reais do visor da câmera antes da entrega.
const ATIV5_PHOTOS: ActivityPhoto[] = [
  {
    file: 'DSC01256',
    src: '/ifsc/ativ5/DSC01256.JPG',
    alt: 'Garrafa de água gelada sobre o braço de uma cadeira, nítida, com o corredor do IFSC desfocado ao fundo',
    modality: 'Fundo desfocado',
    iso: '≈ ISO 800–1600',
    aperture: '≈ f/1.8–2.8',
    shutter: '≈ 1/100 s',
    comment:
      'A garrafa inteira está nítida e o corredor atrás virou manchas suaves. A abertura grande deixou só uma faixa estreita em foco, e o ISO mais alto compensou a pouca luz da noite.',
    approved: true,
  },
  {
    file: 'DSC01257',
    src: '/ifsc/ativ5/DSC01257.JPG',
    alt: 'Close do gargalo de uma garrafa de tampa laranja com gotas nítidas e luzes do teto desfocadas em círculos',
    modality: 'Fundo desfocado',
    iso: '≈ ISO 800–1600',
    aperture: '≈ f/1.8–2.8',
    shutter: '≈ 1/125 s',
    comment:
      'De perto, as gotas na garrafa ficam bem nítidas e as luzes do teto viram círculos desfocados. A abertura bem aberta, somada à distância curta, deixou o fundo mais desfocado de toda a série.',
    approved: true,
  },
  {
    file: 'DSC01268',
    src: '/ifsc/ativ5/DSC01268.JPG',
    alt: 'Arco de água de um bebedouro de inox parado no ar, com a mão acionando o botão',
    modality: 'Congelamento',
    iso: '≈ ISO 3200–6400',
    aperture: '≈ f/2.8',
    shutter: '≈ 1/1000 s ou mais',
    comment:
      'O arco de água aparece parado no ar, com a textura do jato visível. A velocidade alta congelou o movimento; abertura grande e ISO alto compensaram a luz que entra por tão pouco tempo.',
    approved: true,
  },
  {
    file: 'DSC01270',
    src: '/ifsc/ativ5/DSC01270.JPG',
    alt: 'Jato de bebedouro quebrado em blocos de água suspensos no ar, ao lado da torneira de inox',
    modality: 'Congelamento',
    iso: '≈ ISO 3200–6400',
    aperture: '≈ f/2.8',
    shutter: '≈ 1/1000 s ou mais',
    comment:
      'O jato se quebrou em blocos de água que ficaram suspensos, como uma escultura. Foi a velocidade alta que segurou cada gota no lugar, com ISO alto para a foto não ficar escura.',
    approved: true,
  },
  {
    file: 'DSC01274',
    src: '/ifsc/ativ5/DSC01274.JPG',
    alt: 'Rastros vermelhos de luz de lanterna desenhando voltas sobre fundo totalmente preto',
    modality: 'Light painting',
    iso: '≈ ISO 100–400',
    aperture: '≈ f/5.6–8',
    shutter: 'Alguns segundos',
    comment:
      'Linhas vermelhas de uma lanterna desenham voltas no escuro, mostrando o caminho da luz durante a foto. A exposição longa, com a câmera parada, registrou o gesto inteiro; ISO baixo manteve o preto limpo.',
    approved: true,
  },
];

const ATIV1_PHOTOS: ActivityPhoto[] = [
  {
    file: 'foto-1', title: 'A raposa do mural', landscape: true, src: '/ifsc/ativ1/foto-1.jpg', approved: true, favorite: true,
    alt: 'Mural pintado na parede: uma raposa laranja sentada ao lado de um telescópio azul, sob um céu preto com estrelas',
    comment: 'Favorita. A raposa laranja salta do fundo preto e o telescópio azul equilibra o quadro do outro lado. É um pedaço do campus que quase ninguém para pra olhar, e a foto faz a gente parar.',
  },
  {
    file: 'foto-2', title: 'Calango e mocó', landscape: true, src: '/ifsc/ativ1/foto-2.jpg', approved: true,
    alt: 'Maquete escolar com areia, cascas e figuras recortadas de um calango e de um mocó com placas de nome',
    comment: 'Uma maquete esquecida num canto vira cenário. O foco fica no mocó e nas placas, e o fundo azul de papel lembra um céu de verdade.',
  },
  {
    file: 'foto-3', title: 'O grampeador', landscape: true, src: '/ifsc/ativ1/foto-3.jpg', approved: true,
    alt: 'Grampeador preto sozinho sobre uma prateleira cinza brilhante, com reflexo na superfície e lateral verde do armário',
    comment: 'Um objeto comum sozinho na prateleira. O cinza limpo, o reflexo e a faixa verde no canto deixam a foto simples e organizada.',
  },
  {
    file: 'foto-4', title: 'Cantina vazia', landscape: true, src: '/ifsc/ativ1/foto-4.jpg', approved: true,
    alt: 'Balcão de madeira com faixa verde de uma cantina vazia, armários marrons e cadeiras plásticas brancas em primeiro plano',
    comment: 'A cantina sem ninguém mostra o silêncio do campus fora do horário. As cadeiras brancas na frente dão profundidade e levam o olhar até o balcão.',
  },
  {
    file: 'foto-5', title: 'Debaixo da escada', landscape: true, src: '/ifsc/ativ1/foto-5.jpg', approved: true,
    alt: 'Balde amarelo de limpeza com rodo azul encostado embaixo de uma escada branca',
    comment: 'O amarelo do balde é a única cor forte num canto todo branco. A diagonal da escada corta o quadro e guia o olhar até ele.',
  },
];

const ATIV2_PHOTOS: ActivityPhoto[] = [
  {
    file: 'ativ2-1', title: 'Guarda-sóis', src: '/ifsc/ativ2/foto-1.jpg', approved: true, favorite: true,
    alt: 'Dois guarda-sóis vistos de baixo contra o céu azul: um azul com varetas de madeira e outro listrado de branco e cinza',
    comment: 'Favorita. Olhando de baixo, as varetas de madeira formam uma estrela, e o azul do tecido conversa com o azul do céu. As listras do segundo guarda-sol quebram a cena e dão ritmo.',
  },
  {
    file: 'ativ2-2', title: 'O melhor lugar do mundo', tall: true, src: '/ifsc/ativ2/foto-2.jpg', approved: true,
    alt: 'Placas de madeira pintadas à mão num poste, à noite: O melhor lugar do mundo é aqui e agora',
    comment: 'As placas coloridas saltam do fundo escuro e a frase fala por si. Fotografada de baixo, a placa fica maior e mais forte no quadro.',
  },
  {
    file: 'ativ2-3', title: 'Céu em brasa', src: '/ifsc/ativ2/foto-3.jpg', approved: true,
    alt: 'Céu do fim de tarde coberto de nuvens em tons de laranja, rosa e lilás',
    comment: 'Só céu, nada mais. A luz do pôr do sol pinta as nuvens de laranja e rosa, e as nuvens escuras embaixo dão peso e profundidade.',
  },
];

const ATIV6_PHOTOS: ActivityPhoto[] = [
  {
    file: 'ativ6', title: 'Guarda-sóis', src: '/ifsc/ativ2/foto-1.jpg', approved: true, highlight: true,
    alt: 'Dois guarda-sóis vistos de baixo contra o céu azul: um azul com varetas de madeira e outro listrado de branco e cinza',
    comment:
      'Escolhida como a mais bonita e limpa de todas. O fundo é só céu azul, sem nada atrapalhando, e a luz do sol atravessa o tecido de forma suave, como uma luz de estúdio. As varetas desenham uma estrela que leva o olhar ao centro, e as cores (azul, madeira e listras) combinam entre si.',
  },
];

export const ACTIVITIES_DATA: ActivityCardData[] = [
  {
    id: 'ativ-1',
    n: 1,
    title: 'IFSC invisível',
    theme: 'Fotografia noturna no campus',
    status: 'concluido',
    shortDescription: 'O campus do IFSC por cantos que ninguém repara: um mural, uma maquete, objetos e espaços vazios.',
    details: [{ label: 'Pedido', text: '5 fotos no campus + foto favorita justificada.' }],
    photos: ATIV1_PHOTOS,
  },
  {
    id: 'ativ-2',
    n: 2,
    title: 'Livre',
    theme: 'Fotografia diurna, tema livre',
    status: 'concluido',
    shortDescription: 'Tema livre: cor e céu. Guarda-sóis, uma placa pintada à mão e um pôr do sol.',
    details: [{ label: 'Pedido', text: 'Fotos de tema livre + foto favorita justificada.' }],
    photos: ATIV2_PHOTOS,
  },
  {
    id: 'ativ-3',
    n: 3,
    title: 'Por aí',
    theme: '5 regras de composição',
    status: 'pendente',
    shortDescription: 'Uma foto para cada regra: terços, simetria, contraste de cor, contraste de luz e linhas-guia.',
    details: [{ label: 'Pedido', text: '5 fotos (1 por regra) + favorita e a que menos gostou, com justificativa.' }],
    missing: ['5 fotos (1 por regra) com legenda', 'favorita', 'a que menos gostou'],
  },
  {
    id: 'ativ-4',
    n: 4,
    title: 'Pesquisa',
    theme: 'Triângulo da exposição na prática · mesma saída da Atividade 5',
    status: 'concluido',
    shortDescription:
      'A pesquisa sobre ISO, abertura e velocidade virou prática na saída fotográfica “Uma noite no IFSC” (11/09/2026). Mesmas fotos da Atividade 5.',
    photos: ATIV5_PHOTOS,
  },
  {
    id: 'ativ-5',
    n: 5,
    title: 'Triângulo da exposição',
    theme: '“Uma noite no IFSC” · saída fotográfica de 11/09/2026',
    status: 'concluido',
    shortDescription:
      'Saída fotográfica noturna no campus, com câmera profissional, mostrando as três modalidades do triângulo da exposição: light painting, congelamento de movimento e fundo desfocado.',
    details: [
      { label: 'Data', text: '11/09/2026, das 19h59 às 20h11.' },
      { label: 'Arquivos', text: 'DSC01253–01259, DSC01265–01268, DSC01270, DSC01271 e DSC01274 (ordem do disparo).' },
      { label: 'Exposição', text: 'Valores aproximados. Conferir no visor da câmera antes da entrega.' },
    ],
    photos: ATIV5_PHOTOS,
  },
  {
    id: 'ativ-6',
    n: 6,
    title: 'Estúdio',
    theme: 'Luz controlada: cores, retrato e produto',
    status: 'concluido',
    shortDescription: 'De todas as fotos do portfólio, a mais bonita e limpa, em destaque, com o porquê.',
    photos: ATIV6_PHOTOS,
  },
  {
    id: 'ativ-7',
    n: 7,
    title: 'Análise',
    theme: 'Comentário técnico de cada foto',
    status: 'concluido',
    shortDescription:
      'Cada foto deste portfólio já traz o comentário logo abaixo: o que ela mostra, como foi composta e, na Atividade 5, o que o triângulo da exposição (ISO, abertura e velocidade) fez nela.',
  },
  {
    id: 'ativ-8',
    n: 8,
    title: 'Fotografia em movimento',
    theme: 'Vídeo “VERDE”',
    status: 'concluido',
    shortDescription: 'Vídeo guiado pela palavra “VERDE”, com título e nome no próprio vídeo.',
    video: { title: 'VERDE', author: 'Barbarotti', duration: '1min14', file: '/ifsc/ativ8/video.mp4', poster: '/ifsc/ativ8/capa.jpg' },
  },
  {
    id: 'ativ-9',
    n: 9,
    title: 'Entrega final',
    theme: 'Portfólio completo',
    status: 'pendente',
    shortDescription: 'Portfólio com as atividades 1 a 8, enviado no SIGAA e por e-mail à professora.',
    details: [
      { label: 'Socialização', text: '04/12/2026.' },
      { label: 'Envio', text: 'SIGAA (Portfólio, Tarefa 4 e Tarefa 5) + e-mail da professora.' },
    ],
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

function Pending({ items }: { items: string[] }) {
  return (
    <div className="mt-6 border border-dashed border-linha p-5">
      <p className="font-display text-[11px] uppercase tracking-wider text-fumaca">[PREENCHER]</p>
      <ul className="mt-2 space-y-1 font-sans text-[13px] text-fumaca">
        {items.map((m) => (
          <li key={m}>• {m}</li>
        ))}
      </ul>
    </div>
  );
}

function VideoBlock({ video }: { video: NonNullable<ActivityCardData['video']> }) {
  const embed = video.url ? parseEmbed(video.url) : null;
  return (
    <div className="mt-6 border border-linha bg-nevoa p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-linha pb-3">
        <h4 className="font-display text-[22px] font-semibold text-carvao">“{video.title}”</h4>
        <span className="font-display text-[12px] uppercase text-fumaca">
          {video.author} · {video.duration}
        </span>
      </div>
      <div className="relative aspect-video w-full overflow-hidden border border-linha bg-branco-tela">
        {video.file ? (
          <video
            controls
            playsInline
            preload="none"
            poster={video.poster}
            className="absolute inset-0 h-full w-full bg-black object-contain"
            aria-label={`Vídeo “${video.title}”, de ${video.author}`}
          >
            <source src={video.file} type="video/mp4" />
          </video>
        ) : embed ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={
              embed.provider === 'youtube'
                ? `https://www.youtube-nocookie.com/embed/${embed.id}?rel=0`
                : `https://player.vimeo.com/video/${embed.id}?dnt=1`
            }
            title={`Vídeo “${video.title}”, de ${video.author}`}
            loading="lazy"
            allow="fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="grid h-full w-full place-items-center p-6 text-center">
            <p className="font-display text-[12px] uppercase text-fumaca">
              [PREENCHER: link do vídeo “{video.title}”]
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoGrid({ ativ }: { ativ: ActivityCardData }) {
  const all = ativ.photos ?? [];
  const approved = all.filter((p) => p.approved);
  if (!approved.length) {
    return all.length ? (
      <Pending items={[`${all.length} fotos pré-selecionadas aguardando aprovação do autor`]} />
    ) : null;
  }
  // Separadas por modalidade, na ordem pedida
  const order = ['Light painting', 'Congelamento', 'Fundo desfocado'] as const;
  const groups = [
    ...order.map((m) => ({ title: m as string, photos: approved.filter((p) => p.modality === m) })),
    { title: 'Fotos', photos: approved.filter((p) => !p.modality) },
  ].filter((g) => g.photos.length);
  return (
    <div className="mt-6 space-y-10">
      {groups.map((g) => (
        <section key={g.title} aria-label={g.title}>
          <h4 className="mb-4 flex items-baseline gap-3 border-b border-linha pb-2 font-display text-[18px] font-semibold text-carvao">
            {g.title}
            <span className="text-[12px] font-normal uppercase tracking-wider text-fumaca">
              {g.photos.length} {g.photos.length > 1 ? 'fotos' : 'foto'}
            </span>
          </h4>
          {/* Mesmo formato (16:9, menos a placa), mesma margem e mesmo alinhamento em toda a grade */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {g.photos.map((photo) => (
              <figure
                key={photo.file}
                className={`flex flex-col border border-linha bg-branco-tela ${photo.highlight ? 'sm:col-span-2 lg:col-span-3' : ''} ${photo.highlight && photo.tall ? 'sm:flex-row sm:items-stretch' : ''}`}
              >
                <div
                  className={`relative w-full overflow-hidden bg-nevoa ${photo.highlight && photo.tall ? 'sm:w-[42%] lg:w-[34%] sm:shrink-0' : ''} ${photo.tall ? 'aspect-[9/16]' : 'aspect-video'}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={photo.highlight ? '(max-width: 1200px) 100vw, 1200px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                    className="object-cover"
                  />
                </div>
                <figcaption className={`flex flex-1 flex-col p-4 ${photo.highlight ? 'sm:justify-center sm:p-8 sm:text-[15px]' : ''}`}>
                  <span className="font-display text-[12px] uppercase tracking-wider text-carvao">
                    {photo.title ?? photo.file}
                    {photo.favorite ? <span className="ml-2 text-azul-ceu">★ Favorita</span> : null}
                  </span>
                  {photo.credits ? <span className="mt-0.5 font-sans text-[11px] text-azul-ceu">{photo.credits}</span> : null}
                  {photo.iso || photo.aperture || photo.shutter ? (
                  <span className="mt-2.5 flex flex-wrap gap-1.5 border-y border-linha py-1.5 font-display text-[10.5px] uppercase text-carvao">
                    {[photo.iso, photo.aperture, photo.shutter].filter(Boolean).map((v) => (
                      <span key={v} className="border border-linha px-1.5 py-0.5">
                        {v}
                      </span>
                    ))}
                  </span>
                  ) : null}
                  <span className="mt-2.5 font-sans text-[12.5px] leading-relaxed text-fumaca">{photo.comment}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ActivityCard({ ativ }: { ativ: ActivityCardData }) {
  return (
    <article id={ativ.id} className="scroll-mt-24 border border-linha bg-branco-tela p-6 lg:p-8">
      <div className="flex flex-col gap-4 border-b border-linha pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-[12px] font-semibold uppercase tracking-wider text-azul-ceu">
            Atividade {pad(ativ.n)} <span className="text-carvao">·</span>{' '}
            <span className="font-normal text-fumaca">{ativ.theme}</span>
          </p>
          <h3 className="font-display text-[26px] font-semibold tracking-[-0.02em] md:text-[32px] mt-2 text-carvao">{ativ.title}</h3>
          <p className="mt-2 max-w-[850px] font-sans text-[13.5px] leading-relaxed text-fumaca">{ativ.shortDescription}</p>
        </div>
        <span
          className={`shrink-0 self-start border px-3 py-1 font-display text-[11px] uppercase tracking-wider ${
            ativ.status === 'concluido'
              ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
              : ativ.status === 'aguardando_aprovacao'
                ? 'border-azul-ceu bg-azul-ceu/15 text-azul-ceu'
                : 'border-linha bg-nevoa text-fumaca'
          }`}
        >
          {STATUS_LABEL[ativ.status]}
        </span>
      </div>

      {ativ.details?.length ? (
        <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ativ.details.map((d) => (
            <div key={d.label} className="font-sans text-[12.5px]">
              <dt className="inline font-semibold text-carvao">{d.label}: </dt>
              <dd className="inline text-fumaca">{d.text}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <PhotoGrid ativ={ativ} />
      {ativ.video ? <VideoBlock video={ativ.video} /> : null}
      {ativ.missing?.length ? <Pending items={ativ.missing} /> : null}
    </article>
  );
}

function Notices() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="border border-azul-ceu bg-azul-ceu/10 p-5 text-carvao">
        <span className="font-display text-[11px] uppercase tracking-wider text-azul-ceu">Aviso · 04/12</span>
        <h4 className="font-display text-[17px] font-semibold mt-2.5">Socialização dos portfólios em 04/12</h4>
        <p className="mt-2 font-sans text-[12.5px] leading-relaxed text-fumaca">
          Apresentação dos portfólios para a turma. Recuperação em EAD em 12/12/2026.
        </p>
      </div>
      <div className="border border-red-600 bg-red-600/10 p-5 text-carvao">
        <span className="font-display text-[11px] uppercase tracking-wider text-red-600">Frequência</span>
        <h4 className="font-display text-[17px] font-semibold mt-2.5">Limite de faltas</h4>
        <p className="mt-2 font-sans text-[12.5px] leading-relaxed text-fumaca">
          Cada aula vale 4 faltas. A falta de 23/10 pode ser abonada com a entrega do vídeo da Tarefa 5.
        </p>
      </div>
      <div className="border border-linha bg-branco-tela p-5 text-carvao">
        <span className="font-display text-[11px] uppercase tracking-wider text-fumaca">Avaliação</span>
        <h4 className="font-display text-[17px] font-semibold mt-2.5">Notas 2 e 3</h4>
        <p className="mt-2 font-sans text-[12.5px] leading-relaxed text-fumaca">
          Nota 2: atividades 5, 6, 7 e 8. Nota 3: portfólio completo.
        </p>
      </div>
    </div>
  );
}

type Tab = 'todas' | 'atividades' | 'avisos';

export function IFSCActivitiesSection() {
  const [tab, setTab] = useState<Tab>('todas');
  const [only, setOnly] = useState<number | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'atividades', label: 'Atividades 1 a 9' },
    { key: 'avisos', label: 'Avisos' },
  ];
  const shown = only ? ACTIVITIES_DATA.filter((a) => a.n === only) : ACTIVITIES_DATA;

  return (
    <section className="relative mt-20 border-t border-linha pt-16 lg:mt-28 lg:pt-24" id="ifsc-modulo-pratico">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-display text-[11px] uppercase tracking-widest text-azul-ceu">
            <span className="size-2 bg-azul-ceu" />
            IFSC · Módulo Prático
          </p>
          <h2 className="text-[40px] leading-[1.02] font-display font-semibold tracking-[-0.03em] md:text-[56px] mt-3 text-carvao">
            <SplitText text="Portfólio de fotografia" speed="slow" mode="words" />
            <span className="block text-fumaca">
              <SplitText text="Atividades 1 a 9" speed="slow" mode="words" delay={80} />
            </span>
          </h2>
        </div>

        <div role="tablist" aria-label="Seções do módulo" className="flex flex-wrap border-t border-l border-linha">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => {
                setTab(t.key);
                setOnly(null);
              }}
              className={`border-r border-b border-linha px-5 py-3 font-display text-[13px] uppercase transition-colors ${
                tab === t.key ? 'bg-azul-ceu font-semibold text-white' : 'bg-branco-tela text-carvao hover:bg-nevoa'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'atividades' ? (
        <div className="mt-6 flex flex-wrap items-center gap-1.5 border-b border-linha pb-4" aria-label="Escolher atividade">
          {[null, ...ACTIVITIES_DATA.map((a) => a.n)].map((n) => (
            <button
              key={n ?? 'all'}
              type="button"
              aria-pressed={only === n}
              onClick={() => setOnly(n)}
              className={`border px-2.5 py-1 font-display text-[11px] uppercase transition-colors ${
                only === n
                  ? 'border-azul-ceu bg-azul-ceu font-semibold text-white'
                  : 'border-linha text-fumaca hover:border-linha'
              }`}
            >
              {n ? `Ativ. ${n}` : 'Todas'}
            </button>
          ))}
        </div>
      ) : null}

      {tab !== 'atividades' ? (
        <ScrollReveal delay={40}>
          <Notices />
        </ScrollReveal>
      ) : null}

      {tab !== 'avisos' ? (
        <div className="mt-10 space-y-10">
          {shown.map((a) => (
            <ActivityCard key={a.id} ativ={a} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
