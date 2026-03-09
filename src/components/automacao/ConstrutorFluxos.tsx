"use client";

import { EXEMPLOS_FLUXOS } from "@/lib/mock-automacao";

export function ConstrutorFluxos() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">6. Construtor de fluxos (avançado)</h2>
      <p className="text-sm text-slate-500">
        Modelo visual: SE (condição) → ENTÃO (ação) → SENÃO (ação alternativa).
      </p>

      <div className="space-y-4">
        {EXEMPLOS_FLUXOS.map((ex, i) => (
          <div key={i} className="card border-primary/20">
            <p className="mb-3 font-medium text-slate-800">{ex.titulo}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="shrink-0 rounded bg-amber-100 px-2 py-1 font-semibold text-amber-800">SE</span>
                <span className="text-slate-700">{ex.se}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 rounded bg-green-100 px-2 py-1 font-semibold text-green-800">→ ENTÃO</span>
                <span className="text-slate-700">{ex.entao}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">→ SENÃO</span>
                <span className="text-slate-600">{ex.senao}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-600">Criar novo fluxo condicional</p>
        <button
          type="button"
          className="mt-3 rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
        >
          Abrir construtor visual
        </button>
      </div>
    </section>
  );
}
