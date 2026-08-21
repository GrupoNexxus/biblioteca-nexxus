// Nomes de categoria mais curtos para caber bem no filtro e nos cards
// (o valor usado para filtrar continua sendo o nome completo, salvo no banco).
export const CATEGORY_SHORT = {
  'Recursos Humanos / Departamento Pessoal': 'RH / Depto. Pessoal',
  'Liderança e Gestão': 'Liderança e Gestão',
  'Treinamento e Desenvolvimento': 'Treinamento',
  Vendas: 'Vendas',
  'Legislação Trabalhista': 'Legislação Trabalhista',
  'Segurança do Trabalho': 'Segurança do Trabalho',
  'Dinâmicas e Entretenimento': 'Dinâmicas',
  'Desenvolvimento Pessoal e Relacionamentos': 'Desenv. Pessoal',
  'Gestão de Pessoas': 'Gestão de Pessoas',
  'Fiscal / Tributário': 'Fiscal / Tributário',
  'Finanças Pessoais': 'Finanças Pessoais',
  'Atendimento e Experiência do Cliente': 'Atendimento ao Cliente',
  'Empreendedorismo e Liderança': 'Empreend. e Liderança',
  'Liderança e Coaching': 'Liderança e Coaching',
  Literatura: 'Literatura',
  'Estratégia e Liderança': 'Estratégia e Liderança',
  'Desenvolvimento Pessoal e Bem-estar': 'Bem-estar',
  'Carreira e Desenvolvimento Profissional': 'Carreira',
  'Inovação e Gestão': 'Inovação e Gestão',
  'Empreendedorismo e Inovação': 'Empreend. e Inovação',
  'Negociação e Comunicação': 'Negociação',
  'Liderança e Carreira': 'Liderança e Carreira',
  'Desenvolvimento Pessoal e Motivação': 'Motivação',
  'Vendas e Prospecção': 'Vendas e Prospecção',
};

export function shortCategory(name) {
  return CATEGORY_SHORT[name] || name;
}

// Cor do card varia conforme a categoria (5 combinações do design system),
// sempre a mesma cor para a mesma categoria — dá variedade sem ser aleatório.
export const COVER_COLORS = ['cover-c1', 'cover-c2', 'cover-c3', 'cover-c4', 'cover-c5'];

export function coverColorClass(categoria = '') {
  let hash = 0;
  for (let i = 0; i < categoria.length; i++) hash = (hash * 31 + categoria.charCodeAt(i)) >>> 0;
  return COVER_COLORS[hash % COVER_COLORS.length];
}

export function statusClass(status) {
  return (
    { Disponível: 'disponivel', Emprestado: 'emprestado', Reservado: 'reservado', Indisponível: 'indisponivel' }[
      status
    ] || 'indisponivel'
  );
}

export function solicStatusClass(s) {
  return (
    {
      Solicitado: 'reservado',
      Aprovado: 'disponivel',
      Recusado: 'emprestado',
      'Aguardando retirada': 'reservado',
      Emprestado: 'emprestado',
      Devolvido: 'disponivel',
    }[s] || 'indisponivel'
  );
}

export function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('pt-BR');
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isAtrasado(l) {
  return l.status === 'Emprestado' && l.data_prevista_devolucao && l.data_prevista_devolucao < todayISO();
}

export function isVencendo(l) {
  if (l.status !== 'Emprestado' || !l.data_prevista_devolucao) return false;
  const diff = (new Date(l.data_prevista_devolucao) - new Date(todayISO())) / 86400000;
  return diff >= 0 && diff <= 3;
}

export function emailDomainOk(email, allowedDomains) {
  const parts = email.split('@');
  return parts.length === 2 && allowedDomains.includes(parts[1].toLowerCase());
}
