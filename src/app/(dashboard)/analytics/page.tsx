"use client";

import { VisaoExecutiva } from "@/components/analytics/VisaoExecutiva";
import { ReceitaLucratividade } from "@/components/analytics/ReceitaLucratividade";
import { ClientesAnalytics } from "@/components/analytics/ClientesAnalytics";
import { PerformanceOperacional } from "@/components/analytics/PerformanceOperacional";
import { RiscoPerdas } from "@/components/analytics/RiscoPerdas";
import { InsightsIA } from "@/components/analytics/InsightsIA";
import { Projecoes } from "@/components/analytics/Projecoes";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
  const {
    visaoExecutiva,
    clientesMetricas,
    rankingProfissionais,
    riscoPerdas,
    receitaLucratividade,
    receitaDiaria30,
    ocupacaoPorDiaSemana,
    ocupacaoPorDiaSemanaPeriodo,
    cancelamentosPorHorario,
    projecoes,
    insightsIA,
    loading,
    error,
  } = useAnalytics();

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500">
          O cérebro do sistema — decisão estratégica em 10 segundos: crescimento, onde perde, quem gera lucro, no-show e horário rentável
        </p>
      </header>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="mb-4 text-sm text-slate-500">Carregando…</p>}
      <div className="space-y-8">
        <VisaoExecutiva
          data={visaoExecutiva}
          receitaDiaria30={receitaDiaria30}
          ocupacaoPorDiaSemana={ocupacaoPorDiaSemana}
          ocupacaoPorDiaSemanaPeriodo={ocupacaoPorDiaSemanaPeriodo}
          loading={loading}
        />
        <ReceitaLucratividade data={receitaLucratividade} loading={loading} />
        <ClientesAnalytics data={clientesMetricas} loading={loading} />
        <PerformanceOperacional
          data={rankingProfissionais}
          cancelamentosPorHorario={cancelamentosPorHorario}
          loading={loading}
        />
        <RiscoPerdas data={riscoPerdas} loading={loading} />
        <InsightsIA insights={insightsIA} loading={loading} />
        <Projecoes data={projecoes} loading={loading} />
      </div>
    </div>
  );
}
