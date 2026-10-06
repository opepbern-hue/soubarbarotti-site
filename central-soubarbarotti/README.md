# Central de Prospecção, @soubarbarotti

Todo dia você abre a central e aperta **Começar o dia**. Ela encontra negócios, **valida o Instagram de cada um antes de qualquer coisa** e só entrega quem vale a pena chamar, já com a mensagem pronta para o Instagram e para o WhatsApp. Depois você acompanha cada conversa num funil em kanban até o contrato.

## O que acontece quando você aperta o botão

```
Google Maps ──> site público ──> INSTAGRAM ──> IA dá a nota ──> IA escreve ──> sua lista de hoje
(negócios)      (acha o @ e      (existe? é      (verba, lacuna   (DM, WhatsApp,
                 sinais de verba) comercial?      de vídeo,        follow-ups,
                                  postou nos      encaixe)         ideia de teaser)
                                  últimos 45 dias?
                                  seguidores na faixa?)
                                  Não: descarta.
```

- **O Instagram vem primeiro.** Perfil parado, pessoal, pequeno demais ou grande demais é descartado antes de gastar IA.
- **Os números viram argumento.** A IA sabe quantos seguidores o negócio tem, quanto do feed é vídeo e sobre o que foram os últimos posts, então a mensagem cita um post real deles.
- **Mistura de nichos por dia:** 50% imobiliário, 25% estética e 25% gastronomia (dá para mudar em `MIX_NICHOS`).
- **A busca começa perto e vai abrindo:** Grande Floripa e litoral primeiro, depois o resto de SC, depois as capitais do Sul e Sudeste. Ela só busca mais quando a fila acaba.
- **Os leads aparecem na lista conforme ficam prontos.** Você já pode começar a chamar enquanto a busca continua.

## Instalação (uma vez)

1. Instale o Python 3.10 ou superior (python.org).
2. Na pasta do projeto: `pip install -r requirements.txt`
3. Copie `.env.example` para `.env` e preencha:
   - **GOOGLE_PLACES_API_KEY**: em console.cloud.google.com, ative a **Places API (New)** e crie uma chave. Crie também um **alerta de orçamento** no faturamento.
   - **ANTHROPIC_API_KEY**: em console.anthropic.com.
4. Conecte o Instagram (próxima seção). Se pular, a central funciona do mesmo jeito, mas cada perfil chega marcado para você conferir à mão.

## Conectar o Instagram (validação automática)

A validação usa a **Business Discovery**, que é a API oficial da Meta para ler perfis públicos de contas comerciais. É gratuita, mas exige uma configuração inicial de uns 20 minutos:

1. **O @soubarbarotti precisa ser conta profissional** (comercial ou criador de conteúdo) e estar **ligado a uma Página do Facebook**. No app do Instagram, vá em Configurações, depois Tipo de conta e ferramentas, e Contas vinculadas.
2. Em **developers.facebook.com**, crie um app do tipo **Business** e adicione o produto **Instagram** (a opção de configuração com login do Facebook).
3. Abra o **Graph API Explorer** (developers.facebook.com/tools/explorer), escolha o seu app e gere um token de usuário com estas permissões:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
4. No painel do app, em Configurações e depois Básico, copie o **App ID** e o **App Secret**.
5. Na pasta da central, rode `python configurar_instagram.py` e cole o que ele pedir.

O script troca o token por um que vale uns 60 dias, descobre o ID da sua conta, faz um teste e grava tudo no `.env`. Quando faltar uma semana para vencer, o painel avisa, e aí é só repetir os passos 3 e 5.

A Meta limita quantas consultas você pode fazer por hora. A central respeita isso sozinha: se a Meta pedir uma pausa, ela para e avisa no painel. Os negócios que ficaram esperando voltam na próxima vez que você apertar o botão.

## Uso diário

```bash
python app.py
```

A central abre no navegador em `http://localhost:8765`. Deixe a janela do terminal aberta enquanto usa.

**Na tela Hoje:**

1. Aperte **Começar o dia** e escolha quantos quer (10, 25 ou 40).
2. Abra o primeiro da lista. O card mostra:
   - os números do Instagram do negócio;
   - por que ele é lead e qual o ângulo de venda;
   - a ideia de teaser;
   - a mensagem pronta.
3. Aperte **Copiar e abrir o Instagram**. A mensagem vai para a área de transferência e a conversa com o negócio abre. Cole e envie. Se preferir, use **Abrir no WhatsApp**, que já abre com a mensagem de apresentação escrita.
4. A central pergunta se você enviou. Responda **Sim** e ela marca como chamado, agenda os follow-ups e abre o próximo da lista.
5. Na coluna da direita aparecem os **follow-ups** do dia (dia 2, dia 5 com o teaser e dia 10 com a despedida) e os **retornos** que você marcou.

Se apertar o botão de novo no mesmo dia, ele vira **Buscar mais** e traz outra leva.

**Na tela Funil:**

- O kanban tem as colunas Para chamar, Chamado, Respondeu, Call marcada, Proposta enviada, Fechado e Perdido.
- Arraste os cards entre as colunas. No celular, abra o card e toque na etapa.
- Clique num card para abrir a ficha. Nela ficam todas as mensagens, o próximo retorno, o valor da proposta, o marcador de teaser pronto, as anotações e o histórico.
- **Baixar planilha (CSV)** exporta tudo para o Excel ou o Google Sheets.
- **O que está funcionando** (acima do kanban) mostra a taxa de resposta por nicho, por canal e por nota, depois dos primeiros 5 chamados. Use isso para decidir onde insistir.

**Na ficha de cada lead, o assistente:**

- **Teaser:** o botão **Gerar prompt do Seedance** escreve o prompt do teaser de 6 a 8 s, vertical, no formato de blocos da sua skill, a partir da ideia do lead e do que o Instagram dele mostra. A primeira linha diz qual foto pegar no perfil deles. Copie e cole no Higgsfield. No card do Hoje, o link **Prompt do teaser** leva direto para lá.
- **O cliente respondeu?:** cole a resposta do cliente e aperte **Sugerir resposta**. A IA diz o que ele quis dizer (interesse, preço, objeção, pedido para parar) e escreve a resposta seguindo o playbook, sempre puxando para a call de 20 minutos. Se fizer sentido, aparece o botão para mover o lead de etapa. A resposta do cliente fica salva no histórico.
- **Proposta:** escreva nas **Anotações** o que ouviu na call e aperte **Montar proposta**. Sai uma página com a sua marca, com o diagnóstico, as ideias para eles, os 3 pacotes (com o recomendado em destaque), o seu processo e as condições. Abra e aperte **Salvar como PDF**: cabe sempre numa folha A4. Os pacotes e preços ficam em `PACOTES`, no `config.py`. Coloque o seu WhatsApp e o seu e-mail no `.env` para eles aparecerem na proposta.

Tudo fica salvo em `dados/central.db`, no seu computador. Toda vez que você abre a central, ela guarda uma cópia do dia em `dados/backups` e mantém as dos últimos 14 dias.

## Ajustes em `config.py`

| O quê | Onde |
|---|---|
| Quantos por dia | `LEADS_POR_DIA` |
| Nota mínima da IA | `NOTA_MINIMA` |
| Perfil parado há quantos dias descarta | `IG_MAX_DIAS_SEM_POSTAR` |
| Faixa de seguidores | `IG_MIN_SEGUIDORES` e `IG_MAX_SEGUIDORES` |
| Mistura de nichos | `MIX_NICHOS` |
| Cidades e termos de busca | `CAMADAS_CIDADES` e `NICHOS` |
| Link que vai no WhatsApp | `LINK_POR_NICHO` (troque pelas páginas de serviço do plano de SEO quando estiverem no ar) |
| O que a IA pode citar como prova | `PROVAS_CONFIRMADAS` |

Os números da página de vendas (+340 leads no Grand Life Residence Pagani e +1.200 seguidores na HOF Clinic) **não entram nas mensagens** até você confirmar que são reais e que os clientes autorizam o uso.

## Regras que protegem você

- **Nada é enviado sozinho.** A central prepara e abre a conversa, e quem aperta enviar é você. Automação de envio derruba a conta do Instagram e o número do WhatsApp.
- **Ritmo:** até uns 25 contatos novos por dia, mais os follow-ups. Use um **WhatsApp Business** separado do pessoal.
- **Sem scraping:** usa só a API oficial do Google, a API oficial da Meta e a página inicial pública dos sites.
- **LGPD:** só dados públicos de **empresas**, para contato comercial ligado ao negócio delas. A mensagem de WhatsApp termina com uma saída educada. Se alguém pedir para parar, descarte o lead e não mande mais nada.

Depois da primeira resposta, siga o `PLAYBOOK_VENDAS.md`: call de diagnóstico, proposta, objeções, fechamento e pós-venda.
