// Consulta pública e gratuita de CNPJ (sem necessidade de cartão ou token pago)
// Fontes: BrasilAPI e CNPJá Open API

export type CnpjData = {
  cnpj: string;
  cnpjFormatado: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  porte: string; // MEI, ME, EPP, DEMAIS
  isMei: boolean;
  dataAbertura: string;
  cidade: string;
  estado: string;
  bairro: string;
  logradouro: string;
  numero: string;
  cep: string;
  socios: Array<{ nome: string; cargo: string }>;
  socioPrincipal: string | null;
  primeiroNomeSocio: string | null;
  telefoneDivulgado: string | null;
  emailCorporativo: string | null;
  linkCnpja: string;
  avisoLgpd?: string;
};

export async function consultarCnpjGratuito(rawCnpj: string): Promise<CnpjData | null> {
  const cnpj = rawCnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return null;

  const linkCnpja = `https://open.cnpja.com/office/${cnpj}`;

  try {
    // 1ª Tentativa: BrasilAPI (rápida, aberta e sem limite rígido)
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      headers: { 'User-Agent': 'soubarbarotti-portfolio/1.0' },
      next: { revalidate: 86400 }, // Cache de 24h
    });

    if (res.ok) {
      const data = await res.json();
      
      const razaoSocial = (data.razao_social || '').trim();
      const nomeFantasia = (data.nome_fantasia || razaoSocial).trim();
      const situacao = (data.descricao_situacao_cadastral || 'ATIVA').toUpperCase();
      
      // Identificar porte e se é MEI
      const porteDesc = (data.porte || '').toUpperCase();
      let porte = 'ME';
      let isMei = false;
      if (porteDesc.includes('MEI') || data.opcao_pelo_mei === true) {
        porte = 'MEI';
        isMei = true;
      } else if (porteDesc.includes('EPP') || data.codigo_porte === 3) {
        porte = 'EPP';
      } else if (porteDesc.includes('ME') || data.codigo_porte === 1) {
        porte = 'ME';
      } else {
        porte = porteDesc || 'DEMAIS';
      }

      // Quadro de Sócios (QSA)
      const qsa = Array.isArray(data.qsa) ? data.qsa : [];
      const socios = qsa.map((s: any) => ({
        nome: capitalize(s.nome_socio || s.nome || ''),
        cargo: capitalize(s.qualificacao_socio || s.cargo || 'Sócio'),
      })).filter((s: any) => s.nome);

      // Descobrir sócio principal para saudação ("Oi, Daniela")
      let socioPrincipal = socios.length > 0 ? socios[0].nome : null;
      let primeiroNomeSocio = socioPrincipal ? socioPrincipal.split(' ')[0] : null;

      // Se for MEI, a própria Razão Social costuma ter o nome do dono
      if (isMei && !socioPrincipal && razaoSocial) {
        // Ex: "DANIELA SILVA 12345678900" -> "Daniela Silva"
        const cleanName = razaoSocial.replace(/[0-9]/g, '').trim();
        if (cleanName) {
          socioPrincipal = capitalize(cleanName);
          primeiroNomeSocio = socioPrincipal.split(' ')[0];
        }
      }

      // Cuidados LGPD citados na pesquisa de Pedro Barbarotti:
      // Se MEI, telefone/email do cadastro costuma ser pessoal; não usar como canal principal.
      const tel = data.ddd_telefone_1 ? `${data.ddd_telefone_1}`.replace(/\D/g, '') : null;
      const email = data.email ? `${data.email}`.toLowerCase().trim() : null;

      const cnpjFormatado = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

      return {
        cnpj,
        cnpjFormatado,
        razaoSocial,
        nomeFantasia,
        situacao,
        porte,
        isMei,
        dataAbertura: formatarData(data.data_inicio_atividade),
        cidade: capitalize(data.municipio || ''),
        estado: (data.uf || '').toUpperCase(),
        bairro: capitalize(data.bairro || ''),
        logradouro: capitalize(data.logradouro || ''),
        numero: data.numero || '',
        cep: data.cep || '',
        socios,
        socioPrincipal,
        primeiroNomeSocio,
        telefoneDivulgado: isMei ? null : tel, // LGPD: protege contato pessoal de MEI
        emailCorporativo: isMei ? null : (email && !email.includes('contabil') ? email : null),
        linkCnpja,
        avisoLgpd: isMei
          ? 'Negócio MEI: dados cadastrais contêm contato pessoal. Use somente o canal público divulgado pela loja.'
          : undefined,
      };
    }
  } catch (err) {
    console.error('[cnpj] Erro consultando BrasilAPI:', err);
  }

  // Fallback estruturado com o link da CNPJá
  const cnpjFormatado = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  return {
    cnpj,
    cnpjFormatado,
    razaoSocial: '',
    nomeFantasia: '',
    situacao: 'A conferir',
    porte: 'A conferir',
    isMei: false,
    dataAbertura: '',
    cidade: '',
    estado: '',
    bairro: '',
    logradouro: '',
    numero: '',
    cep: '',
    socios: [],
    socioPrincipal: null,
    primeiroNomeSocio: null,
    telefoneDivulgado: null,
    emailCorporativo: null,
    linkCnpja,
  };
}

function capitalize(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatarData(dataIso?: string): string {
  if (!dataIso) return '';
  // Se vier no formato AAAA-MM-DD
  if (dataIso.includes('-')) {
    const [y, m, d] = dataIso.split('-');
    return `${d}/${m}/${y}`;
  }
  return dataIso;
}
