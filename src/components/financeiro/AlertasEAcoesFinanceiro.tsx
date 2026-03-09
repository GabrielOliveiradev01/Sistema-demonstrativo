"use client";

import type { AlertaFinanceiro } from "@/lib/dados-paginas";

interface Props {
  data: AlertaFinanceiro[];
  loading?: boolean;
}

export function AlertasEAcoesFinanceiro({ data: alertas = [], loading }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">7. Alertas e ações</h2>
      <p className="text-sm text-slate-500">Bloco dinâmico — atualizado conforme os dados.</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-3">
          {(loading ? [] : alertas).map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
            >
              <p className="text-sm text-slate-700">{a.texto}</p>
              <button
                type="button"
                className="shrink-0 rounded bg-primary px-2 py-1 text-xs font-medium text-white hover:bg-primary-dark"
              >
                {a.acao}
              </button>
            </div>
          ))}
        </div>
        <div className="card">
          <p className="mb-3 text-sm font-medium text-slate-600">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Criar promoção
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Ajustar preço
            </button>
            <button
              type="button"
              className="rounded-lg border border-primary bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/20"
            >
              Ativar recuperação automática
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Disparar campanha
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
