"use client";

import { BlocoFinanceiro } from "@/components/dashboard/BlocoFinanceiro";
import { BlocoOcupacao } from "@/components/dashboard/BlocoOcupacao";
import { BlocoRisco } from "@/components/dashboard/BlocoRisco";
import { BlocoIA } from "@/components/dashboard/BlocoIA";
import { BlocoClientes } from "@/components/dashboard/BlocoClientes";
import { BlocoAlertas } from "@/components/dashboard/BlocoAlertas";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { financeiro, ocupacao, risco, ia, clientes, loading, error } = useDashboard();

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Visão geral: dinheiro → ocupação → risco → inteligência → ação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Buscar..."
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Novo agendamento
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-4 flex items-center gap-2 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando dashboard…
        </div>
      )}

      <div className="space-y-10">
        <BlocoFinanceiro data={financeiro} loading={loading} />
        <BlocoOcupacao data={ocupacao} loading={loading} />
        <BlocoRisco data={risco} loading={loading} />
        <BlocoIA data={ia} loading={loading} />
        <BlocoClientes data={clientes} loading={loading} />
        <BlocoAlertas />
      </div>
    </div>
  );
}
