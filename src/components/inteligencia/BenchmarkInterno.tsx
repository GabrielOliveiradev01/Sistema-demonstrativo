"use client";

import { BENCHMARK } from "@/lib/mock-inteligencia";

function BarraComparacao({
  seu,
  referencia,
  label,
  unidade = "",
  invertido = false,
}: {
  seu: number;
  referencia: number;
  label: string;
  unidade?: string;
  invertido?: boolean;
}) {
  const max = Math.max(seu, referencia) * 1.2 || 1;
  const seuPct = (seu / max) * 100;
  const refPct = (referencia / max) * 100;
  const melhor = invertido ? seu <= referencia : seu >= referencia;
  const strongClass = melhor ? "text-green-600" : "text-amber-600";

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-600">
          Você: <strong className={strongClass}>{seu}{unidade}</strong>
          {" "}vs ref: {referencia}{unidade}
        </span>
      </div>
      <div className="flex gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${melhor ? "bg-green-500" : "bg-amber-500"}`}
            style={{ width: `${seuPct}%` }}
          />
        </div>
        <div className="h-3 w-20 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-slate-400"
            style={{ width: `${refPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function BenchmarkInterno() {
  const b = BENCHMARK;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">5. Benchmark interno</h2>
      <p className="text-sm text-slate-500">
        Comparação automática com segmento e padrão ideal.
      </p>

      <div className="card">
        <div className="space-y-4">
          <BarraComparacao
            seu={b.ocupacao.seu}
            referencia={b.ocupacao.segmento}
            label={b.ocupacao.label}
            unidade="%"
          />
          <BarraComparacao
            seu={b.ticketMedio.seu}
            referencia={b.ticketMedio.regiao}
            label={b.ticketMedio.label}
            unidade=""
          />
          <BarraComparacao
            seu={b.noShow.seu}
            referencia={b.noShow.mercado}
            label={b.noShow.label}
            unidade="%"
            invertido
          />
          <BarraComparacao
            seu={b.receitaHora.seu}
            referencia={b.receitaHora.ideal}
            label={b.receitaHora.label}
            unidade=""
          />
        </div>
      </div>
    </section>
  );
}
