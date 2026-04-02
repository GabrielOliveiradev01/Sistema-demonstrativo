"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createComprovantePagamento,
  fetchComprovantesPagamento,
  updateComprovantePagamento,
  type ComprovantePagamento,
  type StatusComprovantePagamento,
} from "@/lib/dados-supabase";

function formatMoney(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function statusLabel(s: StatusComprovantePagamento) {
  return s === "pagamento_feito" ? "Pagamento Feito" : "Não realizada";
}

export default function ComprovantesPage() {
  const [rows, setRows] = useState<ComprovantePagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form
  const [agendamentoId, setAgendamentoId] = useState("");
  const [dataPagamento, setDataPagamento] = useState(() => new Date().toISOString().slice(0, 16));
  const [status, setStatus] = useState<StatusComprovantePagamento>("pagamento_feito");
  const [valorRealizado, setValorRealizado] = useState<string>("");
  const [valorComprovante, setValorComprovante] = useState<string>("");
  const [descricao, setDescricao] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchComprovantesPagamento(300);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar comprovantes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const canSubmit = useMemo(() => agendamentoId.trim().length > 0 && !saving, [agendamentoId, saving]);

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Comprovantes</h1>
        <p className="text-slate-500">Registro de pagamentos vinculados a agendamentos.</p>
      </header>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">ID do agendamento</label>
          <input
            value={agendamentoId}
            onChange={(e) => setAgendamentoId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="UUID do agendamento"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Data do pagamento</label>
          <input
            type="datetime-local"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusComprovantePagamento)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="pagamento_feito">Pagamento Feito</option>
            <option value="nao_realizada">Não realizada</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Valor realizado</label>
          <input
            inputMode="decimal"
            value={valorRealizado}
            onChange={(e) => setValorRealizado(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ex: 240"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Valor do comprovante</label>
          <input
            inputMode="decimal"
            value={valorComprovante}
            onChange={(e) => setValorComprovante(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ex: 240"
          />
        </div>
        <div className="lg:col-span-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">Descrição do pagamento</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="min-h-[80px] w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ex: PIX - Banco X - comprovante enviado pelo WhatsApp"
          />
        </div>

        <div className="lg:col-span-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={async () => {
              setSaving(true);
              setError(null);
              try {
                const iso = dataPagamento ? new Date(dataPagamento).toISOString() : new Date().toISOString();
                await createComprovantePagamento({
                  agendamento_id: agendamentoId.trim(),
                  data_pagamento: iso,
                  status,
                  valor_realizado: valorRealizado.trim() ? Number(valorRealizado) : null,
                  valor_comprovante: valorComprovante.trim() ? Number(valorComprovante) : null,
                  descricao: descricao.trim() ? descricao.trim() : null,
                });
                setAgendamentoId("");
                setValorRealizado("");
                setValorComprovante("");
                setDescricao("");
                await load();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Erro ao salvar comprovante");
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar comprovante"}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Atualizar lista
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Últimos comprovantes</h2>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-slate-500">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">Nenhum comprovante cadastrado.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Valor realizado</th>
                  <th className="px-4 py-3 text-left font-medium">Valor comprovante</th>
                  <th className="px-4 py-3 text-left font-medium">Agendamento</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-800">
                      {new Date(r.data_pagamento).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{formatMoney(r.valor_realizado)}</td>
                    <td className="px-4 py-3 text-slate-800">{formatMoney(r.valor_comprovante)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {r.agendamento_id}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.descricao ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={async () => {
                          const next = r.status === "pagamento_feito" ? "nao_realizada" : "pagamento_feito";
                          try {
                            await updateComprovantePagamento(r.id, { status: next });
                            await load();
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Erro ao atualizar status");
                          }
                        }}
                      >
                        Alternar status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

