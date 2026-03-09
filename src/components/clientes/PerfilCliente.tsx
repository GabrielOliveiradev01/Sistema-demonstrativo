"use client";

import {
  IconX,
  IconMapPin,
  IconCalendar,
  IconXCircle,
  IconArrowsRightLeft,
  IconCreditCard,
  IconDocumentText,
  IconTrendingUp,
  IconAcademicCap,
} from "@/components/SidebarIcons";
import type { PerfilCliente as PerfilClienteType } from "@/lib/mock-clientes";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

const tipoIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  atendimento: IconCalendar,
  cancelamento: IconXCircle,
  reagendamento: IconArrowsRightLeft,
  pagamento: IconCreditCard,
  observacao: IconDocumentText,
};

interface PerfilClienteProps {
  perfil: PerfilClienteType;
  onFechar: () => void;
  onEditar?: (cliente: PerfilClienteType) => void;
}

export function PerfilCliente({ perfil, onFechar, onEditar }: PerfilClienteProps) {
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
        {/* Resumo estratégico */}
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
            <IconMapPin className="h-4 w-4" />
            Resumo estratégico
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">LTV total</p>
              <p className="font-bold text-primary">{formatBRL(perfil.ltv)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Ticket médio</p>
              <p className="font-semibold text-slate-800">{formatBRL(perfil.ticketMedio)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Frequência</p>
              <p className="font-semibold text-slate-800">{perfil.frequenciaMedia}/mês</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Total de faltas</p>
              <p className="font-semibold text-slate-800">{perfil.totalFaltas}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Score no-show</p>
              <p className="font-semibold text-slate-800">{perfil.scoreNoShow}%</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Serviço mais contratado</p>
              <p className="font-semibold text-slate-800">{perfil.servicoMaisContratado}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-slate-500">Profissional favorito</p>
              <p className="font-semibold text-slate-800">{perfil.profissionalFavorito}</p>
            </div>
          </div>
        </div>

        {/* Histórico visual */}
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
            <IconTrendingUp className="h-4 w-4" />
            Histórico visual
          </h4>
          <ul className="space-y-2">
            {perfil.historico.map((h) => (
              <li
                key={h.id}
                className="flex items-start gap-3 rounded-lg border border-slate-100 p-2"
              >
                {(() => {
                  const Icon = tipoIcon[h.tipo];
                  return Icon ? <Icon className="h-5 w-5 shrink-0 text-slate-500" /> : null;
                })()}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800">{h.titulo}</p>
                  <p className="text-xs text-slate-500">{formatDate(h.data)}</p>
                </div>
                {h.valor != null && (
                  <span className="font-semibold text-slate-700">{formatBRL(h.valor)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Inteligência aplicada */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-slate-500">
            <IconAcademicCap className="h-4 w-4" />
            Inteligência aplicada
          </h4>
          <ul className="space-y-2">
            {perfil.insightsIA.map((insight, i) => (
              <li
                key={i}
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-slate-700"
              >
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
