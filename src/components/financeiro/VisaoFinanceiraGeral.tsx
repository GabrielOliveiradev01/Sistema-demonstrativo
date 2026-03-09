"use client";

import {
  IconCurrency,
  IconTrendingUp,
  IconTarget,
  IconTrendingDown,
  IconExclamation,
  IconBanknotes,
} from "@/components/SidebarIcons";
import type { VisaoFinanceiraGeralData } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const cards = [
  { key: "receitaConfirmadaMes", Icon: IconCurrency, titulo: "Receita confirmada (mês)" },
  { key: "receitaPrevistaAgenda", Icon: IconTrendingUp, titulo: "Receita prevista (agenda futura)" },
  { key: "metaAtingidaPercent", Icon: IconTarget, titulo: "Meta financeira (% atingido)" },
  { key: "cancelamentosFinanceiros", Icon: IconTrendingDown, titulo: "Cancelamentos financeiros", negativo: true },
  { key: "receitaEmRiscoNoShow", Icon: IconExclamation, titulo: "Receita em risco (no-show previsto)", negativo: true },
  { key: "ticketMedio", Icon: IconBanknotes, titulo: "Ticket médio" },
];

const vazio: VisaoFinanceiraGeralData = {
  receitaConfirmadaMes: 0,
  receitaPrevistaAgenda: 0,
  metaFinanceira: 0,
  metaAtingidaPercent: 0,
  cancelamentosFinanceiros: 0,
  receitaEmRiscoNoShow: 0,
  ticketMedio: 0,
};

export function VisaoFinanceiraGeral({ data, loading }: { data: VisaoFinanceiraGeralData | null; loading?: boolean }) {
  const v = data ?? vazio;

  const formatValor = (key: string) => {
    if (key === "metaAtingidaPercent") return `${v.metaAtingidaPercent.toFixed(1)}%`;
    if (key === "ticketMedio") return formatBRL(v.ticketMedio);
    const valor = (v as unknown as Record<string, number>)[key];
    return typeof valor === "number" ? formatBRL(valor) : "";
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">1. Visão financeira geral</h2>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.key}
            className={`card ${c.negativo ? "border-amber-200 bg-amber-50/50" : ""}`}
          >
            <c.Icon className="h-6 w-6 text-slate-600" />
            <p className="mt-1 text-xs font-medium text-slate-500">{c.titulo}</p>
            <p
              className={`text-lg font-bold ${
                c.negativo ? "text-amber-700" : "text-slate-800"
              }`}
            >
              {formatValor(c.key)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
