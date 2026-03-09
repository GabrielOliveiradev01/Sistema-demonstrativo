// Dados mock — Profissionais: Centro de Performance Operacional

export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  unidade: string;
  receitaMes: number;
  ticketMedio: number;
  taxaOcupacao: number;
  taxaNoShow: number;
  cancelamentos: number;
  horasTrabalhadas: number;
  receitaPorHora: number;
}

export interface PerfilProfissional extends Profissional {
  receitaAno: number;
  horasOciosas: number;
  metaIndividual: number;
  servicosMaisRealizados: { nome: string; qtd: number; margem: number }[];
  insightsIA: string[];
  horariosFixos: string;
  intervalos: string;
  ferias: string;
  crescimentoMensal: number;
}

// Visão geral
export const VISAO_GERAL_PROF = {
  total: 12,
  receitaTotalMes: 84750,
  maisRentavel: { nome: "Ana Silva", valor: 28400 },
  menorOcupacao: { nome: "Carlos Lima", ocupacao: 42 },
  ocupacaoMediaGeral: 68,
  metaMediaPorProfissional: 7062,
};

// Lista de profissionais
export const LISTA_PROFISSIONAIS: Profissional[] = [
  {
    id: "1",
    nome: "Ana Silva",
    especialidade: "Coloração",
    unidade: "Matriz",
    receitaMes: 28400,
    ticketMedio: 245,
    taxaOcupacao: 89,
    taxaNoShow: 3,
    cancelamentos: 2,
    horasTrabalhadas: 68,
    receitaPorHora: 418,
  },
  {
    id: "2",
    nome: "Carlos Lima",
    especialidade: "Corte",
    unidade: "Matriz",
    receitaMes: 19200,
    ticketMedio: 95,
    taxaOcupacao: 42,
    taxaNoShow: 12,
    cancelamentos: 5,
    horasTrabalhadas: 52,
    receitaPorHora: 369,
  },
  {
    id: "3",
    nome: "Fernanda Costa",
    especialidade: "Estética",
    unidade: "Filial Centro",
    receitaMes: 25100,
    ticketMedio: 180,
    taxaOcupacao: 78,
    taxaNoShow: 6,
    cancelamentos: 3,
    horasTrabalhadas: 62,
    receitaPorHora: 405,
  },
  {
    id: "4",
    nome: "Roberto Mendes",
    especialidade: "Barbearia",
    unidade: "Matriz",
    receitaMes: 11250,
    ticketMedio: 75,
    taxaOcupacao: 55,
    taxaNoShow: 18,
    cancelamentos: 8,
    horasTrabalhadas: 48,
    receitaPorHora: 234,
  },
];

// Perfil completo
export function getPerfilProfissional(id: string): PerfilProfissional | null {
  const p = LISTA_PROFISSIONAIS.find((x) => x.id === id);
  if (!p) return null;
  return {
    ...p,
    receitaAno: p.receitaMes * 11,
    horasOciosas: Math.round((p.horasTrabalhadas / (p.taxaOcupacao / 100)) * (1 - p.taxaOcupacao / 100)),
    metaIndividual: 7500,
    servicosMaisRealizados: [
      { nome: "Coloração", qtd: 42, margem: 72 },
      { nome: "Corte", qtd: 38, margem: 65 },
      { nome: "Hidratação", qtd: 28, margem: 68 },
    ],
    insightsIA: [
      "Este profissional pode aumentar preço em 8%.",
      "Alta demanda às quintas às 18h.",
      "Baixa ocupação às terças 14h.",
      "Está perdendo R$ 2.400/mês por ociosidade.",
    ],
    horariosFixos: "Seg–Sáb 09h–18h",
    intervalos: "Almoço 12h–13h",
    ferias: "Nenhuma agendada",
    crescimentoMensal: 12,
  };
}

// Comissões e rentabilidade
export const COMISSOES_EXEMPLO = {
  comissaoPorServico: "40% em corte, 35% em coloração",
  comissaoVariavel: "Bônus a partir de 80% da meta",
  metaFaturamento: 7500,
  metaOcupacao: 75,
  bonusPerformance: "R$ 500 se bater meta mês",
  ranking: [
    { posicao: 1, nome: "Ana Silva", receita: 28400 },
    { posicao: 2, nome: "Fernanda Costa", receita: 25100 },
    { posicao: 3, nome: "Carlos Lima", receita: 19200 },
    { posicao: 4, nome: "Roberto Mendes", receita: 11250 },
  ],
};

// Alertas operacionais
export const ALERTAS_PROFISSIONAIS = [
  { id: "1", tipo: "sobrecarga", texto: "Ana Silva está sobrecarregada esta semana.", acao: "Redistribuir agenda" },
  { id: "2", tipo: "subutilizado", texto: "Carlos Lima está subutilizado (42% ocupação).", acao: "Criar promoção" },
  { id: "3", tipo: "noshow", texto: "Roberto Mendes com taxa de no-show acima da média (18%).", acao: "Ajustar confirmação" },
  { id: "4", tipo: "cancelamento", texto: "Cancelamentos concentrados em terças 14h–16h.", acao: "Ajustar horário" },
];

// Métricas importantes
export const METRICAS_PROFISSIONAIS = {
  receitaPorHoraTrabalhada: 358,
  receitaPorCadeira: 21187,
  indiceEficiencia: 72,
  tempoMedioEntreAtendimentos: 22,
  taxaRetencaoClientes: 78,
};
