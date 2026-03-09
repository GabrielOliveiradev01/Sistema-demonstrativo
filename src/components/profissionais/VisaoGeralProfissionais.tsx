"use client";

import {
  IconUsers,
  IconCurrency,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconTarget,
} from "@/components/SidebarIcons";
import type { VisaoGeralProf } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const vazio: VisaoGeralProf = {
  total: 0,
  receitaTotalMes: 0,
  maisRentavel: { nome: "—", valor: 0 },
  menorOcupacao: { nome: "—", ocupacao: 0 },
  ocupacaoMediaGeral: 0,
  metaMediaPorProfissional: 0,
};

interface VisaoGeralProfissionaisProps {
  data: VisaoGeralProf | null;
  loading?: boolean;
  onNovoProfissional?: () => void;
}

export function VisaoGeralProfissionais({ data, loading, onNovoProfissional }: VisaoGeralProfissionaisProps) {
  const d = data ?? vazio;
  const cards = [
    { Icon: IconUsers, titulo: "Total de profissionais", valor: d.total },
    { Icon: IconCurrency, titulo: "Receita total (mês)", valor: formatBRL(d.receitaTotalMes) },
    { Icon: IconTrendingUp, titulo: "Mais rentável", valor: d.maisRentavel.nome, sub: formatBRL(d.maisRentavel.valor) },
    { Icon: IconTrendingDown, titulo: "Menor ocupação", valor: d.menorOcupacao.nome, sub: `${d.menorOcupacao.ocupacao}%` },
    { Icon: IconClock, titulo: "Ocupação média geral", valor: `${d.ocupacaoMediaGeral}%` },
    { Icon: IconTarget, titulo: "Meta média por profissional", valor: formatBRL(d.metaMediaPorProfissional) },
  ];
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-800">1. Visão geral</h2>
        {onNovoProfissional && (
          <button
            type="button"
            onClick={onNovoProfissional}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Novo profissional
          </button>
        )}
      </div>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.titulo} className="card">
            <c.Icon className="h-6 w-6 text-slate-600" />
            <p className="mt-1 text-xs font-medium text-slate-500">{c.titulo}</p>
            <p className="text-lg font-bold text-slate-800">{c.valor}</p>
            {c.sub && <p className="text-sm text-primary font-medium">{c.sub}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
