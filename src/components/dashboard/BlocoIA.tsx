"use client";

import { IconCpuChip, IconCurrency, IconArrowsRightLeft, IconChart } from "@/components/SidebarIcons";
import type { ResumoIA } from "@/lib/dados-supabase";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

const vazio: ResumoIA = {
  faltasEvitadas: 0,
  receitaRecuperada: 0,
  encaixesFeitos: 0,
  performancePercent: 0,
};

export function BlocoIA({ data, loading }: { data: ResumoIA | null; loading?: boolean }) {
  const d = data ?? vazio;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">4. Bloco de IA Operacional</h2>
      <p className="text-sm text-slate-500">Valor gerado pela inteligência artificial no seu negócio.</p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card border-primary/20 bg-green-50/50">
          <IconCpuChip className="h-8 w-8 text-primary" />
          <p className="mt-1 text-sm text-slate-600">Faltas evitadas pela IA</p>
          <p className="text-2xl font-bold text-primary">{d.faltasEvitadas}</p>
        </div>
        <div className="card border-primary/20 bg-green-50/50">
          <IconCurrency className="h-8 w-8 text-primary" />
          <p className="mt-1 text-sm text-slate-600">Receita recuperada automaticamente</p>
          <p className="text-2xl font-bold text-primary">
            {formatBRL(d.receitaRecuperada)}
          </p>
        </div>
        <div className="card border-primary/20 bg-green-50/50">
          <IconArrowsRightLeft className="h-8 w-8 text-primary" />
          <p className="mt-1 text-sm text-slate-600">Encaixes feitos pela IA</p>
          <p className="text-2xl font-bold text-primary">{d.encaixesFeitos}</p>
        </div>
        <div className="card border-primary/20 bg-green-50/50">
          <IconChart className="h-8 w-8 text-primary" />
          <p className="mt-1 text-sm text-slate-600">Performance da IA</p>
          <p className="text-2xl font-bold text-primary">{d.performancePercent}%</p>
          <p className="text-xs text-slate-500">eficácia</p>
        </div>
      </div>
    </section>
  );
}
