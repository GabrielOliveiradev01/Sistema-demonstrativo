"use client";

import { useState } from "react";
import { AUTOMACOES_OCUPACAO, EXEMPLO_OCUPACAO } from "@/lib/mock-automacao";

export function AutomacoesOcupacao() {
  const [itens, setItens] = useState(AUTOMACOES_OCUPACAO);

  const toggle = (id: string) => {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, ativo: !i.ativo } : i)));
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">4. Automações de ocupação</h2>
      <p className="text-sm text-slate-500">
        Se ocupação &lt; X%: campanha automática, clientes inativos, desconto em horário morto, upgrade.
      </p>

      <div className="card space-y-3">
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

      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium text-slate-700">Exemplo (nível avançado)</p>
        <p className="mt-1 text-slate-800">"{EXEMPLO_OCUPACAO}"</p>
      </div>
    </section>
  );
}
