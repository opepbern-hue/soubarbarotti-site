import type { Metadata } from 'next';
import { Container, SectionHeading } from '@/components/site/Hud';
import { Fill } from '@/components/site/Text';
import { getSettings } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: 'Quais dados o formulário de contato do soubarbarotti coleta, para que servem, por quanto tempo ficam guardados e como pedir a exclusão.',
  alternates: { canonical: '/privacidade' },
};

// Texto simples para revisar. Não é aconselhamento jurídico.
export default async function PrivacidadePage() {
  const s = await getSettings();
  const updated = new Date(s.privacyUpdatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const email = s.contactEmail || '[PREENCHER: e-mail para pedidos de privacidade]';
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
        'As mensagens ficam guardadas no banco de dados do site, num servidor com acesso protegido por senha. [PREENCHER: nome do serviço de hospedagem e país do servidor].',
        'Guardo cada mensagem por [PREENCHER: prazo; sugestão: 12 meses] depois do último contato. Depois disso, apago.',
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
    <section className="pb-[100px] pt-[130px] md:pt-[170px] lg:pb-[140px] lg:pt-[190px]">
      <Container>
        <p className="font-display text-[14px] font-medium uppercase tracking-[0.02em]">Última atualização: {updated}</p>
        <SectionHeading as="h1" size="page" line1="política" line2="de privacidade" className="mt-[30px]" />
        <div className="mt-[70px] flex max-w-[760px] flex-col gap-12 lg:ml-auto lg:mt-[100px]">
          {blocks.map((b) => (
            <section key={b.title}>
              <h2 className="font-display text-[22px] font-medium tracking-[-0.01em]">{b.title}</h2>
              {b.body.map((t, i) => (
                <p key={i} className="mt-3 text-[16px] leading-[1.6] text-fumaca">
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
