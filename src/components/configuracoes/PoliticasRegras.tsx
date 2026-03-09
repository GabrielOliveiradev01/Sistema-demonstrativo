"use client";

import type { PoliticasConfigData } from "@/lib/dados-paginas";

interface Props {
  data: PoliticasConfigData | null;
  loading?: boolean;
}

export function PoliticasRegras({ data, loading }: Props) {
  const p = data ?? {
    antecedenciaMinimaHoras: 24,
    antecedenciaMaximaDias: 90,
    limiteCancelamentoDias: 2,
    penalidadeAutomatica: true,
    scoreMinimoSemSinal: 70,
  };

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">9. Políticas e regras</h2>
      <p className="text-sm text-slate-500">Regras globais que conectam com Inteligência.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <label className="block text-sm font-medium text-slate-600">Antecedência mínima (horas)</label>
          <input type="number" defaultValue={p.antecedenciaMinimaHoras} className="mt-1 w-full max-w-[100px] rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div className="card">
          <label className="block text-sm font-medium text-slate-600">Antecedência máxima (dias)</label>
          <input type="number" defaultValue={p.antecedenciaMaximaDias} className="mt-1 w-full max-w-[100px] rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div className="card">
          <label className="block text-sm font-medium text-slate-600">Limite de cancelamento (dias antes)</label>
          <input type="number" defaultValue={p.limiteCancelamentoDias} className="mt-1 w-full max-w-[100px] rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div className="card">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input type="checkbox" defaultChecked={p.penalidadeAutomatica} /> Penalidade automática
          </label>
        </div>
        <div className="card sm:col-span-2">
          <label className="block text-sm font-medium text-slate-600">Score mínimo para agendar sem sinal (%)</label>
          <input type="number" defaultValue={p.scoreMinimoSemSinal} className="mt-1 w-full max-w-[100px] rounded-lg border border-slate-200 px-3 py-2" />
        </div>
      </div>
      <button type="button" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Salvar regras</button>
    </section>
  );
}
