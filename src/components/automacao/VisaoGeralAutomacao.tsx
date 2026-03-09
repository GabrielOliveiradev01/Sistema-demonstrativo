"use client";

import {
  IconCpuChip,
  IconArrowsRightLeft,
  IconCurrency,
  IconClock,
  IconExclamation,
} from "@/components/SidebarIcons";
import { VISAO_GERAL_AUTOMACAO } from "@/lib/mock-automacao";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const cards = [
  { key: "automacoesAtivas", Icon: IconCpuChip, titulo: "Automações ativas" },
  { key: "execucoesEstaSemana", Icon: IconArrowsRightLeft, titulo: "Execuções esta semana" },
  { key: "receitaGeradaAutomaticamente", Icon: IconCurrency, titulo: "Receita gerada automaticamente", format: "currency" },
  { key: "tempoEconomizadoHoras", Icon: IconClock, titulo: "Tempo economizado est.", sub: "horas" },
  { key: "fluxosComErro", Icon: IconExclamation, titulo: "Fluxos com erro", destaque: true },
];

export function VisaoGeralAutomacao({ onCriarNova }: { onCriarNova: () => void }) {
  const v = VISAO_GERAL_AUTOMACAO;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">1. Visão geral de automações</h2>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((c) => {
            const valor = (v as Record<string, number>)[c.key];
            const fmt = (c as { format?: string }).format;
            const display = fmt === "currency" ? formatBRL(valor) : valor;
            const sub = (c as { sub?: string }).sub;
            return (
              <div
                key={c.key}
                className={`card ${(c as { destaque?: boolean }).destaque && valor > 0 ? "border-amber-200 bg-amber-50/50" : ""}`}
              >
                <c.Icon className="h-6 w-6 text-slate-600" />
                <p className="mt-1 text-xs font-medium text-slate-500">{c.titulo}</p>
                <p className={`text-lg font-bold ${(c as { destaque?: boolean }).destaque && valor > 0 ? "text-amber-700" : "text-slate-800"}`}>
                  {display}{sub ? ` ${sub}` : ""}
                </p>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onCriarNova}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Criar nova automação
        </button>
      </div>
    </section>
  );
}
