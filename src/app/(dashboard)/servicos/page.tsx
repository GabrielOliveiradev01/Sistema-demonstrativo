"use client";

import { useState, useMemo } from "react";
import { ListaServicos } from "@/components/servicos/ListaServicos";
import { CategoriasServicos } from "@/components/servicos/CategoriasServicos";
import { CadastroServico } from "@/components/servicos/CadastroServico";
import { MetricasServico } from "@/components/servicos/MetricasServico";
import { PacotesCombos } from "@/components/servicos/PacotesCombos";
import { useServicos } from "@/hooks/useServicos";
import type { CategoriaItem } from "@/lib/dados-paginas";
import type { ServicoCompleto } from "@/lib/mock-servicos";
import { createCategoriaServico, createPacote, createServico, updateServico } from "@/lib/dados-supabase";

function getServicoVazio(categorias: CategoriaItem[]): ServicoCompleto {
  return {
    id: "",
    nome: "",
    categoriaId: categorias[0]?.id ?? "",
    categoriaNome: categorias[0]?.nome ?? "",
    duracao: 60,
    precoBase: 0,
    profissionaisVinculados: 0,
    status: "ativo",
    receita30Dias: 0,
    descricao: "",
    corCalendario: "#22c55e",
    bufferAntes: 0,
    bufferDepois: 15,
    exigirSinal: false,
    percentualSinal: 30,
    permitirDesconto: true,
    disponivelOnline: true,
    antecedenciaMinima: 60,
    antecedenciaMaxima: 90,
    profissionais: [],
    precoDinamicoPorDia: [],
    precoPorFaixaHorario: [],
    limiteDiarioAtendimentos: null,
    apenasRecorrentes: false,
    scoreMinimo: null,
    recorrente: false,
    intervaloDias: null,
    gerarProximosAutomatico: false,
    limiteRepeticoes: null,
  };
}

export default function ServicosPage() {
  const { servicos, categorias, pacotes, loading, error, refetch } = useServicos();
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [servicoEmEdicao, setServicoEmEdicao] = useState<string | null>(null);
  const [criandoNovo, setCriandoNovo] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const servicosFiltrados = useMemo(() => {
    let list = [...servicos];
    if (filtroCategoria) list = list.filter((s) => s.categoriaId === filtroCategoria);
    if (filtroStatus) list = list.filter((s) => s.status === filtroStatus);
    return list;
  }, [servicos, filtroCategoria, filtroStatus]);

  const servicoCompleto: ServicoCompleto | null = useMemo(() => {
    if (!servicoEmEdicao) return null;
    const svc = servicos.find((s) => s.id === servicoEmEdicao);
    if (!svc) return null;
    return {
      ...getServicoVazio(categorias),
      ...svc,
      categoriaNome: categorias.find((c) => c.id === svc.categoriaId)?.nome ?? "—",
    };
  }, [servicoEmEdicao, servicos, categorias]);

  const handleCriarCategoria = async (nome: string, cor: string, ordem: number) => {
    setActionError(null);
    try {
      await createCategoriaServico({ nome, cor, ordem, ativa: true });
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao criar categoria");
      throw e;
    }
  };

  const handleSalvarServico = async (data: Partial<ServicoCompleto>) => {
    if (!data.nome?.trim()) {
      setActionError("Informe o nome do serviço.");
      return;
    }
    setActionError(null);
    try {
      const payload = {
        nome: data.nome.trim(),
        descricao: data.descricao ?? null,
        duracao_minutos: Number(data.duracao ?? 60),
        valor_base: Number(data.precoBase ?? 0),
        ativo: (data.status ?? "ativo") === "ativo",
        categoria_id: data.categoriaId || null,
        cor_calendario: data.corCalendario ?? "#22c55e",
        buffer_antes_min: Number(data.bufferAntes ?? 0),
        buffer_depois_min: Number(data.bufferDepois ?? 0),
        exigir_sinal: Boolean(data.exigirSinal),
        percentual_sinal: Number(data.percentualSinal ?? 30),
        permitir_desconto: Boolean(data.permitirDesconto ?? true),
        disponivel_online: Boolean(data.disponivelOnline ?? true),
        antecedencia_minima_min: Number(data.antecedenciaMinima ?? 60),
        antecedencia_maxima_dias: Number(data.antecedenciaMaxima ?? 90),
        limite_diario_atendimentos: data.limiteDiarioAtendimentos ?? null,
        apenas_recorrentes: Boolean(data.apenasRecorrentes),
        score_minimo: data.scoreMinimo ?? null,
        recorrente: Boolean(data.recorrente),
        intervalo_dias: data.intervaloDias ?? null,
        gerar_proximos_automatico: Boolean(data.gerarProximosAutomatico),
        limite_repeticoes: data.limiteRepeticoes ?? null,
      };
      if (criandoNovo) {
        await createServico(payload);
      } else if (servicoEmEdicao) {
        await updateServico(servicoEmEdicao, payload);
      }
      await refetch();
      setServicoEmEdicao(null);
      setCriandoNovo(false);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao salvar serviço");
    }
  };

  const handleCriarPacote = async (payload: { nome: string; valorTotal: number; servicoIds: string[] }) => {
    if (!payload.nome.trim() || payload.servicoIds.length === 0) {
      setActionError("Informe nome e pelo menos um serviço para o combo.");
      return;
    }
    setActionError(null);
    try {
      const duracaoTotal = payload.servicoIds.reduce((sum, id) => sum + (servicos.find((s) => s.id === id)?.duracao ?? 0), 0);
      await createPacote({
        nome: payload.nome.trim(),
        valor_total: payload.valorTotal,
        duracao_total_min: duracaoTotal,
        itens: payload.servicoIds.map((id, idx) => ({ servico_id: id, quantidade: 1, ordem: idx })),
      });
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erro ao criar combo");
      throw e;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Serviços</h1>
            <p className="text-slate-500">
              Lista, categorias, cadastro com 5 abas, profissionais vinculados, regras avançadas, métricas e pacotes
            </p>
          </header>
          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {actionError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
          {loading && <p className="mb-4 text-sm text-slate-500">Carregando…</p>}
          <div className="space-y-8">
            <ListaServicos
              servicos={servicosFiltrados}
              categorias={categorias}
              filtroCategoria={filtroCategoria}
              onFiltroCategoria={setFiltroCategoria}
              filtroStatus={filtroStatus}
              onFiltroStatus={setFiltroStatus}
              onCriarServico={() => { setCriandoNovo(true); setServicoEmEdicao(null); }}
              onCriarPacote={() => {}}
              onEditar={(id) => { setServicoEmEdicao(id); setCriandoNovo(false); }}
              onDuplicar={() => {}}
              onArquivar={() => {}}
            />
            <CategoriasServicos categorias={categorias.map((c) => ({ id: c.id, nome: c.nome, cor: c.cor, ordem: c.ordem }))} onAdicionar={handleCriarCategoria} />
            <PacotesCombos pacotes={pacotes} servicos={servicos} onCriarPacote={handleCriarPacote} />
            {servicoEmEdicao && (
              <MetricasServico nomeServico={servicos.find((s) => s.id === servicoEmEdicao)?.nome ?? ""} />
            )}
          </div>
        </div>
      </div>

      {(servicoEmEdicao || criandoNovo) && (
        <div className="fixed inset-y-0 right-0 z-20 w-full border-l border-slate-200 bg-white shadow-xl lg:w-[520px]">
          <CadastroServico
            servico={criandoNovo ? getServicoVazio(categorias) : servicoCompleto}
            categorias={categorias}
            isNovo={criandoNovo}
            onFechar={() => { setServicoEmEdicao(null); setCriandoNovo(false); }}
            onSalvar={handleSalvarServico}
          />
        </div>
      )}
    </div>
  );
}
