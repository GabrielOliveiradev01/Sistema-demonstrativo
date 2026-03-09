"use client";

import type { HorarioConfig } from "@/lib/dados-paginas";

interface Props {
  data: HorarioConfig[];
  loading?: boolean;
}

export function HorariosFuncionamento({ data: horarios = [], loading }: Props) {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">4. Horários de funcionamento</h2>
      <p className="text-sm text-slate-500">Por dia da semana, unidade ou profissional. Almoço, bloqueios, feriados.</p>
      <div className="card">
        <div className="mb-4 flex gap-2">
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option>Geral</option>
            <option>Por unidade</option>
            <option>Por profissional</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-2 text-left font-medium text-slate-600">Dia</th>
                <th className="p-2 text-left font-medium text-slate-600">Abre</th>
                <th className="p-2 text-left font-medium text-slate-600">Fecha</th>
                <th className="p-2 text-left font-medium text-slate-600">Fechado</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : horarios).map((h) => (
                <tr key={h.dia} className="border-b border-slate-100">
                  <td className="p-2 font-medium text-slate-800">{h.dia}</td>
                  <td className="p-2">
                    <input type="time" defaultValue={h.abre} className="rounded border border-slate-200 px-2 py-1" disabled={h.fechado} />
                  </td>
                  <td className="p-2">
                    <input type="time" defaultValue={h.fecha} className="rounded border border-slate-200 px-2 py-1" disabled={h.fechado} />
                  </td>
                  <td className="p-2">
                    <input type="checkbox" defaultChecked={h.fechado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-500">Horário de almoço, bloqueios recorrentes e feriados configuráveis por unidade/profissional.</p>
      </div>
    </section>
  );
}
