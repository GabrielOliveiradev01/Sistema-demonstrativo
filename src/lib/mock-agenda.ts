// Dados mock para a Agenda (centro operacional inteligente)

export type StatusAgendamento = "confirmado" | "pendente" | "risco" | "aguardando_pagamento" | "em_atendimento" | "concluido";

export type RiscoNivel = "baixo" | "medio" | "alto";

export interface Agendamento {
  id: string;
  clienteId?: string;
  clienteNome: string;
  servicoId?: string;
  servico: string;
  valor: number;
  status: StatusAgendamento;
  riscoNivel: RiscoNivel;
  inicio: string; // "09:00"
  fim: string;
  profissionalId: string;
  profissionalNome: string;
  salaId?: string;
  salaNome?: string;
  /** ISO string do início (para edição) */
  inicioISO?: string;
  /** ISO string do fim (para edição) */
  fimISO?: string;
}

export interface Profissional {
  id: string;
  nome: string;
  cor: string;
}

export interface Sala {
  id: string;
  nome: string;
  unidade: string;
}

export interface Servico {
  id: string;
  nome: string;
  duracao_minutos?: number;
}

export interface SugestaoEncaixe {
  clienteNome: string;
  probabilidadeAceite: number;
  descontoSugerido: number;
  receitaPotencialPerdida: number;
}

export interface ClienteWaitlist {
  id: string;
  clienteId: string;
  servicoId?: string | null;
  nome: string;
  servicoDesejado: string;
  probabilidadeAceite: number;
  prioridade: number;
}

export interface DetalheCliente {
  historicoResumos: string[];
  scoreNoShow: number;
  frequencia: number;
  ltv: number;
}

// Profissionais
export const PROFISSIONAIS: Profissional[] = [
  { id: "p1", nome: "Ana Silva", cor: "#22c55e" },
  { id: "p2", nome: "Carlos Lima", cor: "#3b82f6" },
  { id: "p3", nome: "Fernanda Costa", cor: "#a855f7" },
];

// Salas/Unidades
export const SALAS: Sala[] = [
  { id: "s1", nome: "Sala 1", unidade: "Matriz" },
  { id: "s2", nome: "Sala 2", unidade: "Matriz" },
  { id: "s3", nome: "Sala 1", unidade: "Filial Centro" },
];

// Serviços
export const SERVICOS: Servico[] = [
  { id: "sv1", nome: "Corte" },
  { id: "sv2", nome: "Coloração" },
  { id: "sv3", nome: "Manicure" },
  { id: "sv4", nome: "Massagem" },
];

// Agendamentos do dia (exemplo)
export const AGENDAMENTOS_DIA: Agendamento[] = [
  {
    id: "a1",
    clienteNome: "Maria Santos",
    servico: "Coloração",
    valor: 280,
    status: "confirmado",
    riscoNivel: "baixo",
    inicio: "09:00",
    fim: "11:00",
    profissionalId: "p1",
    profissionalNome: "Ana Silva",
    salaId: "s1",
    salaNome: "Sala 1",
  },
  {
    id: "a2",
    clienteNome: "João Oliveira",
    servico: "Corte",
    valor: 80,
    status: "pendente",
    riscoNivel: "medio",
    inicio: "11:00",
    fim: "11:45",
    profissionalId: "p1",
    profissionalNome: "Ana Silva",
    salaId: "s1",
    salaNome: "Sala 1",
  },
  {
    id: "a3",
    clienteNome: "Paula Costa",
    servico: "Manicure",
    valor: 65,
    status: "aguardando_pagamento",
    riscoNivel: "baixo",
    inicio: "09:30",
    fim: "10:30",
    profissionalId: "p2",
    profissionalNome: "Carlos Lima",
    salaId: "s2",
    salaNome: "Sala 2",
  },
  {
    id: "a4",
    clienteNome: "Ricardo Alves",
    servico: "Corte",
    valor: 80,
    status: "risco",
    riscoNivel: "alto",
    inicio: "14:00",
    fim: "14:45",
    profissionalId: "p1",
    profissionalNome: "Ana Silva",
    salaId: "s1",
    salaNome: "Sala 1",
  },
  {
    id: "a5",
    clienteNome: "Fernanda Lima",
    servico: "Massagem",
    valor: 150,
    status: "confirmado",
    riscoNivel: "baixo",
    inicio: "15:00",
    fim: "16:00",
    profissionalId: "p3",
    profissionalNome: "Fernanda Costa",
    salaId: "s1",
    salaNome: "Sala 1 (Filial)",
  },
  {
    id: "a6",
    clienteNome: "Lucas Mendes",
    servico: "Corte",
    valor: 80,
    status: "confirmado",
    riscoNivel: "baixo",
    inicio: "10:00",
    fim: "10:45",
    profissionalId: "p2",
    profissionalNome: "Carlos Lima",
    salaId: "s2",
    salaNome: "Sala 2",
  },
];

// Sugestão ao clicar em horário vazio (ex.: 14:00 Ana Silva)
export const SUGESTAO_ENCAIXE: SugestaoEncaixe = {
  clienteNome: "Beatriz Souza",
  probabilidadeAceite: 78,
  descontoSugerido: 10,
  receitaPotencialPerdida: 280,
};

// Detalhes do cliente ao clicar no agendamento
export const DETALHE_CLIENTE: DetalheCliente = {
  historicoResumos: [
    "5 atendimentos nos últimos 3 meses",
    "Última visita: há 2 semanas",
    "Prefere manhã",
  ],
  scoreNoShow: 12,
  frequencia: 4,
  ltv: 1890,
};

// Lista de espera (mock; em produção vem do Supabase)
export const LISTA_ESPERA: ClienteWaitlist[] = [
  { id: "w1", clienteId: "c1", servicoId: "sv2", nome: "Carla Dias", servicoDesejado: "Coloração", probabilidadeAceite: 92, prioridade: 1 },
  { id: "w2", clienteId: "c2", servicoId: "sv1", nome: "Roberto Silva", servicoDesejado: "Corte", probabilidadeAceite: 85, prioridade: 2 },
  { id: "w3", clienteId: "c3", servicoId: "sv3", nome: "Amanda Rocha", servicoDesejado: "Manicure", probabilidadeAceite: 78, prioridade: 3 },
  { id: "w4", clienteId: "c4", servicoId: "sv1", nome: "Pedro Henrique", servicoDesejado: "Corte", probabilidadeAceite: 70, prioridade: 4 },
];

// Indicadores do dia
export const INDICADORES_DIA = {
  ocupacaoPercent: 68,
  receitaPrevistaDia: 735,
  horariosLivresCriticos: 4,
  riscoNoShowHoje: 1,
};

// Slots para modo otimização (exemplo)
export const SLOTS_OTIMIZACAO = {
  premium: [{ profissional: "Ana Silva", horario: "10h-12h" }],
  subvalorizados: [{ profissional: "Carlos Lima", horario: "14h-15h" }],
  riscoCancelamento: [{ id: "a4", cliente: "Ricardo Alves", horario: "14h" }],
  profissionaisOciosos: ["Carlos Lima"],
};

// Horário de funcionamento (para grade)
export const HORARIO_INICIO = 8;
export const HORARIO_FIM = 19;
