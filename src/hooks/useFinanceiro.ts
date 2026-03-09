"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type {
  VisaoFinanceiraGeralData,
  ReceitaPorHoraData,
  MovimentoFinanceiro,
  AlertaFinanceiro,
  MetricasFundamentaisData,
} from "@/lib/dados-paginas";
import {
  fetchVisaoFinanceiraGeral,
  fetchReceitaPorPeriodo,
  fetchReceitaPorUnidade,
  fetchReceitaPorHora,
  fetchMovimentosRecentes,
  fetchAlertasFinanceiro,
  fetchMetricasFundamentais,
} from "@/lib/dados-paginas";

export function useFinanceiro() {
  const [visaoGeral, setVisaoGeral] = useState<VisaoFinanceiraGeralData | null>(null);
  const [receitaPeriodo, setReceitaPeriodo] = useState<{ label: string; valor: number; anterior: number }[]>([]);
  const [receitaPorUnidade, setReceitaPorUnidade] = useState<{ nome: string; valor: number }[]>([]);
  const [receitaPorHora, setReceitaPorHora] = useState<ReceitaPorHoraData | null>(null);
  const [movimentosRecentes, setMovimentosRecentes] = useState<MovimentoFinanceiro[]>([]);
  const [alertas, setAlertas] = useState<AlertaFinanceiro[]>([]);
  const [metricasFundamentais, setMetricasFundamentais] = useState<MetricasFundamentaisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const safe = <T,>(fn: () => Promise<T>, fallback: T): Promise<T> =>
      fn().catch(() => fallback);
    try {
      const [
        visao,
        periodo,
        unidade,
        porHora,
        movimentos,
        alertasData,
        metricas,
      ] = await Promise.all([
        safe(fetchVisaoFinanceiraGeral, null),
        safe(fetchReceitaPorPeriodo, []),
        safe(fetchReceitaPorUnidade, []),
        safe(fetchReceitaPorHora, null),
        safe(fetchMovimentosRecentes, []),
        safe(fetchAlertasFinanceiro, []),
        safe(fetchMetricasFundamentais, null),
      ]);
      setVisaoGeral(visao);
      setReceitaPeriodo(periodo);
      setReceitaPorUnidade(unidade);
      setReceitaPorHora(porHora);
      setMovimentosRecentes(movimentos);
      setAlertas(alertasData);
      setMetricasFundamentais(metricas);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const channel = supabase
      .channel("financeiro-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "financeiro_movimentacoes" }, () => refetch())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [refetch]);

  return {
    visaoGeral,
    receitaPeriodo,
    receitaPorUnidade,
    receitaPorHora,
    movimentosRecentes,
    alertas,
    metricasFundamentais,
    loading,
    error,
    refetch,
  };
}
