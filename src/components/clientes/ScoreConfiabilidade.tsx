"use client";

export function ScoreConfiabilidade() {
  const criterios = [
    "Histórico de faltas",
    "Cancelamentos",
    "Antecedência do agendamento",
    "Frequência de visitas",
    "Forma de pagamento",
  ];

  const classificacoes = [
    { dot: "bg-green-500", label: "Confiável", acoes: "Sem restrições" },
    { dot: "bg-amber-500", label: "Moderado", acoes: "Lembrete reforçado" },
    { dot: "bg-red-500", label: "Alto risco", acoes: "Sinal automático, confirmação dupla ou bloqueio" },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">5. Score de confiabilidade</h2>
      <p className="text-sm text-slate-500">
        Índice por cliente que define ações automáticas do sistema.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h4 className="mb-2 text-sm font-medium text-slate-700">Critérios do índice</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
            {criterios.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h4 className="mb-2 text-sm font-medium text-slate-700">Classificação e ações</h4>
          <ul className="space-y-2">
            {classificacoes.map((c) => (
              <li key={c.label} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2">
                <span className={`h-3 w-3 shrink-0 rounded-full ${c.dot}`} />
                <div>
                  <p className="font-medium text-slate-800">{c.label}</p>
                  <p className="text-xs text-slate-500">{c.acoes}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <p className="text-sm font-medium text-amber-900">
          O sistema pode: exigir sinal automático, forçar confirmação dupla ou bloquear agendamento recorrente para clientes de alto risco.
        </p>
      </div>
    </section>
  );
}
