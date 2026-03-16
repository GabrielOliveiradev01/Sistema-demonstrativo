"use client";

import { useState, useEffect, useMemo } from "react";
import type { ProfissionalCreate, HorarioProfissional } from "@/lib/dados-supabase";
import { createProfissional, saveProfissionaisHorarios } from "@/lib/dados-supabase";
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
  horarios?: HorarioProfissional[];
};

export type PerfilOption = { id: string; nome: string };

const CORES_AGENDA = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#ec4899"];

const DIAS_SEMANA = [
  { dia_semana: 1, label: "Segunda" },
  { dia_semana: 2, label: "Terça" },
  { dia_semana: 3, label: "Quarta" },
  { dia_semana: 4, label: "Quinta" },
  { dia_semana: 5, label: "Sexta" },
  { dia_semana: 6, label: "Sábado" },
  { dia_semana: 0, label: "Domingo" },
];

const DEFAULT_HORARIOS: HorarioProfissional[] = [
  { dia_semana: 0, abre: "09:00", fecha: "18:00", fechado: true },
  { dia_semana: 1, abre: "09:00", fecha: "18:00", fechado: false },
  { dia_semana: 2, abre: "09:00", fecha: "18:00", fechado: false },
  { dia_semana: 3, abre: "09:00", fecha: "18:00", fechado: false },
  { dia_semana: 4, abre: "09:00", fecha: "18:00", fechado: false },
  { dia_semana: 5, abre: "09:00", fecha: "18:00", fechado: false },
  { dia_semana: 6, abre: "09:00", fecha: "13:00", fechado: false },
];

interface FormProfissionalProps {
  profissional: ProfissionalFormData | null;
  unidades: { id: string; nome: string }[];
  perfis: PerfilOption[];
  onSalvar: (payload: ProfissionalCreate, opcoes?: { profissionalJaCriado?: boolean; profissionalId?: string; horarios?: HorarioProfissional[] }) => Promise<void>;
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
  const [horarios, setHorarios] = useState<HorarioProfissional[]>(DEFAULT_HORARIOS);

  useEffect(() => {
    if (profissional) {
      setNome(profissional.nome);
      setEmail(profissional.email);
      setTelefone(profissional.telefone ?? "");
      setCargo(profissional.cargo ?? "");
      setEspecialidade(profissional.especialidade ?? "");
      setUnidadeId(profissional.unidade_id ?? "");
      setCorAgenda(profissional.cor_agenda ?? "#22c55e");
      setHorarios(profissional.horarios?.length ? profissional.horarios : DEFAULT_HORARIOS);
    } else {
      setHorarios(DEFAULT_HORARIOS);
    }
  }, [profissional]);

  const resumoHorarios = useMemo(() => {
    const ativos = horarios.filter((h) => !h.fechado);
    if (ativos.length === 0) return "Este profissional não trabalha em nenhum dia.";
    const faixasStr = [...new Set(ativos.map((h) => `${h.abre}-${h.fecha}`))].join(", ");
    const diasLabel = DIAS_SEMANA.filter((d) => ativos.some((a) => a.dia_semana === d.dia_semana)).map((d) => d.label);
    const diasStr = diasLabel.length === 7 ? "todos os dias" : diasLabel.join(", ");
    return `Este profissional trabalha ${faixasStr}, ${diasStr}.`;
  }, [horarios]);

  const getSlotsPorDia = (dia_semana: number) => {
    const fechado = horarios.find((h) => h.dia_semana === dia_semana && h.fechado);
    const slots = horarios.filter((h) => h.dia_semana === dia_semana && !h.fechado).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    return { fechado: !!fechado, slots };
  };

  const setTrabalha = (dia_semana: number, trabalha: boolean) => {
    setHorarios((prev) => {
      const outros = prev.filter((h) => h.dia_semana !== dia_semana);
      if (!trabalha) return [...outros, { dia_semana, abre: "09:00", fecha: "18:00", fechado: true }];
      const slotsExistentes = prev.filter((h) => h.dia_semana === dia_semana && !h.fechado);
      if (slotsExistentes.length > 0) return outros.concat(slotsExistentes);
      return [...outros, { dia_semana, abre: "09:00", fecha: "18:00", fechado: false }];
    });
  };

  const updateSlot = (dia_semana: number, slotIdx: number, upd: Partial<HorarioProfissional>) => {
    setHorarios((prev) => {
      const slots = prev.filter((h) => h.dia_semana === dia_semana && !h.fechado).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
      const outros = prev.filter((h) => !(h.dia_semana === dia_semana && !h.fechado));
      const novo = [...slots];
      if (novo[slotIdx]) novo[slotIdx] = { ...novo[slotIdx], ...upd };
      return outros.concat(novo.map((s, i) => ({ ...s, ordem: i })));
    });
  };

  const addSlot = (dia_semana: number) => {
    setHorarios((prev) => {
      const slots = prev.filter((h) => h.dia_semana === dia_semana && !h.fechado);
      const outros = prev.filter((h) => !(h.dia_semana === dia_semana && !h.fechado));
      return [...outros, ...slots, { dia_semana, abre: "16:00", fecha: "20:00", fechado: false, ordem: slots.length }];
    });
  };

  const removeSlot = (dia_semana: number, slotIdx: number) => {
    setHorarios((prev) => {
      const slots = prev.filter((h) => h.dia_semana === dia_semana && !h.fechado).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
      const outros = prev.filter((h) => !(h.dia_semana === dia_semana && !h.fechado));
      const novo = slots.filter((_, i) => i !== slotIdx);
      return outros.concat(novo.map((s, i) => ({ ...s, ordem: i })));
    });
  };

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
      if (isEdicao && profissional) {
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
          { horarios, profissionalId: profissional.id }
        );
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
          { profissionalJaCriado: true, profissionalId: profId, horarios }
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

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <label className="block text-xs font-medium text-slate-600">Dias e horários de trabalho</label>
        <p className="text-xs text-slate-500">Adicione múltiplas faixas por dia (ex: 12:30-14:00 e 16:00-20:00)</p>
        <div className="space-y-4">
          {DIAS_SEMANA.map((dia) => {
            const { fechado, slots } = getSlotsPorDia(dia.dia_semana);
            const trabalha = !fechado && (slots.length > 0 || horarios.some((h) => h.dia_semana === dia.dia_semana));
            const slotsParaExibir = slots.length > 0 ? slots : [{ abre: "09:00", fecha: "18:00", fechado: false } as HorarioProfissional];
            return (
              <div key={dia.dia_semana} className="rounded-lg border border-slate-200 bg-white p-3">
                <label className="mb-2 flex min-w-[100px] items-center gap-2">
                  <input
                    type="checkbox"
                    checked={trabalha}
                    onChange={(e) => setTrabalha(dia.dia_semana, e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium">{dia.label}</span>
                </label>
                {trabalha ? (
                  <div className="space-y-2 pl-6">
                    {slotsParaExibir.map((slot, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2">
                        <input
                          type="time"
                          value={slot.abre}
                          onChange={(e) => updateSlot(dia.dia_semana, idx, { abre: e.target.value })}
                          className="rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                        <span className="text-slate-500">às</span>
                        <input
                          type="time"
                          value={slot.fecha}
                          onChange={(e) => updateSlot(dia.dia_semana, idx, { fecha: e.target.value })}
                          className="rounded border border-slate-200 px-2 py-1 text-sm"
                        />
                        {slotsParaExibir.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(dia.dia_semana, idx)}
                            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSlot(dia.dia_semana)}
                      className="text-xs text-primary hover:underline"
                    >
                      + Adicionar outra faixa
                    </button>
                  </div>
                ) : (
                  <p className="pl-6 text-sm text-slate-400">Não trabalha</p>
                )}
              </div>
            );
          })}
        </div>
        <p className="rounded bg-white px-3 py-2 text-sm text-slate-700">{resumoHorarios}</p>
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
