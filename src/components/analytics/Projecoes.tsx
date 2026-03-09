"use client";

import type { AnalyticsProjecoes } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const vazio: AnalyticsProjecoes = {
  receitaProjetadaMes: 0,
  previsaoOcupacao: 0,
  previsaoNoShow: 0,
  crescimentoEstimado: 0,
};

export function Projecoes({ data, loading }: { data: AnalyticsProjecoes | null; loading?: boolean }) {
  const p = data ?? vazio;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">7. Projeções</h2>
      <p className="text-sm text-slate-500">Baseado em histórico.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card border-primary/20 bg-primary/5">
          <p className="text-xs font-medium text-slate-500">Receita projetada do mês</p>
          <p className="text-xl font-bold text-primary">{formatBRL(p.receitaProjetadaMes)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Previsão de ocupação</p>
          <p className="text-xl font-bold text-slate-800">{p.previsaoOcupacao}%</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Previsão de no-show</p>
          <p className="text-xl font-bold text-slate-800">{p.previsaoNoShow}%</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Crescimento estimado</p>
          <p className={`text-xl font-bold ${p.crescimentoEstimado >= 0 ? "text-green-700" : "text-red-600"}`}>
            {p.crescimentoEstimado >= 0 ? "+" : ""}{p.crescimentoEstimado}%
          </p>
        </div>
      </div>
    </section>
  );
}
