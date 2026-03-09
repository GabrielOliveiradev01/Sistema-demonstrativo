"use client";

import { useState, useEffect } from "react";
import { IconX } from "@/components/SidebarIcons";
import type { Agendamento, ClienteWaitlist } from "@/lib/mock-agenda";
import type { PerfilCliente } from "@/lib/mock-clientes";
import type { Cliente } from "@/lib/mock-clientes";
import type { AgendamentoCreate } from "@/lib/dados-supabase";
import { verificarConflitoAgendamento, fetchDuracaoServico, fetchAvisoClienteMesmoDia } from "@/lib/dados-supabase";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Monta ISO local para um dia + hora "HH:MM" */
function toISOLocal(date: Date, timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const y = date.getFullYear();
  const mo = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(m ?? 0)}:00`;
}

/** Adiciona minutos a um ISO local e retorna novo ISO local (YYYY-MM-DDTHH:mm:ss) */
function addMinutes(isoLocal: string, minutes: number): string {
  const d = new Date(isoLocal);
  d.setMinutes(d.getMinutes() + minutes);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours();
  const min = d.getMinutes();
  return `${y}-${pad(m)}-${pad(day)}T${pad(h)}:${pad(min)}:00`;
}

export type PanelState =
  | { type: "idle" }
  | { type: "slot_vazio"; horario: string; profissionalId: string; profissionalNome: string }
  | { type: "novo"; listaEsperaId?: string }
  | { type: "agendamento"; agendamento: Agendamento }
  | { type: "editar"; agendamento: Agendamento };

interface AgendaSidePanelProps {
  state: PanelState;
  date: Date;
  clientes: Cliente[];
  servicos: { id: string; nome: string; duracao_minutos?: number }[];
  salas: { id: string; nome: string; unidade: string }[];
  profissionais: { id: string; nome: string }[];
  sugestaoEncaixe?: ClienteWaitlist | null;
  getPerfilCliente?: (id: string) => Promise<PerfilCliente | null>;
  onClose: () => void;
  onAtivarRecuperacao: () => void;
  onConfirmar: (id: string) => void;
  onReagendar: (id: string) => void;
  onCancelar: (id: string) => void;
  onCobrarSinal: (id: string) => void;
  onIniciarAtendimento?: (id: string) => void;
  onConcluir?: (id: string) => void;
  onSalvarNovo: (payload: AgendamentoCreate) => Promise<void>;
  onSalvarEditar: (id: string, payload: { cliente_id: string; profissional_id: string; servico_id: string | null; sala_id: string | null; inicio: string; fim: string; valor: number | null; status?: string }) => Promise<void>;
}

export function AgendaSidePanel({
  state,
  date,
  clientes,
  servicos,
  salas,
  profissionais,
  sugestaoEncaixe,
  getPerfilCliente,
  onClose,
  onAtivarRecuperacao,
  onConfirmar,
  onReagendar,
  onCancelar,
  onCobrarSinal,
  onIniciarAtendimento,
  onConcluir,
  onSalvarNovo,
  onSalvarEditar,
}: AgendaSidePanelProps) {
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [perfilLoading, setPerfilLoading] = useState(false);
  const [erroConflito, setErroConflito] = useState<string | null>(null);
  const [avisoMesmoDia, setAvisoMesmoDia] = useState<string | null>(null);

  // Form state (novo / slot_vazio / editar)
  const isForm = state.type === "slot_vazio" || state.type === "novo" || state.type === "editar";
  const editAg = state.type === "editar" ? state.agendamento : null;
  const slotHorario = state.type === "slot_vazio" ? state.horario : "";
  const slotProfId = state.type === "slot_vazio" ? state.profissionalId : "";
  const slotProfNome = state.type === "slot_vazio" ? state.profissionalNome : "";

  const [clienteId, setClienteId] = useState(editAg?.clienteId ?? sugestaoEncaixe?.clienteId ?? "");
  const [servicoId, setServicoId] = useState(editAg?.servicoId ?? sugestaoEncaixe?.servicoId ?? "");
  const [profissionalId, setProfissionalId] = useState(editAg?.profissionalId ?? slotProfId ?? "");
  const [salaId, setSalaId] = useState(editAg?.salaId ?? "");
  const [valor, setValor] = useState(editAg?.valor ?? 0);
  const [inicioTime, setInicioTime] = useState(editAg?.inicio ?? (slotHorario || "09:00"));
  const [duracao, setDuracao] = useState(60);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    setErroConflito(null);
    if (state.type === "editar" && state.agendamento.inicio) {
      setClienteId(state.agendamento.clienteId ?? "");
      setServicoId(state.agendamento.servicoId ?? "");
      setProfissionalId(state.agendamento.profissionalId);
      setSalaId(state.agendamento.salaId ?? "");
      setValor(state.agendamento.valor ?? 0);
      setInicioTime(state.agendamento.inicio);
      const ini = state.agendamento.inicioISO ? new Date(state.agendamento.inicioISO) : null;
      const fim = state.agendamento.fimISO ? new Date(state.agendamento.fimISO) : null;
      if (ini && fim) setDuracao(Math.round((fim.getTime() - ini.getTime()) / 60000));
    } else if (state.type === "novo" && sugestaoEncaixe) {
      setClienteId(sugestaoEncaixe.clienteId ?? "");
      setServicoId(sugestaoEncaixe.servicoId ?? "");
      setProfissionalId("");
      setSalaId("");
      setValor(0);
      setInicioTime("09:00");
      setDuracao(60);
      setNotas("");
    } else if (state.type === "slot_vazio") {
      setClienteId(sugestaoEncaixe?.clienteId ?? "");
      setServicoId(sugestaoEncaixe?.servicoId ?? "");
      setProfissionalId(state.profissionalId);
      setSalaId("");
      setValor(0);
      setInicioTime(state.horario);
      setDuracao(60);
      setNotas("");
    }
  }, [state.type, state.type === "editar" ? state.agendamento?.id : null, state.type === "slot_vazio" ? state.horario + state.profissionalId : null, sugestaoEncaixe]);

  // Preencher duração conforme serviço selecionado (base ou personalizada por profissional)
  // Apenas em novo agendamento ou slot vazio — em edição mantém a duração existente
  useEffect(() => {
    if (state.type === "editar") return;
    if (!servicoId) return;
    if (profissionalId) {
      fetchDuracaoServico(servicoId, profissionalId).then(setDuracao);
    } else {
      const svc = servicos.find((s) => s.id === servicoId);
      setDuracao(svc?.duracao_minutos ?? 60);
    }
  }, [state.type, servicoId, profissionalId, servicos]);

  // Aviso (não bloqueia): cliente já tem outros agendamentos neste dia
  useEffect(() => {
    if (!clienteId || !isForm) return;
    fetchAvisoClienteMesmoDia(
      clienteId,
      date,
      state.type === "editar" ? state.agendamento.id : undefined
    ).then(setAvisoMesmoDia);
  }, [clienteId, date.getTime(), isForm, state.type, state.type === "editar" ? state.agendamento?.id : null]);

  useEffect(() => {
    if (state.type === "agendamento" && state.agendamento.clienteId && getPerfilCliente) {
      setPerfilLoading(true);
      setPerfil(null);
      getPerfilCliente(state.agendamento.clienteId)
        .then(setPerfil)
        .finally(() => setPerfilLoading(false));
    } else {
      setPerfil(null);
    }
  }, [state.type, state.type === "agendamento" ? state.agendamento.clienteId : null, getPerfilCliente]);

  const handleSubmitNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !profissionalId) return;
    setErroConflito(null);
    setAvisoMesmoDia(null);
    const inicioISO = toISOLocal(date, inicioTime);
    const fimISO = addMinutes(inicioISO, duracao);
    const conflito = await verificarConflitoAgendamento({
      profissional_id: profissionalId,
      sala_id: salaId || null,
      inicio: inicioISO,
      fim: fimISO,
    });
    if (!conflito.ok) {
      setErroConflito(conflito.mensagem ?? "Já existe agendamento neste horário.");
      return;
    }
    setSaving(true);
    try {
      await onSalvarNovo({
        cliente_id: clienteId,
        profissional_id: profissionalId,
        servico_id: servicoId || null,
        sala_id: salaId || null,
        inicio: inicioISO,
        fim: fimISO,
        status: "pendente",
        valor: valor || null,
        risco_nivel: "baixo",
        notas: notas || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.type !== "editar" || !clienteId || !profissionalId) return;
    setErroConflito(null);
    setAvisoMesmoDia(null);
    const inicioISO = toISOLocal(date, inicioTime);
    const fimISO = addMinutes(inicioISO, duracao);
    const conflito = await verificarConflitoAgendamento({
      profissional_id: profissionalId,
      sala_id: salaId || null,
      inicio: inicioISO,
      fim: fimISO,
      excluir_id: state.agendamento.id,
    });
    if (!conflito.ok) {
      setErroConflito(conflito.mensagem ?? "Já existe agendamento neste horário.");
      return;
    }
    setSaving(true);
    try {
      await onSalvarEditar(state.agendamento.id, {
        cliente_id: clienteId,
        profissional_id: profissionalId,
        servico_id: servicoId || null,
        sala_id: salaId || null,
        inicio: inicioISO,
        fim: fimISO,
        valor: valor || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (state.type === "idle") {
    return null;
  }

  if (isForm) {
    const isEditar = state.type === "editar";
    const titulo = isEditar ? "Editar agendamento" : "Novo agendamento";
    const dataLabel = date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return (
      <aside className="flex w-96 shrink-0 flex-col border-l border-slate-200 bg-white p-4 overflow-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-semibold text-slate-800">{titulo}</h3>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Fechar">
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Data do agendamento: <span className="font-medium">{dataLabel}</span>
        </p>
        {state.type === "slot_vazio" && (
          <p className="mt-2 text-sm text-slate-600">
            {slotHorario} — {slotProfNome}
          </p>
        )}
        <form onSubmit={isEditar ? handleSubmitEditar : handleSubmitNovo} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">Cliente *</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            >
              <option value="">Selecione</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Profissional *</label>
            <select
              value={profissionalId}
              onChange={(e) => setProfissionalId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            >
              <option value="">Selecione</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Serviço</label>
            <select
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Selecione</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Sala</label>
            <select
              value={salaId}
              onChange={(e) => setSalaId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Nenhuma</option>
              {salas.map((s) => (
                <option key={s.id} value={s.id}>{s.nome} — {s.unidade}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600">Horário início</label>
              <input
                type="time"
                value={inicioTime}
                onChange={(e) => setInicioTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Duração (min)</label>
              <select
                value={duracao}
                onChange={(e) => setDuracao(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 h</option>
                <option value={90}>1h30</option>
                <option value={120}>2 h</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Valor (R$)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={valor || ""}
              onChange={(e) => setValor(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Notas</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Opcional"
            />
          </div>
          {erroConflito && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {erroConflito}
            </div>
          )}
          {avisoMesmoDia && !erroConflito && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <span className="font-medium">Aviso:</span> {avisoMesmoDia}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? "Salvando…" : isEditar ? "Salvar" : "Criar agendamento"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 py-2.5 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </form>
        {state.type === "slot_vazio" && sugestaoEncaixe && (
          <div className="mt-4 rounded-lg bg-primary/5 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Sugestão da lista de espera</p>
            <p className="mt-1 font-semibold text-slate-900">{sugestaoEncaixe.nome}</p>
            <p className="text-sm text-slate-600">Serviço: {sugestaoEncaixe.servicoDesejado} — {sugestaoEncaixe.probabilidadeAceite}% aceite</p>
          </div>
        )}
      </aside>
    );
  }

  if (state.type !== "agendamento") return null;
  const ag = state.agendamento;
  return (
    <aside className="flex w-96 shrink-0 flex-col border-l border-slate-200 bg-white p-4 overflow-auto">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="font-semibold text-slate-800">Agendamento</h3>
        <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Fechar">
          <IconX className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 font-medium text-slate-900">{ag.clienteNome}</p>
      <p className="text-sm text-slate-600">{ag.servico} — {ag.inicio}</p>
      <p className="font-semibold text-slate-800">{formatBRL(ag.valor)}</p>

      {ag.clienteId && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Cliente</p>
          {perfilLoading && <p className="mt-1 text-sm text-slate-500">Carregando…</p>}
          {perfil && !perfilLoading && (
            <>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-500">Score no-show:</span> <span className="font-medium">{perfil.scoreNoShow ?? "—"}%</span></div>
                <div><span className="text-slate-500">Frequência:</span> <span className="font-medium">{perfil.frequenciaMedia}/mês</span></div>
                <div><span className="text-slate-500">LTV:</span> <span className="font-medium text-primary">{formatBRL(perfil.ltv)}</span></div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
        {ag.status === "confirmado" && onIniciarAtendimento && (
          <button type="button" onClick={() => onIniciarAtendimento(ag.id)} className="rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark">
            Iniciar atendimento
          </button>
        )}
        {ag.status === "confirmado" && onConcluir && (
          <button type="button" onClick={() => onConcluir(ag.id)} className="rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">
            Concluir atendimento
          </button>
        )}
        {ag.status === "em_atendimento" && onConcluir && (
          <button type="button" onClick={() => onConcluir(ag.id)} className="rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">
            Concluir atendimento
          </button>
        )}
        {(ag.status === "pendente" || ag.status === "aguardando_pagamento" || ag.status === "risco") && (
          <>
            <button type="button" onClick={() => onConfirmar(ag.id)} className="rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">
              Confirmar
            </button>
            <button type="button" onClick={() => onCobrarSinal(ag.id)} className="rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cobrar sinal
            </button>
          </>
        )}
        {(ag.status !== "concluido") && (
          <button type="button" onClick={() => onReagendar(ag.id)} className="rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Reagendar
          </button>
        )}
        {ag.status !== "concluido" && (
          <button type="button" onClick={() => onCancelar(ag.id)} className="rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Cancelar
          </button>
        )}
        {ag.status === "concluido" && (
          <p className="rounded-lg bg-green-50 py-2 text-center text-sm font-medium text-green-800">
            Atendimento concluído
          </p>
        )}
      </div>
    </aside>
  );
}
