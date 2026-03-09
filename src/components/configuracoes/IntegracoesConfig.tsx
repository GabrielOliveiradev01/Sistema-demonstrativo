"use client";

import type { IntegracaoConfig } from "@/lib/dados-paginas";

interface Props {
  data: IntegracaoConfig[];
  loading?: boolean;
}

export function IntegracoesConfig({ data: integracoes = [], loading }: Props) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">8. Integrações</h2>
      <p className="text-sm text-slate-500">API, webhooks, CRM, ERP, Google Calendar, Meta Ads. Chaves: gerar, revogar, monitorar.</p>
      <div className="space-y-3">
        {(loading ? [] : integracoes).map((i) => (
          <div key={i.id} className="card flex items-center justify-between">
            <span className="font-medium text-slate-800">{i.nome}</span>
            <div className="flex gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${i.ativo ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>{i.ativo ? "Ativo" : "Inativo"}</span>
              <button type="button" className="text-sm text-primary hover:underline">Configurar</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h4 className="mb-2 text-sm font-medium text-slate-600">Chaves de API</h4>
        <p className="mb-2 text-xs text-slate-500">Gerar, revogar e monitorar uso.</p>
        <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">Gerar chave</button>
      </div>
    </section>
  );
}
