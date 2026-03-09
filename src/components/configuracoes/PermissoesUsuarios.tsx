"use client";

import { useState } from "react";
import type { PerfilPermissao, UsuarioConfig } from "@/lib/dados-paginas";
import { updateUsuarioPerfil, createUsuario } from "@/lib/dados-paginas";

interface Props {
  data: PerfilPermissao[];
  usuarios: UsuarioConfig[];
  loading?: boolean;
  onSaved?: () => void;
}

export function PermissoesUsuarios({ data: perfis = [], usuarios = [], loading, onSaved }: Props) {
  const [formNovo, setFormNovo] = useState(false);
  const [nomeNovo, setNomeNovo] = useState("");
  const [emailNovo, setEmailNovo] = useState("");
  const [perfilNovo, setPerfilNovo] = useState("");
  const [saving, setSaving] = useState(false);

  async function handlePerfilChange(usuarioId: string, perfilId: string) {
    setSaving(true);
    try {
      await updateUsuarioPerfil(usuarioId, perfilId || null);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  async function handleCriarUsuario() {
    if (!nomeNovo.trim() || !emailNovo.trim()) return;
    setSaving(true);
    try {
      const id = await createUsuario({
        nome: nomeNovo.trim(),
        email: emailNovo.trim(),
        perfilId: perfilNovo || null,
      });
      if (id) {
        setFormNovo(false);
        setNomeNovo("");
        setEmailNovo("");
        setPerfilNovo("");
        onSaved?.();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">4. Permissões e usuários</h2>
      <p className="text-sm text-slate-500">Perfis com permissões granulares. Vincule usuários aos perfis e unidades.</p>

      <div className="card">
        <h4 className="mb-3 text-sm font-medium text-slate-600">Perfis disponíveis</h4>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 text-left font-medium text-slate-600">Perfil</th>
                <th className="p-3 text-left font-medium text-slate-600">Ver financeiro</th>
                <th className="p-3 text-left font-medium text-slate-600">Editar preço</th>
                <th className="p-3 text-left font-medium text-slate-600">Cancelar</th>
                <th className="p-3 text-left font-medium text-slate-600">Dar desconto</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : perfis).map((pf) => (
                <tr key={pf.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-800">{pf.nome}</td>
                  <td className="p-3">{pf.verFinanceiro ? "Sim" : "Não"}</td>
                  <td className="p-3">{pf.editarPreco ? "Sim" : "Não"}</td>
                  <td className="p-3">{pf.cancelar ? "Sim" : "Não"}</td>
                  <td className="p-3">{pf.darDesconto ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h4 className="mb-3 text-sm font-medium text-slate-600">Usuários do sistema</h4>
        <p className="mb-3 text-xs text-slate-500">
          Usuários precisam ser criados no Supabase Auth. Aqui você vincula o usuário ao perfil. Crie um registro para email convidado.
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 text-left font-medium text-slate-600">Nome</th>
                <th className="p-3 text-left font-medium text-slate-600">Email</th>
                <th className="p-3 text-left font-medium text-slate-600">Perfil</th>
                <th className="p-3 text-left font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : usuarios).map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-800">{u.nome}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.perfilId ?? ""}
                      onChange={(e) => handlePerfilChange(u.id, e.target.value)}
                      disabled={saving}
                      className="rounded border border-slate-200 px-2 py-1 text-sm"
                    >
                      <option value="">— Nenhum —</option>
                      {perfis.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${u.ativo ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {formNovo ? (
          <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Nome</label>
              <input
                type="text"
                value={nomeNovo}
                onChange={(e) => setNomeNovo(e.target.value)}
                placeholder="Nome completo"
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                value={emailNovo}
                onChange={(e) => setEmailNovo(e.target.value)}
                placeholder="email@exemplo.com"
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Perfil</label>
              <select
                value={perfilNovo}
                onChange={(e) => setPerfilNovo(e.target.value)}
                className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">— Selecionar —</option>
                {perfis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCriarUsuario}
                disabled={saving || !nomeNovo.trim() || !emailNovo.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setFormNovo(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFormNovo(true)}
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            + Adicionar usuário
          </button>
        )}
      </div>
    </section>
  );
}
