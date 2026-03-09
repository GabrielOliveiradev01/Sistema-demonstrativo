"use client";

import { METRICAS_SERVICO } from "@/lib/mock-servicos";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export function MetricasServico({ nomeServico }: { nomeServico: string }) {
  const m = METRICAS_SERVICO;
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">6. Métricas do serviço</h2>
      <p className="text-sm text-slate-500">Últimos 30 dias — {nomeServico}</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card"><p className="text-xs text-slate-500">Atendimentos</p><p className="text-xl font-bold text-slate-800">{m.atendimentos30Dias}</p></div>
        <div className="card"><p className="text-xs text-slate-500">Receita</p><p className="text-xl font-bold text-primary">{formatBRL(m.receita30Dias)}</p></div>
        <div className="card"><p className="text-xs text-slate-500">Ticket médio</p><p className="text-xl font-bold text-slate-800">{formatBRL(m.ticketMedio)}</p></div>
        <div className="card"><p className="text-xs text-slate-500">Ocupação média</p><p className="text-xl font-bold text-slate-800">{m.ocupacaoMedia}%</p></div>
      </div>
    </section>
  );
}
