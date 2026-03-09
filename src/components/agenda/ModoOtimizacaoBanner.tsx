"use client";

import { SLOTS_OTIMIZACAO } from "@/lib/mock-agenda";

interface ModoOtimizacaoBannerProps {
  onReorganizar: () => void;
  onAjustarPrecos: () => void;
  onCriarPromocao: () => void;
}

export function ModoOtimizacaoBanner({
  onReorganizar,
  onAjustarPrecos,
  onCriarPromocao,
}: ModoOtimizacaoBannerProps) {
  const { premium, subvalorizados, riscoCancelamento, profissionaisOciosos } =
    SLOTS_OTIMIZACAO;

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
      <h3 className="font-semibold text-amber-900">
        Modo Otimização IA ativo — visão de oportunidades
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-2">
          <p className="text-xs font-semibold text-slate-500">Horários premium</p>
          {premium.map((s, i) => (
            <p key={i} className="text-sm text-green-700">
              {s.profissional} {s.horario}
            </p>
          ))}
        </div>
        <div className="rounded-lg bg-white p-2">
          <p className="text-xs font-semibold text-slate-500">Subvalorizados</p>
          {subvalorizados.map((s, i) => (
            <p key={i} className="text-sm text-amber-700">
              {s.profissional} {s.horario}
            </p>
          ))}
        </div>
        <div className="rounded-lg bg-white p-2">
          <p className="text-xs font-semibold text-slate-500">Risco cancelamento</p>
          {riscoCancelamento.map((s, i) => (
            <p key={i} className="text-sm text-red-700">
              {s.cliente} — {s.horario}
            </p>
          ))}
        </div>
        <div className="rounded-lg bg-white p-2">
          <p className="text-xs font-semibold text-slate-500">Profissionais ociosos</p>
          {profissionaisOciosos.map((n, i) => (
            <p key={i} className="text-sm text-slate-700">{n}</p>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-amber-800">
        Sugestões do sistema:
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReorganizar}
          className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
        >
          Reorganizar horários
        </button>
        <button
          type="button"
          onClick={onAjustarPrecos}
          className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          Ajustar preços
        </button>
        <button
          type="button"
          onClick={onCriarPromocao}
          className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          Criar promoção automática
        </button>
      </div>
    </div>
  );
}
