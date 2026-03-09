"use client";

import type { ProfissionalListItem } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export type ComissoesData = {
  metaMediaPorProfissional: number;
  ocupacaoMediaGeral: number;
  ranking: { posicao: number; nome: string; receita: number }[];
};

interface ComissoesERentabilidadeProps {
  data?: ComissoesData | null;
  loading?: boolean;
}

export function ComissoesERentabilidade({ data, loading }: ComissoesERentabilidadeProps) {
  const ranking = data?.ranking ?? [];
  const metaMedia = data?.metaMediaPorProfissional ?? 0;
  const ocupacaoMedia = data?.ocupacaoMediaGeral ?? 0;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">5. Comissões e rentabilidade</h2>

      {loading ? (
        <p className="text-sm text-slate-500">Carregando…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card">
              <p className="text-xs font-medium text-slate-500">Meta média por profissional (mês)</p>
              <p className="text-lg font-bold text-primary">{formatBRL(metaMedia)}</p>
            </div>
            <div className="card">
              <p className="text-xs font-medium text-slate-500">Ocupação média geral</p>
              <p className="text-lg font-bold text-slate-800">{ocupacaoMedia}%</p>
            </div>
          </div>

          <div className="card">
            <p className="mb-3 text-sm font-medium text-slate-600">Ranking interno (receita do mês)</p>
            {ranking.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum dado no período.</p>
            ) : (
              <div className="space-y-2">
                {ranking.map((r) => (
                  <div
                    key={r.nome + r.posicao}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="font-medium text-slate-800">
                      #{r.posicao} {r.nome}
                    </span>
                    <span className="font-semibold text-primary">{formatBRL(r.receita)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
