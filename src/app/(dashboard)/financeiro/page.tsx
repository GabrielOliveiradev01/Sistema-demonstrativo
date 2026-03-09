"use client";

import { VisaoFinanceiraGeral } from "@/components/financeiro/VisaoFinanceiraGeral";
import { ReceitaPorPeriodo } from "@/components/financeiro/ReceitaPorPeriodo";
import { ReceitaPorUnidade } from "@/components/financeiro/ReceitaPorUnidade";
import { ReceitaPorHora } from "@/components/financeiro/ReceitaPorHora";
import { SinaisEPagamentos } from "@/components/financeiro/SinaisEPagamentos";
import { AlertasEAcoesFinanceiro } from "@/components/financeiro/AlertasEAcoesFinanceiro";
import { MetricasFundamentais } from "@/components/financeiro/MetricasFundamentais";
import { useFinanceiro } from "@/hooks/useFinanceiro";

export default function FinanceiroPage() {
  const {
    visaoGeral,
    receitaPeriodo,
    receitaPorUnidade,
    receitaPorHora,
    movimentosRecentes,
    alertas,
    metricasFundamentais,
    loading,
    error,
  } = useFinanceiro();

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="text-slate-500">
          Centro de previsibilidade — quanto ganhou, quanto vai ganhar, quanto está em risco e quem gera mais lucro
        </p>
      </header>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="mb-4 text-sm text-slate-500">Carregando…</p>}
      <div className="space-y-8">
        <VisaoFinanceiraGeral data={visaoGeral} loading={loading} />
        <ReceitaPorPeriodo data={receitaPeriodo} loading={loading} />
        <ReceitaPorUnidade data={receitaPorUnidade} loading={loading} />
        <ReceitaPorHora data={receitaPorHora} loading={loading} />
        <SinaisEPagamentos data={movimentosRecentes} loading={loading} />
        <AlertasEAcoesFinanceiro data={alertas} loading={loading} />
        <MetricasFundamentais data={metricasFundamentais} loading={loading} />
      </div>
    </div>
  );
}
