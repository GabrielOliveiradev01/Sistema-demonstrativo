"use client";

import { useState } from "react";
import type { MovimentoFinanceiro, StatusPagamento } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

const statusConfig: Record<StatusPagamento, string> = {
  sinal: "bg-blue-100 text-blue-800",
  pendente: "bg-amber-100 text-amber-800",
  confirmado: "bg-green-100 text-green-800",
  reembolso: "bg-slate-100 text-slate-700",
  cancelado: "bg-red-100 text-red-800",
};

interface Props {
  data: MovimentoFinanceiro[];
  loading?: boolean;
}

export function SinaisEPagamentos({ data: movimentos = [], loading }: Props) {
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusPagamento | "">("");

  const filtrados = movimentos.filter((m) => {
    if (filtroCliente && !m.cliente.toLowerCase().includes(filtroCliente.toLowerCase())) return false;
    if (filtroStatus && m.status !== filtroStatus) return false;
    return true;
  });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">5. Sinais e pagamentos</h2>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filtrar por cliente"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus((e.target.value || "") as StatusPagamento | "")}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="sinal">Sinal</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="reembolso">Reembolso</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <span className="text-sm text-slate-500">Período: último mês</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-3 text-left font-medium text-slate-600">Data</th>
              <th className="p-3 text-left font-medium text-slate-600">Cliente</th>
              <th className="p-3 text-left font-medium text-slate-600">Profissional</th>
              <th className="p-3 text-left font-medium text-slate-600">Serviço</th>
              <th className="p-3 text-left font-medium text-slate-600">Valor</th>
              <th className="p-3 text-left font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Carregando…
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  Nenhum movimento no período.
                </td>
              </tr>
            ) : (
              filtrados.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 text-slate-600">{formatDate(m.data)}</td>
                <td className="p-3 font-medium text-slate-800">{m.cliente}</td>
                <td className="p-3 text-slate-600">{m.profissional}</td>
                <td className="p-3 text-slate-600">{m.servico}</td>
                <td className="p-3 font-semibold text-slate-800">{formatBRL(m.valor)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusConfig[m.status]}`}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
