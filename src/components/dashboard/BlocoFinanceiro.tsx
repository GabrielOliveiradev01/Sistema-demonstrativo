"use client";

import {
  IconCurrency,
  IconTrendingUp,
  IconTarget,
  IconChart,
  IconBanknotes,
  IconCalculator,
} from "@/components/SidebarIcons";
import type { ResumoFinanceiro } from "@/lib/dados-supabase";
import { IndicadorCircularMeta } from "./IndicadorCircularMeta";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);

const vazio: ResumoFinanceiro = {
  receitaMesConfirmada: 0,
  receitaPrevista: 0,
  metaMes: 0,
  metaAtingidaPercent: 0,
  crescimentoVsAnterior: 0,
  ticketMedio: 0,
  receitaPorHora: 0,
  graficoReceita: [],
};

export function BlocoFinanceiro({ data, loading }: { data: ResumoFinanceiro | null; loading?: boolean }) {
  const d = data ?? vazio;
  const metaOk = d.metaAtingidaPercent >= 90;
  const crescimentoPositivo = d.crescimentoVsAnterior >= 0;
  const grafico = d.graficoReceita?.length ? d.graficoReceita : [{ mes: "—", valor: 0 }];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">1. Bloco Financeiro</h2>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <CardFinanceiro titulo="Receita do mês (confirmada)" valor={formatBRL(d.receitaMesConfirmada)} positivo={true} Icon={IconCurrency} />
        <CardFinanceiro titulo="Receita prevista" valor={formatBRL(d.receitaPrevista)} positivo={d.metaMes === 0 || d.receitaPrevista >= d.metaMes} Icon={IconTrendingUp} />
        <CardFinanceiro titulo="Meta do mês" valor={`${d.metaAtingidaPercent.toFixed(1)}%`} positivo={metaOk} Icon={IconTarget} />
        <CardFinanceiro titulo="Crescimento vs mês anterior" valor={`${d.crescimentoVsAnterior >= 0 ? "+" : ""}${d.crescimentoVsAnterior.toFixed(1)}%`} positivo={crescimentoPositivo} Icon={IconChart} />
        <CardFinanceiro titulo="Ticket médio" valor={formatBRL(d.ticketMedio)} positivo={true} Icon={IconBanknotes} />
        <CardFinanceiro titulo="Receita por hora" valor={formatBRL(d.receitaPorHora)} positivo={true} Icon={IconCalculator} />
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="card flex flex-col items-center justify-center">
          <IndicadorCircularMeta percentual={d.metaAtingidaPercent} label="Meta do mês" />
        </div>
        <div className="card lg:col-span-3">
          <p className="mb-3 text-sm font-medium text-slate-600">Receita mensal (últimos 6 meses)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={grafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$ ${v}k`} />
                <Tooltip formatter={(v: number) => [`R$ ${v}k`, "Receita"]} />
                <Line type="monotone" dataKey="valor" stroke="#166534" strokeWidth={2} dot={{ fill: "#22c55e" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardFinanceiro({
  titulo,
  valor,
  positivo,
  Icon,
}: {
  titulo: string;
  valor: string;
  positivo: boolean;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={`card flex flex-col gap-1 ${
        positivo ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
      }`}
    >
      <Icon className="h-6 w-6 text-slate-600" />
      <p className="text-xs font-medium text-slate-500">{titulo}</p>
      <p
        className={`text-xl font-bold ${positivo ? "text-green-700" : "text-red-600"}`}
      >
        {valor}
      </p>
    </div>
  );
}
