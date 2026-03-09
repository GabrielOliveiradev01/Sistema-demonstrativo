"use client";

import type { PagamentosConfigData } from "@/lib/dados-paginas";

interface Props {
  data: PagamentosConfigData | null;
  loading?: boolean;
}

export function PagamentosConfig({ data, loading }: Props) {
  const p = data ?? {
    cartao: true,
    pix: true,
    dinheiro: true,
    linkPagamento: false,
    cobrancaAutomaticaSinal: false,
    multaCancelamento: 0,
    reembolsoAutomatico: false,
    parcelamentoMax: 1,
  };

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">5. Pagamentos</h2>
      <p className="text-sm text-slate-500">Integrações e regras. Webhook para integração externa.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h4 className="mb-3 text-sm font-medium text-slate-600">Formas aceitas</h4>
          <label className="flex items-center gap-2 py-1"><input type="checkbox" defaultChecked={p.cartao} /> Cartão</label>
          <label className="flex items-center gap-2 py-1"><input type="checkbox" defaultChecked={p.pix} /> PIX</label>
          <label className="flex items-center gap-2 py-1"><input type="checkbox" defaultChecked={p.dinheiro} /> Dinheiro</label>
          <label className="flex items-center gap-2 py-1"><input type="checkbox" defaultChecked={p.linkPagamento} /> Link de pagamento</label>
        </div>
        <div className="card space-y-3">
          <div><label className="block text-sm font-medium text-slate-600">Cobrança automática de sinal</label><input type="checkbox" defaultChecked={p.cobrancaAutomaticaSinal} className="mt-1" /></div>
          <div><label className="block text-sm font-medium text-slate-600">Multa por cancelamento (%)</label><input type="number" defaultValue={p.multaCancelamento} className="mt-1 w-20 rounded-lg border border-slate-200 px-2 py-1" /></div>
          <div><label className="block text-sm font-medium text-slate-600">Reembolso automático</label><input type="checkbox" defaultChecked={p.reembolsoAutomatico} className="mt-1" /></div>
          <div><label className="block text-sm font-medium text-slate-600">Parcelamento (máx. vezes)</label><input type="number" defaultValue={p.parcelamentoMax} className="mt-1 w-20 rounded-lg border border-slate-200 px-2 py-1" /></div>
        </div>
      </div>
      <div className="card">
        <h4 className="mb-2 text-sm font-medium text-slate-600">Webhook</h4>
        <input type="url" placeholder="https://seu-sistema.com/webhook" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      </div>
    </section>
  );
}
