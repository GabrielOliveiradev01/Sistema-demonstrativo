"use client";

import { IconTrendingUp, IconChart } from "@/components/SidebarIcons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar } from "recharts";
import type { VisaoExecutivaData } from "@/lib/dados-paginas";
import type { AnalyticsReceitaDiaria30, AnalyticsOcupacaoPorDiaSemana } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const vazio: VisaoExecutivaData = {
  receitaHoje: 0,
  receitaMes: 0,
  receitaAcumulado: 0,
  taxaOcupacao: 0,
  taxaNoShow: 0,
  ticketMedio: 0,
  ltvMedio: 0,
  margemEstimada: 0,
  crescimentoVsAnterior: 0,
};

const padraoReceita30: AnalyticsReceitaDiaria30[] = Array.from({ length: 30 }, (_, i) => ({ dia: `${i + 1}`, valor: 0 }));
const padraoOcupacao: AnalyticsOcupacaoPorDiaSemana[] = [{ dia: "Seg", ocupacao: 0 }, { dia: "Ter", ocupacao: 0 }, { dia: "Qua", ocupacao: 0 }, { dia: "Qui", ocupacao: 0 }, { dia: "Sex", ocupacao: 0 }, { dia: "Sáb", ocupacao: 0 }];

interface VisaoExecutivaProps {
  data: VisaoExecutivaData | null;
  receitaDiaria30?: AnalyticsReceitaDiaria30[];
  ocupacaoPorDiaSemana?: AnalyticsOcupacaoPorDiaSemana[];
  ocupacaoPorDiaSemanaPeriodo?: { de: string; ate: string } | null;
  loading?: boolean;
}

function formatarPeriodo(de: string, ate: string): string {
  const [y1, m1, d1] = de.split("-");
  const [y2, m2, d2] = ate.split("-");
  return `${d1}/${m1}/${y1} a ${d2}/${m2}/${y2}`;
}

export function VisaoExecutiva({ data, receitaDiaria30 = padraoReceita30, ocupacaoPorDiaSemana = padraoOcupacao, ocupacaoPorDiaSemanaPeriodo, loading }: VisaoExecutivaProps) {
  const v = data ?? vazio;

  const cards = [
    { label: "Receita hoje", valor: formatBRL(v.receitaHoje) },
    { label: "Receita mês", valor: formatBRL(v.receitaMes) },
    { label: "Acumulado", valor: formatBRL(v.receitaAcumulado) },
    { label: "Ocupação", valor: `${v.taxaOcupacao}%` },
    { label: "No-show", valor: `${v.taxaNoShow}%` },
    { label: "Ticket médio", valor: formatBRL(v.ticketMedio) },
    { label: "LTV médio", valor: formatBRL(v.ltvMedio) },
    { label: "Margem est.", valor: `${v.margemEstimada}%` },
    { label: "Crescimento vs ant.", valor: `+${v.crescimentoVsAnterior}%` },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">1. Visão executiva</h2>
      <p className="text-sm text-slate-500">Resumo inteligente — resposta em segundos.</p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-xs font-medium text-slate-500">{c.label}</p>
            <p className="text-base font-bold text-slate-800">{c.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600">
            <IconTrendingUp className="h-4 w-4" />
            Receita diária (30 dias)
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={receitaDiaria30.length > 0 ? receitaDiaria30 : padraoReceita30}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(1)}k`} />
                <Tooltip formatter={(v: number) => [formatBRL(v), "Receita"]} />
                <Line type="monotone" dataKey="valor" stroke="#166534" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600">
            <IconChart className="h-4 w-4" />
            Ocupação por dia da semana
          </p>
          {ocupacaoPorDiaSemanaPeriodo && (
            <p className="mb-2 text-xs text-slate-500">
              Período: {formatarPeriodo(ocupacaoPorDiaSemanaPeriodo.de, ocupacaoPorDiaSemanaPeriodo.ate)}
            </p>
          )}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ocupacaoPorDiaSemana.length > 0 ? ocupacaoPorDiaSemana : padraoOcupacao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => [v, "Ocupação %"]} />
                <Bar dataKey="ocupacao" fill="#166534" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Ver relatório detalhado
        </button>
      </div>
    </section>
  );
}
