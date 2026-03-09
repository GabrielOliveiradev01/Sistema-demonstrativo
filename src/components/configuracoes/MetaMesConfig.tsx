"use client";

import { useState, useEffect } from "react";
import { fetchMetaMesConfig, upsertMetaMes, fetchReceitaMes } from "@/lib/dados-paginas";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

interface Props {
  data: { valorMeta: number; ano: number; mes: number } | null;
  loading?: boolean;
  onSaved?: () => void;
}

export function MetaMesConfig({ data, loading: loadingProp, onSaved }: Props) {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [valorMeta, setValorMeta] = useState(0);
  const [receitaMes, setReceitaMes] = useState<number | null>(null);
  const [receitaAnterior, setReceitaAnterior] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const isMesAtual = ano === now.getFullYear() && mes === now.getMonth() + 1;
  const isMesPassado = ano < now.getFullYear() || (ano === now.getFullYear() && mes < now.getMonth() + 1);
  const percentualAtingido = valorMeta > 0 && receitaMes != null ? Math.min(100, (receitaMes / valorMeta) * 100) : 0;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchMetaMesConfig(ano, mes),
      fetchReceitaMes(ano, mes),
      mes > 1 ? fetchReceitaMes(ano, mes - 1) : fetchReceitaMes(ano - 1, 12),
    ])
      .then(([meta, rec, recAnt]) => {
        setValorMeta(meta?.valorMeta ?? 0);
        setReceitaMes(rec);
        setReceitaAnterior(recAnt);
      })
      .finally(() => setLoading(false));
  }, [ano, mes]);

  useEffect(() => {
    if (data && data.ano === ano && data.mes === mes) {
      setValorMeta(data.valorMeta);
    }
  }, [data, ano, mes]);

  async function handleSalvar() {
    setErro("");
    setSucesso(false);
    if (valorMeta < 0) {
      setErro("A meta deve ser um valor positivo.");
      return;
    }
    setSaving(true);
    try {
      const result = await upsertMetaMes(valorMeta, ano, mes);
      if (result.ok) {
        setSucesso(true);
        onSaved?.();
        setTimeout(() => setSucesso(false), 3000);
      } else {
        setErro(result.error ?? "Erro ao salvar");
      }
    } finally {
      setSaving(false);
    }
  }

  function usarReceitaAnterior() {
    if (receitaAnterior != null) {
      setValorMeta(Math.round(receitaAnterior));
    }
  }

  function usarReceitaAnteriorMais10() {
    if (receitaAnterior != null) {
      setValorMeta(Math.round(receitaAnterior * 1.1));
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Definir meta de receita</h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure a meta financeira para acompanhar o desempenho no dashboard, financeiro e indicadores de risco.
        </p>
      </div>

      {(loading || loadingProp) && (
        <div className="flex items-center gap-2 text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando…
        </div>
      )}

      <div className="card max-w-lg space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-600">Ano</label>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600">Mês</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {MESES.map((nome, i) => (
                <option key={i} value={i + 1}>{nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600">Meta de receita (R$)</label>
          <input
            type="number"
            min={0}
            step={100}
            value={valorMeta || ""}
            onChange={(e) => setValorMeta(Number(e.target.value) || 0)}
            placeholder="Ex: 50000"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {receitaAnterior != null && receitaAnterior > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={usarReceitaAnterior}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Usar mês anterior ({formatBRL(receitaAnterior)})
            </button>
            <button
              type="button"
              onClick={usarReceitaAnteriorMais10}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Mês anterior +10% ({formatBRL(receitaAnterior * 1.1)})
            </button>
          </div>
        )}

        {(isMesAtual || isMesPassado) && receitaMes != null && valorMeta > 0 && (
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-600">Progresso</span>
              <span className="font-medium text-slate-800">
                {formatBRL(receitaMes)} / {formatBRL(valorMeta)} ({percentualAtingido.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${
                  percentualAtingido >= 100 ? "bg-green-600" : percentualAtingido >= 90 ? "bg-primary" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, percentualAtingido)}%` }}
              />
            </div>
          </div>
        )}

        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {sucesso && <p className="text-sm font-medium text-green-600">Meta salva com sucesso.</p>}

        <button
          type="button"
          onClick={handleSalvar}
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar meta"}
        </button>
      </div>
    </section>
  );
}
