"use client";

import { PainelInsights } from "@/components/inteligencia/PainelInsights";
import { MotorRisco } from "@/components/inteligencia/MotorRisco";
import { OtimizadorOcupacao } from "@/components/inteligencia/OtimizadorOcupacao";
import { PrevisaoReceita } from "@/components/inteligencia/PrevisaoReceita";
import { BenchmarkInterno } from "@/components/inteligencia/BenchmarkInterno";
import { AcoesAutomatizadas } from "@/components/inteligencia/AcoesAutomatizadas";
import { InteligenciaAplicada } from "@/components/inteligencia/InteligenciaAplicada";
import { useInteligencia } from "@/hooks/useInteligencia";

export default function InteligenciaPage() {
  const { painelInsights, loading, error } = useInteligencia();

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Inteligência</h1>
        <p className="text-slate-500">
          Central de decisão e otimização — onde perder menos, ganhar mais e o que o sistema recomenda
        </p>
      </header>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="mb-4 text-sm text-slate-500">Carregando…</p>}
      <div className="space-y-8">
        <PainelInsights data={painelInsights} loading={loading} />
        <InteligenciaAplicada />
        <MotorRisco />
        <OtimizadorOcupacao />
        <PrevisaoReceita />
        <BenchmarkInterno />
        <AcoesAutomatizadas />
      </div>
    </div>
  );
}
