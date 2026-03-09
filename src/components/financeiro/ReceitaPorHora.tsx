"use client";

import { IconLightBulb } from "@/components/SidebarIcons";
import type { ReceitaPorHoraData } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

interface Props {
  data: ReceitaPorHoraData | null;
  loading?: boolean;
}

export function ReceitaPorHora({ data, loading }: Props) {
  const h = data ?? {
    receitaPorHoraTrabalhada: 0,
    receitaPorHoraDisponivel: 0,
    horasProdutivas: 0,
    horasOciosas: 0,
    custoOciosidadeEstimado: 0,
    insightOciosidade: "Carregando…",
  };
  const totalHoras = h.horasProdutivas + h.horasOciosas;
  const pctProdutivo = totalHoras > 0 ? (h.horasProdutivas / totalHoras) * 100 : 0;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">4. Receita por hora</h2>
      <p className="text-sm text-slate-500">
        Diferencial: receita baseada em tempo e custo da ociosidade.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Receita por hora trabalhada</p>
          <p className="text-xl font-bold text-primary">{formatBRL(h.receitaPorHoraTrabalhada)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Receita por hora disponível</p>
          <p className="text-xl font-bold text-slate-800">{formatBRL(h.receitaPorHoraDisponivel)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Horas produtivas</p>
          <p className="text-xl font-bold text-green-700">{h.horasProdutivas}h</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-slate-500">Horas ociosas</p>
          <p className="text-xl font-bold text-amber-600">{h.horasOciosas}h</p>
        </div>
        <div className="card border-amber-200 bg-amber-50/50">
          <p className="text-xs font-medium text-slate-500">Custo estimado da ociosidade</p>
          <p className="text-xl font-bold text-amber-700">{formatBRL(h.custoOciosidadeEstimado)}</p>
        </div>
      </div>

      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
        <p className="flex items-center gap-2 font-medium text-amber-900">
          <IconLightBulb className="h-5 w-5 shrink-0" />
          Insight automático
        </p>
        <p className="mt-1 text-amber-800">{h.insightOciosidade}</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-amber-700">
          <span>Produtivo: {pctProdutivo.toFixed(0)}%</span>
          <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${pctProdutivo}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
