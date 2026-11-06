import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/site/Hud';
import { Fill } from '@/components/site/Text';
import { getSettings } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description:
    'Quais dados o formulário de contato do soubarbarotti coleta, para que servem, por quanto tempo ficam guardados e como pedir a exclusão.',
  alternates: { canonical: '/privacidade' },
};

export default async function PrivacidadePage() {
  const s = await getSettings();
  const updated = new Date(s.privacyUpdatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const email =
    s.contactEmail && !/\[PREENCHER/i.test(s.contactEmail) ? s.contactEmail : 'contato@soubarbarotti.com.br';

  const blocks: { title: string; body: string[] }[] = [
    {
      title: 'Quem cuida dos seus dados',
      body: [
        `Este site é do Barbarotti (@soubarbarotti), diretor de vídeo com IA em Palhoça, SC. Sou eu o responsável pelos dados enviados aqui. Contato: ${email}.`,
      ],
    },
    {
      title: 'O que eu coleto',
      body: [
        'Só o que você escreve no formulário de contato: nome, e-mail e mensagem.',
        'Para evitar spam, o servidor guarda por até 7 dias um código anônimo gerado a partir do seu IP. O IP em si não é salvo.',
      ],
    },
    {
      title: 'Para que eu uso',
      body: [
        'Para ler a sua mensagem e responder por e-mail sobre o seu projeto. Não uso os seus dados para marketing, não vendo e não passo para ninguém.',
        'Quando chega uma mensagem, recebo um aviso no meu WhatsApp. O aviso não leva o seu nome, e-mail nem o texto da mensagem.',
      ],
    },
    {
      title: 'Onde os dados ficam e por quanto tempo',
      body: [
        'As mensagens ficam guardadas no banco de dados do site, em infraestrutura de nuvem segura com acesso protegido por senha.',
        'Guardo cada mensagem por até 12 meses depois do último contato. Depois disso, apago.',
      ],
    },
    {
      title: 'Cookies',
      body: [
        'O site não usa cookies de rastreamento nem de publicidade. O único cookie é o de login da área de administração, usado só por mim.',
        'Vídeos do YouTube ou do Vimeo só carregam quando você clica para assistir. A partir daí, valem as regras de privacidade desses serviços.',
      ],
    },
    {
      title: 'Seus direitos',
      body: [
        `Pela LGPD (Lei 13.709/2018), você pode pedir a qualquer momento para ver, corrigir ou apagar os seus dados. É só escrever para ${email}. Eu respondo em até 15 dias.`,
      ],
    },
  ];

  return (
    <section className="bg-paragon-white pt-[124px] pb-[100px] text-paragon-black md:pt-[150px] lg:pt-[170px] lg:pb-[140px]">
      <Container>
        <div className="border-b border-paragon-black pb-10">
          <SectionHeading
            as="h1"
            size="page"
            label={`ATUALIZADO EM ${updated}`}
            line1="Política de"
            line2="Privacidade"
          />
        </div>

        <div className="mt-12 grid grid-cols-1 border-t border-l border-paragon-black md:grid-cols-2 lg:mt-16">
          {blocks.map((b, idx) => (
            <section key={b.title} className="border-r border-b border-paragon-black bg-paragon-white p-6 lg:p-9">
              <span className="font-kicker text-[12px] text-paragon-red uppercase">
                [0{idx + 1}]
              </span>
              <h2 className="text-paragon-h4 mt-2 text-paragon-black">{b.title}</h2>
              {b.body.map((t, i) => (
                <p key={i} className="text-paragon-body mt-3 text-paragon-black/85">
                  <Fill text={t} />
                </p>
              ))}
            </section>
          ))}
        </div>
      </Container>
    </section>
  );
}
