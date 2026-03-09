"use client";

import type { ResumoClientes } from "@/lib/dados-supabase";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const vazio: ResumoClientes = {
  novosNoMes: 0,
  taxaRetorno: 0,
  emRiscoAbandono: 0,
  top5Valiosos: [],
};

export function BlocoClientes({ data, loading }: { data: ResumoClientes | null; loading?: boolean }) {
  const d = data ?? vazio;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">5. Bloco de Clientes</h2>
      {loading && <p className="text-sm text-slate-500">Carregando…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Novos clientes no mês</p>
          <p className="text-2xl font-bold text-primary">{d.novosNoMes}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Taxa de retorno</p>
          <p className="text-2xl font-bold text-primary">{d.taxaRetorno}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Clientes em risco de abandono</p>
          <p className="text-2xl font-bold text-amber-600">{d.emRiscoAbandono}</p>
        </div>
      </div>
      <div className="card">
        <p className="mb-3 text-sm font-medium text-slate-600">Top 5 clientes mais valiosos</p>
        <ul className="divide-y divide-slate-100">
          {d.top5Valiosos.length === 0 && (
            <li className="py-2 text-sm text-slate-500">Nenhum dado ainda.</li>
          )}
          {d.top5Valiosos.map((c, i) => (
            <li key={c.nome + i} className="flex items-center justify-between py-2 first:pt-0">
              <span className="font-medium text-slate-800">{i + 1}. {c.nome}</span>
              <span className="text-primary font-semibold">{formatBRL(c.valor)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
