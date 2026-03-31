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
  fetchHorariosClincia,
} from "@/lib/dados-supabase";
import type { HorarioClinciaDia } from "@/lib/dados-supabase";

export function useAgendaDia(data: Date) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [listaEspera, setListaEspera] = useState<ClienteWaitlist[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [horariosClincia, setHorariosClincia] = useState<HorarioClinciaDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ag, prof, sal, svc, lista, cli, horarios] = await Promise.all([
        fetchAgendamentosDia(data),
        fetchProfissionais(),
        fetchSalas(),
        fetchServicos(),
        fetchListaEspera(),
        fetchClientes(),
        fetchHorariosClincia(),
      ]);
      setAgendamentos(ag);
      setProfissionais(prof);
      setSalas(sal);
      setServicos(svc);
      setListaEspera(lista);
      setClientes(cli);
      setHorariosClincia(horarios);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar agenda");
      setAgendamentos([]);
      setProfissionais([]);
      setSalas([]);
      setServicos([]);
      setListaEspera([]);
      setClientes([]);
      setHorariosClincia([]);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, () => { void refetch(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refetch]);

  return {
    agendamentos,
    profissionais,
    salas,
    servicos,
    listaEspera,
    clientes,
    horariosClincia,
    loading,
    error,
    refetch,
  };
}
