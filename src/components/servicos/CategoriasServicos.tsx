"use client";

import { useState } from "react";
import type { CategoriaItem } from "@/lib/dados-paginas";

interface CategoriasServicosProps {
  categorias: CategoriaItem[];
  onAdicionar: (nome: string, cor: string, ordem: number) => Promise<void>;
}

export function CategoriasServicos({ categorias, onAdicionar }: CategoriasServicosProps) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#22c55e");
  const [ordem, setOrdem] = useState(categorias.length + 1);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || saving) return;
    setSaving(true);
    try {
      await onAdicionar(nome.trim(), cor, ordem);
      setNome("");
      setCor("#22c55e");
      setAberto(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">2. Categorias</h2>
      <p className="text-sm text-slate-500">
        Cor e ordem impactam calendário, página de agendamento e relatórios.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {categorias.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm"
          >
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.cor }} />
            <span className="font-medium text-slate-800">{c.nome}</span>
            <span className="text-xs text-slate-400">#{c.ordem}</span>
          </div>
        ))}
        {!aberto ? (
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-500 hover:border-primary hover:text-primary"
          >
            + Criar categoria
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <label className="block text-xs font-medium text-slate-500">Nome</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm" placeholder="Ex: Unhas" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Cor</label>
              <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="h-9 w-14 cursor-pointer rounded border border-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500">Ordem</label>
              <input type="number" min={1} value={ordem} onChange={(e) => setOrdem(Number(e.target.value))} className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
            </div>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60">{saving ? "Salvando..." : "Salvar"}</button>
            <button type="button" disabled={saving} onClick={() => setAberto(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">Cancelar</button>
          </form>
        )}
      </div>
    </section>
  );
}
