"use client";

import {
  IconUsers,
  IconPlus,
  IconArrowsRightLeft,
  IconSparkles,
  IconExclamation,
  IconCurrency,
} from "@/components/SidebarIcons";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export type MetricasClientesData = {
  total: number;
  novosNoMes: number;
  taxaRetorno: number;
  ativos: number;
  emRisco: number;
  ltvMedio: number;
  tempoMedioEntreVisitas: number;
  taxaReativacao: number;
  churnRate: number;
};

export type ReceitaPorSegmentoItem = { segmento: string; receita: number };

interface VisaoGeralClientesProps {
  metricas: MetricasClientesData;
  receitaPorSegmento: ReceitaPorSegmentoItem[];
  loading?: boolean;
  onCriarCampanhaReativacao: () => void;
  onNovoCliente?: () => void;
}

export function VisaoGeralClientes({
  metricas,
  receitaPorSegmento,
  loading,
  onCriarCampanhaReativacao,
  onNovoCliente,
}: VisaoGeralClientesProps) {
  const m = metricas;

  const cards = [
    { Icon: IconUsers, titulo: "Total de clientes", valor: m.total.toLocaleString("pt-BR") },
    { Icon: IconPlus, titulo: "Novos no mês", valor: m.novosNoMes.toString() },
    { Icon: IconArrowsRightLeft, titulo: "Taxa de retorno", valor: `${m.taxaRetorno}%` },
    { Icon: IconSparkles, titulo: "Clientes ativos", valor: m.ativos.toLocaleString("pt-BR") },
    { Icon: IconExclamation, titulo: "Clientes em risco", valor: m.emRisco.toString(), destaque: true },
    { Icon: IconCurrency, titulo: "LTV médio", valor: formatBRL(m.ltvMedio) },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-800">1. Visão geral</h2>
        {onNovoCliente && (
          <button
            type="button"
            onClick={onNovoCliente}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            + Novo cliente
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando métricas…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {cards.map((c) => (
              <div
                key={c.titulo}
                className={`card ${c.destaque ? "border-amber-200 bg-amber-50/50" : ""}`}
              >
                <c.Icon className="h-6 w-6 text-slate-600" />
                <p className="mt-1 text-xs font-medium text-slate-500">{c.titulo}</p>
                <p className={`text-lg font-bold ${c.destaque ? "text-amber-700" : "text-slate-800"}`}>
                  {c.valor}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <span><strong className="text-slate-600">Tempo médio entre visitas:</strong> {m.tempoMedioEntreVisitas} dias</span>
              <span><strong className="text-slate-600">Taxa de reativação:</strong> {m.taxaReativacao}%</span>
              <span><strong className="text-slate-600">Churn rate:</strong> {m.churnRate}%</span>
            </div>
            <button
              type="button"
              onClick={onCriarCampanhaReativacao}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Criar campanha de reativação
            </button>
          </div>
          <div className="card">
            <p className="mb-2 text-sm font-medium text-slate-600">Receita por segmento (LTV)</p>
            <div className="flex flex-wrap gap-4">
              {receitaPorSegmento.length === 0 && (
                <p className="text-sm text-slate-500">Nenhum segmento com dados.</p>
              )}
              {receitaPorSegmento.map((s) => (
                <div key={s.segmento} className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-xs text-slate-500">{s.segmento}</span>
                  <p className="font-semibold text-slate-800">{formatBRL(s.receita)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
