"use client";

import { VisaoGeralAutomacao } from "@/components/automacao/VisaoGeralAutomacao";
import { AutomacoesAgendamento } from "@/components/automacao/AutomacoesAgendamento";
import { AutomacoesCancelamento } from "@/components/automacao/AutomacoesCancelamento";
import { AutomacoesOcupacao } from "@/components/automacao/AutomacoesOcupacao";
import { AutomacoesCliente } from "@/components/automacao/AutomacoesCliente";
import { ConstrutorFluxos } from "@/components/automacao/ConstrutorFluxos";

export default function AutomacaoPage() {
  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Automação</h1>
        <p className="text-slate-500">
          Fluxos por agendamento, cancelamento, ocupação e cliente — e construtor SE → ENTÃO → SENÃO
        </p>
      </header>

      <div className="space-y-8">
        <VisaoGeralAutomacao onCriarNova={() => {}} />
        <AutomacoesAgendamento />
        <AutomacoesCancelamento />
        <AutomacoesOcupacao />
        <AutomacoesCliente />
        <ConstrutorFluxos />
      </div>
    </div>
  );
}
