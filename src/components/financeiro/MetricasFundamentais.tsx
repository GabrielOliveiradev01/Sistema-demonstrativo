"use client";

import { IconChart } from "@/components/SidebarIcons";
import type { MetricasFundamentaisData } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const itens = [
  { key: "receitaBruta", label: "Receita bruta" },
  { key: "receitaLiquida", label: "Receita líquida" },
  { key: "ticketMedio", label: "Ticket médio" },
  { key: "receitaPorHora", label: "Receita por hora" },
  { key: "ltvMedio", label: "LTV médio" },
  { key: "cac", label: "CAC" },
  { key: "churnCliente", label: "Churn de cliente" },
  { key: "taxaConversaoFinanceira", label: "Taxa de conversão financeira" },
];

interface Props {
  data: MetricasFundamentaisData | null;
  loading?: boolean;
}

export function MetricasFundamentais({ data, loading }: Props) {
  const m = data ?? {
    receitaBruta: 0,
    receitaLiquida: 0,
    ticketMedio: 0,
    receitaPorHora: 0,
    ltvMedio: 0,
    cac: 0,
    churnCliente: 0,
    taxaConversaoFinanceira: 0,
  };

  const formatValor = (key: string) => {
    const v = (m as Record<string, number>)[key];
    if (key === "churnCliente" || key === "taxaConversaoFinanceira") return `${v}%`;
    if (key === "ticketMedio" || key === "receitaPorHora" || key === "ltvMedio" || key === "cac")
      return formatBRL(v);
    if (key === "receitaBruta" || key === "receitaLiquida") return formatBRL(v);
    return String(v);
  };

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
        <IconChart className="h-5 w-5" />
        Métricas fundamentais
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {itens.map(({ key, label }) => (
          <div key={key} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 font-bold text-slate-800">{formatValor(key)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
