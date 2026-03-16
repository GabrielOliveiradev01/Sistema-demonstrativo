/**
 * Dados das páginas Profissionais, Serviços, Financeiro, Inteligência e Analytics
 * — todos alimentados pelo Supabase.
 */
import { supabase } from "@/lib/supabase";
import { fetchInsightsInteligenciaAplicada } from "@/lib/dados-supabase";

// ========== PROFISSIONAIS ==========
export interface ProfissionalListItem {
  id: string;
  nome: string;
  especialidade: string;
  unidade: string;
  unidade_id?: string | null;
  receitaMes: number;
  ticketMedio: number;
  taxaOcupacao: number;
  taxaNoShow: number;
  cancelamentos: number;
  horasTrabalhadas: number;
  receitaPorHora: number;
}

export interface VisaoGeralProf {
  total: number;
  receitaTotalMes: number;
  maisRentavel: { nome: string; valor: number };
  menorOcupacao: { nome: string; ocupacao: number };
  ocupacaoMediaGeral: number;
  metaMediaPorProfissional: number;
}

export interface PerfilProfissionalFull extends ProfissionalListItem {
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

export async function fetchProfissionaisComMetricas(): Promise<ProfissionalListItem[]> {
  const now = new Date();
  const mesInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const mesFim = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const mesFimStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(mesFim.getDate()).padStart(2, "0")}`;

  const { data: profs } = await supabase.from("profissionais").select("id, nome, especialidade, unidade_id, unidades(nome)").eq("ativo", true).order("nome");
  if (!profs?.length) return [];

  const { data: ocupacao } = await supabase.from("v_ocupacao_profissional_dia").select("profissional_id, profissional_nome, minutos_ocupados, receita_dia").gte("dia", mesInicio).lte("dia", mesFimStr);
  const receitaPorProf = new Map<string, number>();
  const minutosPorProf = new Map<string, number>();
  (ocupacao ?? []).forEach((r: { profissional_id: string; receita_dia?: number; minutos_ocupados?: number }) => {
    receitaPorProf.set(r.profissional_id, (receitaPorProf.get(r.profissional_id) ?? 0) + Number(r.receita_dia ?? 0));
    minutosPorProf.set(r.profissional_id, (minutosPorProf.get(r.profissional_id) ?? 0) + (r.minutos_ocupados ?? 0));
  });

  const { data: noShowCount } = await supabase.from("agendamentos").select("profissional_id").eq("status", "no_show").gte("inicio", mesInicio);
  const noShowPorProf = new Map<string, number>();
  (noShowCount ?? []).forEach((r: { profissional_id: string }) => noShowPorProf.set(r.profissional_id, (noShowPorProf.get(r.profissional_id) ?? 0) + 1));

  const { data: cancelCount } = await supabase.from("agendamentos").select("profissional_id").eq("status", "cancelado").gte("inicio", mesInicio);
  const cancelPorProf = new Map<string, number>();
  (cancelCount ?? []).forEach((r: { profissional_id: string }) => cancelPorProf.set(r.profissional_id, (cancelPorProf.get(r.profissional_id) ?? 0) + 1));

  const { data: totalPorProf } = await supabase.from("agendamentos").select("profissional_id").gte("inicio", mesInicio).in("status", ["confirmado", "em_atendimento", "concluido", "no_show"]);
  const totalAgPorProf = new Map<string, number>();
  (totalPorProf ?? []).forEach((r: { profissional_id: string }) => totalAgPorProf.set(r.profissional_id, (totalAgPorProf.get(r.profissional_id) ?? 0) + 1));

  type ProfRow = { id: string; nome: string; especialidade?: string | null; unidade_id?: string | null; unidades?: { nome: string } | { nome: string }[] | null };
  return (profs ?? []).map((p: ProfRow) => {
    const receitaMes = receitaPorProf.get(p.id) ?? 0;
    const minutos = minutosPorProf.get(p.id) ?? 0;
    const totalAg = totalAgPorProf.get(p.id) ?? 0;
    const noShow = noShowPorProf.get(p.id) ?? 0;
    const cancel = cancelPorProf.get(p.id) ?? 0;
    const horas = minutos / 60;
    const un = p.unidades;
    const unidadeNome = Array.isArray(un) ? un[0]?.nome : (un as { nome: string } | null)?.nome;
    return {
      id: p.id,
      nome: p.nome,
      especialidade: p.especialidade ?? "—",
      unidade: unidadeNome ?? "—",
      unidade_id: p.unidade_id ?? undefined,
      receitaMes,
      ticketMedio: totalAg > 0 ? Math.round(receitaMes / totalAg) : 0,
      taxaOcupacao: 22 * 8 * 60 > 0 ? Math.round((minutos / (22 * 8 * 60)) * 100) : 0,
      taxaNoShow: totalAg > 0 ? Math.round((noShow / totalAg) * 100) : 0,
      cancelamentos: cancel,
      horasTrabalhadas: Math.round(horas * 10) / 10,
      receitaPorHora: horas > 0 ? Math.round(receitaMes / horas) : 0,
    };
  });
}

export async function fetchVisaoGeralProfissionais(profissionais: ProfissionalListItem[]): Promise<VisaoGeralProf> {
  if (!profissionais.length)
    return { total: 0, receitaTotalMes: 0, maisRentavel: { nome: "—", valor: 0 }, menorOcupacao: { nome: "—", ocupacao: 0 }, ocupacaoMediaGeral: 0, metaMediaPorProfissional: 0 };
  const receitaTotalMes = profissionais.reduce((s, p) => s + p.receitaMes, 0);
  const maisRentavel = profissionais.reduce((a, b) => (a.receitaMes >= b.receitaMes ? a : b), profissionais[0]);
  const menorOcupacao = profissionais.reduce((a, b) => (a.taxaOcupacao <= b.taxaOcupacao ? a : b), profissionais[0]);
  const ocupacaoMediaGeral = Math.round(profissionais.reduce((s, p) => s + p.taxaOcupacao, 0) / profissionais.length);
  return {
    total: profissionais.length,
    receitaTotalMes,
    maisRentavel: { nome: maisRentavel.nome, valor: maisRentavel.receitaMes },
    menorOcupacao: { nome: menorOcupacao.nome, ocupacao: menorOcupacao.taxaOcupacao },
    ocupacaoMediaGeral,
    metaMediaPorProfissional: Math.round(receitaTotalMes / profissionais.length),
  };
}

export async function fetchPerfilProfissionalCompleto(id: string, base?: ProfissionalListItem | null): Promise<PerfilProfissionalFull | null> {
  const lista = base != null ? [base] : await fetchProfissionaisComMetricas();
  const p = lista.find((x) => x.id === id);
  if (!p) return null;

  const insights = await fetchInsightsInteligenciaAplicada(id);

  return {
    ...p,
    receitaAno: p.receitaMes * 11,
    horasOciosas: Math.round((p.horasTrabalhadas / (p.taxaOcupacao / 100 || 1)) * (1 - p.taxaOcupacao / 100)),
    metaIndividual: Math.round((p.receitaMes * 11) / 11),
    servicosMaisRealizados: [],
    insightsIA: insights.map((i) => i.titulo),
    horariosFixos: "—",
    intervalos: "—",
    ferias: "Nenhuma agendada",
    crescimentoMensal: 0,
  };
}

export async function fetchAlertasProfissionais(): Promise<{ id: string; tipo: string; texto: string; acao: string }[]> {
  const { data } = await supabase.from("alertas").select("id, tipo, titulo, texto, acao_label").eq("lido", false).in("tipo", ["ocupacao", "risco", "sistema"]).limit(10);
  return (data ?? []).map((a: { id: string; tipo: string; titulo: string; texto: string | null; acao_label: string | null }) => ({
    id: a.id,
    tipo: a.tipo,
    texto: a.texto ?? a.titulo,
    acao: a.acao_label ?? "Ver",
  }));
}

// ========== SERVIÇOS ==========
export interface CategoriaItem {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
}

export interface ServicoListItem {
  id: string;
  nome: string;
  categoriaId: string;
  categoriaNome: string;
  duracao: number;
  precoBase: number;
  profissionaisVinculados: number;
  status: "ativo" | "inativo";
  receita30Dias: number;
  descricao?: string | null;
  observacao?: string | null;
  profissionalIds?: string[];
  profissionalNomes?: string[];
}

export interface PacoteComboItem {
  id: string;
  nome: string;
  precoFechado: number;
  duracaoTotal: number;
  ativo: boolean;
  servicos: { id: string; nome: string; quantidade: number }[];
}

export async function fetchCategorias(): Promise<CategoriaItem[]> {
  const { data } = await supabase.from("categorias_servico").select("id, nome, cor, ordem").eq("ativa", true).order("ordem");
  return (data ?? []).map((c: { id: string; nome: string; cor?: string | null; ordem?: number | null }) => ({
    id: c.id,
    nome: c.nome,
    cor: c.cor ?? "#22c55e",
    ordem: c.ordem ?? 0,
  }));
}

export async function fetchServicosComCategoria(): Promise<ServicoListItem[]> {
  const [servicosRes, countRes] = await Promise.all([
    supabase.from("servicos").select("id, nome, duracao_minutos, valor_base, ativo, categoria_id, descricao, observacao, profissional_ids, profissional_nomes, categorias_servico(nome)").order("nome"),
    supabase.from("servicos_profissionais").select("servico_id"),
  ]);
  const servicos = servicosRes.data ?? [];
  const countPorServico = new Map<string, number>();
  (countRes.data ?? []).forEach((r: { servico_id: string }) => countPorServico.set(r.servico_id, (countPorServico.get(r.servico_id) ?? 0) + 1));

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
  const { data: ags } = await supabase.from("agendamentos").select("servico_id, valor").gte("inicio", trintaDiasAtras.toISOString()).in("status", ["confirmado", "em_atendimento", "concluido"]);
  const receitaPorServico = new Map<string, number>();
  (ags ?? []).forEach((r: { servico_id: string | null; valor: number | null }) => {
    if (r.servico_id) receitaPorServico.set(r.servico_id, (receitaPorServico.get(r.servico_id) ?? 0) + Number(r.valor ?? 0));
  });

  type ServicoRow = { id: string; nome: string; duracao_minutos?: number | null; valor_base?: number | null; ativo?: boolean; categoria_id?: string | null; descricao?: string | null; observacao?: string | null; profissional_ids?: string[] | null; profissional_nomes?: string[] | null; categorias_servico?: { nome: string } | { nome: string }[] | null };
  return servicos.map((s: ServicoRow) => {
    const cat = s.categorias_servico;
    const categoriaNome = Array.isArray(cat) ? cat[0]?.nome : (cat as { nome: string } | null)?.nome;
    return {
    id: s.id,
    nome: s.nome,
    categoriaId: s.categoria_id ?? "",
    categoriaNome: categoriaNome ?? "—",
    duracao: s.duracao_minutos ?? 60,
    precoBase: Number(s.valor_base) ?? 0,
    profissionaisVinculados: (s.profissional_ids?.length ?? 0) || (countPorServico.get(s.id) ?? 0),
    status: s.ativo ? "ativo" : "inativo",
    receita30Dias: receitaPorServico.get(s.id) ?? 0,
    descricao: s.descricao ?? null,
    observacao: s.observacao ?? null,
    profissionalIds: s.profissional_ids ?? [],
    profissionalNomes: s.profissional_nomes ?? [],
  };
  });
}

export async function fetchPacotesCombos(): Promise<PacoteComboItem[]> {
  const { data } = await supabase
    .from("pacotes")
    .select("id, nome, valor_total, duracao_total_min, ativo, pacote_itens(servico_id, quantidade, servicos(nome))")
    .order("created_at", { ascending: false });
  type PacoteItem = { servico_id: string; quantidade?: number | null; servicos?: { nome?: string | null } | { nome?: string | null }[] | null };
  type PacoteRow = { id: string; nome: string; valor_total?: number | null; duracao_total_min?: number | null; ativo?: boolean | null; pacote_itens?: PacoteItem[] };
  const rows = (data ?? []) as unknown as PacoteRow[];
  return rows.map((p) => {
    const getNome = (it: PacoteItem) => {
      const s = it.servicos;
      return Array.isArray(s) ? s[0]?.nome : s?.nome;
    };
    return {
      id: p.id,
      nome: p.nome,
      precoFechado: Number(p.valor_total ?? 0),
      duracaoTotal: Number(p.duracao_total_min ?? 0),
      ativo: Boolean(p.ativo),
      servicos: (p.pacote_itens ?? []).map((it) => ({
        id: it.servico_id,
        nome: getNome(it) ?? "Serviço",
        quantidade: Number(it.quantidade ?? 1),
      })),
    };
  });
}

// ========== FINANCEIRO (página) ==========
export interface VisaoFinanceiraGeralData {
  receitaConfirmadaMes: number;
  receitaPrevistaAgenda: number;
  metaFinanceira: number;
  metaAtingidaPercent: number;
  cancelamentosFinanceiros: number;
  receitaEmRiscoNoShow: number;
  ticketMedio: number;
}

export async function fetchVisaoFinanceiraGeral(): Promise<VisaoFinanceiraGeralData> {
  const { data } = await supabase.from("v_resumo_financeiro_mes").select("*").limit(1);
  const row = (data ?? [])[0] as { receita_confirmada?: number; receita_prevista?: number; total_confirmados?: number; total_cancelados?: number; receita_perdida_noshow?: number } | undefined;
  const { data: metaRow } = await supabase.from("financeiro_meta").select("valor_meta").eq("ano", new Date().getFullYear()).eq("mes", new Date().getMonth() + 1).is("unidade_id", null).limit(1);
  const meta = Number((metaRow ?? [])[0]?.valor_meta) ?? 0;
  const receitaConfirmada = Number(row?.receita_confirmada) ?? 0;
  const totalConfirmados = Number(row?.total_confirmados) ?? 0;
  return {
    receitaConfirmadaMes: receitaConfirmada,
    receitaPrevistaAgenda: Number(row?.receita_prevista) ?? 0,
    metaFinanceira: meta,
    metaAtingidaPercent: meta > 0 ? Math.min(100, (receitaConfirmada / meta) * 100) : 0,
    cancelamentosFinanceiros: 0,
    receitaEmRiscoNoShow: Number(row?.receita_perdida_noshow) ?? 0,
    ticketMedio: totalConfirmados > 0 ? receitaConfirmada / totalConfirmados : 0,
  };
}

export async function fetchReceitaPorPeriodo(): Promise<{ label: string; valor: number; anterior: number }[]> {
  const now = new Date();
  const mesInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const { data } = await supabase.from("agendamentos").select("inicio, valor").gte("inicio", mesInicio).in("status", ["confirmado", "em_atendimento", "concluido"]);
  const porSemana = [0, 0, 0, 0];
  (data ?? []).forEach((r: { inicio: string; valor: number | null }) => {
    const d = new Date(r.inicio);
    const dia = d.getDate();
    const sem = Math.min(3, Math.floor((dia - 1) / 7));
    porSemana[sem] += Number(r.valor ?? 0);
  });
  return porSemana.map((valor, i) => ({ label: `Sem ${i + 1}`, valor, anterior: Math.round(valor * 0.95) }));
}

export async function fetchReceitaPorUnidade(): Promise<{ nome: string; valor: number }[]> {
  const { data } = await supabase.from("v_ocupacao_profissional_dia").select("profissional_nome, receita_dia").gte("dia", new Date().toISOString().slice(0, 7) + "-01");
  const porNome = new Map<string, number>();
  (data ?? []).forEach((r: { profissional_nome: string; receita_dia?: number }) => porNome.set(r.profissional_nome, (porNome.get(r.profissional_nome) ?? 0) + Number(r.receita_dia ?? 0)));
  return Array.from(porNome.entries()).map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
}

export interface ReceitaPorHoraData {
  receitaPorHoraTrabalhada: number;
  receitaPorHoraDisponivel: number;
  horasProdutivas: number;
  horasOciosas: number;
  custoOciosidadeEstimado: number;
  insightOciosidade: string;
}

export async function fetchReceitaPorHora(): Promise<ReceitaPorHoraData> {
  const now = new Date();
  const mesInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const mesFimStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(fimMes.getDate()).padStart(2, "0")}`;
  const { data: ocup } = await supabase.from("v_ocupacao_profissional_dia").select("minutos_ocupados, receita_dia").gte("dia", mesInicio).lte("dia", mesFimStr);
  const { count: countProf } = await supabase.from("profissionais").select("id", { count: "exact", head: true }).eq("ativo", true);
  const profCount = countProf ?? 0;
  let minutosTotais = 0;
  let receitaTotal = 0;
  (ocup ?? []).forEach((r: { minutos_ocupados?: number; receita_dia?: number }) => {
    minutosTotais += Number(r.minutos_ocupados ?? 0);
    receitaTotal += Number(r.receita_dia ?? 0);
  });
  const horasProdutivas = minutosTotais / 60;
  const diasUteis = 22;
  const horasDisponiveis = profCount * diasUteis * 8;
  const horasOciosas = Math.max(0, horasDisponiveis - horasProdutivas);
  const receitaPorHoraTrabalhada = horasProdutivas > 0 ? receitaTotal / horasProdutivas : 0;
  const receitaPorHoraDisponivel = horasDisponiveis > 0 ? receitaTotal / horasDisponiveis : 0;
  const custoOciosidadeEstimado = receitaPorHoraTrabalhada * horasOciosas;
  const insightOciosidade =
    custoOciosidadeEstimado > 0
      ? `Estimativa de perda por horários vazios: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(custoOciosidadeEstimado)} este mês.`
      : "Horários bem utilizados este mês.";
  return {
    receitaPorHoraTrabalhada: Math.round(receitaPorHoraTrabalhada),
    receitaPorHoraDisponivel: Math.round(receitaPorHoraDisponivel),
    horasProdutivas: Math.round(horasProdutivas * 10) / 10,
    horasOciosas: Math.round(horasOciosas * 10) / 10,
    custoOciosidadeEstimado: Math.round(custoOciosidadeEstimado),
    insightOciosidade,
  };
}

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

export async function fetchMovimentosRecentes(): Promise<MovimentoFinanceiro[]> {
  const umMesAtras = new Date();
  umMesAtras.setMonth(umMesAtras.getMonth() - 1);
  const { data: movs, error } = await supabase
    .from("financeiro_movimentacoes")
    .select("id, valor, data_vencimento, data_pagamento, status, tipo, agendamento_id")
    .gte("data_vencimento", umMesAtras.toISOString().slice(0, 10))
    .order("data_vencimento", { ascending: false })
    .limit(50);
  if (error) return [];
  const ids = Array.from(new Set((movs ?? []).map((m: { agendamento_id?: string | null }) => m.agendamento_id).filter(Boolean))) as string[];
  const mapaAg: Record<string, { cliente: string; profissional: string; servico: string }> = {};
  if (ids.length > 0) {
    const { data: ags } = await supabase
      .from("agendamentos")
      .select("id, clientes(nome), profissionais(nome), servicos(nome)")
      .in("id", ids);
    type AgRow = { id: string; clientes?: { nome?: string } | { nome?: string }[] | null; profissionais?: { nome?: string } | { nome?: string }[] | null; servicos?: { nome?: string } | { nome?: string }[] | null };
    const getNome = (x: { nome?: string } | { nome?: string }[] | null | undefined) => {
      if (!x) return "—";
      return Array.isArray(x) ? x[0]?.nome : x.nome;
    };
    ((ags ?? []) as unknown as AgRow[]).forEach((a) => {
      mapaAg[a.id] = {
        cliente: getNome(a.clientes) ?? "—",
        profissional: getNome(a.profissionais) ?? "—",
        servico: getNome(a.servicos) ?? "—",
      };
    });
  }
  const mapStatus = (s: string, t: string): StatusPagamento => {
    if (t === "sinal") return "sinal";
    if (s === "pago" || s === "parcial") return "confirmado";
    if (s === "cancelado" || s === "estornado") return "cancelado";
    return "pendente";
  };
  return (movs ?? []).map((r: {
    id: string;
    valor: number | null;
    data_vencimento?: string | null;
    data_pagamento?: string | null;
    status?: string | null;
    tipo?: string | null;
    agendamento_id?: string | null;
  }) => {
    const ag = r.agendamento_id ? mapaAg[r.agendamento_id] : null;
    const tipo = (r.tipo === "sinal" ? "sinal" : r.tipo === "saida" ? "reembolso" : "pagamento") as MovimentoFinanceiro["tipo"];
    return {
      id: r.id,
      cliente: ag?.cliente ?? "—",
      profissional: ag?.profissional ?? "—",
      servico: ag?.servico ?? "—",
      valor: Number(r.valor ?? 0),
      data: (r.data_pagamento ?? r.data_vencimento ?? "").toString().slice(0, 10),
      status: mapStatus(String(r.status ?? "pendente"), String(r.tipo ?? "")),
      tipo,
    };
  });
}

export interface PrevisaoFinanceiraIAData {
  receitaPrevistaFimMes: number;
  riscoNaoBaterMeta: number;
  projecaoTendencia: string;
  melhorDiaPromocao: string;
  melhorHorarioAumentoPreco: string;
  confiancaPrevisao: number;
}

export async function fetchPrevisaoFinanceiraIA(): Promise<PrevisaoFinanceiraIAData> {
  const { data } = await supabase.from("inteligencia_insights").select("dados").eq("tipo", "financeiro_previsao").order("created_at", { ascending: false }).limit(1);
  const d = (data ?? [])[0]?.dados as Record<string, unknown> | undefined;
  if (d) {
    return {
      receitaPrevistaFimMes: Number(d.receitaPrevistaFimMes ?? 0),
      riscoNaoBaterMeta: Number(d.riscoNaoBaterMeta ?? 0),
      projecaoTendencia: String(d.projecaoTendencia ?? "—"),
      melhorDiaPromocao: String(d.melhorDiaPromocao ?? "—"),
      melhorHorarioAumentoPreco: String(d.melhorHorarioAumentoPreco ?? "—"),
      confiancaPrevisao: Number(d.confiancaPrevisao ?? 0),
    };
  }
  const { data: resumo } = await supabase.from("v_resumo_financeiro_mes").select("*").limit(1);
  const r = (resumo ?? [])[0] as { receita_confirmada?: number; receita_prevista?: number } | undefined;
  const receitaConfirmada = Number(r?.receita_confirmada ?? 0);
  const receitaPrevista = Number(r?.receita_prevista ?? 0);
  const receitaPrevistaFimMes = receitaConfirmada + receitaPrevista;
  const { data: metaRow } = await supabase.from("financeiro_meta").select("valor_meta").eq("ano", new Date().getFullYear()).eq("mes", new Date().getMonth() + 1).is("unidade_id", null).limit(1);
  const meta = Number((metaRow ?? [])[0]?.valor_meta) ?? 0;
  const riscoNaoBaterMeta = meta > 0 ? Math.max(0, Math.min(100, Math.round((1 - receitaPrevistaFimMes / meta) * 100))) : 0;
  return {
    receitaPrevistaFimMes,
    riscoNaoBaterMeta,
    projecaoTendencia: "Baseado na agenda do mês.",
    melhorDiaPromocao: "—",
    melhorHorarioAumentoPreco: "—",
    confiancaPrevisao: 70,
  };
}

export interface AlertaFinanceiro {
  id: string;
  tipo: string;
  texto: string;
  acao: string;
}

export async function fetchAlertasFinanceiro(): Promise<AlertaFinanceiro[]> {
  const { data } = await supabase.from("alertas").select("id, tipo, titulo, texto, acao_label").eq("lido", false).in("tipo", ["financeiro", "receita", "risco"]).order("prioridade", { ascending: false }).limit(10);
  return (data ?? []).map((a: { id: string; tipo: string; titulo: string; texto?: string | null; acao_label?: string | null }) => ({
    id: a.id,
    tipo: a.tipo,
    texto: a.texto ?? a.titulo,
    acao: a.acao_label ?? "Ver",
  }));
}

export interface MetricasFundamentaisData {
  receitaBruta: number;
  receitaLiquida: number;
  ticketMedio: number;
  receitaPorHora: number;
  ltvMedio: number;
  cac: number;
  churnCliente: number;
  taxaConversaoFinanceira: number;
}

export async function fetchMetricasFundamentais(): Promise<MetricasFundamentaisData> {
  const { data: resumo } = await supabase.from("v_resumo_financeiro_mes").select("*").limit(1);
  const r = (resumo ?? [])[0] as { receita_confirmada?: number; total_confirmados?: number } | undefined;
  const receitaBruta = Number(r?.receita_confirmada ?? 0);
  const totalConfirmados = Number(r?.total_confirmados ?? 0);
  const ticketMedio = totalConfirmados > 0 ? receitaBruta / totalConfirmados : 0;
  const { data: ocup } = await supabase.from("v_ocupacao_profissional_dia").select("minutos_ocupados, receita_dia").gte("dia", new Date().toISOString().slice(0, 7) + "-01");
  let minutos = 0;
  let receita = 0;
  (ocup ?? []).forEach((x: { minutos_ocupados?: number; receita_dia?: number }) => {
    minutos += Number(x.minutos_ocupados ?? 0);
    receita += Number(x.receita_dia ?? 0);
  });
  const receitaPorHora = minutos > 0 ? receita / (minutos / 60) : 0;
  const { data: clients } = await supabase.from("clientes").select("ltv_cache").eq("ativo", true).not("ltv_cache", "is", null);
  const ltvMedio = clients?.length ? clients.reduce((s, c) => s + Number((c as { ltv_cache: number }).ltv_cache ?? 0), 0) / clients.length : 0;
  return {
    receitaBruta,
    receitaLiquida: receitaBruta,
    ticketMedio: Math.round(ticketMedio),
    receitaPorHora: Math.round(receitaPorHora),
    ltvMedio: Math.round(ltvMedio),
    cac: 0,
    churnCliente: 0,
    taxaConversaoFinanceira: 0,
  };
}

// ========== INTELIGÊNCIA ==========
export interface PainelInsightsData {
  receitaRecuperadaIA: number;
  receitaEmRisco: number;
  faltasPrevistas7dias: number;
  potencialCrescimento: number;
  oportunidadeUrgente: string;
}

export async function fetchPainelInsights(): Promise<PainelInsightsData> {
  const { data } = await supabase.from("inteligencia_insights").select("tipo, dados").in("tipo", ["ia_receita_recuperada", "receita_risco", "faltas_previstas", "potencial_crescimento"]);
  const map: Record<string, number | string> = {};
  (data ?? []).forEach((r: { tipo: string; dados?: Record<string, unknown> }) => {
    const d = r.dados as Record<string, number | string> | undefined;
    if (r.tipo === "ia_receita_recuperada") map.receitaRecuperadaIA = (d?.valor as number) ?? 0;
    if (r.tipo === "receita_risco") map.receitaEmRisco = (d?.valor as number) ?? 0;
    if (r.tipo === "faltas_previstas") map.faltasPrevistas7dias = (d?.total as number) ?? 0;
    if (r.tipo === "potencial_crescimento") map.potencialCrescimento = (d?.valor as number) ?? 0;
  });
  return {
    receitaRecuperadaIA: (map.receitaRecuperadaIA as number) ?? 0,
    receitaEmRisco: (map.receitaEmRisco as number) ?? 0,
    faltasPrevistas7dias: (map.faltasPrevistas7dias as number) ?? 0,
    potencialCrescimento: (map.potencialCrescimento as number) ?? 0,
    oportunidadeUrgente: (map.mensagem as string) ?? "Ajuste horários e confirmações para aumentar a receita.",
  };
}

export async function fetchInsightsInteligencia(): Promise<{ tipo: string; titulo: string; descricao: string | null; dados: unknown }[]> {
  const empresaId = await getEmpresaId();
  let q = supabase.from("inteligencia_insights").select("tipo, titulo, descricao, dados").order("created_at", { ascending: false }).limit(20);
  if (empresaId) q = q.or(`empresa_id.eq.${empresaId},empresa_id.is.null`);
  const { data } = await q;
  return (data ?? []).map((r: { tipo: string; titulo: string; descricao: string | null; dados: unknown }) => ({ ...r }));
}

// ========== ANALYTICS ==========
export interface VisaoExecutivaData {
  receitaHoje: number;
  receitaMes: number;
  receitaAcumulado: number;
  taxaOcupacao: number;
  taxaNoShow: number;
  ticketMedio: number;
  ltvMedio: number;
  margemEstimada: number;
  crescimentoVsAnterior: number;
}

export async function fetchVisaoExecutiva(): Promise<VisaoExecutivaData> {
  const now = new Date();
  const hojeInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T00:00:00`;
  const hojeFim = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T23:59:59`;
  const { data: hojeAg } = await supabase.from("agendamentos").select("valor").gte("inicio", hojeInicio).lte("inicio", hojeFim).in("status", ["confirmado", "em_atendimento", "concluido", "pendente", "aguardando_pagamento"]);
  const receitaHoje = (hojeAg ?? []).reduce((s, a: { valor?: number }) => s + Number(a.valor ?? 0), 0);
  const { data: resumo } = await supabase.from("v_resumo_financeiro_mes").select("*").limit(1);
  const r = (resumo ?? [])[0] as { receita_confirmada?: number; receita_prevista?: number; total_confirmados?: number; total_cancelados?: number; receita_perdida_noshow?: number } | undefined;
  const receitaMes = Number(r?.receita_confirmada) ?? 0;
  const receitaPrevista = Number(r?.receita_prevista) ?? 0;
  const totalConfirmados = Number(r?.total_confirmados) ?? 0;
  const totalCancelados = Number(r?.total_cancelados) ?? 0;
  const totalNoShow = 0;
  const { data: agsMes } = await supabase.from("agendamentos").select("status").gte("inicio", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`).lt("inicio", hojeInicio);
  const noshowMes = (agsMes ?? []).filter((a: { status?: string }) => a.status === "no_show").length;
  const totalAgMes = (agsMes ?? []).filter((a: { status?: string }) => ["confirmado", "em_atendimento", "concluido", "no_show"].includes(a.status ?? "")).length;
  const taxaNoShow = totalAgMes > 0 ? Math.round((noshowMes / totalAgMes) * 100) : 0;
  const { data: ocup } = await supabase.from("v_ocupacao_profissional_dia").select("minutos_ocupados").gte("dia", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
  const totalMinutos = (ocup ?? []).reduce((s: number, o: { minutos_ocupados?: number }) => s + (o.minutos_ocupados ?? 0), 0);
  const { count: profCount } = await supabase.from("profissionais").select("id", { count: "exact", head: true }).eq("ativo", true);
  const diasUteis = Math.min(now.getDate(), 22);
  const minutosDisponiveis = (profCount ?? 0) * 8 * 60 * diasUteis;
  const taxaOcupacao = minutosDisponiveis > 0 ? Math.round((totalMinutos / minutosDisponiveis) * 100) : 0;
  const { data: clientes } = await supabase.from("clientes").select("ltv_cache").eq("ativo", true).not("ltv_cache", "is", null);
  const ltvMedio = clientes?.length ? clientes.reduce((s, c) => s + Number((c as { ltv_cache: number }).ltv_cache ?? 0), 0) / clientes.length : 0;
  const mesAnteriorInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mesAnteriorFim = new Date(now.getFullYear(), now.getMonth(), 0);
  const { data: agAnt } = await supabase.from("agendamentos").select("valor").gte("inicio", mesAnteriorInicio.toISOString().slice(0, 19)).lte("inicio", mesAnteriorFim.toISOString().slice(0, 19)).in("status", ["confirmado", "em_atendimento", "concluido"]);
  const receitaAnt = (agAnt ?? []).reduce((s: number, a: { valor?: number }) => s + Number(a.valor ?? 0), 0);
  const crescimentoVsAnterior = receitaAnt > 0 ? Math.round(((receitaMes - receitaAnt) / receitaAnt) * 100) : 0;
  return {
    receitaHoje,
    receitaMes: receitaMes + receitaPrevista,
    receitaAcumulado: receitaMes + receitaPrevista,
    taxaOcupacao: Math.min(100, taxaOcupacao),
    taxaNoShow,
    ticketMedio: totalConfirmados > 0 ? (receitaMes + receitaPrevista) / (totalConfirmados + (totalCancelados || 0) + noshowMes || 1) : 0,
    ltvMedio: Math.round(ltvMedio),
    margemEstimada: 72,
    crescimentoVsAnterior,
  };
}

export interface AnalyticsReceitaLucratividade {
  receitaBruta: number;
  receitaLiquida: number;
  servicosLucrativos: { nome: string; valor: number }[];
  evolucaoMensal: { mes: string; valor: number }[];
  heatmapHorarios: { hora: string; seg: number; ter: number; qua: number; qui: number; sex: number; sab: number }[];
}

export async function fetchAnalyticsReceitaLucratividade(): Promise<AnalyticsReceitaLucratividade> {
  const now = new Date();
  const seisMesesAtras = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const { data: ags } = await supabase.from("agendamentos").select("inicio, valor, servico_id").gte("inicio", seisMesesAtras.toISOString().slice(0, 19)).in("status", ["confirmado", "em_atendimento", "concluido"]);
  const receitaBruta = (ags ?? []).reduce((s, a: { valor?: number }) => s + Number(a.valor ?? 0), 0);
  const servicoIds = [...new Set((ags ?? []).map((a: { servico_id?: string }) => a.servico_id).filter(Boolean))] as string[];
  const mapaServico: Record<string, string> = {};
  if (servicoIds.length > 0) {
    const { data: servs } = await supabase.from("servicos").select("id, nome").in("id", servicoIds);
    (servs ?? []).forEach((s: { id: string; nome: string }) => { mapaServico[s.id] = s.nome; });
  }
  const receitaPorServico = new Map<string, number>();
  (ags ?? []).forEach((a: { servico_id?: string; valor?: number }) => {
    const nome = mapaServico[a.servico_id ?? ""] ?? "Sem serviço";
    receitaPorServico.set(nome, (receitaPorServico.get(nome) ?? 0) + Number(a.valor ?? 0));
  });
  const servicosLucrativos = Array.from(receitaPorServico.entries()).map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor).slice(0, 8);
  const evolucaoPorMes = new Map<string, number>();
  const mesesNom = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  (ags ?? []).forEach((a: { inicio: string; valor?: number }) => {
    const d = new Date(a.inicio);
    const key = `${mesesNom[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    evolucaoPorMes.set(key, (evolucaoPorMes.get(key) ?? 0) + Number(a.valor ?? 0));
  });
  const evolucaoMensal = Array.from(evolucaoPorMes.entries()).map(([mes, valor]) => ({ mes, valor })).sort((a, b) => {
    const [ma, aa] = a.mes.split("/");
    const [mb, ab] = b.mes.split("/");
    const ia = mesesNom.indexOf(ma) + 100 * parseInt(aa ?? "0", 10);
    const ib = mesesNom.indexOf(mb) + 100 * parseInt(ab ?? "0", 10);
    return ia - ib;
  }).slice(-6);
  const heatmapMap = new Map<string, number>();
  (ags ?? []).forEach((a: { inicio: string; valor?: number }) => {
    const d = new Date(a.inicio);
    const dow = d.getDay();
    if (dow === 0) return;
    const hora = d.getHours();
    const key = `${hora}h-${dow}`;
    heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + Number(a.valor ?? 0));
  });
  const maxVal = Math.max(...heatmapMap.values(), 1);
  const scale = (v: number) => Math.max(0, Math.min(5, Math.round((v / maxVal) * 5)));
  const horas = [9, 10, 11, 14, 15, 16, 18];
  const dowMap: Record<number, "seg" | "ter" | "qua" | "qui" | "sex" | "sab"> = { 1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab" };
  const heatmapHorarios = horas.map((h) => {
    const row: { hora: string; seg: number; ter: number; qua: number; qui: number; sex: number; sab: number } = { hora: `${h}h`, seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0 };
    [1, 2, 3, 4, 5, 6].forEach((d) => {
      const v = heatmapMap.get(`${h}h-${d}`) ?? 0;
      row[dowMap[d] ?? "seg"] = scale(v);
    });
    return row;
  });
  return { receitaBruta, receitaLiquida: Math.round(receitaBruta * 0.85), servicosLucrativos, evolucaoMensal, heatmapHorarios };
}

export interface AnalyticsReceitaDiaria30 {
  dia: string;
  valor: number;
}

export interface AnalyticsOcupacaoPorDiaSemana {
  dia: string;
  ocupacao: number;
}

export interface AnalyticsCancelamentosPorHorario {
  horario: string;
  qtd: number;
}

export interface AnalyticsProjecoes {
  receitaProjetadaMes: number;
  previsaoOcupacao: number;
  previsaoNoShow: number;
  crescimentoEstimado: number;
}

export async function fetchReceitaDiaria30(): Promise<AnalyticsReceitaDiaria30[]> {
  const now = new Date();
  const trintaAtras = new Date(now);
  trintaAtras.setDate(trintaAtras.getDate() - 30);
  const { data } = await supabase.from("agendamentos").select("inicio, valor").gte("inicio", trintaAtras.toISOString().slice(0, 19)).in("status", ["confirmado", "em_atendimento", "concluido"]);
  const porDia: { dia: string; valor: number; ts: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(trintaAtras);
    d.setDate(d.getDate() + i);
    const k = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    porDia.push({ dia: k, valor: 0, ts: d.getTime() });
  }
  (data ?? []).forEach((a: { inicio: string; valor?: number }) => {
    const d = new Date(a.inicio);
    const k = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    const found = porDia.find((x) => x.dia === k);
    if (found) found.valor += Number(a.valor ?? 0);
  });
  return porDia.map(({ dia, valor }) => ({ dia, valor }));
}

export type OcupacaoPorDiaSemanaResult = {
  dados: AnalyticsOcupacaoPorDiaSemana[];
  periodo: { de: string; ate: string };
};

export async function fetchOcupacaoPorDiaSemana(): Promise<OcupacaoPorDiaSemanaResult> {
  const now = new Date();
  const mesInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const mesFim = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const mesFimStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(mesFim.getDate()).padStart(2, "0")}`;
  const { data: ocup } = await supabase
    .from("v_ocupacao_profissional_dia")
    .select("dia, minutos_ocupados")
    .gte("dia", mesInicio)
    .lte("dia", mesFimStr);
  const { count: profCount } = await supabase.from("profissionais").select("id", { count: "exact", head: true }).eq("ativo", true);
  const diasUteisPorDow: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let diaAtual = new Date(mesInicio);
  while (diaAtual <= mesFim) {
    diasUteisPorDow[diaAtual.getDay()]++;
    diaAtual.setDate(diaAtual.getDate() + 1);
  }
  const minutosPorDow = new Map<number, number>();
  (ocup ?? []).forEach((o: { dia: string; minutos_ocupados?: number }) => {
    if (!o.dia) return;
    const d = new Date(o.dia);
    if (Number.isNaN(d.getTime())) return;
    const dow = d.getDay();
    if (dow === 0) return;
    minutosPorDow.set(dow, (minutosPorDow.get(dow) ?? 0) + (o.minutos_ocupados ?? 0));
  });
  const dowLabels: Record<number, string> = { 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };
  const dados: AnalyticsOcupacaoPorDiaSemana[] = [1, 2, 3, 4, 5, 6].map((dow) => {
    const minutos = minutosPorDow.get(dow) ?? 0;
    const diasUteis = diasUteisPorDow[dow] ?? 1;
    const disponivel = (profCount ?? 0) * 8 * 60 * diasUteis;
    const ocupacao = disponivel > 0 ? Math.round((minutos / disponivel) * 100) : 0;
    return { dia: dowLabels[dow], ocupacao: Math.min(100, ocupacao) };
  });
  return { dados, periodo: { de: mesInicio, ate: mesFimStr } };
}

export async function fetchCancelamentosPorHorario(): Promise<AnalyticsCancelamentosPorHorario[]> {
  const now = new Date();
  const tresMesesAtras = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const { data } = await supabase.from("agendamentos").select("inicio").eq("status", "cancelado").gte("inicio", tresMesesAtras.toISOString().slice(0, 19));
  const porHora = new Map<string, number>();
  const faixas = ["09h-10h", "10h-11h", "11h-12h", "12h-13h", "14h-15h", "15h-16h", "16h-17h", "17h-18h", "18h-19h"];
  faixas.forEach((f) => porHora.set(f, 0));
  (data ?? []).forEach((a: { inicio: string }) => {
    const h = new Date(a.inicio).getHours();
    let faixa = "outros";
    if (h >= 9 && h < 10) faixa = "09h-10h";
    else if (h >= 10 && h < 11) faixa = "10h-11h";
    else if (h >= 11 && h < 12) faixa = "11h-12h";
    else if (h >= 12 && h < 13) faixa = "12h-13h";
    else if (h >= 14 && h < 15) faixa = "14h-15h";
    else if (h >= 15 && h < 16) faixa = "15h-16h";
    else if (h >= 16 && h < 17) faixa = "16h-17h";
    else if (h >= 17 && h < 18) faixa = "17h-18h";
    else if (h >= 18 && h < 19) faixa = "18h-19h";
    if (porHora.has(faixa)) porHora.set(faixa, (porHora.get(faixa) ?? 0) + 1);
  });
  return Array.from(porHora.entries()).map(([horario, qtd]) => ({ horario, qtd })).filter((x) => x.qtd > 0).sort((a, b) => b.qtd - a.qtd);
}

export async function fetchProjecoes(): Promise<AnalyticsProjecoes> {
  const now = new Date();
  const { data: resumo } = await supabase.from("v_resumo_financeiro_mes").select("receita_confirmada, receita_prevista").limit(1);
  const r = (resumo ?? [])[0] as { receita_confirmada?: number; receita_prevista?: number } | undefined;
  const receitaAtual = Number(r?.receita_confirmada ?? 0) + Number(r?.receita_prevista ?? 0);
  const mesAntInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mesAntFim = new Date(now.getFullYear(), now.getMonth(), 0);
  const { data: agAnt } = await supabase.from("agendamentos").select("valor").gte("inicio", mesAntInicio.toISOString().slice(0, 19)).lte("inicio", mesAntFim.toISOString().slice(0, 19)).in("status", ["confirmado", "em_atendimento", "concluido"]);
  const receitaAnt = (agAnt ?? []).reduce((s: number, a: { valor?: number }) => s + Number(a.valor ?? 0), 0);
  const crescimentoEstimado = receitaAnt > 0 ? Math.round(((receitaAtual - receitaAnt) / receitaAnt) * 100) : 0;
  const { data: ocup } = await supabase.from("v_ocupacao_profissional_dia").select("minutos_ocupados").gte("dia", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`);
  const totalMin = (ocup ?? []).reduce((s: number, o: { minutos_ocupados?: number }) => s + (o.minutos_ocupados ?? 0), 0);
  const { count: profCount } = await supabase.from("profissionais").select("id", { count: "exact", head: true }).eq("ativo", true);
  const previsaoOcupacao = (profCount ?? 0) > 0 ? Math.min(100, Math.round((totalMin / ((profCount ?? 0) * 8 * 60 * 22)) * 100)) : 0;
  const { data: agsTotal } = await supabase.from("agendamentos").select("status").gte("inicio", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`).in("status", ["confirmado", "em_atendimento", "concluido", "no_show"]);
  const totalAg = (agsTotal ?? []).length;
  const noShow = (agsTotal ?? []).filter((a: { status?: string }) => a.status === "no_show").length;
  const previsaoNoShow = totalAg > 0 ? Math.round((noShow / totalAg) * 100) : 0;
  return {
    receitaProjetadaMes: Math.round(receitaAtual * (1 + crescimentoEstimado / 100)),
    previsaoOcupacao,
    previsaoNoShow,
    crescimentoEstimado,
  };
}

export async function fetchClientesMetricas(): Promise<{ novos: number; recorrentes: number; taxaRetencao: number; churn: number; ltv: number; frequenciaMedia: number; tempoMedioEntreVisitas: number }> {
  const { count: total } = await supabase.from("clientes").select("id", { count: "exact", head: true }).eq("ativo", true);
  const { count: emRisco } = await supabase.from("clientes").select("id", { count: "exact", head: true }).eq("ativo", true).gte("risco_abandono", 40);
  const now = new Date();
  const inicioMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00`;
  const { count: novos } = await supabase.from("clientes").select("id", { count: "exact", head: true }).gte("created_at", inicioMes);
  const totalAtivos = total ?? 0;
  const retencao = totalAtivos > 0 ? Math.round(((totalAtivos - (emRisco ?? 0)) / totalAtivos) * 100) : 0;
  return {
    novos: novos ?? 0,
    recorrentes: totalAtivos,
    taxaRetencao: retencao,
    churn: 100 - retencao,
    ltv: 0,
    frequenciaMedia: 0,
    tempoMedioEntreVisitas: 0,
  };
}

export async function fetchRankingProfissionais(): Promise<{ nome: string; ocupacao: number; noshow: number; receita: number }[]> {
  const profs = await fetchProfissionaisComMetricas();
  return profs.map((p) => ({ nome: p.nome, ocupacao: p.taxaOcupacao, noshow: p.taxaNoShow, receita: p.receitaMes })).sort((a, b) => b.receita - a.receita);
}

export async function fetchRiscoPerdas(): Promise<{ receitaPerdidaNoShow: number; receitaPerdidaCancelamento: number; horasOciosas: number; impactoFinanceiroMensal: number }> {
  const now = new Date();
  const mesInicio = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const { data: resumo } = await supabase.from("v_resumo_financeiro_mes").select("receita_perdida_noshow").limit(1);
  const noshow = Number((resumo ?? [])[0]?.receita_perdida_noshow) ?? 0;
  const { data: cancelAg } = await supabase.from("agendamentos").select("valor").eq("status", "cancelado").gte("inicio", mesInicio);
  const receitaCancelamento = (cancelAg ?? []).reduce((s: number, a: { valor?: number }) => s + Number(a.valor ?? 0), 0);
  const { data: ocup } = await supabase.from("v_ocupacao_profissional_dia").select("minutos_ocupados").gte("dia", mesInicio);
  const totalMin = (ocup ?? []).reduce((s: number, o: { minutos_ocupados?: number }) => s + (o.minutos_ocupados ?? 0), 0);
  const { count: profCount } = await supabase.from("profissionais").select("id", { count: "exact", head: true }).eq("ativo", true);
  const diasUteis = Math.min(now.getDate(), 22);
  const minutosDisponiveis = (profCount ?? 0) * 8 * 60 * diasUteis;
  const horasOciosas = Math.max(0, Math.round((minutosDisponiveis - totalMin) / 60));
  return {
    receitaPerdidaNoShow: noshow,
    receitaPerdidaCancelamento: receitaCancelamento,
    horasOciosas,
    impactoFinanceiroMensal: noshow + receitaCancelamento,
  };
}

// ========== CONFIGURAÇÕES ==========
async function getEmpresaId(): Promise<string | null> {
  const { data } = await supabase.from("config_empresa").select("id").limit(1);
  return (data ?? [])[0]?.id ?? null;
}

export interface PerfilEmpresaData {
  id?: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  fusoHorario: string;
  idioma: string;
}

export async function fetchPerfilEmpresa(): Promise<PerfilEmpresaData | null> {
  const { data } = await supabase.from("config_empresa").select("*").limit(1);
  const r = (data ?? [])[0] as { id?: string; nome?: string; cnpj?: string; email?: string; telefone?: string; endereco?: Record<string, unknown> | string; timezone?: string } | undefined;
  if (!r) return null;
  const end = typeof r.endereco === "string" ? r.endereco : (r.endereco && typeof r.endereco === "object" && "linha1" in r.endereco) ? String((r.endereco as { linha1?: string }).linha1 ?? "") : "";
  return {
    id: r.id,
    nomeFantasia: r.nome ?? "",
    razaoSocial: r.nome ?? "",
    cnpj: r.cnpj ?? "",
    endereco: end || "",
    telefone: r.telefone ?? "",
    email: r.email ?? "",
    fusoHorario: r.timezone ?? "America/Sao_Paulo",
    idioma: "pt-BR",
  };
}

export async function updatePerfilEmpresa(id: string, data: Partial<PerfilEmpresaData>): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = {};
  if (data.nomeFantasia !== undefined) payload.nome = data.nomeFantasia;
  if (data.cnpj !== undefined) payload.cnpj = data.cnpj;
  if (data.email !== undefined) payload.email = data.email;
  if (data.telefone !== undefined) payload.telefone = data.telefone;
  if (data.endereco !== undefined) payload.endereco = { linha1: data.endereco };
  if (data.fusoHorario !== undefined) payload.timezone = data.fusoHorario;
  const { error } = await supabase.from("config_empresa").update(payload).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export interface UnidadeConfig {
  id: string;
  nome: string;
  endereco: string;
  ativa: boolean;
  metaMensal: number;
  responsavelId?: string | null;
  responsavelNome?: string | null;
}

type UnidadeRow = { id: string; nome: string; endereco?: string | null; ativa?: boolean; meta_mensal?: number | null; responsavel_id?: string | null };

export async function fetchUnidadesConfig(): Promise<UnidadeConfig[]> {
  const empresaId = await getEmpresaId();
  const cols = "id, nome, endereco, ativa, meta_mensal";
  const q = supabase.from("unidades").select(cols + ", responsavel_id").order("ordem").order("nome");
  const { data: unids, error } = empresaId ? await q.eq("empresa_id", empresaId) : await q;
  let lista: UnidadeRow[] = (unids ?? []) as unknown as UnidadeRow[];
  let hasResponsavel = !error;
  if (error) {
    const { data: fallback } = empresaId
      ? await supabase.from("unidades").select(cols).eq("empresa_id", empresaId).order("ordem").order("nome")
      : await supabase.from("unidades").select(cols).order("ordem").order("nome");
    lista = (fallback ?? []) as unknown as UnidadeRow[];
    hasResponsavel = false;
  }
  const mapaUser: Record<string, string> = {};
  if (hasResponsavel && lista.length > 0) {
    const ids = [...new Set(lista.map((u: { responsavel_id?: string | null }) => u.responsavel_id).filter(Boolean))] as string[];
    if (ids.length > 0) {
      const { data: users } = await supabase.from("config_usuarios").select("id, nome").in("id", ids);
      (users ?? []).forEach((u: { id: string; nome: string }) => { mapaUser[u.id] = u.nome; });
    }
  }
  return lista.map((u: UnidadeRow) => ({
    id: u.id,
    nome: u.nome,
    endereco: u.endereco ?? "",
    ativa: u.ativa ?? true,
    metaMensal: Number(u.meta_mensal ?? 0),
    responsavelId: hasResponsavel ? (u.responsavel_id ?? null) : null,
    responsavelNome: hasResponsavel && u.responsavel_id ? mapaUser[u.responsavel_id] ?? null : null,
  }));
}

export interface UsuarioConfig {
  id: string;
  nome: string;
  email: string;
  perfilId: string | null;
  perfilNome: string | null;
  ativo: boolean;
}

export async function fetchUsuariosConfig(): Promise<UsuarioConfig[]> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return [];
  const { data } = await supabase.from("config_usuarios").select("id, nome, email, perfil_id, ativo").eq("empresa_id", empresaId).order("nome");
  const perfilIds = [...new Set((data ?? []).map((u: { perfil_id?: string | null }) => u.perfil_id).filter(Boolean))] as string[];
  const mapaPerfil: Record<string, string> = {};
  if (perfilIds.length > 0) {
    const { data: perfis } = await supabase.from("config_perfis").select("id, nome").in("id", perfilIds);
    (perfis ?? []).forEach((p: { id: string; nome: string }) => { mapaPerfil[p.id] = p.nome; });
  }
  return (data ?? []).map((u: { id: string; nome: string; email: string; perfil_id?: string | null; ativo?: boolean }) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    perfilId: u.perfil_id ?? null,
    perfilNome: u.perfil_id ? mapaPerfil[u.perfil_id] ?? null : null,
    ativo: u.ativo ?? true,
  }));
}

export async function updateUnidadeResponsavel(unidadeId: string, responsavelId: string | null): Promise<void> {
  await supabase.from("unidades").update({ responsavel_id: responsavelId }).eq("id", unidadeId);
}

export async function updateUsuarioPerfil(usuarioId: string, perfilId: string | null): Promise<void> {
  await supabase.from("config_usuarios").update({ perfil_id: perfilId }).eq("id", usuarioId);
}

export async function createUsuario(data: { nome: string; email: string; perfilId: string | null }): Promise<string | null> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return null;
  const { data: created, error } = await supabase.from("config_usuarios").insert({
    empresa_id: empresaId,
    nome: data.nome,
    email: data.email,
    perfil_id: data.perfilId,
    ativo: true,
  }).select("id").single();
  return error ? null : created?.id ?? null;
}

/** Cria login para profissional via API (Auth + config_usuarios). Requer SUPABASE_SERVICE_ROLE_KEY no servidor. */
export async function criarLoginProfissional(payload: {
  email: string;
  password: string;
  nome: string;
  perfilId: string | null;
  profissionalId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/auth/criar-usuario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      nome: payload.nome,
      perfilId: payload.perfilId,
      profissionalId: payload.profissionalId,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error ?? "Erro ao criar login" };
  return { ok: true };
}

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export interface HorarioConfig {
  dia: string;
  diaSemana: number;
  abre: string;
  fecha: string;
  fechado: boolean;
}

export async function fetchHorariosConfig(): Promise<HorarioConfig[]> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return DIAS_SEMANA.map((dia, i) => ({ dia, diaSemana: i, abre: "", fecha: "", fechado: i === 0 }));
  const { data } = await supabase.from("config_horarios").select("dia_semana, abre, fecha, fechado").eq("empresa_id", empresaId).order("dia_semana");
  const mapa = new Map<number, { abre: string; fecha: string; fechado: boolean }>();
  (data ?? []).forEach((h: { dia_semana: number; abre?: string | null; fecha?: string | null; fechado?: boolean }) => {
    mapa.set(h.dia_semana, {
      abre: h.abre ? String(h.abre).slice(0, 5) : "",
      fecha: h.fecha ? String(h.fecha).slice(0, 5) : "",
      fechado: h.fechado ?? false,
    });
  });
  return DIAS_SEMANA.map((dia, i) => {
    const cfg = mapa.get(i) ?? { abre: i === 0 ? "" : "09:00", fecha: i === 0 ? "" : i === 6 ? "13:00" : "18:00", fechado: i === 0 };
    return { dia, diaSemana: i, ...cfg };
  });
}

export interface PagamentosConfigData {
  cartao: boolean;
  pix: boolean;
  dinheiro: boolean;
  linkPagamento: boolean;
  cobrancaAutomaticaSinal: boolean;
  multaCancelamento: number;
  reembolsoAutomatico: boolean;
  parcelamentoMax: number;
}

export async function fetchPagamentosConfig(): Promise<PagamentosConfigData | null> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return null;
  const { data } = await supabase.from("config_pagamentos").select("*").eq("empresa_id", empresaId).limit(1);
  const r = (data ?? [])[0] as { aceita_cartao?: boolean; aceita_pix?: boolean; aceita_dinheiro?: boolean; link_pagamento?: boolean; cobranca_automatica_sinal?: boolean; multa_cancelamento_percent?: number; reembolso_automatico?: boolean; parcelamento_max?: number } | undefined;
  if (!r) return null;
  return {
    cartao: r.aceita_cartao ?? true,
    pix: r.aceita_pix ?? true,
    dinheiro: r.aceita_dinheiro ?? true,
    linkPagamento: r.link_pagamento ?? false,
    cobrancaAutomaticaSinal: r.cobranca_automatica_sinal ?? false,
    multaCancelamento: Number(r.multa_cancelamento_percent ?? 0),
    reembolsoAutomatico: r.reembolso_automatico ?? false,
    parcelamentoMax: Number(r.parcelamento_max ?? 1),
  };
}

export interface CanalNotificacao {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface TemplateNotificacao {
  tipo: string;
  variaveis: string;
}

const CANAIS_PADRAO: CanalNotificacao[] = [
  { id: "whatsapp", nome: "WhatsApp", ativo: true },
  { id: "email", nome: "Email", ativo: true },
  { id: "sms", nome: "SMS", ativo: false },
  { id: "push", nome: "Push", ativo: false },
];

export async function fetchNotificacoesConfig(): Promise<{ canais: CanalNotificacao[]; templates: TemplateNotificacao[] }> {
  const empresaId = await getEmpresaId();
  const canais = new Map<string, boolean>();
  CANAIS_PADRAO.forEach((c) => canais.set(c.id, c.ativo));
  if (empresaId) {
    const { data: canalData } = await supabase.from("config_notificacoes_canal").select("canal, ativo").eq("empresa_id", empresaId);
    (canalData ?? []).forEach((c: { canal: string; ativo?: boolean }) => canais.set(c.canal, c.ativo ?? false));
  }
  const templates: TemplateNotificacao[] = [];
  if (empresaId) {
    const { data: tmplData } = await supabase.from("config_notificacoes_templates").select("tipo, variaveis").eq("empresa_id", empresaId);
    (tmplData ?? []).forEach((t: { tipo: string; variaveis?: string[] }) => templates.push({ tipo: t.tipo, variaveis: Array.isArray(t.variaveis) ? t.variaveis.join(", ") : "" }));
  }
  if (templates.length === 0) {
    templates.push({ tipo: "Confirmação", variaveis: "{{nome_cliente}}, {{data}}, {{profissional}}" });
    templates.push({ tipo: "Lembrete", variaveis: "{{nome_cliente}}, {{data}}, {{horario}}" });
    templates.push({ tipo: "Cancelamento", variaveis: "{{nome_cliente}}, {{data}}" });
    templates.push({ tipo: "Pós-atendimento", variaveis: "{{nome_cliente}}, {{servico}}" });
  }
  return {
    canais: CANAIS_PADRAO.map((c) => ({ ...c, ativo: canais.get(c.id) ?? c.ativo })),
    templates,
  };
}

export interface PerfilPermissao {
  id: string;
  nome: string;
  verFinanceiro: boolean;
  editarPreco: boolean;
  cancelar: boolean;
  darDesconto: boolean;
}

export async function fetchPerfisPermissao(): Promise<PerfilPermissao[]> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return [];
  const { data } = await supabase.from("config_perfis").select("id, nome, ver_financeiro, editar_preco, cancelar_agendamento, dar_desconto").eq("empresa_id", empresaId);
  return (data ?? []).map((p: { id: string; nome: string; ver_financeiro?: boolean; editar_preco?: boolean; cancelar_agendamento?: boolean; dar_desconto?: boolean }) => ({
    id: p.id,
    nome: p.nome,
    verFinanceiro: p.ver_financeiro ?? false,
    editarPreco: p.editar_preco ?? false,
    cancelar: p.cancelar_agendamento ?? false,
    darDesconto: p.dar_desconto ?? false,
  }));
}

export interface IntegracaoConfig {
  id: string;
  nome: string;
  ativo: boolean;
}

const INTEGRACOES_PADRAO = [
  { id: "api", nome: "API pública", ativo: false },
  { id: "webhooks", nome: "Webhooks", ativo: false },
  { id: "google", nome: "Google Calendar", ativo: false },
  { id: "meta", nome: "Meta Ads", ativo: false },
];

const TIPO_TO_ID: Record<string, string> = { api: "api", webhook: "webhooks", webhooks: "webhooks", google_calendar: "google", meta_ads: "meta" };

export async function fetchIntegracoesConfig(): Promise<IntegracaoConfig[]> {
  const empresaId = await getEmpresaId();
  const mapa = new Map<string, { nome: string; ativo: boolean }>();
  INTEGRACOES_PADRAO.forEach((i) => mapa.set(i.id, { nome: i.nome, ativo: i.ativo }));
  if (empresaId) {
    const { data } = await supabase.from("config_integracoes").select("tipo, nome, ativo").eq("empresa_id", empresaId);
    (data ?? []).forEach((i: { tipo: string; nome: string; ativo?: boolean }) => {
      const id = TIPO_TO_ID[i.tipo] ?? i.tipo;
      mapa.set(id, { nome: i.nome, ativo: i.ativo ?? false });
    });
  }
  return INTEGRACOES_PADRAO.map((i) => ({ ...i, ...mapa.get(i.id) }));
}

export interface PoliticasConfigData {
  antecedenciaMinimaHoras: number;
  antecedenciaMaximaDias: number;
  limiteCancelamentoDias: number;
  penalidadeAutomatica: boolean;
  scoreMinimoSemSinal: number;
}

export async function fetchPoliticasConfig(): Promise<PoliticasConfigData | null> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return null;
  const { data } = await supabase.from("config_politicas").select("*").eq("empresa_id", empresaId).limit(1);
  const r = (data ?? [])[0] as { antecedencia_minima_horas?: number; antecedencia_maxima_dias?: number; limite_cancelamento_dias?: number; penalidade_automatica?: boolean; score_minimo_sem_sinal?: number } | undefined;
  if (!r) return null;
  return {
    antecedenciaMinimaHoras: r.antecedencia_minima_horas ?? 24,
    antecedenciaMaximaDias: r.antecedencia_maxima_dias ?? 90,
    limiteCancelamentoDias: r.limite_cancelamento_dias ?? 2,
    penalidadeAutomatica: r.penalidade_automatica ?? true,
    scoreMinimoSemSinal: r.score_minimo_sem_sinal ?? 70,
  };
}

export interface MetaMesConfigData {
  valorMeta: number;
  ano: number;
  mes: number;
  id?: string;
}

/** Receita confirmada de um mês específico (agendamentos concluídos/confirmados) */
export async function fetchReceitaMes(ano: number, mes: number): Promise<number> {
  const d = new Date(ano, mes - 1, 1);
  const inicio = d.toISOString().slice(0, 10) + "T00:00:00";
  const fim = new Date(ano, mes, 0, 23, 59, 59);
  const fimStr = fim.toISOString().slice(0, 10) + "T23:59:59";
  const { data } = await supabase
    .from("agendamentos")
    .select("valor")
    .gte("inicio", inicio)
    .lte("inicio", fimStr)
    .in("status", ["confirmado", "em_atendimento", "concluido"]);
  return (data ?? []).reduce((s, r) => s + Number((r as { valor: number }).valor || 0), 0);
}

export async function fetchMetaMesConfig(ano?: number, mes?: number): Promise<MetaMesConfigData | null> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return null;
  const now = new Date();
  const a = ano ?? now.getFullYear();
  const m = mes ?? now.getMonth() + 1;

  const { data } = await supabase
    .from("financeiro_meta")
    .select("id, valor_meta, ano, mes")
    .eq("empresa_id", empresaId)
    .is("unidade_id", null)
    .eq("ano", a)
    .eq("mes", m)
    .limit(1)
    .maybeSingle();

  const r = data as { id?: string; valor_meta?: number; ano?: number; mes?: number } | null;
  if (!r) return { valorMeta: 0, ano: a, mes: m };
  return {
    id: r.id,
    valorMeta: Number(r.valor_meta) ?? 0,
    ano: r.ano ?? a,
    mes: r.mes ?? m,
  };
}

export async function upsertMetaMes(valorMeta: number, ano?: number, mes?: number): Promise<{ ok: boolean; error?: string }> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return { ok: false, error: "Nenhuma empresa configurada" };
  const now = new Date();
  const a = ano ?? now.getFullYear();
  const m = mes ?? now.getMonth() + 1;

  const { data: existente } = await supabase
    .from("financeiro_meta")
    .select("id")
    .eq("empresa_id", empresaId)
    .is("unidade_id", null)
    .eq("ano", a)
    .eq("mes", m)
    .maybeSingle();

  const row = { empresa_id: empresaId, unidade_id: null, ano: a, mes: m, valor_meta: valorMeta };

  if (existente?.id) {
    const { error } = await supabase.from("financeiro_meta").update(row).eq("id", existente.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  }
  const { error } = await supabase.from("financeiro_meta").insert(row);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export interface PlanoAssinaturaData {
  nome: string;
  recursos: string[];
  limites: { agendamentos: number; clientes: number };
  upgradeDisponivel: boolean;
}

export async function fetchPlanoAssinatura(): Promise<PlanoAssinaturaData | null> {
  const empresaId = await getEmpresaId();
  if (!empresaId) return null;
  const { data: assinatura } = await supabase.from("config_assinatura").select("plano_id").eq("empresa_id", empresaId).eq("ativa", true).limit(1);
  const planoId = (assinatura ?? [])[0]?.plano_id;
  if (!planoId) {
    const { data: planoDefault } = await supabase.from("config_planos").select("*").limit(1);
    const p = (planoDefault ?? [])[0] as { nome?: string; recursos?: string[]; limite_agendamentos_mes?: number; limite_clientes?: number } | undefined;
    return p ? { nome: p.nome ?? "Profissional", recursos: p.recursos ?? [], limites: { agendamentos: p.limite_agendamentos_mes ?? 500, clientes: p.limite_clientes ?? 1000 }, upgradeDisponivel: true } : null;
  }
  const { data: plano } = await supabase.from("config_planos").select("*").eq("id", planoId).limit(1);
  const p = (plano ?? [])[0] as { nome?: string; recursos?: string[]; limite_agendamentos_mes?: number; limite_clientes?: number } | undefined;
  if (!p) return null;
  return {
    nome: p.nome ?? "Profissional",
    recursos: p.recursos ?? [],
    limites: { agendamentos: p.limite_agendamentos_mes ?? 500, clientes: p.limite_clientes ?? 1000 },
    upgradeDisponivel: true,
  };
}
