"use client";

import { MOTOR_RISCO } from "@/lib/mock-inteligencia";

export function MotorRisco() {
  const m = MOTOR_RISCO;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">2. Motor de risco (No-show & cancelamento)</h2>
      <p className="text-sm text-slate-500">
        Clientes e horários críticos. O sistema sugere ações.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h4 className="mb-3 text-sm font-medium text-slate-600">Clientes com alto risco</h4>
          <ul className="space-y-2">
            {m.clientesAltoRisco.map((c) => (
              <li key={c.nome} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                <span className="font-medium text-slate-800">{c.nome}</span>
                <span className="text-sm text-red-700">Score {c.score}% · {c.acao}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h4 className="mb-3 text-sm font-medium text-slate-600">Profissionais com maior índice de falta</h4>
          <ul className="space-y-2">
            {m.profissionaisMaiorFalta.map((p) => (
              <li key={p.nome} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{p.nome}</span>
                <span className="text-amber-700">{p.taxa}% no-show</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h4 className="mb-2 text-sm font-medium text-slate-600">Dias críticos da semana</h4>
          <p className="text-slate-800">{m.diasCriticos.join(", ")}</p>
        </div>
        <div className="card">
          <h4 className="mb-2 text-sm font-medium text-slate-600">Horários com maior cancelamento</h4>
          <p className="text-slate-800">{m.horariosMaiorCancelamento.join(", ")}</p>
        </div>
      </div>

      <div className="card border-amber-200 bg-amber-50/50">
        <h4 className="mb-2 text-sm font-medium text-amber-900">Sugestões do sistema</h4>
        <ul className="space-y-1 text-sm text-amber-800">
          {m.sugestoes.map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">Exigir sinal</button>
          <button type="button" className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100">Confirmação antecipada</button>
          <button type="button" className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100">Reorganizar agenda</button>
          <button type="button" className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100">Criar política</button>
        </div>
      </div>
    </section>
  );
}
