"use client";

import { useState, useMemo, useCallback } from "react";
import { AgendaTopBar, type ViewMode } from "@/components/agenda/AgendaTopBar";
import { CalendarioDia } from "@/components/agenda/CalendarioDia";
import { CalendarioLista } from "@/components/agenda/CalendarioLista";
import { CalendarioMes } from "@/components/agenda/CalendarioMes";
import { AgendaSidePanel, type PanelState } from "@/components/agenda/AgendaSidePanel";
import { ModoOtimizacaoBanner } from "@/components/agenda/ModoOtimizacaoBanner";
// import { ListaEsperaAgenda } from "@/components/agenda/ListaEsperaAgenda";
import { useAgendaDia } from "@/hooks/useAgendaDia";
import {
  createAgendamento,
  updateAgendamento,
  cancelarAgendamento,
  fetchPerfilCliente,
  marcarListaEsperaAtendida,
} from "@/lib/dados-supabase";
import type { Agendamento } from "@/lib/mock-agenda";
import { HORARIO_INICIO, HORARIO_FIM } from "@/lib/mock-agenda";
import type { HorarioClinciaDia } from "@/lib/dados-supabase";

function parseTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h + (m ?? 0) / 60;
}

/** Dado uma data e os horários da clínica, retorna o range de exibição da agenda */
function getHorarioRangeParaData(date: Date, horarios: HorarioClinciaDia[]): { inicio: number; fim: number; fechado: boolean } {
  const dow = date.getDay();
  const cfg = horarios.find((h) => h.diaSemana === dow) ?? horarios[dow];
  if (!cfg || cfg.fechado || !cfg.abre || !cfg.fecha) {
    return { inicio: HORARIO_INICIO, fim: HORARIO_INICIO, fechado: true };
  }
  return {
    inicio: parseTime(cfg.abre),
    fim: parseTime(cfg.fecha),
    fechado: false,
  };
}

export default function AgendaPage() {
  const [date, setDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("dia");
  const [profissionalId, setProfissionalId] = useState("");
  const [salaId, setSalaId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [modoOtimizacao, setModoOtimizacao] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>({ type: "idle" });

  const {
    agendamentos: agendamentosDia,
    profissionais: PROFISSIONAIS,
    salas: SALAS,
    servicos: SERVICOS,
    listaEspera,
    clientes,
    horariosClincia,
    loading,
    error,
    refetch,
  } = useAgendaDia(date);

  const horarioRange = useMemo(
    () => getHorarioRangeParaData(date, horariosClincia),
    [date.getTime(), horariosClincia]
  );

  const agendamentosFiltrados = useMemo(() => {
    let list = [...agendamentosDia];
    if (profissionalId) list = list.filter((a) => a.profissionalId === profissionalId);
    if (salaId) list = list.filter((a) => a.salaId === salaId);
    if (servicoId) list = list.filter((a) => a.servico === SERVICOS.find((s) => s.id === servicoId)?.nome);
    return list;
  }, [agendamentosDia, profissionalId, salaId, servicoId, SERVICOS]);

  const indicadores = useMemo(() => {
    const stepMin = 30;
    const ativos =
      profissionalId && PROFISSIONAIS.length
        ? PROFISSIONAIS.filter((p) => p.id === profissionalId)
        : PROFISSIONAIS;
    const [hi, hf] = horarioRange.fechado ? [HORARIO_INICIO, HORARIO_INICIO] : [horarioRange.inicio, horarioRange.fim];
    const totalMinutosDisponiveis = ativos.length * (hf - hi) * 60;

    let minutosOcupados = 0;
    let receitaPrevista = 0;
    let riscoNoShow = 0;
    for (const a of agendamentosDia) {
      if (!ativos.some((p) => p.id === a.profissionalId)) continue;
      const start = parseTime(a.inicio);
      const end = parseTime(a.fim);
      minutosOcupados += (end - start) * 60;
      receitaPrevista += a.valor;
      if (a.riscoNivel === "alto") riscoNoShow++;
    }

    const ocupacaoPercent =
      totalMinutosDisponiveis > 0
        ? Math.round((minutosOcupados / totalMinutosDisponiveis) * 100)
        : 0;

    // Horários livres críticos: TODOS os slots de 30min livres no dia selecionado
    let horariosLivresCriticos = 0;
    if (ativos.length > 0 && !horarioRange.fechado) {
      for (const prof of ativos) {
        for (let t = hi; t < hf; t += stepMin / 60) {
          const slotStart = t;
          const slotEnd = t + stepMin / 60;
          const ocupado = agendamentosDia.some((a) => {
            if (a.profissionalId !== prof.id) return false;
            const aStart = parseTime(a.inicio);
            const aEnd = parseTime(a.fim);
            return aStart < slotEnd && aEnd > slotStart;
          });
          if (!ocupado) horariosLivresCriticos++;
        }
      }
    }

    return {
      ocupacaoPercent,
      receitaPrevistaDia: receitaPrevista,
      horariosLivresCriticos,
      riscoNoShowHoje: riscoNoShow,
    };
  }, [agendamentosDia, PROFISSIONAIS, profissionalId, horarioRange]);

  const handleSlotVazioClick = useCallback((horario: string, profId: string, profissionalNome: string) => {
    setPanelState({ type: "slot_vazio", horario, profissionalId: profId, profissionalNome });
  }, []);

  const handleAgendamentoClick = useCallback((ag: Agendamento) => {
    setPanelState({ type: "agendamento", agendamento: ag });
  }, []);

  const handleNovoAgendamento = useCallback(() => {
    setPanelState({ type: "novo" });
  }, []);

  const handleSalvarNovo = useCallback(async (payload: Parameters<typeof createAgendamento>[0], listaEsperaId?: string) => {
    const id = await createAgendamento(payload);
    if (listaEsperaId) await marcarListaEsperaAtendida(listaEsperaId, id);
    await refetch();
  }, [refetch]);

  const handleSalvarEditar = useCallback(async (id: string, payload: Parameters<typeof updateAgendamento>[1]) => {
    await updateAgendamento(id, payload);
    await refetch();
  }, [refetch]);

  const handleConfirmar = useCallback(async (id: string) => {
    await updateAgendamento(id, { status: "confirmado" });
    await refetch();
    setPanelState({ type: "idle" });
  }, [refetch]);

  const handleReagendar = useCallback((id: string) => {
    const ag = agendamentosDia.find((a) => a.id === id);
    if (ag) setPanelState({ type: "editar", agendamento: ag });
  }, [agendamentosDia]);

  const handleCancelar = useCallback(async (id: string) => {
    await cancelarAgendamento(id);
    await refetch();
    setPanelState({ type: "idle" });
  }, [refetch]);

  const handleCobrarSinal = useCallback(async (id: string) => {
    await updateAgendamento(id, { status: "aguardando_pagamento" });
    await refetch();
  }, [refetch]);

  const handleIniciarAtendimento = useCallback(async (id: string) => {
    await updateAgendamento(id, { status: "em_atendimento" });
    await refetch();
  }, [refetch]);

  const handleConcluir = useCallback(async (id: string) => {
    await updateAgendamento(id, { status: "concluido" });
    await refetch();
    setPanelState({ type: "idle" });
  }, [refetch]);

  const handlePreencherAutomaticamente = useCallback(() => {
    const primeiro = listaEspera[0];
    if (primeiro) setPanelState({ type: "novo", listaEsperaId: primeiro.id });
    else setPanelState({ type: "novo" });
  }, [listaEspera]);

  const sugestaoEncaixe = listaEspera[0] ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-white/80 px-4 py-2 text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando agenda…
        </div>
      )}
      <AgendaTopBar
        date={date}
        onDateChange={setDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        profissionalId={profissionalId}
        onProfissionalChange={setProfissionalId}
        salaId={salaId}
        onSalaChange={setSalaId}
        servicoId={servicoId}
        onServicoChange={setServicoId}
        onNovoAgendamento={handleNovoAgendamento}
        modoOtimizacao={modoOtimizacao}
        onModoOtimizacaoToggle={() => setModoOtimizacao((v) => !v)}
        profissionais={PROFISSIONAIS}
        salas={SALAS}
        servicos={SERVICOS}
        indicadores={indicadores}
      />

      {modoOtimizacao && (
        <div className="border-b border-slate-200 px-4 py-2">
          <ModoOtimizacaoBanner
            onReorganizar={() => {}}
            onAjustarPrecos={() => {}}
            onCriarPromocao={() => {}}
          />
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-auto p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            Agenda — {viewMode === "dia" && "Dia"}
            {viewMode === "semana" && "Semana"}
            {viewMode === "mes" && "Mês"}
            {viewMode === "lista" && "Lista"}
            {viewMode === "sala" && "Por sala"}
            {viewMode === "profissional" && "Por profissional"}
          </h2>

          {viewMode === "dia" && (
            <CalendarioDia
              agendamentos={agendamentosFiltrados}
              onSlotVazioClick={handleSlotVazioClick}
              onAgendamentoClick={handleAgendamentoClick}
              modoOtimizacao={modoOtimizacao}
              profissionalFiltroId={profissionalId}
              profissionais={PROFISSIONAIS}
              modoColuna="profissional"
              horarioInicio={horarioRange.inicio}
              horarioFim={horarioRange.fim}
              fechado={horarioRange.fechado}
            />
          )}

          {viewMode === "mes" && (
            <CalendarioMes
              date={date}
              onDateChange={setDate}
            />
          )}

          {viewMode === "semana" && (
            <CalendarioDia
              agendamentos={agendamentosFiltrados}
              onSlotVazioClick={handleSlotVazioClick}
              onAgendamentoClick={handleAgendamentoClick}
              modoOtimizacao={modoOtimizacao}
              profissionalFiltroId={profissionalId || undefined}
              profissionais={PROFISSIONAIS}
              modoColuna="profissional"
              horarioInicio={horarioRange.inicio}
              horarioFim={horarioRange.fim}
              fechado={horarioRange.fechado}
            />
          )}

          {viewMode === "profissional" && (
            <CalendarioDia
              agendamentos={agendamentosFiltrados}
              onSlotVazioClick={handleSlotVazioClick}
              onAgendamentoClick={handleAgendamentoClick}
              modoOtimizacao={modoOtimizacao}
              profissionalFiltroId={profissionalId || undefined}
              profissionais={PROFISSIONAIS}
              modoColuna="profissional"
              horarioInicio={horarioRange.inicio}
              horarioFim={horarioRange.fim}
              fechado={horarioRange.fechado}
            />
          )}

          {viewMode === "sala" && (
            <CalendarioDia
              agendamentos={agendamentosFiltrados}
              onSlotVazioClick={handleSlotVazioClick}
              onAgendamentoClick={handleAgendamentoClick}
              modoOtimizacao={modoOtimizacao}
              profissionais={SALAS.map((s) => ({
                id: s.id,
                nome: `${s.nome} — ${s.unidade}`,
              }))}
              modoColuna="sala"
              horarioInicio={horarioRange.inicio}
              horarioFim={horarioRange.fim}
              fechado={horarioRange.fechado}
            />
          )}

          {viewMode === "lista" && (
            <CalendarioLista
              agendamentos={agendamentosFiltrados}
              onAgendamentoClick={handleAgendamentoClick}
              modoOtimizacao={modoOtimizacao}
            />
          )}
        </div>

        <AgendaSidePanel
          state={panelState}
          date={date}
          horariosClincia={horariosClincia}
          clientes={clientes}
          servicos={SERVICOS}
          salas={SALAS}
          profissionais={PROFISSIONAIS}
          sugestaoEncaixe={sugestaoEncaixe}
          getPerfilCliente={fetchPerfilCliente}
          onClose={() => setPanelState({ type: "idle" })}
          onAtivarRecuperacao={() => {}}
          onConfirmar={handleConfirmar}
          onReagendar={handleReagendar}
          onCancelar={handleCancelar}
          onCobrarSinal={handleCobrarSinal}
          onIniciarAtendimento={handleIniciarAtendimento}
          onConcluir={handleConcluir}
          onSalvarNovo={async (payload) => {
            const listaEsperaId = panelState.type === "novo" && "listaEsperaId" in panelState ? panelState.listaEsperaId : undefined;
            await handleSalvarNovo(payload, listaEsperaId);
          }}
          onSalvarEditar={handleSalvarEditar}
        />
      </div>

      {/* Lista de espera inteligente temporariamente oculta */}
    </div>
  );
}
