"use client";

import { IconExclamation } from "@/components/SidebarIcons";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

type RiscoPerdasData = {
  receitaPerdidaNoShow: number;
  receitaPerdidaCancelamento: number;
  horasOciosas: number;
  impactoFinanceiroMensal: number;
};

const vazio: RiscoPerdasData = {
  receitaPerdidaNoShow: 0,
  receitaPerdidaCancelamento: 0,
  horasOciosas: 0,
  impactoFinanceiroMensal: 0,
};

export function RiscoPerdas({ data, loading }: { data: RiscoPerdasData | null; loading?: boolean }) {
  const r = data ?? vazio;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">5. Risco & perdas</h2>
      <p className="text-sm text-slate-500">Métricas críticas que fazem o dono agir.</p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card border-red-200 bg-red-50/50">
          <p className="text-xs font-medium text-slate-500">Receita perdida (no-show)</p>
          <p className="text-xl font-bold text-red-700">{formatBRL(r.receitaPerdidaNoShow)}</p>
        </div>
        <div className="card border-amber-200 bg-amber-50/50">
          <p className="text-xs font-medium text-slate-500">Receita perdida (cancelamento)</p>
          <p className="text-xl font-bold text-amber-700">{formatBRL(r.receitaPerdidaCancelamento)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Horas ociosas</p>
          <p className="text-xl font-bold text-slate-800">{r.horasOciosas}h</p>
        </div>
        <div className="card border-red-200 bg-red-50/50">
          <p className="text-xs font-medium text-slate-500">Impacto financeiro mensal</p>
          <p className="text-xl font-bold text-red-700">{formatBRL(r.impactoFinanceiroMensal)}</p>
        </div>
      </div>

      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
        <p className="flex items-center gap-2 font-semibold text-red-900">
          <IconExclamation className="h-5 w-5 shrink-0" />
          Insight automático
        </p>
        <p className="mt-1 text-red-800">Dados de no-show e cancelamentos alimentados pelo banco.</p>
      </div>
    </section>
  );
}
