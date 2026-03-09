"use client";

import {
  IconCurrency,
  IconExclamation,
  IconSparkles,
  IconTrendingUp,
  IconTarget,
} from "@/components/SidebarIcons";
import type { PainelInsightsData } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const cards = [
  { key: "receitaRecuperadaIA", Icon: IconCurrency, titulo: "Receita recuperada pela IA" },
  { key: "receitaEmRisco", Icon: IconExclamation, titulo: "Receita em risco" },
  { key: "faltasPrevistas7dias", Icon: IconSparkles, titulo: "Faltas previstas (7 dias)" },
  { key: "potencialCrescimento", Icon: IconTrendingUp, titulo: "Potencial de crescimento" },
  { key: "oportunidadeUrgente", Icon: IconTarget, titulo: "Oportunidade mais urgente", texto: true },
];

const vazio: PainelInsightsData = {
  receitaRecuperadaIA: 0,
  receitaEmRisco: 0,
  faltasPrevistas7dias: 0,
  potencialCrescimento: 0,
  oportunidadeUrgente: "Ajuste horários e confirmações para aumentar a receita.",
};

export function PainelInsights({ data, loading }: { data: PainelInsightsData | null; loading?: boolean }) {
  const p = data ?? vazio;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">1. Painel de insights</h2>
      <p className="text-sm text-slate-500">Resumo automático da semana.</p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.filter((c) => !c.texto).map((c) => {
          const valor = (p as unknown as Record<string, number>)[c.key];
          const isCurrency = c.key.includes("receita") || c.key.includes("potencial");
          return (
            <div key={c.key} className="card">
              <c.Icon className="h-6 w-6 text-slate-600" />
              <p className="mt-1 text-xs font-medium text-slate-500">{c.titulo}</p>
              <p className={`text-lg font-bold ${c.key === "receitaEmRisco" ? "text-amber-700" : "text-slate-800"}`}>
                {isCurrency ? formatBRL(valor) : valor}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <IconTarget className="h-4 w-4 shrink-0" />
          Oportunidade mais urgente
        </p>
        <p className="mt-1 text-slate-800">{p.oportunidadeUrgente}</p>
      </div>
    </section>
  );
}
