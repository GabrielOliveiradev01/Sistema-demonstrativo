"use client";

import { useState, useEffect } from "react";
import type { ProfissionalCreate } from "@/lib/dados-supabase";
import { criarLoginProfissional } from "@/lib/dados-paginas";

export type ProfissionalFormData = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cargo: string | null;
  especialidade: string | null;
  unidade_id: string | null;
  cor_agenda: string | null;
};

export type PerfilOption = { id: string; nome: string };

const CORES_AGENDA = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#ec4899"];

interface FormProfissionalProps {
  profissional: ProfissionalFormData | null;
  unidades: { id: string; nome: string }[];
  perfis: PerfilOption[];
  onSalvar: (payload: ProfissionalCreate, opcoes?: { profissionalJaCriado?: boolean }) => Promise<void>;
  onCancelar: () => void;
}

export function FormProfissional({ profissional, unidades, perfis = [], onSalvar, onCancelar }: FormProfissionalProps) {
  const isEdicao = !!profissional;
  const [nome, setNome] = useState(profissional?.nome ?? "");
  const [email, setEmail] = useState(profissional?.email ?? "");
  const [telefone, setTelefone] = useState(profissional?.telefone ?? "");
  const [cargo, setCargo] = useState(profissional?.cargo ?? "");
  const [especialidade, setEspecialidade] = useState(profissional?.especialidade ?? "");
  const [unidadeId, setUnidadeId] = useState(profissional?.unidade_id ?? "");
  const [corAgenda, setCorAgenda] = useState(profissional?.cor_agenda ?? "#22c55e");
  const [criarLogin, setCriarLogin] = useState(false);
  const [senha, setSenha] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (profissional) {
      setNome(profissional.nome);
      setEmail(profissional.email);
      setTelefone(profissional.telefone ?? "");
      setCargo(profissional.cargo ?? "");
      setEspecialidade(profissional.especialidade ?? "");
      setUnidadeId(profissional.unidade_id ?? "");
      setCorAgenda(profissional.cor_agenda ?? "#22c55e");
    }
  }, [profissional]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }
    if (!email.trim()) {
      setErro("E-mail é obrigatório.");
      return;
    }
    if (criarLogin && senha.length < 6) {
      setErro("Senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (criarLogin && !perfis.some((p) => p.nome.toLowerCase() === "profissional")) {
      setErro("Perfil Profissional não encontrado. Configure os perfis em Configurações.");
      return;
    }
    setSaving(true);
    try {
      if (isEdicao) {
        await onSalvar({
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim() || null,
          cargo: cargo.trim() || null,
          especialidade: especialidade.trim() || null,
          unidade_id: unidadeId || null,
          cor_agenda: corAgenda || null,
        });
      } else {
        const { createProfissional } = await import("@/lib/dados-supabase");
        const profId = await createProfissional({
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim() || null,
          cargo: cargo.trim() || null,
          especialidade: especialidade.trim() || null,
          unidade_id: unidadeId || null,
          cor_agenda: corAgenda || null,
        });
        if (criarLogin) {
          const perfilProfissional = perfis.find((p) => p.nome.toLowerCase() === "profissional");
          const result = await criarLoginProfissional({
            email: email.trim(),
            password: senha,
            nome: nome.trim(),
            perfilId: perfilProfissional?.id ?? null,
            profissionalId: profId,
          });
          if (!result.ok) {
            setErro(result.error ?? "Erro ao criar login.");
            setSaving(false);
            return;
          }
        }
        await onSalvar(
          {
            nome: nome.trim(),
            email: email.trim(),
            telefone: telefone.trim() || null,
            cargo: cargo.trim() || null,
            especialidade: especialidade.trim() || null,
            unidade_id: unidadeId || null,
            cor_agenda: corAgenda || null,
          },
          { profissionalJaCriado: true }
        );
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (isEdicao && !profissional) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Editar profissional</h3>
        <p className="text-sm text-slate-500">Carregando…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-800">{isEdicao ? "Editar profissional" : "Novo profissional"}</h3>
      {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <div>
        <label className="block text-xs font-medium text-slate-600">Nome *</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">E-mail *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Telefone</label>
        <input
          type="text"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Cargo</label>
        <input
          type="text"
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Especialidade</label>
        <input
          type="text"
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Ex: Cabelo, Unhas, Estética"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Unidade</label>
        <select
          value={unidadeId}
          onChange={(e) => setUnidadeId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Nenhuma</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Cor na agenda</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {CORES_AGENDA.map((cor) => (
            <button
              key={cor}
              type="button"
              onClick={() => setCorAgenda(cor)}
              className={`h-8 w-8 rounded-full border-2 ${corAgenda === cor ? "border-slate-800" : "border-slate-200"}`}
              style={{ backgroundColor: cor }}
              aria-label={cor}
            />
          ))}
        </div>
      </div>

      {!isEdicao && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={criarLogin}
              onChange={(e) => setCriarLogin(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">Criar acesso ao sistema (login com senha)</span>
          </label>
          {criarLogin && (
            <div>
              <label className="block text-xs font-medium text-slate-600">Senha inicial</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">Acesso com perfil Profissional (Agenda e Dashboard).</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Salvando…" : isEdicao ? "Salvar" : "Criar profissional"}
        </button>
        <button type="button" onClick={onCancelar} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}
