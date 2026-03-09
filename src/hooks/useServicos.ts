"use client";

import { useState, useEffect, useCallback } from "react";
import type { CategoriaItem, ServicoListItem, PacoteComboItem } from "@/lib/dados-paginas";
import { fetchCategorias, fetchServicosComCategoria, fetchPacotesCombos } from "@/lib/dados-paginas";

export function useServicos() {
  const [servicos, setServicos] = useState<ServicoListItem[]>([]);
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [pacotes, setPacotes] = useState<PacoteComboItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cat, svc, pcts] = await Promise.all([fetchCategorias(), fetchServicosComCategoria(), fetchPacotesCombos()]);
      setCategorias(cat);
      setServicos(svc);
      setPacotes(pcts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
      setCategorias([]);
      setServicos([]);
      setPacotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { servicos, categorias, pacotes, loading, error, refetch };
}
