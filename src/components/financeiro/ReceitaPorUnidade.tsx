"use client";

import { useState } from "react";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

type Aba = "profissional" | "servico" | "categoria" | "sala" | "canal";

export function ReceitaPorUnidade({ data = [], loading }: { data?: { nome: string; valor: number }[]; loading?: boolean }) {
  const [aba, setAba] = useState<Aba>("profissional");
  const abas: { id: Aba; label: string; dados: { nome: string; valor: number }[] }[] = [
    { id: "profissional", label: "Por profissional", dados: data },
    { id: "servico", label: "Por serviço", dados: [] },
    { id: "categoria", label: "Por categoria", dados: [] },
    { id: "sala", label: "Por sala/unidade", dados: [] },
    { id: "canal", label: "Por canal", dados: [] },
  ];
  const atual = abas.find((a) => a.id === aba)!;
  const total = atual.dados.reduce((s, d) => s + d.valor, 0);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">3. Receita por unidade de negócio</h2>
      <p className="text-sm text-slate-500">De onde vem o dinheiro.</p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="flex flex-wrap gap-2">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              aba === a.id ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="space-y-3">
          {atual.dados.length === 0 && !loading && <p className="text-sm text-slate-500">Nenhum dado no período.</p>}
          {atual.dados.map((d) => {
            const pct = total > 0 ? (d.valor / total) * 100 : 0;
            return (
              <div key={d.nome}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{d.nome}</span>
                  <span className="text-slate-600">
                    {formatBRL(d.valor)} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
