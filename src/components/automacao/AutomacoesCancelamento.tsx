"use client";

import { useState } from "react";
import { AUTOMACOES_CANCELAMENTO, MODOS_RECUPERACAO } from "@/lib/mock-automacao";

export function AutomacoesCancelamento() {
  const [itens, setItens] = useState(AUTOMACOES_CANCELAMENTO);
  const [modoRecuperacao, setModoRecuperacao] = useState("total");

  const toggle = (id: string) => {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, ativo: !i.ativo } : i)));
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">3. Automações de cancelamento</h2>
      <p className="text-sm text-slate-500">
        Quando status = cancelado. Ativar recuperação total, parcial com aprovação ou apenas notificar.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-3">
          <h4 className="text-sm font-medium text-slate-600">Ações ao cancelar</h4>
          {itens.map((i) => (
            <div key={i.id} className="flex items-center justify-between">
              <span className="text-sm text-slate-800">{i.label}</span>
              <button
                type="button"
                onClick={() => toggle(i.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${i.ativo ? "bg-primary text-white" : "bg-slate-200 text-slate-600"}`}
              >
                {i.ativo ? "Ativo" : "Inativo"}
              </button>
            </div>
          ))}
        </div>
        <div className="card">
          <h4 className="mb-3 text-sm font-medium text-slate-600">Modo de recuperação</h4>
          {MODOS_RECUPERACAO.map((m) => (
            <label key={m.id} className="flex cursor-pointer items-center gap-2 py-2">
              <input
                type="radio"
                name="modo_recuperacao"
                checked={modoRecuperacao === m.id}
                onChange={() => setModoRecuperacao(m.id)}
                className="text-primary"
              />
              <span className="text-sm text-slate-800">{m.label}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
