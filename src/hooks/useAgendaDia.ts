"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Agendamento, ClienteWaitlist, Profissional, Sala, Servico } from "@/lib/mock-agenda";
import type { Cliente } from "@/lib/mock-clientes";
import {
  fetchAgendamentosDia,
  fetchProfissionais,
  fetchSalas,
  fetchServicos,
  fetchListaEspera,
  fetchClientes,
} from "@/lib/dados-supabase";

export function useAgendaDia(data: Date) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [listaEspera, setListaEspera] = useState<ClienteWaitlist[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ag, prof, sal, svc, lista, cli] = await Promise.all([
        fetchAgendamentosDia(data),
        fetchProfissionais(),
        fetchSalas(),
        fetchServicos(),
        fetchListaEspera(),
        fetchClientes(),
      ]);
      setAgendamentos(ag);
      setProfissionais(prof);
      setSalas(sal);
      setServicos(svc);
      setListaEspera(lista);
      setClientes(cli);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar agenda");
      setAgendamentos([]);
      setProfissionais([]);
      setSalas([]);
      setServicos([]);
      setListaEspera([]);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [data.getTime()]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const channel = supabase
      .channel("agenda-agendamentos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    agendamentos,
    profissionais,
    salas,
    servicos,
    listaEspera,
    clientes,
    loading,
    error,
    refetch,
  };
}
