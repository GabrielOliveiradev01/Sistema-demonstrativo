"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ResumoFinanceiro, ResumoOcupacao, ResumoRisco, ResumoIA, ResumoClientes } from "@/lib/dados-supabase";
import {
  fetchResumoFinanceiro,
  fetchResumoOcupacao,
  fetchResumoRisco,
  fetchResumoIA,
  fetchResumoClientes,
} from "@/lib/dados-supabase";

export function useDashboard() {
  const [financeiro, setFinanceiro] = useState<ResumoFinanceiro | null>(null);
  const [ocupacao, setOcupacao] = useState<ResumoOcupacao | null>(null);
  const [risco, setRisco] = useState<ResumoRisco | null>(null);
  const [ia, setIa] = useState<ResumoIA | null>(null);
  const [clientes, setClientes] = useState<ResumoClientes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, o, r, i, c] = await Promise.all([
        fetchResumoFinanceiro(),
        fetchResumoOcupacao(),
        fetchResumoRisco(),
        fetchResumoIA(),
        fetchResumoClientes(),
      ]);
      setFinanceiro(f);
      setOcupacao(o);
      setRisco(r);
      setIa(i);
      setClientes(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, () => { void refetch(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "clientes" }, () => { void refetch(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refetch]);

  return { financeiro, ocupacao, risco, ia, clientes, loading, error, refetch };
}
