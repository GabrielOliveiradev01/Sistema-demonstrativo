"use client";

import type { Agendamento } from "@/lib/mock-agenda";
import { BlocoAgendamento } from "./BlocoAgendamento";
import { HORARIO_INICIO, HORARIO_FIM, SLOTS_OTIMIZACAO } from "@/lib/mock-agenda";

interface CalendarioDiaProps {
  agendamentos: Agendamento[];
  onSlotVazioClick: (horario: string, colunaId: string, colunaNome: string) => void;
  onAgendamentoClick: (a: Agendamento) => void;
  modoOtimizacao: boolean;
  profissionalFiltroId?: string;
  profissionais: { id: string; nome: string }[];
  /** Define se as colunas representam profissionais (default) ou salas */
  modoColuna?: "profissional" | "sala";
  /** Horários da clínica: início e fim em decimal (ex: 9 para 09:00) — respeita config_horarios */
  horarioInicio?: number;
  horarioFim?: number;
  /** Se true, a clínica está fechada neste dia */
  fechado?: boolean;
}

function parseTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h + (m ?? 0) / 60;
}

function slotKey(colId: string, time: number) {
  return `${colId}-${time}`;
}

export function CalendarioDia({
  agendamentos,
  onSlotVazioClick,
  onAgendamentoClick,
  modoOtimizacao,
  profissionalFiltroId,
  profissionais,
  modoColuna = "profissional",
  horarioInicio = HORARIO_INICIO,
  horarioFim = HORARIO_FIM,
  fechado = false,
}: CalendarioDiaProps) {
  const stepMin = 30;
  const hi = fechado ? horarioInicio : horarioInicio;
  const hf = fechado ? horarioInicio : horarioFim;
  const totalMinutos = Math.max(0, (hf - hi) * 60);
  const slots = Array.from(
    { length: totalMinutos / stepMin },
    (_, i) => hi + (i * stepMin) / 60
  );

  const colunas = profissionalFiltroId
    ? profissionais.filter((p) => p.id === profissionalFiltroId)
    : profissionais;

  // Para cada (coluna, slot), achar agendamento que cobre esse intervalo
  const getAgendamento = (colId: string, time: number) => {
    const start = time;
    const end = time + stepMin / 60;
    return agendamentos.find((a) => {
      const colMatch =
        modoColuna === "sala" ? a.salaId === colId : a.profissionalId === colId;
      if (!colMatch) return false;
      const aStart = parseTime(a.inicio);
      const aEnd = parseTime(a.fim);
      return aStart < end && aEnd > start;
    });
  };

  const getMarcacaoOtimizacao = (ag: Agendamento): "premium" | "subvalorizado" | "risco_cancelamento" | null => {
    if (!modoOtimizacao) return null;
    const risco = SLOTS_OTIMIZACAO.riscoCancelamento.find((r) => r.id === ag.id);
    if (risco) return "risco_cancelamento";
    const sub = SLOTS_OTIMIZACAO.subvalorizados.some(
      (s) => s.profissional === ag.profissionalNome && ag.inicio.startsWith("14")
    );
    if (sub) return "subvalorizado";
    const prem = SLOTS_OTIMIZACAO.premium.some(
      (s) => s.profissional === ag.profissionalNome
    );
    if (prem) return "premium";
    return null;
  };

  if (fechado) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50/50 p-8 text-slate-500">
        <p className="text-center">Clínica fechada neste dia.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-16 border border-slate-200 bg-slate-50 p-2 text-left text-slate-600">
              Horário
            </th>
            {colunas.map((c) => (
              <th
                key={c.id}
                className="min-w-[180px] border border-slate-200 bg-slate-50 p-2 text-left font-medium text-slate-700"
              >
                {c.nome}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((time) => {
            const horaInt = Math.floor(time);
            const minutos = Math.round((time - horaInt) * 60);
            const rotuloHora = `${horaInt.toString().padStart(2, "0")}:${minutos
              .toString()
              .padStart(2, "0")}`;
            return (
              <tr key={time}>
                <td className="border border-slate-200 p-1 text-slate-500">
                  {rotuloHora}
                </td>
                {colunas.map((col) => {
                  const ag = getAgendamento(col.id, time);
                  if (ag) {
                    const horaInicio = parseTime(ag.inicio);
                    const rowSpan = Math.max(
                      1,
                      Math.ceil(
                        (parseTime(ag.fim) - horaInicio) / (stepMin / 60)
                      )
                    );
                    const isFirstRow = Math.abs(time - horaInicio) < 1e-6;
                    if (!isFirstRow)
                      return (
                        <td
                          key={slotKey(col.id, time)}
                          className="border-0 p-0 h-0 overflow-hidden invisible"
                        />
                      );
                    return (
                      <td
                        key={slotKey(col.id, time)}
                        rowSpan={rowSpan}
                        className="border border-slate-200 align-top p-1"
                      >
                        <BlocoAgendamento
                          agendamento={ag}
                          onClick={() => onAgendamentoClick(ag)}
                          modoOtimizacao={modoOtimizacao}
                          marcacaoOtimizacao={getMarcacaoOtimizacao(ag)}
                        />
                      </td>
                    );
                  }
                  return (
                    <td
                      key={slotKey(col.id, time)}
                      className="border border-slate-200 align-top p-1"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onSlotVazioClick(rotuloHora, col.id, col.nome)
                        }
                        className="flex min-h-[60px] w-full items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      >
                        Livre
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
