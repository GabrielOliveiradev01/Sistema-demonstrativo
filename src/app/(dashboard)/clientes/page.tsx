"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VisaoGeralClientes, type MetricasClientesData, type ReceitaPorSegmentoItem } from "@/components/clientes/VisaoGeralClientes";
import { ListaClientes, type FiltroRapido } from "@/components/clientes/ListaClientes";
import { PerfilCliente } from "@/components/clientes/PerfilCliente";
import { SegmentacaoClientes, type SegmentoItem } from "@/components/clientes/SegmentacaoClientes";
import { ScoreConfiabilidade } from "@/components/clientes/ScoreConfiabilidade";
import { FormCliente } from "@/components/clientes/FormCliente";
import { useClientes } from "@/hooks/useClientes";
import { fetchPerfilCliente, createCliente, updateCliente } from "@/lib/dados-supabase";
import type { PerfilCliente as PerfilClienteType } from "@/lib/mock-clientes";
import type { Cliente } from "@/lib/mock-clientes";

const SEGMENTOS_CONFIG: { id: string; label: string; descricao: string }[] = [
  { id: "vip", label: "VIP (alto LTV)", descricao: "LTV acima de R$ 2.000" },
  { id: "recorrente", label: "Recorrentes", descricao: "Visita regular nos últimos 90 dias" },
  { id: "risco_abandono", label: "Em risco de abandono", descricao: "Sem visita há 30+ dias" },
  { id: "risco_noshow", label: "Alto risco de no-show", descricao: "Score no-show > 25%" },
  { id: "novo", label: "Novos clientes", descricao: "Primeira visita nos últimos 30 dias" },
  { id: "inativo_30", label: "Inativos há +30 dias", descricao: "Sem agendamento há 30+ dias" },
];

export default function ClientesPage() {
  const router = useRouter();
  const { clientes, loading, error, refetch } = useClientes();
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>("");
  const [segmentoPersonalizado, setSegmentoPersonalizado] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<PerfilClienteType | null>(null);
  const [formClienteState, setFormClienteState] = useState<null | "novo" | { type: "editar"; cliente: Cliente | PerfilClienteType }>(null);

  const clientesFiltrados = useMemo(() => {
    let list = [...clientes];
    if (filtroRapido === "risco")
      list = list.filter((c) => c.riscoAbandono > 40);
    if (filtroRapido === "alto_valor")
      list = list.filter((c) => c.ltv >= 2000);
    if (filtroRapido === "novos")
      list = list.filter((c) => c.segmentos.includes("novo"));
    if (filtroRapido === "alto_noshow")
      list = list.filter((c) => c.riscoNoShow >= 25);
    if (segmentoPersonalizado)
      list = list.filter((c) => c.segmentos.includes(segmentoPersonalizado as never));
    return list;
  }, [clientes, filtroRapido, segmentoPersonalizado]);

  const metricas = useMemo((): MetricasClientesData => {
    const total = clientes.length;
    const emRisco = clientes.filter((c) => c.riscoAbandono > 40).length;
    const novosNoMes = clientes.filter((c) => c.segmentos.includes("novo")).length;
    const taxaRetorno = total > 0 ? Math.round(((total - emRisco) / total) * 100) : 0;
    const ltvMedio = total > 0 ? clientes.reduce((s, c) => s + c.ltv, 0) / total : 0;
    return {
      total,
      novosNoMes,
      taxaRetorno,
      ativos: total,
      emRisco,
      ltvMedio: Math.round(ltvMedio),
      tempoMedioEntreVisitas: 18,
      taxaReativacao: 12,
      churnRate: 8,
    };
  }, [clientes]);

  const receitaPorSegmento = useMemo((): ReceitaPorSegmentoItem[] => {
    const map = new Map<string, number>();
    for (const c of clientes) {
      if (c.segmentos.length === 0) {
        const k = "Sem segmento";
        map.set(k, (map.get(k) ?? 0) + c.ltv);
      } else {
        for (const s of c.segmentos) {
          const label = SEGMENTOS_CONFIG.find((x) => x.id === s)?.label ?? s;
          map.set(label, (map.get(label) ?? 0) + c.ltv);
        }
      }
    }
    return Array.from(map.entries()).map(([segmento, receita]) => ({ segmento, receita }));
  }, [clientes]);

  const segmentosComCount = useMemo((): SegmentoItem[] => {
    return SEGMENTOS_CONFIG.map((s) => ({
      ...s,
      count: clientes.filter((c) => c.segmentos.includes(s.id)).length,
    }));
  }, [clientes]);

  useEffect(() => {
    if (!clienteSelecionado) {
      setPerfil(null);
      return;
    }
    let cancelled = false;
    fetchPerfilCliente(clienteSelecionado).then((p) => {
      if (!cancelled) setPerfil(p);
    });
    return () => { cancelled = true; };
  }, [clienteSelecionado]);

  const handleSalvarCliente = async (payload: Parameters<typeof createCliente>[0]) => {
    if (formClienteState && formClienteState !== "novo" && formClienteState.type === "editar") {
      await updateCliente(formClienteState.cliente.id, payload);
    } else {
      await createCliente(payload);
    }
    await refetch();
    setFormClienteState(null);
    if (formClienteState && formClienteState !== "novo" && formClienteState.type === "editar") {
      setClienteSelecionado(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div
        className={`flex flex-1 flex-col overflow-auto transition-all ${clienteSelecionado ? "lg:mr-0" : ""}`}
      >
        <div className="p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
            <p className="text-slate-500">
              Centro de inteligência de receita — quem gera lucro, quem está sumindo e quem reativar
            </p>
          </header>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-4 flex items-center gap-2 text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Carregando clientes…
            </div>
          )}

          <div className="space-y-8">
            <VisaoGeralClientes
              metricas={metricas}
              receitaPorSegmento={receitaPorSegmento}
              loading={loading}
              onCriarCampanhaReativacao={() => router.push("/campanhas?segmento=risco_abandono")}
              onNovoCliente={() => setFormClienteState("novo")}
            />

            <ListaClientes
              clientes={clientesFiltrados}
              filtroRapido={filtroRapido}
              onFiltroRapidoChange={setFiltroRapido}
              segmentoPersonalizado={segmentoPersonalizado}
              onSegmentoChange={setSegmentoPersonalizado}
              onClienteClick={(c) => setClienteSelecionado(c.id)}
            />

            <SegmentacaoClientes
              segmentos={segmentosComCount}
              loading={loading}
              onDispararCampanha={(segmentoId) => router.push(`/campanhas?segmento=${segmentoId}`)}
            />

            <ScoreConfiabilidade />
          </div>
        </div>
      </div>

      {clienteSelecionado && perfil && (
        <div className="fixed inset-y-0 right-0 z-20 flex w-full flex-col border-l border-slate-200 bg-white shadow-xl lg:w-[420px]">
          <PerfilCliente
            perfil={perfil}
            onFechar={() => setClienteSelecionado(null)}
            onEditar={(p) => setFormClienteState({ type: "editar", cliente: p })}
          />
        </div>
      )}

      {formClienteState && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl">
            <FormCliente
              cliente={formClienteState === "novo" ? null : formClienteState.cliente}
              onSalvar={handleSalvarCliente}
              onCancelar={() => setFormClienteState(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
