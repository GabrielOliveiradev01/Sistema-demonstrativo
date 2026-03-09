"use client";

import { useState, useEffect } from "react";
import type { PerfilEmpresaData } from "@/lib/dados-paginas";
import { updatePerfilEmpresa } from "@/lib/dados-paginas";

interface Props {
  data: PerfilEmpresaData | null;
  loading?: boolean;
  onSaved?: () => void;
}

const VAZIO: PerfilEmpresaData = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  endereco: "",
  telefone: "",
  email: "",
  fusoHorario: "America/Sao_Paulo",
  idioma: "pt-BR",
};

export function PerfilEmpresa({ data, loading, onSaved }: Props) {
  const [form, setForm] = useState<PerfilEmpresaData>(VAZIO);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    setForm(data ?? VAZIO);
  }, [data]);

  function handleChange(campo: keyof PerfilEmpresaData, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSalvar() {
    if (!form.id) {
      setMsg({ tipo: "erro", texto: "Perfil não carregado." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const result = await updatePerfilEmpresa(form.id, {
        nomeFantasia: form.nomeFantasia,
        cnpj: form.cnpj,
        endereco: form.endereco,
        telefone: form.telefone,
        email: form.email,
        fusoHorario: form.fusoHorario,
      });
      if (result.ok) {
        setMsg({ tipo: "ok", texto: "Perfil salvo com sucesso." });
        onSaved?.();
      } else {
        setMsg({ tipo: "erro", texto: result.error ?? "Erro ao salvar." });
      }
    } catch {
      setMsg({ tipo: "erro", texto: "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  const p = form;

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">1. Perfil da empresa</h2>
      {msg && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${msg.tipo === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}
        >
          {msg.texto}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-600">Nome fantasia</label>
          <input
            type="text"
            value={p.nomeFantasia}
            onChange={(e) => handleChange("nomeFantasia", e.target.value)}
            placeholder="Nome da empresa"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Razão social</label>
          <input
            type="text"
            value={p.razaoSocial}
            onChange={(e) => handleChange("razaoSocial", e.target.value)}
            placeholder="Razão social"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">CNPJ</label>
          <input
            type="text"
            value={p.cnpj}
            onChange={(e) => handleChange("cnpj", e.target.value)}
            placeholder="00.000.000/0001-00"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            disabled={loading}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-600">Endereço</label>
          <input
            type="text"
            value={p.endereco}
            onChange={(e) => handleChange("endereco", e.target.value)}
            placeholder="Rua, número, bairro, cidade"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Telefone</label>
          <input
            type="text"
            value={p.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
            placeholder="(11) 3333-4444"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={p.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="contato@empresa.com.br"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Fuso horário</label>
          <select
            value={p.fusoHorario}
            onChange={(e) => handleChange("fusoHorario", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            disabled={loading}
          >
            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
            <option value="America/Manaus">Manaus (GMT-4)</option>
            <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Idioma</label>
          <select
            value={p.idioma}
            onChange={(e) => handleChange("idioma", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            disabled={loading}
          >
            <option value="pt-BR">Português (BR)</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSalvar}
        disabled={loading || saving || !p.id}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {saving ? "Salvando…" : "Salvar"}
      </button>
    </section>
  );
}
