// Dados mock para a dashboard (substituir por dados reais do Supabase depois)

export const MOCK_FINANCEIRO = {
  receitaMesConfirmada: 84750,
  receitaPrevista: 92300,
  metaMes: 90000,
  crescimentoVsAnterior: 12.4,
  ticketMedio: 187,
  receitaPorHora: 425,
  metaAtingidaPercent: 94.2,
};

export const MOCK_OCUPACAO = {
  taxaOcupacaoMes: 72,
  taxaOcupacaoSemana: 68,
  horariosOciososCriticos: [
    { dia: "Terça", horario: "14h-16h", slots: 12 },
    { dia: "Quarta", horario: "09h-11h", slots: 8 },
  ],
  profissionalMaisOcupado: { nome: "Ana Silva", ocupacao: 89 },
  profissionalMenorOcupacao: { nome: "Carlos Lima", ocupacao: 42 },
};

export const MOCK_RISCO = {
  taxaNoShow: 8.2,
  riscoPrevistoFaltas: 3,
  cancelamentosSemana: 5,
  receitaEmRisco: 3200,
  nivelRisco: "medio" as "baixo" | "medio" | "alto",
};

export const MOCK_IA = {
  faltasEvitadas: 14,
  receitaRecuperada: 4200,
  encaixesFeitos: 23,
  performancePercent: 87,
};

export const MOCK_CLIENTES = {
  novosNoMes: 28,
  taxaRetorno: 76,
  top5Valiosos: [
    { nome: "Maria Santos", valor: 2450 },
    { nome: "João Oliveira", valor: 1890 },
    { nome: "Paula Costa", valor: 1620 },
    { nome: "Ricardo Alves", valor: 1480 },
    { nome: "Fernanda Lima", valor: 1350 },
  ],
  emRiscoAbandono: 7,
};

export const MOCK_ALERTAS = [
  {
    id: "1",
    texto: "Você tem 4 horários vazios amanhã às 14h.",
    acao: "Otimizar",
    tipo: "horarios",
  },
  {
    id: "2",
    texto: "Carlos está com 30% menos ocupação que a média.",
    acao: "Ver agenda",
    tipo: "ocupacao",
  },
  {
    id: "3",
    texto: "Cancelamentos aumentaram 12% esta semana.",
    acao: "Ativar recuperação",
    tipo: "risco",
  },
  {
    id: "4",
    texto: "Você pode faturar +R$ 3.200 se otimizar terça-feira.",
    acao: "Otimizar horários",
    tipo: "receita",
  },
];

export const MOCK_GRAFICO_RECEITA = [
  { mes: "Jul", valor: 62 },
  { mes: "Ago", valor: 58 },
  { mes: "Set", valor: 71 },
  { mes: "Out", valor: 68 },
  { mes: "Nov", valor: 78 },
  { mes: "Dez", valor: 84 },
];

export const MOCK_GRAFICO_OCUPACAO = [
  { dia: "Seg", ocupacao: 65 },
  { dia: "Ter", ocupacao: 72 },
  { dia: "Qua", ocupacao: 68 },
  { dia: "Qui", ocupacao: 80 },
  { dia: "Sex", ocupacao: 85 },
  { dia: "Sáb", ocupacao: 55 },
];
