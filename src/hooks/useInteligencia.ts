"use client";

import { useState, useEffect, useCallback } from "react";
import type { PainelInsightsData } from "@/lib/dados-paginas";
import { fetchPainelInsights, fetchInsightsInteligencia } from "@/lib/dados-paginas";

export function useInteligencia() {
  const [painelInsights, setPainelInsights] = useState<PainelInsightsData | null>(null);
  const [insights, setInsights] = useState<{ tipo: string; titulo: string; descricao: string | null; dados: unknown }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [painel, list] = await Promise.all([fetchPainelInsights(), fetchInsightsInteligencia()]);
      setPainelInsights(painel);
      setInsights(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { painelInsights, insights, loading, error, refetch };
}
