"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  VisaoExecutivaData,
  AnalyticsReceitaLucratividade,
  AnalyticsReceitaDiaria30,
  AnalyticsOcupacaoPorDiaSemana,
  AnalyticsCancelamentosPorHorario,
  AnalyticsProjecoes,
} from "@/lib/dados-paginas";
import {
  fetchVisaoExecutiva,
  fetchClientesMetricas,
  fetchRankingProfissionais,
  fetchRiscoPerdas,
  fetchAnalyticsReceitaLucratividade,
  fetchReceitaDiaria30,
  fetchOcupacaoPorDiaSemana,
  fetchCancelamentosPorHorario,
  fetchProjecoes,
  fetchInsightsInteligencia,
} from "@/lib/dados-paginas";

export function useAnalytics() {
  const [visaoExecutiva, setVisaoExecutiva] = useState<VisaoExecutivaData | null>(null);
  const [clientesMetricas, setClientesMetricas] = useState<{
    novos: number;
    recorrentes: number;
    taxaRetencao: number;
    churn: number;
    ltv: number;
    frequenciaMedia: number;
    tempoMedioEntreVisitas: number;
  } | null>(null);
  const [rankingProfissionais, setRankingProfissionais] = useState<{ nome: string; ocupacao: number; noshow: number; receita: number }[]>([]);
  const [riscoPerdas, setRiscoPerdas] = useState<{ receitaPerdidaNoShow: number; receitaPerdidaCancelamento: number; horasOciosas: number; impactoFinanceiroMensal: number } | null>(null);
  const [receitaLucratividade, setReceitaLucratividade] = useState<AnalyticsReceitaLucratividade | null>(null);
  const [receitaDiaria30, setReceitaDiaria30] = useState<AnalyticsReceitaDiaria30[]>([]);
  const [ocupacaoPorDiaSemana, setOcupacaoPorDiaSemana] = useState<AnalyticsOcupacaoPorDiaSemana[]>([]);
  const [ocupacaoPorDiaSemanaPeriodo, setOcupacaoPorDiaSemanaPeriodo] = useState<{ de: string; ate: string } | null>(null);
  const [cancelamentosPorHorario, setCancelamentosPorHorario] = useState<AnalyticsCancelamentosPorHorario[]>([]);
  const [projecoes, setProjecoes] = useState<AnalyticsProjecoes | null>(null);
  const [insightsIA, setInsightsIA] = useState<{ titulo: string; descricao?: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        visao,
        clientes,
        ranking,
        risco,
        receitaLuc,
        receita30,
        ocupacaoResult,
        cancelamentos,
        proj,
        insights,
      ] = await Promise.all([
        fetchVisaoExecutiva(),
        fetchClientesMetricas(),
        fetchRankingProfissionais(),
        fetchRiscoPerdas(),
        fetchAnalyticsReceitaLucratividade(),
        fetchReceitaDiaria30(),
        fetchOcupacaoPorDiaSemana(),
        fetchCancelamentosPorHorario(),
        fetchProjecoes(),
        fetchInsightsInteligencia(),
      ]);
      setVisaoExecutiva(visao);
      setClientesMetricas(clientes);
      setRankingProfissionais(ranking);
      setRiscoPerdas(risco);
      setReceitaLucratividade(receitaLuc);
      setReceitaDiaria30(receita30);
      setOcupacaoPorDiaSemana(ocupacaoResult.dados);
      setOcupacaoPorDiaSemanaPeriodo(ocupacaoResult.periodo);
      setCancelamentosPorHorario(cancelamentos);
      setProjecoes(proj);
      setInsightsIA((insights ?? []).map((i) => ({ titulo: i.titulo, descricao: i.descricao })));
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
    visaoExecutiva,
    clientesMetricas,
    rankingProfissionais,
    riscoPerdas,
    receitaLucratividade,
    receitaDiaria30,
    ocupacaoPorDiaSemana,
    ocupacaoPorDiaSemanaPeriodo,
    cancelamentosPorHorario,
    projecoes,
    insightsIA,
    loading,
    error,
    refetch,
  };
}
