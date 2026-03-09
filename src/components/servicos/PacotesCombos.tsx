"use client";

import { useMemo, useState } from "react";
import type { PacoteComboItem, ServicoListItem } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

interface PacotesCombosProps {
  pacotes: PacoteComboItem[];
  servicos: ServicoListItem[];
  onCriarPacote: (payload: { nome: string; valorTotal: number; servicoIds: string[] }) => Promise<void>;
}

export function PacotesCombos({ pacotes, servicos, onCriarPacote }: PacotesCombosProps) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [valorTotal, setValorTotal] = useState(0);
  const [servicoIds, setServicoIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const servicosById = useMemo(() => new Map(servicos.map((s) => [s.id, s])), [servicos]);

  const toggleServico = (id: string) => {
    setServicoIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCriar = async () => {
    if (!nome.trim() || servicoIds.length === 0 || saving) return;
    setSaving(true);
    try {
      await onCriarPacote({ nome: nome.trim(), valorTotal, servicoIds });
      setNome("");
      setValorTotal(0);
      setServicoIds([]);
      setAberto(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">4. Pacotes / Combos</h2>
      <p className="text-sm text-slate-500">
        Vários serviços, preço fechado, duração somada, comissão dividida.
      </p>
      <div className="space-y-3">
        {pacotes.map((p) => (
          <div key={p.id} className="card flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-800">{p.nome}</p>
              <p className="text-sm text-slate-500">{p.servicos.map((s) => `${s.nome}${s.quantidade > 1 ? ` x${s.quantidade}` : ""}`).join(" + ")}</p>
              <p className="mt-1 text-xs text-slate-500">{p.duracaoTotal} min total</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{formatBRL(p.precoFechado)}</p>
              <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${p.ativo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {p.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        ))}
        {!pacotes.length && <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">Nenhum combo cadastrado.</p>}
      </div>
      {!aberto ? (
        <button type="button" onClick={() => setAberto(true)} className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-500 hover:border-primary hover:text-primary">
          + Criar pacote
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Nome do combo</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">Preço fechado</label>
              <input type="number" min={0} value={valorTotal} onChange={(e) => setValorTotal(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <p className="mb-2 mt-4 text-sm font-medium text-slate-600">Serviços do combo</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {servicos.map((s) => (
              <label key={s.id} className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={servicoIds.includes(s.id)} onChange={() => toggleServico(s.id)} />
                <span>{s.nome}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Duração total estimada: {servicoIds.reduce((sum, id) => sum + (servicosById.get(id)?.duracao ?? 0), 0)} min
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" disabled={saving} onClick={handleCriar} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? "Salvando..." : "Salvar combo"}
            </button>
            <button type="button" disabled={saving} onClick={() => setAberto(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
