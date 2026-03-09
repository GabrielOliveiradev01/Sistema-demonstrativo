// Dados mock para Clientes — Centro de Inteligência de Receita

export type ScoreConfiabilidade = "confiavel" | "moderado" | "alto_risco";
export type Segmento = "vip" | "recorrente" | "risco_abandono" | "risco_noshow" | "novo" | "inativo_30";

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ultimaVisita: string; // ISO date
  proximaVisita: string | null;
  frequenciaMedia: number; // vezes por mês
  ltv: number;
  scoreConfiabilidade: number; // 0-100
  scoreConfiabilidadeLabel: ScoreConfiabilidade;
  riscoAbandono: number; // 0-100
  canalOrigem: string;
  segmentos: Segmento[];
  riscoNoShow: number;
}

export interface PerfilCliente extends Cliente {
  ticketMedio: number;
  totalFaltas: number;
  scoreNoShow: number;
  servicoMaisContratado: string;
  profissionalFavorito: string;
  historico: ItemHistorico[];
  insightsIA: string[];
}

export interface ItemHistorico {
  id: string;
  data: string;
  tipo: "atendimento" | "cancelamento" | "reagendamento" | "pagamento" | "observacao";
  titulo: string;
  valor?: number;
}

// Métricas visão geral
export const METRICAS_CLIENTES = {
  total: 1247,
  novosNoMes: 28,
  taxaRetorno: 76,
  ativos: 892,
  emRisco: 47,
  ltvMedio: 1840,
  tempoMedioEntreVisitas: 18, // dias
  taxaReativacao: 12,
  churnRate: 8,
};

// Lista de clientes (amostra)
export const LISTA_CLIENTES: Cliente[] = [
  {
    id: "1",
    nome: "Maria Santos",
    email: "maria@email.com",
    telefone: "(11) 99999-1111",
    ultimaVisita: "2025-02-28",
    proximaVisita: "2025-03-15",
    frequenciaMedia: 2.5,
    ltv: 2450,
    scoreConfiabilidade: 92,
    scoreConfiabilidadeLabel: "confiavel",
    riscoAbandono: 5,
    canalOrigem: "Indicação",
    segmentos: ["vip", "recorrente"],
    riscoNoShow: 3,
  },
  {
    id: "2",
    nome: "João Oliveira",
    email: "joao@email.com",
    telefone: "(11) 99999-2222",
    ultimaVisita: "2025-03-01",
    proximaVisita: null,
    frequenciaMedia: 1.8,
    ltv: 1890,
    scoreConfiabilidade: 78,
    scoreConfiabilidadeLabel: "moderado",
    riscoAbandono: 22,
    canalOrigem: "Site",
    segmentos: ["recorrente"],
    riscoNoShow: 12,
  },
  {
    id: "3",
    nome: "Paula Costa",
    email: "paula@email.com",
    telefone: "(11) 99999-3333",
    ultimaVisita: "2025-01-10",
    proximaVisita: null,
    frequenciaMedia: 0.5,
    ltv: 1620,
    scoreConfiabilidade: 45,
    scoreConfiabilidadeLabel: "alto_risco",
    riscoAbandono: 68,
    canalOrigem: "Instagram",
    segmentos: ["risco_abandono", "inativo_30"],
    riscoNoShow: 28,
  },
  {
    id: "4",
    nome: "Ricardo Alves",
    email: "ricardo@email.com",
    telefone: "(11) 99999-4444",
    ultimaVisita: "2025-03-02",
    proximaVisita: "2025-03-10",
    frequenciaMedia: 2,
    ltv: 1480,
    scoreConfiabilidade: 38,
    scoreConfiabilidadeLabel: "alto_risco",
    riscoAbandono: 15,
    canalOrigem: "Google",
    segmentos: ["risco_noshow"],
    riscoNoShow: 42,
  },
  {
    id: "5",
    nome: "Fernanda Lima",
    email: "fernanda@email.com",
    telefone: "(11) 99999-5555",
    ultimaVisita: "2025-03-03",
    proximaVisita: "2025-03-20",
    frequenciaMedia: 3,
    ltv: 3200,
    scoreConfiabilidade: 95,
    scoreConfiabilidadeLabel: "confiavel",
    riscoAbandono: 2,
    canalOrigem: "Indicação",
    segmentos: ["vip", "recorrente"],
    riscoNoShow: 1,
  },
  {
    id: "6",
    nome: "Carla Dias",
    email: "carla@email.com",
    telefone: "(11) 99999-6666",
    ultimaVisita: "2025-02-15",
    proximaVisita: null,
    frequenciaMedia: 1.2,
    ltv: 890,
    scoreConfiabilidade: 72,
    scoreConfiabilidadeLabel: "moderado",
    riscoAbandono: 45,
    canalOrigem: "Site",
    segmentos: ["risco_abandono"],
    riscoNoShow: 8,
  },
  {
    id: "7",
    nome: "Lucas Mendes",
    email: "lucas@email.com",
    telefone: "(11) 99999-7777",
    ultimaVisita: "2025-03-01",
    proximaVisita: null,
    frequenciaMedia: 0.3,
    ltv: 420,
    scoreConfiabilidade: 88,
    scoreConfiabilidadeLabel: "confiavel",
    riscoAbandono: 10,
    canalOrigem: "Indicação",
    segmentos: ["novo"],
    riscoNoShow: 5,
  },
];

// Perfil completo (para quando abrir um cliente)
export function getPerfilCliente(id: string): PerfilCliente | null {
  const c = LISTA_CLIENTES.find((x) => x.id === id);
  if (!c) return null;
  return {
    ...c,
    ticketMedio: Math.round(c.ltv / 12),
    totalFaltas: c.riscoNoShow > 30 ? 2 : c.riscoNoShow > 15 ? 1 : 0,
    scoreNoShow: c.riscoNoShow,
    servicoMaisContratado: "Coloração",
    profissionalFavorito: "Ana Silva",
    historico: [
      { id: "h1", data: "2025-03-01", tipo: "atendimento", titulo: "Coloração", valor: 280 },
      { id: "h2", data: "2025-02-28", tipo: "pagamento", titulo: "Pagamento PIX" },
      { id: "h3", data: "2025-02-15", tipo: "atendimento", titulo: "Corte", valor: 80 },
      { id: "h4", data: "2025-02-10", tipo: "reagendamento", titulo: "Reagendado de 08/02" },
      { id: "h5", data: "2025-01-20", tipo: "observacao", titulo: "Prefere manhã" },
    ],
    insightsIA: [
      "Cliente com 72% de chance de retornar em 15 dias.",
      "Alto risco de faltar às sextas-feiras.",
      "Pode aceitar upgrade de serviço (coloração premium).",
      "Indicado para promoção premium.",
    ],
  };
}

// Segmentos para filtro/campanhas
export const SEGMENTOS_DISPONIVEIS: { id: Segmento; label: string; descricao: string; count: number }[] = [
  { id: "vip", label: "VIP (alto LTV)", descricao: "LTV acima de R$ 2.000", count: 89 },
  { id: "recorrente", label: "Recorrentes", descricao: "Visita regular nos últimos 90 dias", count: 412 },
  { id: "risco_abandono", label: "Em risco de abandono", descricao: "Sem visita há 30+ dias", count: 47 },
  { id: "risco_noshow", label: "Alto risco de no-show", descricao: "Score no-show > 25%", count: 23 },
  { id: "novo", label: "Novos clientes", descricao: "Primeira visita nos últimos 30 dias", count: 28 },
  { id: "inativo_30", label: "Inativos há +30 dias", descricao: "Sem agendamento há 30+ dias", count: 156 },
];

// Receita por segmento (para métricas)
export const RECEITA_POR_SEGMENTO = [
  { segmento: "VIP", receita: 184200 },
  { segmento: "Recorrentes", receita: 312400 },
  { segmento: "Novos", receita: 28400 },
  { segmento: "Em risco", receita: 12400 },
];
