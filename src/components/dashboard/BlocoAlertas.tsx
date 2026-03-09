"use client";

import { useState, useEffect } from "react";
import { fetchAlertas } from "@/lib/dados-supabase";

type Alerta = { id: string; tipo: string; texto: string; acao: string };

export function BlocoAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlertas()
      .then(setAlertas)
      .catch(() => setAlertas([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">
        6. Alertas e Ações Rápidas
      </h2>
      <p className="text-sm text-slate-500">
        Ações sugeridas para hoje. Atualizado dinamicamente.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Lista de alertas */}
        <div className="card space-y-3">
          {loading && (
            <p className="text-sm text-slate-500">Carregando alertas…</p>
          )}
          {!loading && alertas.length === 0 && (
            <p className="text-sm text-slate-500">Nenhum alerta no momento.</p>
          )}
          {!loading && alertas.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
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

        {/* Botões de ação direta */}
        <div className="card">
          <p className="mb-3 text-sm font-medium text-slate-600">
            Ações rápidas
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Criar promoção
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Disparar campanha
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
