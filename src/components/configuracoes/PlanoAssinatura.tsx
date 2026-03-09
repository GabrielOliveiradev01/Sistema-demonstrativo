"use client";

import type { PlanoAssinaturaData } from "@/lib/dados-paginas";

interface Props {
  data: PlanoAssinaturaData | null;
  loading?: boolean;
}

export function PlanoAssinatura({ data, loading }: Props) {
  const p = data ?? {
    nome: "Profissional",
    recursos: ["Agenda ilimitada", "Relatórios", "WhatsApp"],
    limites: { agendamentos: 500, clientes: 1000 },
    upgradeDisponivel: true,
  };

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">10. Plano e assinatura</h2>
      <p className="text-sm text-slate-500">Recursos liberados, limites e upgrade. Modelo SaaS.</p>
      <div className="card border-primary/20 bg-primary/5 max-w-lg">
        <h4 className="font-semibold text-slate-800">Plano atual: {p.nome}</h4>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {p.recursos.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Limites: {p.limites.agendamentos} agendamentos/mês, {p.limites.clientes} clientes
        </p>
        {p.upgradeDisponivel && (
          <button type="button" className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Fazer upgrade</button>
        )}
      </div>
      <div className="card max-w-lg">
        <h4 className="text-sm font-medium text-slate-600">Histórico de faturas</h4>
        <p className="mt-2 text-sm text-slate-500">Nenhuma fatura no momento.</p>
      </div>

      <div className="card max-w-2xl">
        <h4 className="mb-3 text-sm font-medium text-slate-600">Preview dos recursos</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">Visão Geral (Dashboard)</p>
            <img src="/dashboard.png" alt="Dashboard" className="h-auto w-full object-cover" />
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">Agenda</p>
            <img src="/agenda.png" alt="Agenda" className="h-auto w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
