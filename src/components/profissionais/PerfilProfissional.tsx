"use client";

import {
  IconX,
  IconMapPin,
  IconCalendar,
  IconChart,
  IconAcademicCap,
} from "@/components/SidebarIcons";
import type { PerfilProfissionalFull } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

interface PerfilProfissionalProps {
  perfil: PerfilProfissionalFull;
  onFechar: () => void;
  onEditar?: (perfil: PerfilProfissionalFull) => void;
}

export function PerfilProfissional({ perfil, onFechar, onEditar }: PerfilProfissionalProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900">{perfil.nome}</h3>
        <div className="flex items-center gap-1">
          {onEditar && (
            <button
              type="button"
              onClick={() => onEditar(perfil)}
              className="rounded px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Editar
            </button>
          )}
          <button
            type="button"
            onClick={onFechar}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {/* Resumo executivo */}
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
            <IconMapPin className="h-4 w-4" />
            Resumo executivo
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Receita do mês</p>
              <p className="font-bold text-primary">{formatBRL(perfil.receitaMes)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Receita do ano</p>
              <p className="font-semibold text-slate-800">{formatBRL(perfil.receitaAno)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Ticket médio</p>
              <p className="font-semibold text-slate-800">{formatBRL(perfil.ticketMedio)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Ocupação</p>
              <p className="font-semibold text-slate-800">{perfil.taxaOcupacao}%</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Horas produtivas</p>
              <p className="font-semibold text-slate-800">{perfil.horasTrabalhadas}h</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Horas ociosas</p>
              <p className="font-semibold text-amber-600">{perfil.horasOciosas}h</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Receita por hora</p>
              <p className="font-semibold text-primary">{formatBRL(perfil.receitaPorHora)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Meta individual</p>
              <p className="font-semibold text-slate-800">{formatBRL(perfil.metaIndividual)}</p>
            </div>
          </div>
        </div>

        {/* Gestão de horários */}
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
            <IconCalendar className="h-4 w-4" />
            Gestão de horários
          </h4>
          <ul className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm">
            <li><strong>Horários fixos:</strong> {perfil.horariosFixos}</li>
            <li><strong>Intervalos:</strong> {perfil.intervalos}</li>
            <li><strong>Férias:</strong> {perfil.ferias}</li>
          </ul>
        </div>

        {/* Performance detalhada */}
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
            <IconChart className="h-4 w-4" />
            Performance detalhada
          </h4>
          <p className="mb-2 text-xs text-slate-500">Serviços mais realizados · Crescimento mensal: {perfil.crescimentoMensal}%</p>
          <ul className="space-y-2">
            {perfil.servicosMaisRealizados.map((s) => (
              <li key={s.nome} className="flex justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{s.nome}</span>
                <span className="text-slate-600">{s.qtd} atend. · Margem {s.margem}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Inteligência aplicada (no perfil) */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
            <IconAcademicCap className="h-4 w-4" />
            Inteligência aplicada
          </h4>
          <ul className="space-y-2">
            {perfil.insightsIA.map((insight, i) => (
              <li key={i} className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-slate-700">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
