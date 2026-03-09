"use client";

import { IconExclamation } from "@/components/SidebarIcons";
import type { ResumoRisco } from "@/lib/dados-supabase";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

const vazio: ResumoRisco = {
  taxaNoShow: 0,
  riscoPrevistoFaltas: 0,
  cancelamentosSemana: 0,
  receitaEmRisco: 0,
  nivelRisco: "baixo",
};

export function BlocoRisco({ data, loading }: { data: ResumoRisco | null; loading?: boolean }) {
  const d = data ?? vazio;
  const isAlto = d.nivelRisco === "alto";
  const isMedio = d.nivelRisco === "medio";

  const riskColor =
    d.nivelRisco === "alto"
      ? "bg-red-500"
      : d.nivelRisco === "medio"
        ? "bg-amber-500"
        : "bg-green-500";

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">3. Bloco de Risco</h2>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      {isAlto && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-red-800">
            <IconExclamation className="h-5 w-5 shrink-0" />
            Risco alto detectado — recomendamos ação imediata
          </p>
          <p className="mt-1 text-sm text-red-700">
            Taxa de no-show e cancelamentos acima do esperado. Considere
            confirmações automáticas e campanhas de recuperação.
          </p>
        </div>
      )}

      {isMedio && !isAlto && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">
            Risco moderado. Ative lembretes e recuperação automática para
            reduzir faltas.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card flex flex-col">
          <p className="text-sm text-slate-500">Indicador de risco</p>
          <div className="mt-2 flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded-full ${riskColor}`}
              title={d.nivelRisco}
            />
            <span className="capitalize font-medium">{d.nivelRisco}</span>
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Taxa de no-show</p>
          <p className="text-2xl font-bold text-slate-800">{d.taxaNoShow}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Risco previsto (próximos 7 dias)</p>
          <p className="text-2xl font-bold text-amber-600">{d.riscoPrevistoFaltas} faltas</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Cancelamentos da semana</p>
          <p className="text-2xl font-bold text-slate-800">{d.cancelamentosSemana}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Receita em risco</p>
          <p className="text-2xl font-bold text-red-600">
            {formatBRL(d.receitaEmRisco)}
          </p>
        </div>
      </div>
    </section>
  );
}
