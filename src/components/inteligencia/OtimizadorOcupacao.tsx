"use client";

import { IconFire, IconTrendingDown, IconXCircle } from "@/components/SidebarIcons";
import { OTIMIZADOR_OCUPACAO } from "@/lib/mock-inteligencia";

export function OtimizadorOcupacao() {
  const o = OTIMIZADOR_OCUPACAO;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">3. Otimizador de ocupação</h2>
      <p className="text-sm text-slate-500">Mapa inteligente da agenda.</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <IconFire className="h-4 w-4" />
            Horários premium (alta demanda)
          </h4>
          <ul className="space-y-2">
            {o.premium.map((h) => (
              <li key={h.horario} className="flex justify-between rounded-lg bg-green-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{h.horario}</span>
                <span className="text-green-700">{h.profissional}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Horários neutros
          </h4>
          <ul className="space-y-2">
            {o.neutros.map((h) => (
              <li key={h.horario} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-800">{h.horario}</span>
                <span className="text-slate-600">{h.profissional}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <IconXCircle className="h-4 w-4" />
            Horários subutilizados
          </h4>
          <ul className="space-y-2">
            {o.subutilizados.map((h) => (
              <li key={h.horario} className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
                <span className="text-slate-800">{h.horario}</span>
                <span className="text-amber-700">{h.slots} slots · {h.profissional}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <IconTrendingDown className="h-4 w-4" />
            Profissionais abaixo da média
          </h4>
          <ul className="space-y-2">
            {o.abaixoMedia.map((p) => (
              <li key={p.nome} className="flex justify-between rounded-lg bg-red-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{p.nome}</span>
                <span className="text-red-700">{p.ocupacao}% (média {p.media}%)</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card border-primary/20 bg-primary/5">
        <h4 className="mb-2 text-sm font-medium text-slate-700">Sugestões automáticas</h4>
        <ul className="space-y-1 text-sm text-slate-700">
          {o.sugestoes.map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark">Aumentar preço premium</button>
          <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Promoção horários mortos</button>
          <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Redistribuir agenda</button>
          <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Ajustar carga</button>
        </div>
      </div>
    </section>
  );
}
