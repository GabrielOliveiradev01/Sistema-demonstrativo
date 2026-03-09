"use client";

import type { ProfissionalListItem } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

export type FiltroProfissional =
  | ""
  | "baixa_ocupacao"
  | "alta_rentabilidade"
  | "alto_noshow"
  | "unidade"
  | "especialidade";

interface ListaProfissionaisProps {
  profissionais: ProfissionalListItem[];
  filtro: FiltroProfissional;
  onFiltroChange: (f: FiltroProfissional) => void;
  unidadeSelecionada: string;
  onUnidadeChange: (u: string) => void;
  especialidadeSelecionada: string;
  onEspecialidadeChange: (e: string) => void;
  onProfissionalClick: (p: ProfissionalListItem) => void;
}

export function ListaProfissionais({
  profissionais,
  filtro,
  onFiltroChange,
  unidadeSelecionada,
  onUnidadeChange,
  especialidadeSelecionada,
  onEspecialidadeChange,
  onProfissionalClick,
}: ListaProfissionaisProps) {
  const unidades = Array.from(new Set(profissionais.map((p) => p.unidade).filter(Boolean)));
  const especialidades = Array.from(new Set(profissionais.map((p) => p.especialidade).filter(Boolean)));

  let lista = [...profissionais];
  if (filtro === "baixa_ocupacao") lista = lista.filter((p) => p.taxaOcupacao < 60);
  if (filtro === "alta_rentabilidade") lista = lista.filter((p) => p.receitaMes >= 20000);
  if (filtro === "alto_noshow") lista = lista.filter((p) => p.taxaNoShow >= 10);
  if (unidadeSelecionada) lista = lista.filter((p) => p.unidade === unidadeSelecionada);
  if (especialidadeSelecionada) lista = lista.filter((p) => p.especialidade === especialidadeSelecionada);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">2. Lista inteligente de profissionais</h2>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Filtros:</span>
        {[
          { id: "" as const, label: "Todos" },
          { id: "baixa_ocupacao" as const, label: "Baixa ocupação" },
          { id: "alta_rentabilidade" as const, label: "Alta rentabilidade" },
          { id: "alto_noshow" as const, label: "Alto índice de faltas" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFiltroChange(f.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filtro === f.id ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={unidadeSelecionada}
          onChange={(e) => onUnidadeChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        >
          <option value="">Por unidade</option>
          {unidades.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <select
          value={especialidadeSelecionada}
          onChange={(e) => onEspecialidadeChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        >
          <option value="">Por especialidade</option>
          {especialidades.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-3 text-left font-medium text-slate-600">Nome</th>
              <th className="p-3 text-left font-medium text-slate-600">Especialidade</th>
              <th className="p-3 text-left font-medium text-slate-600">Receita mês</th>
              <th className="p-3 text-left font-medium text-slate-600">Ticket médio</th>
              <th className="p-3 text-left font-medium text-slate-600">Ocupação</th>
              <th className="p-3 text-left font-medium text-slate-600">No-show</th>
              <th className="p-3 text-left font-medium text-slate-600">Cancel.</th>
              <th className="p-3 text-left font-medium text-slate-600">Horas</th>
              <th className="p-3 text-left font-medium text-slate-600">R$/hora</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr
                key={p.id}
                onClick={() => onProfissionalClick(p)}
                className="cursor-pointer border-b border-slate-100 hover:bg-primary/5"
              >
                <td className="p-3 font-medium text-slate-900">{p.nome}</td>
                <td className="p-3 text-slate-600">{p.especialidade}</td>
                <td className="p-3 font-semibold text-slate-800">{formatBRL(p.receitaMes)}</td>
                <td className="p-3 text-slate-600">{formatBRL(p.ticketMedio)}</td>
                <td className="p-3">
                  <span className={p.taxaOcupacao >= 70 ? "text-green-600 font-medium" : p.taxaOcupacao < 50 ? "text-amber-600 font-medium" : "text-slate-600"}>
                    {p.taxaOcupacao}%
                  </span>
                </td>
                <td className="p-3">
                  <span className={p.taxaNoShow >= 10 ? "text-red-600 font-medium" : "text-slate-600"}>
                    {p.taxaNoShow}%
                  </span>
                </td>
                <td className="p-3 text-slate-600">{p.cancelamentos}</td>
                <td className="p-3 text-slate-600">{p.horasTrabalhadas}h</td>
                <td className="p-3 font-medium text-primary">{formatBRL(p.receitaPorHora)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
