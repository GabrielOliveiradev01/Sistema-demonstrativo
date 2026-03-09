// Dados mock — Configurações

export const PERFIL_EMPRESA = {
  nomeFantasia: "Salon Beleza",
  razaoSocial: "Salon Beleza Ltda",
  cnpj: "12.345.678/0001-90",
  endereco: "Rua das Flores, 100 — Centro",
  telefone: "(11) 3333-4444",
  email: "contato@salonbeleza.com.br",
  logoUrl: "",
  corPrimaria: "#166534",
  corSecundaria: "#22c55e",
  fusoHorario: "America/Sao_Paulo",
  idioma: "pt-BR",
  faviconUrl: "",
  dominioPersonalizado: "",
  subdominio: "salonbeleza",
};

export const UNIDADES_EXEMPLO = [
  { id: "u1", nome: "Matriz", endereco: "Rua A, 100", ativa: true, metaMensal: 45000 },
  { id: "u2", nome: "Filial Centro", endereco: "Av. B, 200", ativa: true, metaMensal: 28000 },
];

export const HORARIOS_PADRAO = [
  { dia: "Segunda", abre: "09:00", fecha: "18:00", fechado: false },
  { dia: "Terça", abre: "09:00", fecha: "18:00", fechado: false },
  { dia: "Quarta", abre: "09:00", fecha: "18:00", fechado: false },
  { dia: "Quinta", abre: "09:00", fecha: "18:00", fechado: false },
  { dia: "Sexta", abre: "09:00", fecha: "18:00", fechado: false },
  { dia: "Sábado", abre: "09:00", fecha: "13:00", fechado: false },
  { dia: "Domingo", abre: "", fecha: "", fechado: true },
];

export const PAGAMENTOS = {
  cartao: true,
  pix: true,
  dinheiro: true,
  linkPagamento: true,
  assinatura: false,
  cobrancaAutomaticaSinal: true,
  multaCancelamento: 10,
  reembolsoAutomatico: false,
  parcelamentoMax: 3,
};

export const NOTIFICACOES_CANAIS = [
  { id: "whatsapp", nome: "WhatsApp", ativo: true },
  { id: "email", nome: "Email", ativo: true },
  { id: "sms", nome: "SMS", ativo: false },
  { id: "push", nome: "Push", ativo: false },
];

export const TEMPLATES_EXEMPLO = [
  { tipo: "Confirmação", variaveis: "{{nome_cliente}}, {{data}}, {{profissional}}" },
  { tipo: "Lembrete", variaveis: "{{nome_cliente}}, {{data}}, {{horario}}" },
  { tipo: "Cancelamento", variaveis: "{{nome_cliente}}, {{data}}" },
  { tipo: "Pós-atendimento", variaveis: "{{nome_cliente}}, {{servico}}" },
];

export const PERFIS_PERMISSAO = [
  { id: "admin", nome: "Admin", verFinanceiro: true, editarPreco: true, cancelar: true, darDesconto: true },
  { id: "gerente", nome: "Gerente", verFinanceiro: true, editarPreco: true, cancelar: true, darDesconto: true },
  { id: "recepcao", nome: "Recepção", verFinanceiro: false, editarPreco: false, cancelar: true, darDesconto: false },
  { id: "profissional", nome: "Profissional", verFinanceiro: false, editarPreco: false, cancelar: false, darDesconto: false },
];

export const INTEGRACOES = [
  { id: "api", nome: "API pública", ativo: true },
  { id: "webhooks", nome: "Webhooks", ativo: true },
  { id: "google", nome: "Google Calendar", ativo: false },
  { id: "meta", nome: "Meta Ads", ativo: false },
];

export const POLITICAS = {
  antecedenciaMinimaHoras: 24,
  antecedenciaMaximaDias: 90,
  limiteCancelamentoDias: 2,
  penalidadeAutomatica: true,
  scoreMinimoSemSinal: 70,
};

export const PLANO_ATUAL = {
  nome: "Profissional",
  recursos: ["Agenda ilimitada", "5 profissionais", "2 unidades", "Relatórios", "WhatsApp"],
  limites: { agendamentos: 500, clientes: 1000 },
  upgradeDisponivel: true,
};
