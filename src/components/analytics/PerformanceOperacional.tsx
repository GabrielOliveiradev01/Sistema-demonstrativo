"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsCancelamentosPorHorario } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

type RankingItem = { nome: string; ocupacao: number; noshow: number; receita: number };

interface PerformanceOperacionalProps {
  data?: RankingItem[];
  cancelamentosPorHorario?: AnalyticsCancelamentosPorHorario[];
  loading?: boolean;
}

export function PerformanceOperacional({ data = [], cancelamentosPorHorario = [], loading }: PerformanceOperacionalProps) {
  const cancelamentos = cancelamentosPorHorario.length > 0 ? cancelamentosPorHorario : [{ horario: "—", qtd: 0 }];
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">4. Performance operacional</h2>
      <p className="text-sm text-slate-500">Quem está performando melhor?</p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="card">
        <p className="mb-3 text-sm font-medium text-slate-600">Ranking de profissionais</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-2 text-left font-medium text-slate-600">#</th>
                <th className="p-2 text-left font-medium text-slate-600">Nome</th>
                <th className="p-2 text-left font-medium text-slate-600">Ocupação</th>
                <th className="p-2 text-left font-medium text-slate-600">No-show</th>
                <th className="p-2 text-left font-medium text-slate-600">Receita</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && !loading && <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhum dado ainda.</td></tr>}
              {data.map((p, i) => (
                <tr key={p.nome} className="border-b border-slate-100">
                  <td className="p-2 font-bold text-slate-400">{i + 1}</td>
                  <td className="p-2 font-medium text-slate-800">{p.nome}</td>
                  <td className="p-2"><span className={p.ocupacao >= 70 ? "text-green-600" : "text-amber-600"}>{p.ocupacao}%</span></td>
                  <td className="p-2"><span className={p.noshow >= 10 ? "text-red-600" : "text-slate-600"}>{p.noshow}%</span></td>
                  <td className="p-2 font-semibold text-primary">{formatBRL(p.receita)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <p className="mb-3 text-sm font-medium text-slate-600">Distribuição de cancelamentos por horário</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cancelamentos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="horario" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="qtd" fill="#dc2626" radius={[4, 4, 0, 0]} name="Cancelamentos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
