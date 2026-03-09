// Dados mock — Automação

// 1. Visão geral
export const VISAO_GERAL_AUTOMACAO = {
  automacoesAtivas: 12,
  execucoesEstaSemana: 847,
  receitaGeradaAutomaticamente: 4200,
  tempoEconomizadoHoras: 28,
  fluxosComErro: 1,
};

// 2. Automações de agendamento (fluxos padrão)
export const AUTOMACOES_AGENDAMENTO = [
  { id: "a1", nome: "Confirmação automática após agendar", canal: "WhatsApp", ativo: true },
  { id: "a2", nome: "Lembrete 24h antes", canal: "WhatsApp", ativo: true },
  { id: "a3", nome: "Lembrete 2h antes", canal: "SMS", ativo: true },
  { id: "a4", nome: "Confirmação obrigatória para alto risco", canal: "Email", ativo: true },
  { id: "a5", nome: "Cobrança automática de sinal", canal: "WhatsApp", ativo: false },
];

// 3. Automações de cancelamento
export const AUTOMACOES_CANCELAMENTO = [
  { id: "c1", label: "Ativar recuperação automática", ativo: true },
  { id: "c2", label: "Enviar para lista de espera", ativo: true },
  { id: "c3", label: "Oferecer desconto estratégico", ativo: false },
  { id: "c4", label: "Notificar equipe", ativo: true },
];

export const MODOS_RECUPERACAO = [
  { id: "total", label: "Recuperação total automática" },
  { id: "parcial", label: "Recuperação parcial com aprovação" },
  { id: "notificar", label: "Apenas notificar" },
];

// 4. Automações de ocupação
export const AUTOMACOES_OCUPACAO = [
  { id: "o1", label: "Criar campanha automática", ativo: true },
  { id: "o2", label: "Disparar para clientes inativos", ativo: true },
  { id: "o3", label: "Aplicar desconto em horário morto", ativo: false },
  { id: "o4", label: "Oferecer upgrade", ativo: false },
];

export const EXEMPLO_OCUPACAO = "Se terça-feira 14h estiver abaixo de 40% até segunda 18h → ativar promoção.";

// 5. Automações de cliente
export const AUTOMACOES_CLIENTE = [
  { id: "cl1", nome: "Reativar cliente após 30 dias inativo", ativo: true },
  { id: "cl2", nome: "Oferecer upgrade após 3 visitas", ativo: true },
  { id: "cl3", nome: "Agradecimento pós-atendimento", ativo: true },
  { id: "cl4", nome: "Solicitar avaliação", ativo: false },
  { id: "cl5", nome: "Oferecer plano recorrente", ativo: false },
];

export const SEGMENTACAO_OPCOES = ["LTV", "Frequência", "Serviço", "Profissional", "Score"];

// 6. Exemplos para construtor de fluxos
export const EXEMPLOS_FLUXOS = [
  {
    titulo: "Alto risco no-show",
    se: "cliente.score_no_show > 70%",
    entao: "Exigir sinal · Enviar lembrete extra · Bloquear múltiplos agendamentos",
    senao: "Fluxo normal",
  },
  {
    titulo: "Ocupação baixa",
    se: "ocupação < 60% quinta-feira",
    entao: "Disparar campanha VIP · Aplicar 10% desconto automático",
    senao: "Nenhuma ação",
  },
];
