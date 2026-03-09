"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ProfissionalListItem, VisaoGeralProf, PerfilProfissionalFull } from "@/lib/dados-paginas";
import {
  fetchProfissionaisComMetricas,
  fetchVisaoGeralProfissionais,
  fetchPerfilProfissionalCompleto,
  fetchAlertasProfissionais,
} from "@/lib/dados-paginas";

export function useProfissionais() {
  const [profissionais, setProfissionais] = useState<ProfissionalListItem[]>([]);
  const [visaoGeral, setVisaoGeral] = useState<VisaoGeralProf | null>(null);
  const [alertas, setAlertas] = useState<{ id: string; tipo: string; texto: string; acao: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profs, alertasRes] = await Promise.all([
        fetchProfissionaisComMetricas(),
        fetchAlertasProfissionais(),
      ]);
      setProfissionais(profs);
      const visao = await fetchVisaoGeralProfissionais(profs);
      setVisaoGeral(visao);
      setAlertas(alertasRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
      setProfissionais([]);
      setVisaoGeral(null);
      setAlertas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const channel = supabase
      .channel("profissionais-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "profissionais" }, () => refetch())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [refetch]);

  async function getPerfil(id: string): Promise<PerfilProfissionalFull | null> {
    const base = profissionais.find((p) => p.id === id);
    return fetchPerfilProfissionalCompleto(id, base ?? undefined);
  }

  return { profissionais, visaoGeral, alertas, loading, error, refetch, getPerfil };
}
