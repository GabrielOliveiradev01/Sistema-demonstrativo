"use client";

import { useState } from "react";
import { PerfilEmpresa } from "@/components/configuracoes/PerfilEmpresa";
import { UnidadesConfig } from "@/components/configuracoes/UnidadesConfig";
import { HorariosFuncionamento } from "@/components/configuracoes/HorariosFuncionamento";
import { PermissoesUsuarios } from "@/components/configuracoes/PermissoesUsuarios";
import { PoliticasRegras } from "@/components/configuracoes/PoliticasRegras";
import { MetaMesConfig } from "@/components/configuracoes/MetaMesConfig";
import { PlanoAssinatura } from "@/components/configuracoes/PlanoAssinatura";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import { usePermissions } from "@/hooks/usePermissions";

type Secao = "perfil" | "unidades" | "horarios" | "permissoes" | "politicas" | "meta" | "plano";

const TODAS_SECOES: { id: Secao; label: string; slug: string }[] = [
  { id: "meta", label: "1. Meta do mês", slug: "meta" },
  { id: "perfil", label: "2. Perfil da empresa", slug: "perfil" },
  { id: "unidades", label: "3. Salas", slug: "unidades" },
  { id: "horarios", label: "4. Horários", slug: "horarios" },
  { id: "permissoes", label: "5. Permissões e usuários", slug: "permissoes" },
  { id: "politicas", label: "6. Políticas", slug: "politicas" },
  { id: "plano", label: "7. Plano e assinatura", slug: "plano" },
];

export default function ConfiguracoesPage() {
  const [secao, setSecao] = useState<Secao>("meta");
  const { canSeeConfigSection } = usePermissions();
  const {
    perfilEmpresa,
    unidades,
    horarios,
    perfis,
    politicas,
    metaMes,
    plano,
    usuarios,
    loading,
    error,
    refetch,
  } = useConfiguracoes();
  const secoes = TODAS_SECOES.filter((s) => canSeeConfigSection(s.slug));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-slate-500">Configurações</h2>
        <nav className="space-y-0.5">
          {secoes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSecao(s.id)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                secao === s.id ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
          <p className="text-slate-500">Controle total do sistema — organizado, modular e escalável</p>
        </header>
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {loading && <p className="mb-4 text-sm text-slate-500">Carregando…</p>}
        <div className="max-w-4xl">
          {secao === "perfil" && <PerfilEmpresa data={perfilEmpresa} loading={loading} onSaved={refetch} />}
          {secao === "unidades" && <UnidadesConfig data={unidades} usuarios={usuarios} loading={loading} onSaved={refetch} />}
          {secao === "horarios" && <HorariosFuncionamento data={horarios} loading={loading} />}
          {secao === "permissoes" && <PermissoesUsuarios data={perfis} usuarios={usuarios} loading={loading} onSaved={refetch} />}
          {secao === "politicas" && <PoliticasRegras data={politicas} loading={loading} />}
          {secao === "meta" && <MetaMesConfig data={metaMes} loading={loading} onSaved={refetch} />}
          {secao === "plano" && <PlanoAssinatura data={plano} loading={loading} />}
        </div>
      </main>
    </div>
  );
}
