// Dados mock — Inteligência: Central de Decisão e Otimização

// 1. Painel de Insights
export const PAINEL_INSIGHTS = {
  receitaRecuperadaIA: 4200,
  receitaEmRisco: 2100,
  faltasPrevistas7dias: 3,
  potencialCrescimento: 4280,
  oportunidadeUrgente:
    "Você pode aumentar sua receita em R$ 4.280 este mês ajustando horários ociosos.",
};

// 2. Motor de Risco
export const MOTOR_RISCO = {
  clientesAltoRisco: [
    { nome: "Ricardo Alves", score: 42, acao: "Exigir sinal" },
    { nome: "Paula Costa", score: 28, acao: "Confirmação antecipada" },
  ],
  profissionaisMaiorFalta: [
    { nome: "Roberto Mendes", taxa: 18 },
    { nome: "Carlos Lima", taxa: 12 },
  ],
  diasCriticos: ["Terça", "Sábado"],
  horariosMaiorCancelamento: ["14h-16h", "18h-19h"],
  sugestoes: [
    "Exigir sinal para clientes com score > 30%",
    "Confirmação 24h antes para agendamentos críticos",
    "Reorganizar agenda em terças 14h",
    "Criar política de no-show para sábados",
  ],
};

// 3. Otimizador de Ocupação
export const OTIMIZADOR_OCUPACAO = {
  premium: [
    { horario: "Sábado 10h-12h", demanda: "Alta", profissional: "Ana Silva" },
    { horario: "Quinta 18h-19h", demanda: "Alta", profissional: "Fernanda Costa" },
  ],
  neutros: [
    { horario: "Segunda 14h-16h", profissional: "Carlos Lima" },
    { horario: "Quarta 09h-11h", profissional: "Ana Silva" },
  ],
  subutilizados: [
    { horario: "Terça 14h-16h", slots: 12, profissional: "Vários" },
    { horario: "Quarta 09h-11h", slots: 8, profissional: "Carlos Lima" },
  ],
  abaixoMedia: [
    { nome: "Carlos Lima", ocupacao: 42, media: 68 },
    { nome: "Roberto Mendes", ocupacao: 55, media: 68 },
  ],
  sugestoes: [
    "Aumentar preço em horários premium (Sáb 10h-12h)",
    "Criar promoção para terças 14h-16h",
    "Redistribuir agenda: Carlos Lima",
    "Ajustar carga horária de Roberto",
  ],
};

// 4. Previsão de Receita (para gráfico com faixa)
export const PREVISAO_RECEITA = {
  receitaPrevistaFimMes: 94500,
  melhorCenario: 98200,
  piorCenario: 89100,
  tendenciaAtual: "+8% vs mês anterior",
  riscoNaoBaterMeta: 18,
};

export const PREVISAO_RECEITA_SEMANAL = [
  { semana: "Sem 1", realizado: 19800, min: 18500, max: 21000 },
  { semana: "Sem 2", realizado: 21500, min: 20000, max: 22800 },
  { semana: "Sem 3", realizado: 22450, min: 20800, max: 24000 },
  { semana: "Sem 4", previsto: 21000, min: 19500, max: 22500 },
];

// 5. Benchmark interno
export const BENCHMARK = {
  ocupacao: { seu: 68, segmento: 72, label: "Ocupação" },
  ticketMedio: { seu: 187, regiao: 165, label: "Ticket médio (R$)" },
  noShow: { seu: 8.2, mercado: 12, label: "No-show (%)" },
  receitaHora: { seu: 358, ideal: 420, label: "Receita/hora (R$)" },
};

// 6. Ações automatizadas (estado on/off)
export const ACOES_AUTOMATIZADAS = [
  { id: "recuperacao", label: "Recuperação automática de cancelamentos", desc: "Preenche vagas com lista de espera" },
  { id: "preco", label: "Ajuste dinâmico de preço", desc: "Preço por demanda e horário" },
  { id: "campanha_vazios", label: "Campanha automática para horários vazios", desc: "Promoções em slots ociosos" },
  { id: "reativacao", label: "Reativação de clientes inativos", desc: "Lembretes para quem sumiu" },
  { id: "sinal_risco", label: "Cobrança automática de sinal (alto risco)", desc: "Sinal para clientes com histórico" },
];
