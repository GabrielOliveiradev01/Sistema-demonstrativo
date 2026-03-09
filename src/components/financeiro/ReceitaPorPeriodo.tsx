"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

type VistaPeriodo = "diaria" | "semanal" | "mensal";
type DadoPeriodo = { label: string; valor: number; anterior?: number };

export function ReceitaPorPeriodo({ data = [], loading }: { data?: DadoPeriodo[]; loading?: boolean }) {
  const [vista, setVista] = useState<VistaPeriodo>("semanal");

  const dadosSemanais = data.length ? data : [{ label: "Sem 1", valor: 0, anterior: 0 }];
  const primeiroValor = dadosSemanais[0]?.valor ?? 0;
  const ultimoValor = dadosSemanais[dadosSemanais.length - 1]?.valor ?? 0;
  const crescimento = primeiroValor
    ? ((ultimoValor - primeiroValor) / primeiroValor) * 100
    : 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">2. Receita por período</h2>
        <div className="flex gap-2">
          {(["diaria", "semanal", "mensal"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
                vista === v ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {v === "diaria" ? "Diária" : v === "semanal" ? "Semanal" : "Mensal"}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {vista === "semanal" && (
          <>
            <p className="mb-2 text-sm text-slate-500">
              Comparação com mês anterior — Crescimento:{" "}
              <strong className={crescimento >= 0 ? "text-green-600" : "text-red-600"}>
                {crescimento >= 0 ? "+" : ""}
                {crescimento.toFixed(1)}%
              </strong>
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosSemanais}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: number) => [formatBRL(v), "Receita"]}
                    labelFormatter={(l) => l}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#166534"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e" }}
                    name="Este mês"
                  />
                  <Line
                    type="monotone"
                    dataKey="anterior"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    dot={{ fill: "#94a3b8" }}
                    name="Mês anterior"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {vista === "diaria" && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ dia: "—", valor: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(1)}k`} />
                <Tooltip formatter={(v: number) => [formatBRL(v), "Receita"]} />
                <Bar dataKey="valor" fill="#166534" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {vista === "mensal" && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosSemanais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatBRL(v), "Receita"]} />
                <Line type="monotone" dataKey="valor" stroke="#166534" strokeWidth={2} dot={{ fill: "#22c55e" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
