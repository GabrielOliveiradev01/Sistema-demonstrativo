"use client";

import { useState } from "react";
import { AUTOMACOES_AGENDAMENTO } from "@/lib/mock-automacao";

export function AutomacoesAgendamento() {
  const [fluxos, setFluxos] = useState(AUTOMACOES_AGENDAMENTO);

  const toggle = (id: string) => {
    setFluxos((prev) => prev.map((f) => (f.id === id ? { ...f, ativo: !f.ativo } : f)));
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">2. Automações de agendamento</h2>
      <p className="text-sm text-slate-500">
        Fluxos padrão. Configure canal, tempo antes do evento e condição (ex: score &gt; 60%).
      </p>

      <div className="space-y-3">
        {fluxos.map((f) => (
          <div
            key={f.id}
            className="card flex flex-wrap items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-800">{f.nome}</p>
              <p className="text-xs text-slate-500">Canal: {f.canal} · Tempo: configurável · Condição: opcional</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                <option>WhatsApp</option>
                <option>Email</option>
                <option>SMS</option>
              </select>
              <button
                type="button"
                onClick={() => toggle(f.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${f.ativo ? "bg-primary text-white" : "bg-slate-200 text-slate-600"}`}
              >
                {f.ativo ? "Ativo" : "Inativo"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
