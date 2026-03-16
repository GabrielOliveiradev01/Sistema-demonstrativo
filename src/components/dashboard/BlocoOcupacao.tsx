"use client";

import type { ResumoOcupacao } from "@/lib/dados-supabase";

function formatarPeriodo(de: string, ate: string): string {
  const [y1, m1, d1] = de.split("-");
  const [y2, m2, d2] = ate.split("-");
  return `${d1}/${m1}/${y1} a ${d2}/${m2}/${y2}`;
}
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const vazio: ResumoOcupacao = {
  taxaOcupacaoMes: 0,
  taxaOcupacaoSemana: 0,
  profissionalMaisOcupado: { nome: "—", ocupacao: 0 },
  profissionalMenorOcupacao: { nome: "—", ocupacao: 0 },
  horariosOciososCriticos: [],
  graficoOcupacao: [{ dia: "Seg", ocupacao: 0 }, { dia: "Ter", ocupacao: 0 }, { dia: "Qua", ocupacao: 0 }, { dia: "Qui", ocupacao: 0 }, { dia: "Sex", ocupacao: 0 }, { dia: "Sáb", ocupacao: 0 }],
};

export function BlocoOcupacao({ data, loading }: { data: ResumoOcupacao | null; loading?: boolean }) {
  const d = data ?? vazio;
  const grafico = d.graficoOcupacao?.length ? d.graficoOcupacao : vazio.graficoOcupacao;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">2. Bloco de Ocupação</h2>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <p className="text-sm text-slate-500">Taxa de ocupação do mês</p>
          <p className="text-2xl font-bold text-primary">{d.taxaOcupacaoMes}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Ocupação da semana</p>
          <p className="text-2xl font-bold text-primary">{d.taxaOcupacaoSemana}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Profissional mais ocupado</p>
          <p className="text-lg font-bold text-slate-800">{d.profissionalMaisOcupado.nome}</p>
          <p className="text-primary font-semibold">{d.profissionalMaisOcupado.ocupacao}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Menor ocupação</p>
          <p className="text-lg font-bold text-slate-800">{d.profissionalMenorOcupacao.nome}</p>
          <p className="text-amber-600 font-semibold">{d.profissionalMenorOcupacao.ocupacao}%</p>
        </div>
        <div className="card flex flex-col justify-center">
          <button type="button" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark">
            Otimizar horários agora
          </button>
        </div>
      </div>
      {d.horariosOciososCriticos.length > 0 && (
        <div className="card">
          <p className="mb-3 text-sm font-medium text-slate-600">Horários ociosos críticos</p>
          <ul className="space-y-2">
            {d.horariosOciososCriticos.map((h, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
                <span><strong>{h.dia}</strong> {h.horario}</span>
                <span className="text-amber-700">{h.slots} slots vazios</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="card">
        <p className="mb-3 text-sm font-medium text-slate-600">Ocupação por dia da semana</p>
        {d.graficoOcupacaoPeriodo && (
          <p className="mb-2 text-xs text-slate-500">
            Período: {formatarPeriodo(d.graficoOcupacaoPeriodo.de, d.graficoOcupacaoPeriodo.ate)}
          </p>
        )}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => [v, "Ocupação %"]} />
              <Bar dataKey="ocupacao" fill="#166534" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
