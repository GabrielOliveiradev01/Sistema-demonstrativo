"use client";

import { useState } from "react";
import { ACOES_AUTOMATIZADAS } from "@/lib/mock-inteligencia";

export function AcoesAutomatizadas() {
  const [ativados, setAtivados] = useState<Record<string, boolean>>({
    recuperacao: true,
    preco: false,
    campanha_vazios: true,
    reativacao: false,
    sinal_risco: true,
  });

  const toggle = (id: string) => {
    setAtivados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">6. Ações automatizadas</h2>
      <p className="text-sm text-slate-500">
        Ative o que o sistema pode fazer por você.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {ACOES_AUTOMATIZADAS.map((a) => (
          <div
            key={a.id}
            className="card flex items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-800">{a.label}</p>
              <p className="text-xs text-slate-500">{a.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(a.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                ativados[a.id]
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {ativados[a.id] ? "Ativo" : "Inativo"}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border-2 border-primary bg-primary/10 p-6 text-center">
        <p className="text-lg font-semibold text-slate-800">
          Otimizar meu mês automaticamente
        </p>
        <p className="mt-1 text-sm text-slate-600">
          O sistema aplica as ações ativas e sugere o que mais fazer.
        </p>
        <button
          type="button"
          className="mt-4 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary-dark"
        >
          Otimizar meu mês automaticamente
        </button>
      </div>
    </section>
  );
}
