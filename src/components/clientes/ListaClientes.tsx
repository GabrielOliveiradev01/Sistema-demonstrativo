"use client";

import type { Cliente } from "@/lib/mock-clientes";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const scoreLabel: Record<string, string> = {
  confiavel: "Confiável",
  moderado: "Moderado",
  alto_risco: "Alto risco",
};

const scoreCor: Record<string, string> = {
  confiavel: "bg-green-100 text-green-800",
  moderado: "bg-amber-100 text-amber-800",
  alto_risco: "bg-red-100 text-red-800",
};

export type FiltroRapido =
  | ""
  | "risco"
  | "alto_valor"
  | "novos"
  | "alto_noshow"
  | "segmento";

interface ListaClientesProps {
  clientes: Cliente[];
  filtroRapido: FiltroRapido;
  onFiltroRapidoChange: (f: FiltroRapido) => void;
  segmentoPersonalizado: string;
  onSegmentoChange: (s: string) => void;
  onClienteClick: (c: Cliente) => void;
}

export function ListaClientes({
  clientes,
  filtroRapido,
  onFiltroRapidoChange,
  segmentoPersonalizado,
  onSegmentoChange,
  onClienteClick,
}: ListaClientesProps) {
  const filtros: { id: FiltroRapido; label: string }[] = [
    { id: "", label: "Todos" },
    { id: "risco", label: "Em risco" },
    { id: "alto_valor", label: "Alto valor" },
    { id: "novos", label: "Novos" },
    { id: "alto_noshow", label: "Alto risco no-show" },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">2. Lista inteligente de clientes</h2>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Filtros rápidos:</span>
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFiltroRapidoChange(f.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              filtroRapido === f.id ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <select
          value={segmentoPersonalizado}
          onChange={(e) => onSegmentoChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
        >
          <option value="">Segmentação personalizada</option>
          <option value="vip">VIP</option>
          <option value="recorrente">Recorrentes</option>
          <option value="risco_abandono">Risco abandono</option>
          <option value="inativo_30">Inativos 30+ dias</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-3 text-left font-medium text-slate-600">Nome</th>
              <th className="p-3 text-left font-medium text-slate-600">Última visita</th>
              <th className="p-3 text-left font-medium text-slate-600">Próxima visita</th>
              <th className="p-3 text-left font-medium text-slate-600">Frequência</th>
              <th className="p-3 text-left font-medium text-slate-600">LTV</th>
              <th className="p-3 text-left font-medium text-slate-600">Confiabilidade</th>
              <th className="p-3 text-left font-medium text-slate-600">Risco abandono</th>
              <th className="p-3 text-left font-medium text-slate-600">Canal</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr
                key={c.id}
                onClick={() => onClienteClick(c)}
                className="cursor-pointer border-b border-slate-100 hover:bg-primary/5"
              >
                <td className="p-3 font-medium text-slate-900">{c.nome}</td>
                <td className="p-3 text-slate-600">{formatDate(c.ultimaVisita)}</td>
                <td className="p-3 text-slate-600">{formatDate(c.proximaVisita)}</td>
                <td className="p-3 text-slate-600">{c.frequenciaMedia}/mês</td>
                <td className="p-3 font-semibold text-slate-800">{formatBRL(c.ltv)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${scoreCor[c.scoreConfiabilidadeLabel]}`}>
                    {scoreLabel[c.scoreConfiabilidadeLabel]} ({c.scoreConfiabilidade})
                  </span>
                </td>
                <td className="p-3">
                  <span className={c.riscoAbandono > 40 ? "text-amber-600 font-medium" : "text-slate-600"}>
                    {c.riscoAbandono}%
                  </span>
                </td>
                <td className="p-3 text-slate-600">{c.canalOrigem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
