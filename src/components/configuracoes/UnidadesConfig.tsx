"use client";

import { useState, useEffect } from "react";
import type { UnidadeConfig, UsuarioConfig } from "@/lib/dados-paginas";
import { updateUnidadeResponsavel } from "@/lib/dados-paginas";
import { fetchSalasPorUnidade, createSala, updateSala } from "@/lib/dados-supabase";

const formatBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

type SalaItem = { id: string; nome: string; descricao: string | null; ativa: boolean; ordem: number };

interface Props {
  data: UnidadeConfig[];
  usuarios: UsuarioConfig[];
  loading?: boolean;
  onSaved?: () => void;
}

export function UnidadesConfig({ data: unidades = [], usuarios = [], loading, onSaved }: Props) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [salasPorUnidade, setSalasPorUnidade] = useState<Record<string, SalaItem[]>>({});
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [formNovaSala, setFormNovaSala] = useState<string | null>(null);
  const [nomeNovaSala, setNomeNovaSala] = useState("");
  const [savingSala, setSavingSala] = useState(false);

  useEffect(() => {
    if (!unidades.length) return;
    Promise.all(unidades.map((u) => fetchSalasPorUnidade(u.id)))
      .then((results) => {
        const map: Record<string, SalaItem[]> = {};
        unidades.forEach((u, i) => {
          map[u.id] = (results[i] ?? []) as SalaItem[];
        });
        setSalasPorUnidade(map);
      })
      .catch(() => {});
  }, [unidades]);

  useEffect(() => {
    if (unidades.length >= 1 && (!expandidoId || !unidades.some((u) => u.id === expandidoId)))
      setExpandidoId(unidades[0].id);
  }, [unidades]);

  async function handleResponsavelChange(unidadeId: string, responsavelId: string) {
    setSavingId(unidadeId);
    try {
      await updateUnidadeResponsavel(unidadeId, responsavelId || null);
      onSaved?.();
    } finally {
      setSavingId(null);
    }
  }

  async function handleCriarSala(unidadeId: string) {
    if (!nomeNovaSala.trim()) return;
    setSavingSala(true);
    try {
      await createSala({ unidade_id: unidadeId, nome: nomeNovaSala.trim() });
      const list = await fetchSalasPorUnidade(unidadeId);
      setSalasPorUnidade((prev) => ({ ...prev, [unidadeId]: list as SalaItem[] }));
      setFormNovaSala(null);
      setNomeNovaSala("");
      onSaved?.();
    } finally {
      setSavingSala(false);
    }
  }

  async function handleToggleAtiva(sala: SalaItem, unidadeId: string) {
    setSavingSala(true);
    try {
      await updateSala(sala.id, { ativa: !sala.ativa });
      const list = await fetchSalasPorUnidade(unidadeId);
      setSalasPorUnidade((prev) => ({ ...prev, [unidadeId]: list as SalaItem[] }));
      onSaved?.();
    } finally {
      setSavingSala(false);
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">2. Salas</h2>
      <p className="text-sm text-slate-500">
        Cadastre as salas de atendimento do seu consultório para usar na agenda e nos agendamentos.
      </p>
      <div className="space-y-4">
        {(loading ? [] : unidades).map((u) => {
          const salas = salasPorUnidade[u.id] ?? [];
          const expandido = expandidoId === u.id;
          const mostrarFormNova = formNovaSala === u.id;
          const unicaUnidade = unidades.length === 1;

          return (
            <div key={u.id} className="card">
              {!unicaUnidade && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{u.nome}</p>
                    <p className="text-sm text-slate-500">{u.endereco || "—"}</p>
                    <p className="text-sm font-medium text-primary">Meta mensal: {formatBRL(u.metaMensal)}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600">Responsável:</label>
                      <select
                        value={u.responsavelId ?? ""}
                        onChange={(e) => handleResponsavelChange(u.id, e.target.value)}
                        disabled={savingId === u.id}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      >
                        <option value="">— Nenhum —</option>
                        {usuarios.filter((us) => us.ativo).map((us) => (
                          <option key={us.id} value={us.id}>
                            {us.nome} ({us.perfilNome ?? "—"})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandidoId(expandido ? null : u.id)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      {expandido ? "Ocultar salas" : "Salas"}
                      {salas.length > 0 && <span className="ml-1 rounded bg-slate-200 px-1.5 text-xs">{salas.length}</span>}
                    </button>
                  </div>
                </div>
              )}

              {(expandido || unicaUnidade) && (
                <div className={unicaUnidade ? "" : "mt-4 border-t border-slate-200 pt-4"}>
                  {!unicaUnidade && (
                    <>
                      <h4 className="mb-3 text-sm font-medium text-slate-600">Salas desta unidade</h4>
                      <p className="mb-3 text-xs text-slate-500">
                        Cadastre as salas de atendimento para usar na agenda e nos agendamentos.
                      </p>
                    </>
                  )}
                  <ul className="mb-3 space-y-2">
                    {salas.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm"
                      >
                        <span className={s.ativa ? "font-medium text-slate-800" : "text-slate-500 line-through"}>
                          {s.nome}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${s.ativa ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"}`}
                          >
                            {s.ativa ? "Ativa" : "Inativa"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleAtiva(s, u.id)}
                            disabled={savingSala}
                            className="text-xs text-primary hover:underline"
                          >
                            {s.ativa ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </li>
                    ))}
                    {salas.length === 0 && !mostrarFormNova && (
                      <li className="rounded-lg border border-dashed border-slate-300 py-4 text-center text-sm text-slate-500">
                        {unicaUnidade
                          ? "Nenhuma sala cadastrada. Adicione salas para organizar seus atendimentos na agenda."
                          : "Nenhuma sala cadastrada. Clique em \"+ Nova sala\" para adicionar."}
                      </li>
                    )}
                  </ul>
                  {mostrarFormNova ? (
                    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="min-w-[200px] flex-1">
                        <label className="block text-xs font-medium text-slate-600">Nome da sala</label>
                        <input
                          type="text"
                          value={nomeNovaSala}
                          onChange={(e) => setNomeNovaSala(e.target.value)}
                          placeholder="Ex: Sala 1, Consultório A"
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCriarSala(u.id)}
                          disabled={savingSala || !nomeNovaSala.trim()}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                        >
                          {savingSala ? "Salvando…" : "Salvar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormNovaSala(null);
                            setNomeNovaSala("");
                          }}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFormNovaSala(u.id)}
                      className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:border-primary hover:text-primary"
                    >
                      + Nova sala
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
