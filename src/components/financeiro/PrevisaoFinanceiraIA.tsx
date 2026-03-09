"use client";

import type { PrevisaoFinanceiraIAData } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

interface Props {
  data: PrevisaoFinanceiraIAData | null;
  loading?: boolean;
}

export function PrevisaoFinanceiraIA({ data, loading }: Props) {
  const p = data ?? {
    receitaPrevistaFimMes: 0,
    riscoNaoBaterMeta: 0,
    projecaoTendencia: "—",
    melhorDiaPromocao: "—",
    melhorHorarioAumentoPreco: "—",
    confiancaPrevisao: 0,
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">6. Previsão financeira (IA)</h2>
      <p className="text-sm text-slate-500">
        Decisão estratégica: projeções e melhores momentos para ação.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card border-primary/20 bg-primary/5">
          <p className="text-xs font-medium text-slate-500">Receita prevista até fim do mês</p>
          <p className="text-xl font-bold text-primary">{formatBRL(p.receitaPrevistaFimMes)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Risco de não bater meta</p>
          <p className={`text-xl font-bold ${p.riscoNaoBaterMeta > 20 ? "text-amber-600" : "text-slate-800"}`}>
            {p.riscoNaoBaterMeta}%
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Projeção (tendência)</p>
          <p className="text-xl font-bold text-green-700">{p.projecaoTendencia}</p>
        </div>
        <div className="card border-amber-200 bg-amber-50/50">
          <p className="text-xs font-medium text-slate-500">Melhor dia para promoção</p>
          <p className="text-lg font-bold text-amber-800">{p.melhorDiaPromocao}</p>
        </div>
        <div className="card border-amber-200 bg-amber-50/50">
          <p className="text-xs font-medium text-slate-500">Melhor horário para aumento de preço</p>
          <p className="text-lg font-bold text-amber-800">{p.melhorHorarioAumentoPreco}</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium text-slate-700">
          Confiança da previsão: <strong className="text-primary">{p.confiancaPrevisao}%</strong>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Baseado em histórico, sazonalidade e agenda futura.
        </p>
      </div>
    </section>
  );
}
