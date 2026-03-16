"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { VisaoGeralProfissionais } from "@/components/profissionais/VisaoGeralProfissionais";
import { ListaProfissionais } from "@/components/profissionais/ListaProfissionais";
import { PerfilProfissional } from "@/components/profissionais/PerfilProfissional";
import { InteligenciaAplicadaProf } from "@/components/profissionais/InteligenciaAplicadaProf";
import { ComissoesERentabilidade } from "@/components/profissionais/ComissoesERentabilidade";
import { AlertasOperacionaisProf } from "@/components/profissionais/AlertasOperacionaisProf";
import { MetricasProfissionais } from "@/components/profissionais/MetricasProfissionais";
import { FormProfissional, type ProfissionalFormData } from "@/components/profissionais/FormProfissional";
import { useProfissionais } from "@/hooks/useProfissionais";
import { createProfissional, updateProfissional, deleteProfissional, fetchProfissionalPorId, fetchUnidades, saveProfissionaisHorarios } from "@/lib/dados-supabase";
import { fetchPerfisPermissao } from "@/lib/dados-paginas";
import type { PerfilProfissionalFull } from "@/lib/dados-paginas";
import type { ProfissionalCreate } from "@/lib/dados-supabase";

export default function ProfissionaisPage() {
  const { profissionais, visaoGeral, alertas, loading, error, refetch, getPerfil } = useProfissionais();
  const [filtro, setFiltro] = useState<"" | "baixa_ocupacao" | "alta_rentabilidade" | "alto_noshow" | "unidade" | "especialidade">("");
  const [unidadeSelecionada, setUnidadeSelecionada] = useState("");
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilProfissionalFull | null>(null);
  const [formState, setFormState] = useState<null | "novo" | { type: "editar"; id: string }>(null);
  const [unidades, setUnidades] = useState<{ id: string; nome: string }[]>([]);
  const [perfis, setPerfis] = useState<{ id: string; nome: string }[]>([]);
  const [profissionalParaEditar, setProfissionalParaEditar] = useState<ProfissionalFormData | null>(null);

  useEffect(() => {
    fetchUnidades().then(setUnidades).catch(() => setUnidades([]));
  }, []);
  useEffect(() => {
    fetchPerfisPermissao().then((p) => setPerfis(p.map((x) => ({ id: x.id, nome: x.nome })))).catch(() => setPerfis([]));
  }, []);

  useEffect(() => {
    if (!profissionalSelecionado) {
      setPerfil(null);
      return;
    }
    let cancelled = false;
    getPerfil(profissionalSelecionado).then((p) => {
      if (!cancelled) setPerfil(p);
    });
    return () => { cancelled = true; };
  }, [profissionalSelecionado, getPerfil]);

  useEffect(() => {
    if (formState && formState !== "novo" && formState.type === "editar") {
      fetchProfissionalPorId(formState.id).then((p) => {
        if (p) setProfissionalParaEditar(p);
      });
    } else {
      setProfissionalParaEditar(null);
    }
  }, [formState]);

  const comissoesData = useMemo(() => {
    if (!visaoGeral || !profissionais.length) return null;
    const sorted = [...profissionais].sort((a, b) => b.receitaMes - a.receitaMes);
    return {
      metaMediaPorProfissional: visaoGeral.metaMediaPorProfissional,
      ocupacaoMediaGeral: visaoGeral.ocupacaoMediaGeral,
      ranking: sorted.slice(0, 10).map((p, i) => ({
        posicao: i + 1,
        nome: p.nome,
        receita: p.receitaMes,
      })),
    };
  }, [visaoGeral, profissionais]);

  const metricasData = useMemo(() => {
    if (!profissionais.length) return null;
    const totalReceita = profissionais.reduce((s, p) => s + p.receitaMes, 0);
    const totalHoras = profissionais.reduce((s, p) => s + p.horasTrabalhadas, 0);
    const receitaPorHoraMedia = totalHoras > 0 ? totalReceita / totalHoras : 0;
    const ocupacaoMedia = visaoGeral?.ocupacaoMediaGeral ?? 0;
    const totalAtendimentos = profissionais.reduce((s, p) => s + (p.receitaMes && p.ticketMedio ? Math.round(p.receitaMes / p.ticketMedio) : 0), 0);
    const ticketMedioGeral = totalAtendimentos > 0 ? totalReceita / totalAtendimentos : 0;
    return {
      receitaPorHoraMedia,
      ocupacaoMedia,
      ticketMedioGeral,
      totalHorasTrabalhadas: Math.round(totalHoras * 10) / 10,
      receitaTotalMes: totalReceita,
    };
  }, [profissionais, visaoGeral]);

  const handleExcluirProfissional = useCallback(
    async (id: string) => {
      try {
        await deleteProfissional(id);
        await refetch();
        setProfissionalSelecionado(null);
      } catch (e) {
        console.error("Erro ao excluir profissional:", e);
      }
    },
    [refetch]
  );

  const handleSalvarProfissional = useCallback(
    async (payload: ProfissionalCreate, opcoes?: { profissionalJaCriado?: boolean; profissionalId?: string; horarios?: Array<{ dia_semana: number; abre: string; fecha: string; fechado: boolean }> }) => {
      let profId: string | undefined;
      if (formState && formState !== "novo" && formState.type === "editar") {
        await updateProfissional(formState.id, payload);
        profId = formState.id;
      } else if (!opcoes?.profissionalJaCriado) {
        profId = await createProfissional(payload);
      } else {
        profId = opcoes.profissionalId;
      }
      if (profId && opcoes?.horarios?.length) {
        await saveProfissionaisHorarios(profId, opcoes.horarios);
      }
      await refetch();
      setFormState(null);
      if (formState && formState !== "novo") setProfissionalSelecionado(null);
    },
    [formState, refetch]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Profissionais</h1>
            <p className="text-slate-500">
              Centro de performance operacional — quem fatura mais, quem está ocioso e quem pode aumentar preço
            </p>
          </header>
          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {loading && <p className="mb-4 text-sm text-slate-500">Carregando…</p>}
          <div className="space-y-8">
            <VisaoGeralProfissionais
              data={visaoGeral}
              loading={loading}
              onNovoProfissional={() => setFormState("novo")}
            />
            <ListaProfissionais
              profissionais={profissionais}
              filtro={filtro}
              onFiltroChange={setFiltro}
              unidadeSelecionada={unidadeSelecionada}
              onUnidadeChange={setUnidadeSelecionada}
              especialidadeSelecionada={especialidadeSelecionada}
              onEspecialidadeChange={setEspecialidadeSelecionada}
              onProfissionalClick={(p) => setProfissionalSelecionado(p.id)}
            />
            <InteligenciaAplicadaProf />
            <ComissoesERentabilidade data={comissoesData} loading={loading} />
            <AlertasOperacionaisProf alertas={alertas} loading={loading} />
            <MetricasProfissionais data={metricasData} loading={loading} />
          </div>
        </div>
      </div>

      {profissionalSelecionado && perfil && (
        <div className="fixed inset-y-0 right-0 z-20 flex w-full flex-col border-l border-slate-200 bg-white shadow-xl lg:w-[420px]">
          <PerfilProfissional
            perfil={perfil}
            onFechar={() => setProfissionalSelecionado(null)}
            onEditar={() => setFormState({ type: "editar", id: perfil.id })}
            onExcluir={handleExcluirProfissional}
          />
        </div>
      )}

      {formState && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <FormProfissional
              profissional={formState === "novo" ? null : profissionalParaEditar}
              unidades={unidades}
              perfis={perfis}
              onSalvar={handleSalvarProfissional}
              onCancelar={() => setFormState(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
