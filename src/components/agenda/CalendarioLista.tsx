"use client";

import type { Agendamento } from "@/lib/mock-agenda";
import { BlocoAgendamento } from "./BlocoAgendamento";

interface CalendarioListaProps {
  agendamentos: Agendamento[];
  onAgendamentoClick: (a: Agendamento) => void;
  modoOtimizacao: boolean;
}

export function CalendarioLista({
  agendamentos,
  onAgendamentoClick,
  modoOtimizacao,
}: CalendarioListaProps) {
  const ordenados = [...agendamentos].sort(
    (a, b) => a.inicio.localeCompare(b.inicio)
  );

  return (
    <div className="space-y-2">
      {ordenados.map((ag) => (
        <div
          key={ag.id}
          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-3"
        >
          <div className="w-20 shrink-0 text-sm font-medium text-slate-600">
            {ag.inicio} - {ag.fim}
          </div>
          <div className="min-w-0 flex-1">
            <BlocoAgendamento
              agendamento={ag}
              onClick={() => onAgendamentoClick(ag)}
              modoOtimizacao={modoOtimizacao}
              marcacaoOtimizacao={null}
            />
          </div>
          <div className="shrink-0 text-sm text-slate-500">
            {ag.profissionalNome}
            {ag.salaNome && ` · ${ag.salaNome}`}
          </div>
        </div>
      ))}
    </div>
  );
}
