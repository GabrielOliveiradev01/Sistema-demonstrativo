"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const ABAS = ["dashboard", "agenda", "clientes", "profissionais", "servicos", "financeiro", "campanhas", "inteligencia", "automacao", "analytics", "configuracoes"];
const CONFIG_SECOES = ["perfil", "unidades", "horarios", "permissoes", "politicas", "meta", "plano"];

export function usePermissions() {
  const [permissoes, setPermissoes] = useState<{
    abas: string[];
    config_secoes: string[];
  }>({ abas: ABAS, config_secoes: CONFIG_SECOES });

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPermissoes({ abas: [], config_secoes: [] });
      return;
    }
    const { data: usuario } = await supabase
      .from("config_usuarios")
      .select("perfil_id")
      .eq("auth_uid", user.id)
      .eq("ativo", true)
      .limit(1)
      .maybeSingle();
    if (!usuario?.perfil_id) {
      setPermissoes({ abas: ABAS, config_secoes: CONFIG_SECOES });
      return;
    }
    const { data: perfil } = await supabase.from("config_perfis").select("permissoes_extra").eq("id", usuario.perfil_id).limit(1).single();
    const extra = (perfil?.permissoes_extra as { abas?: string[]; config_secoes?: string[] }) ?? null;
    if (extra?.abas) {
      setPermissoes({
        abas: extra.abas,
        config_secoes: extra.config_secoes ?? [],
      });
    } else {
      setPermissoes({ abas: ABAS, config_secoes: CONFIG_SECOES });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canSeeAba = (aba: string) => permissoes.abas.includes(aba);
  const canSeeConfigSection = (slug: string) => permissoes.config_secoes.includes(slug);

  return { canSeeAba, canSeeConfigSection, permissoes };
}
