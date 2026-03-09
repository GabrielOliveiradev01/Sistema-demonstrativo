"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  PerfilEmpresaData,
  UnidadeConfig,
  HorarioConfig,
  PerfilPermissao,
  PoliticasConfigData,
  MetaMesConfigData,
  PlanoAssinaturaData,
  UsuarioConfig,
} from "@/lib/dados-paginas";
import {
  fetchPerfilEmpresa,
  fetchUnidadesConfig,
  fetchHorariosConfig,
  fetchPerfisPermissao,
  fetchPoliticasConfig,
  fetchMetaMesConfig,
  fetchPlanoAssinatura,
  fetchUsuariosConfig,
} from "@/lib/dados-paginas";

export function useConfiguracoes() {
  const [perfilEmpresa, setPerfilEmpresa] = useState<PerfilEmpresaData | null>(null);
  const [unidades, setUnidades] = useState<UnidadeConfig[]>([]);
  const [horarios, setHorarios] = useState<HorarioConfig[]>([]);
  const [perfis, setPerfis] = useState<PerfilPermissao[]>([]);
  const [politicas, setPoliticas] = useState<PoliticasConfigData | null>(null);
  const [metaMes, setMetaMes] = useState<MetaMesConfigData | null>(null);
  const [plano, setPlano] = useState<PlanoAssinaturaData | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safe = <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => fn().catch(() => fallback);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        perfil,
        unids,
        hors,
        prfs,
        pol,
        meta,
        pln,
        usrs,
      ] = await Promise.all([
        safe(fetchPerfilEmpresa, null),
        safe(fetchUnidadesConfig, []),
        safe(fetchHorariosConfig, []),
        safe(fetchPerfisPermissao, []),
        safe(fetchPoliticasConfig, null),
        safe(fetchMetaMesConfig, null),
        safe(fetchPlanoAssinatura, null),
        safe(fetchUsuariosConfig, []),
      ]);
      setPerfilEmpresa(perfil);
      setUnidades(unids);
      setHorarios(hors);
      setPerfis(prfs);
      setPoliticas(pol);
      setMetaMes(meta);
      setPlano(pln);
      setUsuarios(usrs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
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
  };
}
