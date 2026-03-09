// Dados mock — Financeiro: Centro de Previsibilidade

export const VISAO_GERAL = {
  receitaConfirmadaMes: 84750,
  receitaPrevistaAgenda: 92300,
  metaFinanceira: 90000,
  metaAtingidaPercent: 94.2,
  cancelamentosFinanceiros: 3200,
  receitaEmRiscoNoShow: 2100,
  ticketMedio: 187,
};

// Receita por período (para gráfico)
export const RECEITA_POR_PERIODO = [
  { label: "Sem 1", valor: 19800, anterior: 18200 },
  { label: "Sem 2", valor: 21500, anterior: 20100 },
  { label: "Sem 3", valor: 22450, anterior: 20800 },
  { label: "Sem 4", valor: 21000, anterior: 19500 },
];

export const RECEITA_DIARIA_ULTIMOS_14 = [
  { dia: "18/02", valor: 3200 },
  { dia: "19/02", valor: 2800 },
  { dia: "20/02", valor: 4100 },
  { dia: "21/02", valor: 3500 },
  { dia: "22/02", valor: 2900 },
  { dia: "23/02", valor: 1800 },
  { dia: "24/02", valor: 2200 },
  { dia: "25/02", valor: 3800 },
  { dia: "26/02", valor: 4200 },
  { dia: "27/02", valor: 3100 },
  { dia: "28/02", valor: 3900 },
  { dia: "01/03", valor: 3600 },
  { dia: "02/03", valor: 4100 },
  { dia: "03/03", valor: 2800 },
];

// Receita por unidade de negócio
export const RECEITA_POR_PROFISSIONAL = [
  { nome: "Ana Silva", valor: 28400 },
  { nome: "Carlos Lima", valor: 19200 },
  { nome: "Fernanda Costa", valor: 25100 },
];

export const RECEITA_POR_SERVICO = [
  { nome: "Coloração", valor: 31200 },
  { nome: "Corte", valor: 24800 },
  { nome: "Manicure", valor: 15600 },
  { nome: "Massagem", valor: 13150 },
];

export const RECEITA_POR_CATEGORIA = [
  { nome: "Cabelo", valor: 56000 },
  { nome: "Estética", valor: 28750 },
  { nome: "Outros", valor: 7500 },
];

export const RECEITA_POR_SALA = [
  { nome: "Sala 1 — Matriz", valor: 38200 },
  { nome: "Sala 2 — Matriz", valor: 29800 },
  { nome: "Filial Centro", valor: 25250 },
];

export const RECEITA_POR_CANAL = [
  { nome: "WhatsApp", valor: 45200 },
  { nome: "Site", valor: 28100 },
  { nome: "Indicação", valor: 14200 },
  { nome: "Instagram", valor: 4850 },
];

// Receita por hora
export const RECEITA_POR_HORA = {
  receitaPorHoraTrabalhada: 425,
  receitaPorHoraDisponivel: 312,
  horasProdutivas: 199,
  horasOciosas: 48,
  custoOciosidadeEstimado: 3200,
  insightOciosidade: "Você perdeu R$ 3.200 este mês por horários vazios.",
};

// Sinais e pagamentos
export type StatusPagamento = "sinal" | "pendente" | "confirmado" | "reembolso" | "cancelado";

export interface MovimentoFinanceiro {
  id: string;
  cliente: string;
  profissional: string;
  servico: string;
  valor: number;
  data: string;
  status: StatusPagamento;
  tipo: "sinal" | "pagamento" | "reembolso" | "cancelamento";
}

export const MOVIMENTOS_RECENTES: MovimentoFinanceiro[] = [
  { id: "1", cliente: "Maria Santos", profissional: "Ana Silva", servico: "Coloração", valor: 280, data: "2025-03-03", status: "confirmado", tipo: "pagamento" },
  { id: "2", cliente: "João Oliveira", profissional: "Ana Silva", servico: "Corte", valor: 80, data: "2025-03-03", status: "pendente", tipo: "pagamento" },
  { id: "3", cliente: "Paula Costa", profissional: "Carlos Lima", servico: "Manicure", valor: 65, data: "2025-03-02", status: "confirmado", tipo: "sinal" },
  { id: "4", cliente: "Ricardo Alves", profissional: "Ana Silva", servico: "Corte", valor: 80, data: "2025-03-02", status: "cancelado", tipo: "cancelamento" },
  { id: "5", cliente: "Fernanda Lima", profissional: "Fernanda Costa", servico: "Massagem", valor: 150, data: "2025-03-01", status: "confirmado", tipo: "pagamento" },
  { id: "6", cliente: "Carla Dias", profissional: "Carlos Lima", servico: "Coloração", valor: 280, data: "2025-03-01", status: "sinal", tipo: "sinal" },
];

// Previsão IA
export const PREVISAO_IA = {
  receitaPrevistaFimMes: 94500,
  riscoNaoBaterMeta: 18,
  projecaoTendencia: "+8% vs mês anterior",
  melhorDiaPromocao: "Terça-feira",
  melhorHorarioAumentoPreco: "Sábado 10h-12h",
  confiancaPrevisao: 87,
};

// Alertas
export const ALERTAS_FINANCEIRO = [
  { id: "1", tipo: "queda", texto: "Receita caiu 12% esta semana.", acao: "Ver detalhes" },
  { id: "2", tipo: "cancelamento", texto: "Cancelamentos aumentaram 18%.", acao: "Ativar recuperação" },
  { id: "3", tipo: "meta", texto: "Profissional Ana abaixo da meta.", acao: "Ver desempenho" },
  { id: "4", tipo: "preco", texto: "Horários premium podem aumentar preço.", acao: "Ajustar preço" },
];

// Métricas fundamentais
export const METRICAS_FUNDAMENTAIS = {
  receitaBruta: 84750,
  receitaLiquida: 72100,
  ticketMedio: 187,
  receitaPorHora: 425,
  ltvMedio: 1840,
  cac: 120,
  churnCliente: 8,
  taxaConversaoFinanceira: 94,
};
