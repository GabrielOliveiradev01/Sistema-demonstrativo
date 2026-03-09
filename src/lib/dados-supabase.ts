/**
 * Busca dados reais do Supabase e mapeia para os tipos usados pela UI
 * (compatível com mock-clientes e mock-agenda).
 */
import { supabase } from "@/lib/supabase";
import type { Cliente, PerfilCliente } from "@/lib/mock-clientes";
import type {
  Agendamento,
  Profissional,
  Sala,
  Servico,
  ClienteWaitlist,
} from "@/lib/mock-agenda";

// --- Tipos do banco (respostas Supabase) ---
type ClienteRow = {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  score_confiabilidade?: number | null;
  score_no_show?: number | null;
  risco_abandono?: number | null;
  ultima_visita_at?: string | null;
  proxima_visita_prevista?: string | null;
  frequencia_media_mes?: number | null;
  ltv_cache?: number | null;
  ticket_medio_cache?: number | null;
  total_faltas?: number | null;
  segmentos?: string[];
  canal_origem?: string | null;
  origem?: string | null;
};

function scoreLabel(s: number | null): "confiavel" | "moderado" | "alto_risco" {
  if (s == null) return "moderado";
  if (s >= 80) return "confiavel";
  if (s >= 50) return "moderado";
  return "alto_risco";
}

function mapClienteRowToCliente(r: ClienteRow): Cliente {
  return {
    id: r.id,
    nome: r.nome,
    email: r.email ?? "",
    telefone: r.telefone ?? "",
    ultimaVisita: r.ultima_visita_at
      ? new Date(r.ultima_visita_at).toISOString().slice(0, 10)
      : "",
    proximaVisita: r.proxima_visita_prevista ?? null,
    frequenciaMedia: Number(r.frequencia_media_mes) || 0,
    ltv: Number(r.ltv_cache) || 0,
    scoreConfiabilidade: r.score_confiabilidade ?? 0,
    scoreConfiabilidadeLabel: scoreLabel(r.score_confiabilidade),
    riscoAbandono: r.risco_abandono ?? 0,
    canalOrigem: r.canal_origem ?? r.origem ?? "",
    segmentos: Array.isArray(r.segmentos) ? r.segmentos : [],
    riscoNoShow: r.score_no_show ?? 0,
  };
}

/** Busca todos os clientes ativos do banco */
export async function fetchClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("ativo", true)
    .order("nome");
  if (error) throw error;
  return (data ?? []).map((r) => mapClienteRowToCliente(r as ClienteRow));
}

/** Busca um cliente por id para o perfil lateral */
export async function fetchPerfilCliente(id: string): Promise<PerfilCliente | null> {
  const { data: row, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !row) return null;
  const r = row as ClienteRow;
  const c = mapClienteRowToCliente(r);
  return {
    ...c,
    ticketMedio: Number(r.ticket_medio_cache) || Math.round(c.ltv / 12),
    totalFaltas: r.total_faltas ?? 0,
    scoreNoShow: r.score_no_show ?? 0,
    servicoMaisContratado: "—",
    profissionalFavorito: "—",
    historico: [],
    insightsIA: [],
  };
}

/** Payload para criar cliente (campos que movimentam análises e cards) */
export type ClienteCreate = {
  nome: string;
  email?: string | null;
  telefone?: string | null;
  canal_origem?: string | null;
  origem?: string | null;
  score_confiabilidade?: number | null;
  score_no_show?: number | null;
  risco_abandono?: number | null;
  ultima_visita_at?: string | null;
  proxima_visita_prevista?: string | null;
  frequencia_media_mes?: number | null;
  ltv_cache?: number | null;
  ticket_medio_cache?: number | null;
  total_faltas?: number | null;
  segmentos?: string[] | null;
  notas?: string | null;
};

/** Payload para atualizar cliente (partial) */
export type ClienteUpdate = Partial<ClienteCreate>;

/** Criar novo cliente */
export async function createCliente(payload: ClienteCreate): Promise<string> {
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nome: payload.nome,
      email: payload.email ?? null,
      telefone: payload.telefone ?? null,
      canal_origem: payload.canal_origem ?? payload.origem ?? null,
      origem: payload.origem ?? payload.canal_origem ?? null,
      score_confiabilidade: payload.score_confiabilidade ?? null,
      score_no_show: payload.score_no_show ?? null,
      risco_abandono: payload.risco_abandono ?? null,
      ultima_visita_at: payload.ultima_visita_at ?? null,
      proxima_visita_prevista: payload.proxima_visita_prevista ?? null,
      frequencia_media_mes: payload.frequencia_media_mes ?? null,
      ltv_cache: payload.ltv_cache ?? null,
      ticket_medio_cache: payload.ticket_medio_cache ?? null,
      total_faltas: payload.total_faltas ?? 0,
      segmentos: Array.isArray(payload.segmentos) ? payload.segmentos : [],
      notas: payload.notas ?? null,
      ativo: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Atualizar cliente */
export async function updateCliente(id: string, payload: ClienteUpdate): Promise<void> {
  const row: Record<string, unknown> = {};
  if (payload.nome !== undefined) row.nome = payload.nome;
  if (payload.email !== undefined) row.email = payload.email;
  if (payload.telefone !== undefined) row.telefone = payload.telefone;
  if (payload.canal_origem !== undefined) row.canal_origem = payload.canal_origem;
  if (payload.origem !== undefined) row.origem = payload.origem;
  if (payload.score_confiabilidade !== undefined) row.score_confiabilidade = payload.score_confiabilidade;
  if (payload.score_no_show !== undefined) row.score_no_show = payload.score_no_show;
  if (payload.risco_abandono !== undefined) row.risco_abandono = payload.risco_abandono;
  if (payload.ultima_visita_at !== undefined) row.ultima_visita_at = payload.ultima_visita_at;
  if (payload.proxima_visita_prevista !== undefined) row.proxima_visita_prevista = payload.proxima_visita_prevista;
  if (payload.frequencia_media_mes !== undefined) row.frequencia_media_mes = payload.frequencia_media_mes;
  if (payload.ltv_cache !== undefined) row.ltv_cache = payload.ltv_cache;
  if (payload.ticket_medio_cache !== undefined) row.ticket_medio_cache = payload.ticket_medio_cache;
  if (payload.total_faltas !== undefined) row.total_faltas = payload.total_faltas;
  if (payload.segmentos !== undefined) row.segmentos = payload.segmentos;
  if (payload.notas !== undefined) row.notas = payload.notas;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("clientes").update(row).eq("id", id);
  if (error) throw error;
}

// --- Agenda: profissionais, salas, servicos, agendamentos ---
type ProfissionalRow = { id: string; nome: string; cor_agenda: string | null };
type SalaRow = { id: string; nome: string; unidade_id: string };
type UnidadeRow = { id: string; nome: string };
type ServicoRow = { id: string; nome: string; duracao_minutos?: number | null };
type AgendamentoRow = {
  id: string;
  inicio: string;
  fim: string;
  status: string;
  valor: number | null;
  risco_nivel: string | null;
  cliente_id: string;
  profissional_id: string;
  servico_id: string | null;
  sala_id: string | null;
  clientes: { nome: string } | null;
  profissionais: { id: string; nome: string; cor_agenda: string | null } | null;
  servicos: { id: string; nome: string } | null;
  salas: { id: string; nome: string } | null;
};

export async function fetchProfissionais(): Promise<Profissional[]> {
  const { data, error } = await supabase
    .from("profissionais")
    .select("id, nome, cor_agenda")
    .eq("ativo", true)
    .order("nome");
  if (error) throw error;
  return (data ?? []).map((p: ProfissionalRow) => ({
    id: p.id,
    nome: p.nome,
    cor: p.cor_agenda ?? "#22c55e",
  }));
}

/** Payload para criar profissional */
export type ProfissionalCreate = {
  nome: string;
  email: string;
  telefone?: string | null;
  cargo?: string | null;
  especialidade?: string | null;
  unidade_id?: string | null;
  cor_agenda?: string | null;
};

/** Payload para atualizar profissional (partial) */
export type ProfissionalUpdate = Partial<ProfissionalCreate>;

/** Criar novo profissional */
export async function createProfissional(payload: ProfissionalCreate): Promise<string> {
  const { data, error } = await supabase
    .from("profissionais")
    .insert({
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone ?? null,
      cargo: payload.cargo ?? null,
      especialidade: payload.especialidade ?? null,
      unidade_id: payload.unidade_id ?? null,
      cor_agenda: payload.cor_agenda ?? "#22c55e",
      ativo: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Atualizar profissional */
export async function updateProfissional(id: string, payload: ProfissionalUpdate): Promise<void> {
  const row: Record<string, unknown> = {};
  if (payload.nome !== undefined) row.nome = payload.nome;
  if (payload.email !== undefined) row.email = payload.email;
  if (payload.telefone !== undefined) row.telefone = payload.telefone;
  if (payload.cargo !== undefined) row.cargo = payload.cargo;
  if (payload.especialidade !== undefined) row.especialidade = payload.especialidade;
  if (payload.unidade_id !== undefined) row.unidade_id = payload.unidade_id;
  if (payload.cor_agenda !== undefined) row.cor_agenda = payload.cor_agenda;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("profissionais").update(row).eq("id", id);
  if (error) throw error;
}

/** Buscar um profissional por id (para formulário de edição) */
export async function fetchProfissionalPorId(id: string): Promise<{
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cargo: string | null;
  especialidade: string | null;
  unidade_id: string | null;
  cor_agenda: string | null;
} | null> {
  const { data, error } = await supabase
    .from("profissionais")
    .select("id, nome, email, telefone, cargo, especialidade, unidade_id, cor_agenda")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    cargo: string | null;
    especialidade: string | null;
    unidade_id: string | null;
    cor_agenda: string | null;
  };
}

export async function fetchSalas(): Promise<Sala[]> {
  const { data: salas, error: errSalas } = await supabase
    .from("salas")
    .select("id, nome, unidade_id")
    .eq("ativa", true)
    .order("ordem");
  if (errSalas) throw errSalas;
  if (!salas?.length) return [];
  const unidadeIds = [...new Set(salas.map((s: SalaRow) => s.unidade_id))];
  const { data: unidades } = await supabase
    .from("unidades")
    .select("id, nome")
    .in("id", unidadeIds);
  const unidadeMap = new Map((unidades ?? []).map((u: UnidadeRow) => [u.id, u.nome]));
  return salas.map((s: SalaRow) => ({
    id: s.id,
    nome: s.nome,
    unidade: unidadeMap.get(s.unidade_id) ?? "—",
  }));
}

/** Lista todas as unidades (para formulário de profissional) */
export async function fetchUnidades(): Promise<{ id: string; nome: string }[]> {
  const { data, error } = await supabase.from("unidades").select("id, nome").order("nome");
  if (error) throw error;
  return (data ?? []).map((u: UnidadeRow) => ({ id: u.id, nome: u.nome }));
}

/** Lista salas de uma unidade (para configuração) */
export async function fetchSalasPorUnidade(unidadeId: string): Promise<{ id: string; nome: string; descricao: string | null; ativa: boolean; ordem: number }[]> {
  const { data, error } = await supabase
    .from("salas")
    .select("id, nome, descricao, ativa, ordem")
    .eq("unidade_id", unidadeId)
    .order("ordem")
    .order("nome");
  if (error) throw error;
  return (data ?? []).map((s: { id: string; nome: string; descricao: string | null; ativa: boolean; ordem: number }) => ({
    id: s.id,
    nome: s.nome,
    descricao: s.descricao ?? null,
    ativa: s.ativa ?? true,
    ordem: s.ordem ?? 0,
  }));
}

export type SalaCreate = {
  unidade_id: string;
  nome: string;
  descricao?: string | null;
  ordem?: number | null;
  ativa?: boolean;
};

/** Cria nova sala em uma unidade */
export async function createSala(payload: SalaCreate): Promise<string> {
  const { data, error } = await supabase
    .from("salas")
    .insert({
      unidade_id: payload.unidade_id,
      nome: payload.nome,
      descricao: payload.descricao ?? null,
      ordem: payload.ordem ?? 0,
      ativa: payload.ativa ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export type SalaUpdate = Partial<{
  nome: string;
  descricao: string | null;
  ativa: boolean;
  ordem: number;
}>;

/** Atualiza sala */
export async function updateSala(id: string, payload: SalaUpdate): Promise<void> {
  const row: Record<string, unknown> = {};
  if (payload.nome !== undefined) row.nome = payload.nome;
  if (payload.descricao !== undefined) row.descricao = payload.descricao;
  if (payload.ativa !== undefined) row.ativa = payload.ativa;
  if (payload.ordem !== undefined) row.ordem = payload.ordem;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("salas").update(row).eq("id", id);
  if (error) throw error;
}

export async function fetchServicos(): Promise<Servico[]> {
  const { data, error } = await supabase
    .from("servicos")
    .select("id, nome, duracao_minutos")
    .eq("ativo", true)
    .order("nome");
  if (error) throw error;
  return (data ?? []).map((s: ServicoRow) => ({
    id: s.id,
    nome: s.nome,
    duracao_minutos: s.duracao_minutos ?? 60,
  }));
}

/** Retorna a duração do serviço em minutos (prioriza duração personalizada do profissional) */
export async function fetchDuracaoServico(
  servicoId: string,
  profissionalId?: string | null
): Promise<number> {
  if (profissionalId) {
    const { data: sp } = await supabase
      .from("servicos_profissionais")
      .select("duracao_personalizada_min")
      .eq("servico_id", servicoId)
      .eq("profissional_id", profissionalId)
      .maybeSingle();
    if (sp?.duracao_personalizada_min != null) return sp.duracao_personalizada_min;
  }
  const { data: s } = await supabase
    .from("servicos")
    .select("duracao_minutos")
    .eq("id", servicoId)
    .maybeSingle();
  return s?.duracao_minutos ?? 60;
}

export type VerificarConflitoParams = {
  profissional_id: string;
  sala_id?: string | null;
  inicio: string;
  fim: string;
  /** Ao editar, exclui o próprio agendamento da verificação */
  excluir_id?: string | null;
};

export type VerificarConflitoResult = {
  ok: boolean;
  conflito_sala?: boolean;
  conflito_profissional?: boolean;
  mensagem?: string;
};

/** Verificação master: verifica se já existe agendamento conflitante (sala ou profissional) */
export async function verificarConflitoAgendamento(
  params: VerificarConflitoParams
): Promise<VerificarConflitoResult> {
  const { profissional_id, sala_id, inicio, fim, excluir_id } = params;
  const statusOcupante = ["pendente", "confirmado", "em_atendimento", "concluido", "aguardando_pagamento"];

  let conflitoSala = false;
  let conflitoProf = false;

  if (sala_id) {
    const { data: salaConflitos } = await supabase
      .from("agendamentos")
      .select("id")
      .eq("sala_id", sala_id)
      .in("status", statusOcupante)
      .lt("inicio", fim)
      .gt("fim", inicio);
    const ids = (salaConflitos ?? []).filter((r: { id: string }) => r.id !== excluir_id);
    conflitoSala = ids.length > 0;
  }

  const { data: profConflitos } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("profissional_id", profissional_id)
    .in("status", statusOcupante)
    .lt("inicio", fim)
    .gt("fim", inicio);
  const idsProf = (profConflitos ?? []).filter((r: { id: string }) => r.id !== excluir_id);
  conflitoProf = idsProf.length > 0;

  const ok = !conflitoSala && !conflitoProf;
  let mensagem: string | undefined;
  if (!ok) {
    if (conflitoSala && conflitoProf) {
      mensagem = "Já existe um agendamento neste horário: a sala está ocupada e o profissional está indisponível. Escolha outro horário, sala ou profissional.";
    } else if (conflitoSala) {
      mensagem = "Esta sala já possui um agendamento neste horário. Escolha outra sala ou outro horário.";
    } else {
      mensagem = "O profissional já possui um agendamento neste horário. Escolha outro horário ou outro profissional.";
    }
  }
  return {
    ok,
    conflito_sala: conflitoSala,
    conflito_profissional: conflitoProf,
    mensagem,
  };
}

/** Retorna aviso (não bloqueia) quando o cliente já tem agendamentos no mesmo dia */
export async function fetchAvisoClienteMesmoDia(
  clienteId: string,
  date: Date,
  excluirId?: string | null
): Promise<string | null> {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const diaInicio = `${y}-${m}-${d}T00:00:00`;
  const diaFim = `${y}-${m}-${d}T23:59:59`;
  const statusOcupante = ["pendente", "confirmado", "em_atendimento", "concluido", "aguardando_pagamento"];
  let q = supabase
    .from("agendamentos")
    .select("id")
    .eq("cliente_id", clienteId)
    .in("status", statusOcupante)
    .gte("inicio", diaInicio)
    .lte("inicio", diaFim);
  if (excluirId) q = q.neq("id", excluirId);
  const { data } = await q;
  const qtd = (data ?? []).length;
  if (qtd === 0) return null;
  return qtd === 1
    ? "Este cliente já possui 1 agendamento neste dia."
    : `Este cliente já possui ${qtd} agendamentos neste dia.`;
}

// --- Serviços & categorias: criação/edição (tela Serviços) ---

export type CategoriaServicoCreate = {
  nome: string;
  cor?: string | null;
  ordem?: number | null;
  ativa?: boolean;
};

export async function createCategoriaServico(payload: CategoriaServicoCreate): Promise<string> {
  const { data, error } = await supabase
    .from("categorias_servico")
    .insert({
      nome: payload.nome,
      cor: payload.cor ?? "#22c55e",
      ordem: payload.ordem ?? 0,
      ativa: payload.ativa ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export type ServicoCreate = {
  nome: string;
  descricao?: string | null;
  duracao_minutos?: number;
  valor_base?: number;
  ativo?: boolean;
  categoria_id?: string | null;
  cor_calendario?: string | null;
  buffer_antes_min?: number;
  buffer_depois_min?: number;
  exigir_sinal?: boolean;
  percentual_sinal?: number;
  permitir_desconto?: boolean;
  disponivel_online?: boolean;
  antecedencia_minima_min?: number;
  antecedencia_maxima_dias?: number;
  limite_diario_atendimentos?: number | null;
  apenas_recorrentes?: boolean;
  score_minimo?: number | null;
  recorrente?: boolean;
  intervalo_dias?: number | null;
  gerar_proximos_automatico?: boolean;
  limite_repeticoes?: number | null;
};

export async function createServico(payload: ServicoCreate): Promise<string> {
  const { data, error } = await supabase
    .from("servicos")
    .insert({
      nome: payload.nome,
      descricao: payload.descricao ?? null,
      duracao_minutos: payload.duracao_minutos ?? 60,
      valor_base: payload.valor_base ?? 0,
      ativo: payload.ativo ?? true,
      categoria_id: payload.categoria_id ?? null,
      cor_calendario: payload.cor_calendario ?? "#22c55e",
      buffer_antes_min: payload.buffer_antes_min ?? 0,
      buffer_depois_min: payload.buffer_depois_min ?? 0,
      exigir_sinal: payload.exigir_sinal ?? false,
      percentual_sinal: payload.percentual_sinal ?? 30,
      permitir_desconto: payload.permitir_desconto ?? true,
      disponivel_online: payload.disponivel_online ?? true,
      antecedencia_minima_min: payload.antecedencia_minima_min ?? 60,
      antecedencia_maxima_dias: payload.antecedencia_maxima_dias ?? 90,
      limite_diario_atendimentos: payload.limite_diario_atendimentos ?? null,
      apenas_recorrentes: payload.apenas_recorrentes ?? false,
      score_minimo: payload.score_minimo ?? null,
      recorrente: payload.recorrente ?? false,
      intervalo_dias: payload.intervalo_dias ?? null,
      gerar_proximos_automatico: payload.gerar_proximos_automatico ?? false,
      limite_repeticoes: payload.limite_repeticoes ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateServico(id: string, payload: ServicoCreate): Promise<void> {
  const { error } = await supabase
    .from("servicos")
    .update({
      nome: payload.nome,
      descricao: payload.descricao ?? null,
      duracao_minutos: payload.duracao_minutos ?? 60,
      valor_base: payload.valor_base ?? 0,
      ativo: payload.ativo ?? true,
      categoria_id: payload.categoria_id ?? null,
      cor_calendario: payload.cor_calendario ?? "#22c55e",
      buffer_antes_min: payload.buffer_antes_min ?? 0,
      buffer_depois_min: payload.buffer_depois_min ?? 0,
      exigir_sinal: payload.exigir_sinal ?? false,
      percentual_sinal: payload.percentual_sinal ?? 30,
      permitir_desconto: payload.permitir_desconto ?? true,
      disponivel_online: payload.disponivel_online ?? true,
      antecedencia_minima_min: payload.antecedencia_minima_min ?? 60,
      antecedencia_maxima_dias: payload.antecedencia_maxima_dias ?? 90,
      limite_diario_atendimentos: payload.limite_diario_atendimentos ?? null,
      apenas_recorrentes: payload.apenas_recorrentes ?? false,
      score_minimo: payload.score_minimo ?? null,
      recorrente: payload.recorrente ?? false,
      intervalo_dias: payload.intervalo_dias ?? null,
      gerar_proximos_automatico: payload.gerar_proximos_automatico ?? false,
      limite_repeticoes: payload.limite_repeticoes ?? null,
    })
    .eq("id", id);
  if (error) throw error;
}

export type PacoteCreate = {
  nome: string;
  descricao?: string | null;
  valor_total: number;
  duracao_total_min: number;
  ativo?: boolean;
  itens: { servico_id: string; quantidade?: number; ordem?: number }[];
};

export async function createPacote(payload: PacoteCreate): Promise<string> {
  const { data, error } = await supabase
    .from("pacotes")
    .insert({
      nome: payload.nome,
      descricao: payload.descricao ?? null,
      valor_total: payload.valor_total,
      duracao_total_min: payload.duracao_total_min,
      ativo: payload.ativo ?? true,
    })
    .select("id")
    .single();
  if (error) throw error;

  const pacoteId = data.id as string;
  const itens = payload.itens.map((it, idx) => ({
    pacote_id: pacoteId,
    servico_id: it.servico_id,
    quantidade: it.quantidade ?? 1,
    ordem: it.ordem ?? idx,
  }));
  if (itens.length > 0) {
    const { error: itensError } = await supabase.from("pacote_itens").insert(itens);
    if (itensError) throw itensError;
  }
  return pacoteId;
}

/** status no banco: pendente, confirmado, em_atendimento, concluido, cancelado, no_show, aguardando_pagamento */
function mapStatus(s: string): Agendamento["status"] {
  if (s === "aguardando_pagamento") return "aguardando_pagamento";
  if (s === "confirmado") return "confirmado";
  if (s === "pendente") return "pendente";
  if (s === "em_atendimento") return "em_atendimento";
  if (s === "concluido") return "concluido";
  if (s === "cancelado" || s === "no_show") return "risco";
  return "confirmado";
}

function timeStr(iso: string): string {
  // Usa diretamente a parte HH:MM da string vinda do banco,
  // evitando deslocamentos de fuso horário do Date().
  const s = String(iso);
  if (s.length >= 16) {
    return s.slice(11, 16);
  }
  // Fallback em caso de formato inesperado
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Agendamentos de um dia (início entre 00:00 e 23:59 do dia em timezone local) */
export async function fetchAgendamentosDia(data: Date): Promise<Agendamento[]> {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  const inicioInicio = `${y}-${m}-${d}T00:00:00`;
  const inicioFim = `${y}-${m}-${d}T23:59:59`;
  const { data: rows, error } = await supabase
    .from("agendamentos")
    .select(
      `
      id, inicio, fim, status, valor, risco_nivel,
      cliente_id, profissional_id, servico_id, sala_id,
      clientes(nome),
      profissionais(id, nome, cor_agenda),
      servicos(id, nome),
      salas(id, nome)
    `
    )
    .gte("inicio", inicioInicio)
    .lte("inicio", inicioFim)
    .order("inicio");
  if (error) throw error;
  return (rows ?? []).map((a: AgendamentoRow) => ({
    id: a.id,
    clienteId: a.cliente_id,
    clienteNome: a.clientes?.nome ?? "—",
    servicoId: a.servico_id ?? undefined,
    servico: a.servicos?.nome ?? "—",
    valor: Number(a.valor) || 0,
    status: mapStatus(a.status),
    riscoNivel: (a.risco_nivel as Agendamento["riscoNivel"]) ?? "baixo",
    inicio: timeStr(a.inicio),
    fim: timeStr(a.fim),
    inicioISO: a.inicio,
    fimISO: a.fim,
    profissionalId: a.profissional_id,
    profissionalNome: a.profissionais?.nome ?? "—",
    salaId: a.sala_id ?? undefined,
    salaNome: a.salas?.nome ?? undefined,
  }));
}

/** Status UI -> banco */
function statusToDb(s: Agendamento["status"]): string {
  const map: Record<Agendamento["status"], string> = {
    confirmado: "confirmado",
    pendente: "pendente",
    risco: "cancelado",
    aguardando_pagamento: "aguardando_pagamento",
  };
  return map[s] ?? "pendente";
}

export type AgendamentoCreate = {
  cliente_id: string;
  profissional_id: string;
  servico_id?: string | null;
  sala_id?: string | null;
  inicio: string; // ISO
  fim: string;   // ISO
  status?: string;
  valor?: number | null;
  risco_nivel?: "baixo" | "medio" | "alto";
  notas?: string | null;
};

export type AgendamentoUpdate = Partial<{
  cliente_id: string;
  profissional_id: string;
  servico_id: string | null;
  sala_id: string | null;
  inicio: string;
  fim: string;
  status: string;
  valor: number | null;
  risco_nivel: "baixo" | "medio" | "alto";
  notas: string | null;
  motivo_cancelamento: string;
}>;

/** Criar novo agendamento */
export async function createAgendamento(payload: AgendamentoCreate): Promise<string> {
  const { data, error } = await supabase
    .from("agendamentos")
    .insert({
      cliente_id: payload.cliente_id,
      profissional_id: payload.profissional_id,
      servico_id: payload.servico_id ?? null,
      sala_id: payload.sala_id ?? null,
      inicio: payload.inicio,
      fim: payload.fim,
      status: payload.status ?? "pendente",
      valor: payload.valor ?? null,
      risco_nivel: payload.risco_nivel ?? "baixo",
      notas: payload.notas ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

/** Atualizar agendamento (reagendar, confirmar, cancelar, etc.) */
export async function updateAgendamento(id: string, payload: AgendamentoUpdate): Promise<void> {
  const { error } = await supabase.from("agendamentos").update(payload).eq("id", id);
  if (error) throw error;
}

/** Cancelar agendamento (status = cancelado) */
export async function cancelarAgendamento(id: string, motivo?: string): Promise<void> {
  await updateAgendamento(id, {
    status: "cancelado",
    ...(motivo != null ? { motivo_cancelamento: motivo } : {}),
  });
}

/** Marcar item da lista de espera como atendido e vincular ao agendamento */
export async function marcarListaEsperaAtendida(listaEsperaId: string, agendamentoId: string): Promise<void> {
  const { error } = await supabase
    .from("lista_espera")
    .update({ atendido: true, agendamento_id: agendamentoId })
    .eq("id", listaEsperaId);
  if (error) throw error;
}

/** Lista de espera (não atendidos) */
export async function fetchListaEspera(): Promise<ClienteWaitlist[]> {
  const { data, error } = await supabase
    .from("lista_espera")
    .select(`
      id, cliente_id, servico_id, prioridade, probabilidade_aceite,
      clientes(nome),
      servicos(nome)
    `)
    .eq("atendido", false)
    .order("prioridade", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: { id: string; cliente_id: string; servico_id: string | null; prioridade: number; probabilidade_aceite: number | null; clientes: { nome: string } | null; servicos: { nome: string } | null }) => ({
    id: r.id,
    clienteId: r.cliente_id,
    servicoId: r.servico_id ?? undefined,
    nome: r.clientes?.nome ?? "—",
    servicoDesejado: r.servicos?.nome ?? "—",
    probabilidadeAceite: Number(r.probabilidade_aceite) || 0,
    prioridade: r.prioridade ?? 0,
  }));
}

/** Alertas não lidos para o dashboard */
export async function fetchAlertas() {
  const { data, error } = await supabase
    .from("alertas")
    .select("id, tipo, titulo, texto, acao_label, lido")
    .eq("lido", false)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).map((a: { id: string; tipo: string; titulo: string; texto: string | null; acao_label: string | null }) => ({
    id: a.id,
    tipo: a.tipo,
    texto: a.texto ?? a.titulo,
    acao: a.acao_label ?? "Ver",
  }));
}

// ========== DASHBOARD - Dados reais ==========

export type ResumoFinanceiro = {
  receitaMesConfirmada: number;
  receitaPrevista: number;
  metaMes: number;
  metaAtingidaPercent: number;
  crescimentoVsAnterior: number;
  ticketMedio: number;
  receitaPorHora: number;
  graficoReceita: { mes: string; valor: number }[];
};

/** Resumo financeiro do mês atual + meta + gráfico últimos 6 meses */
export async function fetchResumoFinanceiro(): Promise<ResumoFinanceiro> {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;
  const mesInicio = `${ano}-${String(mes).padStart(2, "0")}-01T00:00:00`;
  const mesFim = new Date(ano, mes, 0, 23, 59, 59);
  const mesFimStr = mesFim.toISOString().slice(0, 10) + "T23:59:59";
  const seisMesesAtras = new Date(ano, mes - 6, 1);
  const seisMesesStr = seisMesesAtras.toISOString().slice(0, 10) + "T00:00:00";

  const [resumoRes, metaRes, agendamentosMesRes, agendamentosAnteriorRes, agendamentosGraficoRes] = await Promise.all([
    supabase.from("v_resumo_financeiro_mes").select("*").limit(1),
    supabase.from("financeiro_meta").select("valor_meta").eq("ano", ano).eq("mes", mes).is("unidade_id", null).limit(1),
    supabase.from("agendamentos").select("valor, inicio, fim").gte("inicio", mesInicio).lte("inicio", mesFimStr).in("status", ["confirmado", "em_atendimento", "concluido"]),
    supabase.from("agendamentos").select("valor").in("status", ["confirmado", "em_atendimento", "concluido"]).gte("inicio", new Date(ano, mes - 2, 1).toISOString().slice(0, 10)).lt("inicio", mesInicio),
    supabase.from("agendamentos").select("valor, inicio").gte("inicio", seisMesesStr).lte("inicio", mesFimStr).in("status", ["confirmado", "em_atendimento", "concluido"]),
  ]);

  const resumo = (resumoRes.data ?? [])[0] as { receita_confirmada?: number; receita_prevista?: number; total_confirmados?: number } | undefined;
  const receitaConfirmada = Number(resumo?.receita_confirmada) || 0;
  const receitaPrevista = Number(resumo?.receita_prevista) || 0;
  const totalConfirmados = Number(resumo?.total_confirmados) || 0;
  const metaMes = Number((metaRes.data ?? [])[0]?.valor_meta) || 0;
  const metaAtingidaPercent = metaMes > 0 ? Math.min(100, (receitaConfirmada / metaMes) * 100) : 0;

  const receitaAnterior = (agendamentosAnteriorRes.data ?? []).reduce((s, r) => s + Number((r as { valor: number }).valor || 0), 0);
  const crescimentoVsAnterior = receitaAnterior > 0 ? ((receitaConfirmada - receitaAnterior) / receitaAnterior) * 100 : 0;

  const minutosMes = (agendamentosMesRes.data ?? []).reduce((acc, r) => {
    const a = r as { inicio: string; fim: string; valor: number };
    const min = (new Date(a.fim).getTime() - new Date(a.inicio).getTime()) / 60000;
    return acc + min;
  }, 0);
  const receitaPorHora = minutosMes > 0 ? (receitaConfirmada / (minutosMes / 60)) : 0;
  const ticketMedio = totalConfirmados > 0 ? receitaConfirmada / totalConfirmados : 0;

  const porMes = new Map<string, number>();
  const nomesMes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1);
    porMes.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
  }
  (agendamentosGraficoRes.data ?? []).forEach((r) => {
    const a = r as { inicio: string; valor: number };
    const key = a.inicio.slice(0, 7);
    if (porMes.has(key)) porMes.set(key, porMes.get(key)! + Number(a.valor || 0));
  });
  const graficoReceita = Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, valor]) => ({ mes: nomesMes[parseInt(k.slice(5, 7), 10) - 1], valor: Math.round(valor / 1000) }));

  return {
    receitaMesConfirmada: receitaConfirmada,
    receitaPrevista: receitaPrevista,
    metaMes,
    metaAtingidaPercent,
    crescimentoVsAnterior,
    ticketMedio,
    receitaPorHora,
    graficoReceita,
  };
}

export type ResumoOcupacao = {
  taxaOcupacaoMes: number;
  taxaOcupacaoSemana: number;
  profissionalMaisOcupado: { nome: string; ocupacao: number };
  profissionalMenorOcupacao: { nome: string; ocupacao: number };
  horariosOciososCriticos: { dia: string; horario: string; slots: number }[];
  graficoOcupacao: { dia: string; ocupacao: number }[];
};

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Ocupação do mês/semana e por profissional (a partir de v_ocupacao_profissional_dia) */
export async function fetchResumoOcupacao(): Promise<ResumoOcupacao> {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;
  const inicioMes = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fimMes = new Date(ano, mes, 0);
  const fimMesStr = `${ano}-${String(mes).padStart(2, "0")}-${String(fimMes.getDate()).padStart(2, "0")}`;
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: ocupacaoDias } = await supabase
    .from("v_ocupacao_profissional_dia")
    .select("profissional_id, profissional_nome, dia, minutos_ocupados")
    .gte("dia", inicioMes)
    .lte("dia", fimMesStr);

  const minutosPorDiaSemana = new Map<number, number>();
  const minutosPorProf = new Map<string, { nome: string; minutos: number }>();
  (ocupacaoDias ?? []).forEach((r: { profissional_nome: string; profissional_id: string; dia: string; minutos_ocupados: number }) => {
    const d = new Date(r.dia);
    const dow = d.getDay();
    minutosPorDiaSemana.set(dow, (minutosPorDiaSemana.get(dow) ?? 0) + (r.minutos_ocupados ?? 0));
    const cur = minutosPorProf.get(r.profissional_id) ?? { nome: r.profissional_nome, minutos: 0 };
    cur.minutos += r.minutos_ocupados ?? 0;
    minutosPorProf.set(r.profissional_id, cur);
  });

  const minutosMesTotal = Array.from(minutosPorDiaSemana.values()).reduce((a, b) => a + b, 0);
  const minutosPossiveisMes = 22 * 8 * 60;
  const taxaOcupacaoMes = minutosPossiveisMes > 0 ? Math.round((minutosMesTotal / minutosPossiveisMes) * 100) : 0;

  const { data: ocupacaoSemana } = await supabase
    .from("v_ocupacao_profissional_dia")
    .select("minutos_ocupados")
    .gte("dia", oneWeekAgo.toISOString().slice(0, 10))
    .lte("dia", now.toISOString().slice(0, 10));
  const minutosSemana = (ocupacaoSemana ?? []).reduce((a, r) => a + (r as { minutos_ocupados: number }).minutos_ocupados, 0);
  const taxaOcupacaoSemana = 7 * 8 * 60 > 0 ? Math.round((minutosSemana / (7 * 8 * 60)) * 100) : 0;

  const profs = Array.from(minutosPorProf.values());
  const maisOcupado = profs.length ? profs.reduce((a, b) => (a.minutos >= b.minutos ? a : b), profs[0]) : { nome: "—", minutos: 0 };
  const menosOcupado = profs.length ? profs.reduce((a, b) => (a.minutos <= b.minutos ? a : b), profs[0]) : { nome: "—", minutos: 0 };
  const ocupacaoMax = Math.max(...profs.map((p) => p.minutos), 1);
  const profissionalMaisOcupado = { nome: maisOcupado.nome, ocupacao: Math.round((maisOcupado.minutos / ocupacaoMax) * 100) || 0 };
  const profissionalMenorOcupacao = { nome: menosOcupado.nome, ocupacao: ocupacaoMax > 0 ? Math.round((menosOcupado.minutos / ocupacaoMax) * 100) : 0 };

  const graficoOcupacao = [1, 2, 3, 4, 5, 6].map((dow) => ({
    dia: DIAS[dow],
    ocupacao: minutosPorDiaSemana.get(dow) ? Math.round((minutosPorDiaSemana.get(dow)! / (8 * 60)) * 100) : 0,
  }));

  return {
    taxaOcupacaoMes,
    taxaOcupacaoSemana,
    profissionalMaisOcupado,
    profissionalMenorOcupacao,
    horariosOciososCriticos: [],
    graficoOcupacao,
  };
}

export type ResumoRisco = {
  taxaNoShow: number;
  riscoPrevistoFaltas: number;
  cancelamentosSemana: number;
  receitaEmRisco: number;
  nivelRisco: "baixo" | "medio" | "alto";
};

/** Risco: no-show, cancelamentos, receita em risco */
export async function fetchResumoRisco(): Promise<ResumoRisco> {
  const now = new Date();
  const semanaAtras = new Date(now);
  semanaAtras.setDate(semanaAtras.getDate() - 7);
  const semanaStr = semanaAtras.toISOString().slice(0, 10) + "T00:00:00";

  const [noShowRes, canceladosRes, riscoRes] = await Promise.all([
    supabase.from("agendamentos").select("id", { count: "exact", head: true }).eq("status", "no_show").gte("inicio", now.getFullYear() + "-01-01"),
    supabase.from("agendamentos").select("id").eq("status", "cancelado").gte("inicio", semanaStr),
    supabase.from("agendamentos").select("valor").in("status", ["pendente", "aguardando_pagamento"]).eq("risco_nivel", "alto").gte("inicio", now.toISOString().slice(0, 10)),
  ]);

  const totalAgendamentosRes = await supabase.from("agendamentos").select("id", { count: "exact", head: true }).gte("inicio", now.getFullYear() + "-01-01").in("status", ["confirmado", "em_atendimento", "concluido", "no_show"]);
  const totalAg = (totalAgendamentosRes.count ?? 0) || 0;
  const totalNoShow = (noShowRes.count ?? 0) || 0;
  const taxaNoShow = totalAg > 0 ? Math.round((totalNoShow / totalAg) * 1000) / 10 : 0;
  const cancelamentosSemana = (canceladosRes.data ?? []).length;
  const receitaEmRisco = (riscoRes.data ?? []).reduce((s, r) => s + Number((r as { valor: number }).valor || 0), 0);
  const riscoPrevistoFaltas = (riscoRes.data ?? []).length;

  let nivelRisco: "baixo" | "medio" | "alto" = "baixo";
  if (taxaNoShow > 15 || cancelamentosSemana > 10 || receitaEmRisco > 5000) nivelRisco = "alto";
  else if (taxaNoShow > 8 || cancelamentosSemana > 4) nivelRisco = "medio";

  return { taxaNoShow, riscoPrevistoFaltas, cancelamentosSemana, receitaEmRisco, nivelRisco };
}

export type ResumoIA = {
  faltasEvitadas: number;
  receitaRecuperada: number;
  encaixesFeitos: number;
  performancePercent: number;
};

/** Helper: obtém empresa_id */
async function getEmpresaId(): Promise<string | null> {
  const { data } = await supabase.from("config_empresa").select("id").limit(1);
  return (data ?? [])[0]?.id ?? null;
}

/** IA: lê de ia_metricas (prioridade) ou inteligencia_insights (fallback); se vazio, zeros */
export async function fetchResumoIA(): Promise<ResumoIA> {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;

  const empresaId = await getEmpresaId();
  if (empresaId) {
    const { data: metricas } = await supabase
      .from("ia_metricas")
      .select("faltas_evitadas, receita_recuperada, encaixes_feitos, performance_percent")
      .eq("empresa_id", empresaId)
      .is("profissional_id", null)
      .eq("periodo_ano", ano)
      .eq("periodo_mes", mes)
      .limit(1)
      .maybeSingle();

    if (metricas) {
      return {
        faltasEvitadas: metricas.faltas_evitadas ?? 0,
        receitaRecuperada: Number(metricas.receita_recuperada) ?? 0,
        encaixesFeitos: metricas.encaixes_feitos ?? 0,
        performancePercent: Number(metricas.performance_percent) ?? 0,
      };
    }
  }

  const { data: insights } = await supabase.from("inteligencia_insights").select("tipo, dados").in("tipo", ["ia_faltas_evitadas", "ia_receita_recuperada", "ia_encaixes", "ia_performance"]).limit(10);
  const map: Record<string, number> = {};
  (insights ?? []).forEach((r: { tipo: string; dados?: Record<string, number> }) => {
    const val = r.dados?.valor ?? r.dados?.total ?? 0;
    if (r.tipo === "ia_faltas_evitadas") map.faltasEvitadas = (map.faltasEvitadas ?? 0) + val;
    if (r.tipo === "ia_receita_recuperada") map.receitaRecuperada = (map.receitaRecuperada ?? 0) + val;
    if (r.tipo === "ia_encaixes") map.encaixesFeitos = (map.encaixesFeitos ?? 0) + val;
    if (r.tipo === "ia_performance") map.performancePercent = val;
  });
  return {
    faltasEvitadas: map.faltasEvitadas ?? 0,
    receitaRecuperada: map.receitaRecuperada ?? 0,
    encaixesFeitos: map.encaixesFeitos ?? 0,
    performancePercent: map.performancePercent ?? 0,
  };
}

export type ResumoClientes = {
  novosNoMes: number;
  taxaRetorno: number;
  emRiscoAbandono: number;
  top5Valiosos: { nome: string; valor: number }[];
};

/** Clientes: novos no mês, em risco, top 5 por LTV */
export async function fetchResumoClientes(): Promise<ResumoClientes> {
  const now = new Date();
  const inicioMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00`;

  const [novosRes, riscoRes, topRes] = await Promise.all([
    supabase.from("clientes").select("id", { count: "exact", head: true }).gte("created_at", inicioMes),
    supabase.from("clientes").select("id", { count: "exact", head: true }).eq("ativo", true).gte("risco_abandono", 40),
    supabase.from("clientes").select("nome, ltv_cache").eq("ativo", true).order("ltv_cache", { ascending: false }).limit(5),
  ]);

  const totalAtivosRes = await supabase.from("clientes").select("id", { count: "exact", head: true }).eq("ativo", true);
  const totalAtivos = totalAtivosRes.count ?? 0;
  const emRisco = riscoRes.count ?? 0;
  const taxaRetorno = totalAtivos > 0 ? Math.round(((totalAtivos - emRisco) / totalAtivos) * 100) : 0;

  const top5Valiosos = (topRes.data ?? []).map((r: { nome: string; ltv_cache: number | null }) => ({ nome: r.nome, valor: Number(r.ltv_cache) || 0 }));

  return {
    novosNoMes: novosRes.count ?? 0,
    taxaRetorno,
    emRiscoAbandono: riscoRes.count ?? 0,
    top5Valiosos,
  };
}

/** Tipos de insight "Inteligência aplicada" */
export const IA_INSIGHT_TIPOS = ["aumento_preco", "alta_demanda", "baixa_ocupacao", "perda_ociosidade"] as const;

export type InsightInteligenciaAplicada = {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  dados: Record<string, unknown>;
};

/** Atualiza ou insere métricas IA no banco (para alimentação por processos/IA) */
export async function upsertMetricasIA(payload: {
  faltasEvitadas?: number;
  receitaRecuperada?: number;
  encaixesFeitos?: number;
  performancePercent?: number;
  profissionalId?: string | null;
}): Promise<void> {
  const empresaId = await getEmpresaId();
  if (!empresaId) throw new Error("Nenhuma empresa configurada");
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;

  const { data: existente } = await supabase
    .from("ia_metricas")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("periodo_ano", ano)
    .eq("periodo_mes", mes)
    .is("profissional_id", payload.profissionalId ?? null)
    .maybeSingle();

  const row = {
    empresa_id: empresaId,
    profissional_id: payload.profissionalId ?? null,
    periodo_ano: ano,
    periodo_mes: mes,
    faltas_evitadas: payload.faltasEvitadas ?? 0,
    receita_recuperada: payload.receitaRecuperada ?? 0,
    encaixes_feitos: payload.encaixesFeitos ?? 0,
    performance_percent: payload.performancePercent ?? 0,
  };

  if (existente?.id) {
    const { error } = await supabase.from("ia_metricas").update(row).eq("id", existente.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("ia_metricas").insert(row);
    if (error) throw error;
  }
}

/** Insere ou atualiza um insight de inteligência aplicada (para alimentação) */
export async function upsertInsightInteligenciaAplicada(payload: {
  tipo: "aumento_preco" | "alta_demanda" | "baixa_ocupacao" | "perda_ociosidade";
  titulo: string;
  descricao?: string | null;
  dados?: Record<string, unknown>;
  profissionalId?: string | null;
}): Promise<string> {
  const empresaId = await getEmpresaId();
  if (!empresaId) throw new Error("Nenhuma empresa configurada");

  let q = supabase
    .from("inteligencia_insights")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("tipo", payload.tipo);
  if (payload.profissionalId) q = q.eq("profissional_id", payload.profissionalId);
  else q = q.is("profissional_id", null);

  const { data: existente } = await q.maybeSingle();
  const row = {
    empresa_id: empresaId,
    profissional_id: payload.profissionalId ?? null,
    tipo: payload.tipo,
    titulo: payload.titulo,
    descricao: payload.descricao ?? null,
    dados: payload.dados ?? {},
  };

  if (existente?.id) {
    const { error } = await supabase.from("inteligencia_insights").update(row).eq("id", existente.id);
    if (error) throw error;
    return existente.id;
  }
  const { data: inserted, error } = await supabase.from("inteligencia_insights").insert(row).select("id").single();
  if (error) throw error;
  return inserted.id;
}

/** Insights "4. Inteligência aplicada" - lê de inteligencia_insights (tipos aumento_preco, alta_demanda, baixa_ocupacao, perda_ociosidade) */
export async function fetchInsightsInteligenciaAplicada(profissionalId?: string | null): Promise<InsightInteligenciaAplicada[]> {
  const empresaId = await getEmpresaId();
  let q = supabase
    .from("inteligencia_insights")
    .select("id, tipo, titulo, descricao, dados")
    .in("tipo", [...IA_INSIGHT_TIPOS])
    .order("tipo");

  if (empresaId) q = q.or(`empresa_id.eq.${empresaId},empresa_id.is.null`);
  if (profissionalId) q = q.or(`profissional_id.eq.${profissionalId},profissional_id.is.null`);

  const { data } = await q;
  return (data ?? []).map((r: { id: string; tipo: string; titulo: string; descricao: string | null; dados: unknown }) => ({
    id: r.id,
    tipo: r.tipo,
    titulo: r.titulo,
    descricao: r.descricao,
    dados: (r.dados as Record<string, unknown>) ?? {},
  }));
}
