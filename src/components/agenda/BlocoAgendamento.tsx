"use client";

import { IconExclamation, IconFire, IconXCircle } from "@/components/SidebarIcons";
import type { Agendamento } from "@/lib/mock-agenda";

interface BlocoAgendamentoProps {
  agendamento: Agendamento;
  onClick: () => void;
  modoOtimizacao?: boolean;
  marcacaoOtimizacao?: "premium" | "subvalorizado" | "risco_cancelamento" | null;
}

const statusConfig: Record<string, { bg: string; label: string }> = {
  confirmado: { bg: "bg-green-100 border-green-300 text-green-900", label: "Confirmado" },
  pendente: { bg: "bg-amber-100 border-amber-300 text-amber-900", label: "Pendente" },
  risco: { bg: "bg-red-100 border-red-300 text-red-900", label: "Risco" },
  aguardando_pagamento: { bg: "bg-slate-100 border-slate-300 text-slate-700", label: "Aguard. pagamento" },
  em_atendimento: { bg: "bg-blue-100 border-blue-300 text-blue-900", label: "Em atendimento" },
  concluido: { bg: "bg-green-50 border-green-200 text-green-800", label: "Concluído" },
};

const riscoDot = { baixo: "bg-green-500", medio: "bg-amber-500", alto: "bg-red-500" } as const;

export function BlocoAgendamento({
  agendamento,
  onClick,
  modoOtimizacao,
  marcacaoOtimizacao,
}: BlocoAgendamentoProps) {
  const cfg = statusConfig[agendamento.status] ?? { bg: "bg-slate-100 border-slate-300 text-slate-800", label: agendamento.status };
  const formatBRL = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

  const otimConfig = marcacaoOtimizacao
    ? {
        premium: { label: "Premium", Icon: IconFire },
        subvalorizado: { label: "Subvalorizado", Icon: IconExclamation },
        risco_cancelamento: { label: "Risco cancel.", Icon: IconXCircle },
      }[marcacaoOtimizacao]
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border-l-4 p-2 text-left text-sm transition hover:ring-2 hover:ring-primary/30 ${cfg.bg}`}
    >
      {modoOtimizacao && otimConfig && (
        <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600">
          <otimConfig.Icon className="h-3.5 w-3.5" />
          {otimConfig.label}
        </span>
      )}
      <div className="font-medium text-slate-900">{agendamento.clienteNome}</div>
      <div className="text-xs text-slate-600">
        {agendamento.servico}
        {agendamento.inicio && agendamento.fim && (
          <span className="ml-1 text-[11px] text-slate-500">
            · {agendamento.inicio}–{agendamento.fim}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-semibold text-slate-800">{formatBRL(agendamento.valor)}</span>
        <span className="flex items-center gap-1 text-xs" title={`Risco: ${agendamento.riscoNivel}`}>
          <span className={`h-2 w-2 rounded-full ${riscoDot[agendamento.riscoNivel]}`} />
          {cfg.label}
        </span>
      </div>
    </button>
  );
}
