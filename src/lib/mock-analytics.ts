// Dados mock — Analytics: O Cérebro do Sistema

// 1. Visão executiva
export const VISAO_EXECUTIVA = {
  receitaHoje: 3200,
  receitaMes: 84750,
  receitaAcumulado: 245600,
  taxaOcupacao: 68,
  taxaNoShow: 8.2,
  ticketMedio: 187,
  ltvMedio: 1840,
  margemEstimada: 72,
  crescimentoVsAnterior: 12.4,
};

export const RECEITA_DIARIA_30 = Array.from({ length: 30 }, (_, i) => ({
  dia: `${i + 1}/03`,
  valor: 2400 + Math.round(800 * Math.sin(i / 5)) + (i % 7 === 0 ? -400 : 0),
}));

export const OCUPACAO_POR_DIA_SEMANA = [
  { dia: "Seg", ocupacao: 62 },
  { dia: "Ter", ocupacao: 71 },
  { dia: "Qua", ocupacao: 68 },
  { dia: "Qui", ocupacao: 78 },
  { dia: "Sex", ocupacao: 82 },
  { dia: "Sáb", ocupacao: 58 },
];

// 2. Receita & lucratividade
export const RECEITA_METRICAS = {
  receitaBruta: 84750,
  receitaLiquida: 72100,
};

export const SERVICOS_LUCRATIVOS = [
  { nome: "Coloração", valor: 31200 },
  { nome: "Corte", valor: 24800 },
  { nome: "Manicure", valor: 15600 },
  { nome: "Massagem", valor: 13150 },
];

export const EVOLUCAO_MENSAL = [
  { mes: "Set", valor: 72000 },
  { mes: "Out", valor: 75800 },
  { mes: "Nov", valor: 81200 },
  { mes: "Dez", valor: 84750 },
];

// Heatmap: horários mais rentáveis (dia da semana x faixa de hora)
export const HEATMAP_HORARIOS = [
  { hora: "09h", seg: 2, ter: 3, qua: 2, qui: 4, sex: 5, sab: 4 },
  { hora: "10h", seg: 3, ter: 4, qua: 3, qui: 5, sex: 5, sab: 5 },
  { hora: "11h", seg: 3, ter: 4, qua: 4, qui: 5, sex: 5, sab: 3 },
  { hora: "14h", seg: 2, ter: 2, qua: 3, qui: 4, sex: 5, sab: 4 },
  { hora: "15h", seg: 3, ter: 3, qua: 3, qui: 5, sex: 5, sab: 5 },
  { hora: "16h", seg: 2, ter: 3, qua: 3, qui: 4, sex: 4, sab: 3 },
  { hora: "18h", seg: 2, ter: 3, qua: 4, qui: 5, sex: 4, sab: 2 },
];

// 3. Clientes
export const CLIENTES_METRICAS = {
  novos: 28,
  recorrentes: 412,
  taxaRetencao: 76,
  churn: 8,
  ltv: 1840,
  frequenciaMedia: 1.8,
  tempoMedioEntreVisitas: 18,
};

export const INSIGHT_CLIENTES = "30 clientes estão 15 dias atrasados no retorno.";

// 4. Performance operacional
export const RANKING_PROFISSIONAIS = [
  { nome: "Ana Silva", ocupacao: 89, noshow: 3, receita: 28400 },
  { nome: "Fernanda Costa", ocupacao: 78, noshow: 6, receita: 25100 },
  { nome: "Carlos Lima", ocupacao: 42, noshow: 12, receita: 19200 },
  { nome: "Roberto Mendes", ocupacao: 55, noshow: 18, receita: 11250 },
];

export const CANCELAMENTOS_POR_HORARIO = [
  { horario: "14h-15h", qtd: 12 },
  { horario: "18h-19h", qtd: 8 },
  { horario: "09h-10h", qtd: 5 },
  { horario: "16h-17h", qtd: 4 },
];

// 5. Risco & perdas
export const RISCO_PERDAS = {
  receitaPerdidaNoShow: 4820,
  receitaPerdidaCancelamento: 3200,
  horasOciosas: 48,
  impactoFinanceiroMensal: 8020,
};

export const INSIGHT_RISCO = "Você perdeu R$ 4.820 este mês com faltas.";

// 6. Insights IA
export const INSIGHTS_IA = [
  "Quarta-feira 14h tem baixa ocupação há 3 semanas.",
  "Profissional Carlos tem 22% mais cancelamentos.",
  "Clientes que fazem Coloração retornam 40% mais.",
  "Seu ticket médio caiu 8%.",
];

// 7. Projeções
export const PROJECOES = {
  receitaProjetadaMes: 94500,
  previsaoOcupacao: 72,
  previsaoNoShow: 7.5,
  crescimentoEstimado: 11,
};
