"use client";

export type SegmentoItem = { id: string; label: string; descricao: string; count: number };

interface SegmentacaoClientesProps {
  segmentos: SegmentoItem[];
  loading?: boolean;
  onDispararCampanha: (segmentoId: string) => void;
}

export function SegmentacaoClientes({ segmentos, loading, onDispararCampanha }: SegmentacaoClientesProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">4. Segmentação inteligente</h2>
      <p className="text-sm text-slate-500">
        Grupos automáticos. Dispare campanhas para um segmento específico.
      </p>
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando segmentos…
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {segmentos.map((s) => (
            <div key={s.id} className="card flex flex-col justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{s.label}</p>
                <p className="text-xs text-slate-500">{s.descricao}</p>
                <p className="mt-1 text-sm font-medium text-primary">{s.count} clientes</p>
              </div>
              <button
                type="button"
                onClick={() => onDispararCampanha(s.id)}
                className="rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
              >
                Disparar campanha
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
