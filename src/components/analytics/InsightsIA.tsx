"use client";

export function InsightsIA({ insights = [], loading }: { insights?: { titulo: string; descricao?: string | null }[]; loading?: boolean }) {
  const lista = insights.length > 0 ? insights : [{ titulo: "Nenhum insight gerado ainda.", descricao: "Os insights aparecem conforme o sistema analisa dados." }];
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">6. Insights automáticos (IA)</h2>
      <p className="text-sm text-slate-500">
        Inteligência operacional — não é dashboard comum.
      </p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {lista.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-slate-800"
          >
            <p className="font-medium">{item.titulo}</p>
            {item.descricao && <p className="mt-1 text-sm text-slate-600">{item.descricao}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
