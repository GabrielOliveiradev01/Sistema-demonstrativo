"use client";

import type { ClienteWaitlist } from "@/lib/mock-agenda";

interface ListaEsperaAgendaProps {
  listaEspera: ClienteWaitlist[];
  onPreencherAutomaticamente: () => void;
}

export function ListaEsperaAgenda({ listaEspera, onPreencherAutomaticamente }: ListaEsperaAgendaProps) {
  return (
    <section className="border-t border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-800">
          Lista de espera inteligente
        </h3>
        <button
          type="button"
          onClick={onPreencherAutomaticamente}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Preencher horário automaticamente
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Clientes aguardando horário — prioridade por probabilidade de aceite
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {listaEspera.length === 0 && <p className="text-sm text-slate-500">Nenhum cliente na lista de espera.</p>}
        {listaEspera.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2"
          >
            <div>
              <p className="font-medium text-slate-800">{c.nome}</p>
              <p className="text-sm text-slate-500">{c.servicoDesejado}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-primary">
                {c.probabilidadeAceite}% aceite
              </p>
              <p className="text-xs text-slate-500">Prioridade #{c.prioridade}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
