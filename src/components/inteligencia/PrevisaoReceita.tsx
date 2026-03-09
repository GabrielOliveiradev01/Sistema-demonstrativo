"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PREVISAO_RECEITA, PREVISAO_RECEITA_SEMANAL } from "@/lib/mock-inteligencia";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export function PrevisaoReceita() {
  const p = PREVISAO_RECEITA;
  const dados = PREVISAO_RECEITA_SEMANAL.map((d) => ({
    ...d,
    valor: (d as { realizado?: number; previsto?: number }).realizado ?? (d as { previsto?: number }).previsto,
  }));

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">4. Previsão de receita</h2>
      <p className="text-sm text-slate-500">
        Faixa de previsão até o fim do mês.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Receita prevista (fim do mês)</p>
          <p className="text-xl font-bold text-primary">{formatBRL(p.receitaPrevistaFimMes)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Melhor cenário</p>
          <p className="text-xl font-bold text-green-700">{formatBRL(p.melhorCenario)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Pior cenário</p>
          <p className="text-xl font-bold text-amber-700">{formatBRL(p.piorCenario)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Tendência atual</p>
          <p className="text-xl font-bold text-slate-800">{p.tendenciaAtual}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Risco de não bater meta</p>
          <p className={`text-xl font-bold ${p.riscoNaoBaterMeta > 20 ? "text-amber-600" : "text-slate-800"}`}>
            {p.riscoNaoBaterMeta}%
          </p>
        </div>
      </div>

      <div className="card">
        <p className="mb-3 text-sm font-medium text-slate-600">Gráfico com faixa de previsão (min–max)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [formatBRL(v), "Valor"]} labelFormatter={(l) => l} />
              <Line type="monotone" dataKey="min" stroke="#94a3b8" strokeDasharray="4 4" dot={false} name="Pior cenário" />
              <Line type="monotone" dataKey="max" stroke="#94a3b8" strokeDasharray="4 4" dot={false} name="Melhor cenário" />
              <Line type="monotone" dataKey="valor" stroke="#166534" strokeWidth={2} dot={{ fill: "#22c55e" }} name="Realizado/Previsto" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
