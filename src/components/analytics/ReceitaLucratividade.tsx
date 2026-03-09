"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnalyticsReceitaLucratividade } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

function heatmapColor(n: number) {
  if (n >= 5) return "bg-green-600 text-white";
  if (n >= 4) return "bg-green-500 text-white";
  if (n >= 3) return "bg-green-400 text-slate-800";
  if (n >= 2) return "bg-green-100 text-slate-700";
  return "bg-slate-100 text-slate-500";
}

const vazio: AnalyticsReceitaLucratividade = {
  receitaBruta: 0,
  receitaLiquida: 0,
  servicosLucrativos: [],
  evolucaoMensal: [],
  heatmapHorarios: [],
};

export function ReceitaLucratividade({ data, loading }: { data: AnalyticsReceitaLucratividade | null; loading?: boolean }) {
  const r = data ?? vazio;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">2. Receita & lucratividade</h2>
      <p className="text-sm text-slate-500">Onde eu ganho mais dinheiro?</p>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Receita bruta</p>
          <p className="text-xl font-bold text-primary">{formatBRL(r.receitaBruta)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Receita líquida</p>
          <p className="text-xl font-bold text-slate-800">{formatBRL(r.receitaLiquida)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <p className="mb-3 text-sm font-medium text-slate-600">Serviços mais lucrativos</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.servicosLucrativos.length > 0 ? r.servicosLucrativos : [{ nome: "—", valor: 0 }]} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="nome" width={90} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [formatBRL(v), "Receita"]} />
                <Bar dataKey="valor" fill="#166534" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <p className="mb-3 text-sm font-medium text-slate-600">Evolução mensal</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={r.evolucaoMensal.length > 0 ? r.evolucaoMensal : [{ mes: "—", valor: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatBRL(v), "Receita"]} />
                <Line type="monotone" dataKey="valor" stroke="#166534" strokeWidth={2} dot={{ fill: "#22c55e" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="mb-3 text-sm font-medium text-slate-600">Heatmap: horários mais rentáveis (1–5)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                <th className="p-1 font-medium text-slate-600">Horário</th>
                <th className="p-1 font-medium text-slate-600">Seg</th>
                <th className="p-1 font-medium text-slate-600">Ter</th>
                <th className="p-1 font-medium text-slate-600">Qua</th>
                <th className="p-1 font-medium text-slate-600">Qui</th>
                <th className="p-1 font-medium text-slate-600">Sex</th>
                <th className="p-1 font-medium text-slate-600">Sáb</th>
              </tr>
            </thead>
            <tbody>
              {(r.heatmapHorarios.length > 0 ? r.heatmapHorarios : [{ hora: "09h", seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0 }]).map((row) => (
                <tr key={row.hora}>
                  <td className="p-1 font-medium text-slate-600">{row.hora}</td>
                  <td className="p-1"><span className={`inline-flex h-8 w-8 items-center justify-center rounded ${heatmapColor(row.seg)}`}>{row.seg}</span></td>
                  <td className="p-1"><span className={`inline-flex h-8 w-8 items-center justify-center rounded ${heatmapColor(row.ter)}`}>{row.ter}</span></td>
                  <td className="p-1"><span className={`inline-flex h-8 w-8 items-center justify-center rounded ${heatmapColor(row.qua)}`}>{row.qua}</span></td>
                  <td className="p-1"><span className={`inline-flex h-8 w-8 items-center justify-center rounded ${heatmapColor(row.qui)}`}>{row.qui}</span></td>
                  <td className="p-1"><span className={`inline-flex h-8 w-8 items-center justify-center rounded ${heatmapColor(row.sex)}`}>{row.sex}</span></td>
                  <td className="p-1"><span className={`inline-flex h-8 w-8 items-center justify-center rounded ${heatmapColor(row.sab)}`}>{row.sab}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
