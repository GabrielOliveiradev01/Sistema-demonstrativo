"use client";

import { IconCalendar, IconClipboard, IconBuildingOffice2, IconUserCircle } from "@/components/SidebarIcons";
const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export type IndicadoresDia = {
  ocupacaoPercent: number;
  receitaPrevistaDia: number;
  horariosLivresCriticos: number;
  riscoNoShowHoje: number;
};

export type ViewMode = "dia" | "semana" | "mes" | "lista" | "sala" | "profissional";

interface AgendaTopBarProps {
  date: Date;
  onDateChange: (d: Date) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  profissionalId: string;
  onProfissionalChange: (id: string) => void;
  salaId: string;
  onSalaChange: (id: string) => void;
  servicoId: string;
  onServicoChange: (id: string) => void;
  onNovoAgendamento: () => void;
  modoOtimizacao: boolean;
  onModoOtimizacaoToggle: () => void;
  profissionais: { id: string; nome: string }[];
  salas: { id: string; nome: string; unidade: string }[];
  servicos: { id: string; nome: string }[];
  indicadores: IndicadoresDia;
}

export function AgendaTopBar({
  date,
  onDateChange,
  viewMode,
  onViewModeChange,
  profissionalId,
  onProfissionalChange,
  salaId,
  onSalaChange,
  servicoId,
  onServicoChange,
  onNovoAgendamento,
  modoOtimizacao,
  onModoOtimizacaoToggle,
  profissionais,
  salas,
  servicos,
  indicadores,
}: AgendaTopBarProps) {
  const ind = indicadores;

  const formatDate = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const toInputDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const isHoje = (() => {
    const hoje = new Date();
    return hoje.toDateString() === date.toDateString();
  })();

  const semanaDias =
    viewMode === "semana"
      ? (() => {
          const base = new Date(date);
          const dow = base.getDay(); // 0 (dom) - 6 (sáb)
          const diff = (dow + 6) % 7; // distância até segunda
          base.setDate(base.getDate() - diff);
          return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            return d;
          });
        })()
      : [];

  return (
    <div className="border-b border-slate-200 bg-white px-4 py-3">
      {/* Linha 1: Data + Filtros + Botões */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={toInputDate(date)}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m, d] = e.target.value.split("-").map(Number);
              onDateChange(new Date(y, (m ?? 1) - 1, d ?? 1));
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <span className="text-sm text-slate-500">{formatDate(date)}</span>
          {isHoje && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Hoje
            </span>
          )}
        </div>

        <select
          value={profissionalId}
          onChange={(e) => onProfissionalChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Todos os profissionais</option>
          {profissionais.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>

        <select
          value={salaId}
          onChange={(e) => onSalaChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Todas as salas</option>
          {salas.map((s) => (
            <option key={s.id} value={s.id}>{s.nome} — {s.unidade}</option>
          ))}
        </select>

        <select
          value={servicoId}
          onChange={(e) => onServicoChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Todos os serviços</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onNovoAgendamento}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Novo Agendamento
          </button>
          <button
            type="button"
            onClick={onModoOtimizacaoToggle}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              modoOtimizacao
                ? "bg-amber-500 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Modo Otimização IA
          </button>
        </div>
      </div>

      {/* Modos de visualização */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[
          { id: "dia" as const, label: "Dia", Icon: IconCalendar },
          { id: "semana" as const, label: "Semana", Icon: IconCalendar },
          { id: "mes" as const, label: "Mês", Icon: IconCalendar },
          { id: "lista" as const, label: "Lista", Icon: IconClipboard },
          { id: "sala" as const, label: "Por sala", Icon: IconBuildingOffice2 },
          { id: "profissional" as const, label: "Por profissional", Icon: IconUserCircle },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onViewModeChange(m.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
              viewMode === m.id ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <m.Icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>
      {/* Semanas (quando em modo semana) */}
      {viewMode === "semana" && semanaDias.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {semanaDias.map((d) => {
            const isSelecionado = d.toDateString() === date.toDateString();
            const eHoje = new Date().toDateString() === d.toDateString();
            const label = d.toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "2-digit",
            });
            return (
              <button
                key={d.toISOString().slice(0, 10)}
                type="button"
                onClick={() => onDateChange(d)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isSelecionado ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
                {eHoje && " (hoje)"}
              </button>
            );
          })}
        </div>
      )}

      {/* Indicadores rápidos */}
      <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3">
        <span className="text-sm text-slate-600">
          <strong className="text-primary">Ocupação do dia:</strong> {ind.ocupacaoPercent}%
        </span>
        <span className="text-sm text-slate-600">
          <strong>Receita prevista:</strong> {formatBRL(ind.receitaPrevistaDia)}
        </span>
        <span className="text-sm text-amber-600">
          <strong>Horários livres críticos:</strong> {ind.horariosLivresCriticos}
        </span>
        <span className="text-sm text-slate-600">
          <strong>Risco no-show hoje:</strong> {ind.riscoNoShowHoje}
        </span>
      </div>
    </div>
  );
}
