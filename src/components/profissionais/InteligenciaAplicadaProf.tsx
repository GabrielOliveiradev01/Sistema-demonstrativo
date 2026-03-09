"use client";

import { useState, useEffect } from "react";
import { fetchInsightsInteligenciaAplicada, type InsightInteligenciaAplicada } from "@/lib/dados-supabase";

interface Props {
  profissionalId?: string | null;
}

export function InteligenciaAplicadaProf({ profissionalId }: Props) {
  const [insights, setInsights] = useState<InsightInteligenciaAplicada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsightsInteligenciaAplicada(profissionalId).then(setInsights).finally(() => setLoading(false));
  }, [profissionalId]);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">4. Inteligência aplicada</h2>
      <p className="text-sm text-slate-500">
        Insights que transformam gestão em decisão estratégica.
      </p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-slate-700"
          >
            {insight.titulo}
          </div>
        ))}
        {!loading && insights.length === 0 && (
          <p className="col-span-2 text-sm text-slate-500">Nenhum insight disponível no momento.</p>
        )}
      </div>
    </section>
  );
}
