"use client";

import { IconLightBulb } from "@/components/SidebarIcons";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

type ClientesMetricas = {
  novos: number;
  recorrentes: number;
  taxaRetencao: number;
  churn: number;
  ltv: number;
  frequenciaMedia: number;
  tempoMedioEntreVisitas: number;
};

const vazio: ClientesMetricas = {
  novos: 0,
  recorrentes: 0,
  taxaRetencao: 0,
  churn: 0,
  ltv: 0,
  frequenciaMedia: 0,
  tempoMedioEntreVisitas: 0,
};

export function ClientesAnalytics({ data, loading }: { data: ClientesMetricas | null; loading?: boolean }) {
  const c = data ?? vazio;

  const metricas = [
    { label: "Novos clientes", valor: c.novos },
    { label: "Recorrentes", valor: c.recorrentes },
    { label: "Taxa de retenção", valor: `${c.taxaRetencao}%` },
    { label: "Churn", valor: `${c.churn}%` },
    { label: "LTV", valor: formatBRL(c.ltv) },
    { label: "Frequência média", valor: c.frequenciaMedia ? `${c.frequenciaMedia}/mês` : "—" },
    { label: "Tempo entre visitas", valor: c.tempoMedioEntreVisitas ? `${c.tempoMedioEntreVisitas} dias` : "—" },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">3. Clientes</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {metricas.map((m) => (
          <div key={m.label} className="card">
            <p className="text-xs font-medium text-slate-500">{m.label}</p>
            <p className="text-base font-bold text-slate-800">{m.valor}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-slate-600">Segmentação:</span>
        {["Por faixa de gasto", "Por risco de abandono", "Por serviço", "Por profissional"].map((s) => (
          <button
            key={s}
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <IconLightBulb className="h-4 w-4 shrink-0" />
          Insight automático
        </p>
        <p className="mt-1 text-slate-800">Dados de clientes alimentados pelo banco. Use segmentação para análises.</p>
      </div>
    </section>
  );
}
