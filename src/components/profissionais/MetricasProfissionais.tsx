"use client";

import { IconChart } from "@/components/SidebarIcons";
import type { ProfissionalListItem } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export type MetricasProfissionaisData = {
  receitaPorHoraMedia: number;
  ocupacaoMedia: number;
  ticketMedioGeral: number;
  totalHorasTrabalhadas: number;
  receitaTotalMes: number;
};

interface MetricasProfissionaisProps {
  data?: MetricasProfissionaisData | null;
  loading?: boolean;
}

export function MetricasProfissionais({ data, loading }: MetricasProfissionaisProps) {
  const d = data ?? {
    receitaPorHoraMedia: 0,
    ocupacaoMedia: 0,
    ticketMedioGeral: 0,
    totalHorasTrabalhadas: 0,
    receitaTotalMes: 0,
  };

  const itens = [
    { label: "Receita por hora (média)", valor: formatBRL(d.receitaPorHoraMedia) },
    { label: "Ocupação média", valor: `${d.ocupacaoMedia}%` },
    { label: "Ticket médio geral", valor: formatBRL(d.ticketMedioGeral) },
    { label: "Total horas trabalhadas (mês)", valor: `${d.totalHorasTrabalhadas}h` },
    { label: "Receita total (mês)", valor: formatBRL(d.receitaTotalMes) },
  ];

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
        <IconChart className="h-5 w-5" />
        Métricas importantes
      </h2>
      {loading ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {itens.map(({ label, valor }) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1 font-bold text-slate-800">{valor}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
