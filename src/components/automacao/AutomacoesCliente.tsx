"use client";

import { useState } from "react";
import { AUTOMACOES_CLIENTE, SEGMENTACAO_OPCOES } from "@/lib/mock-automacao";

export function AutomacoesCliente() {
  const [fluxos, setFluxos] = useState(AUTOMACOES_CLIENTE);

  const toggle = (id: string) => {
    setFluxos((prev) => prev.map((f) => (f.id === id ? { ...f, ativo: !f.ativo } : f)));
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">5. Automações de cliente</h2>
      <p className="text-sm text-slate-500">
        Fluxos inteligentes. Segmentação por LTV, frequência, serviço, profissional, score.
      </p>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-slate-600">Segmentação:</span>
        {SEGMENTACAO_OPCOES.map((s) => (
          <span
            key={s}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {fluxos.map((f) => (
          <div
            key={f.id}
            className="card flex items-center justify-between gap-4"
          >
            <p className="font-medium text-slate-800">{f.nome}</p>
            <button
              type="button"
              onClick={() => toggle(f.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${f.ativo ? "bg-primary text-white" : "bg-slate-200 text-slate-600"}`}
            >
              {f.ativo ? "Ativo" : "Inativo"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
