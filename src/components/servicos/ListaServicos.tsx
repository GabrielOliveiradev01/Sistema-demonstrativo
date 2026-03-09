"use client";

import { IconPlus, IconCube, IconPencil, IconClipboard, IconFolder } from "@/components/SidebarIcons";
import type { ServicoListItem } from "@/lib/dados-paginas";

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);

interface ListaServicosProps {
  servicos: ServicoListItem[];
  categorias: { id: string; nome: string }[];
  filtroCategoria: string;
  onFiltroCategoria: (v: string) => void;
  filtroStatus: string;
  onFiltroStatus: (v: string) => void;
  onCriarServico: () => void;
  onCriarPacote: () => void;
  onEditar: (id: string) => void;
  onDuplicar: (id: string) => void;
  onArquivar: (id: string) => void;
}

export function ListaServicos({
  servicos,
  categorias,
  filtroCategoria,
  onFiltroCategoria,
  filtroStatus,
  onFiltroStatus,
  onCriarServico,
  onCriarPacote,
  onEditar,
  onDuplicar,
  onArquivar,
}: ListaServicosProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">1. Lista de serviços</h2>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filtroCategoria}
            onChange={(e) => onFiltroCategoria(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => onFiltroStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCriarServico}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <IconPlus className="h-4 w-4" />
            Criar serviço
          </button>
          <button
            type="button"
            onClick={onCriarPacote}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconCube className="h-4 w-4" />
            Criar pacote
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-3 text-left font-medium text-slate-600">Nome</th>
              <th className="p-3 text-left font-medium text-slate-600">Categoria</th>
              <th className="p-3 text-left font-medium text-slate-600">Duração</th>
              <th className="p-3 text-left font-medium text-slate-600">Preço base</th>
              <th className="p-3 text-left font-medium text-slate-600">Profissionais</th>
              <th className="p-3 text-left font-medium text-slate-600">Status</th>
              <th className="p-3 text-left font-medium text-slate-600">Receita 30 dias</th>
              <th className="p-3 text-left font-medium text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-900">{s.nome}</td>
                <td className="p-3 text-slate-600">{s.categoriaNome}</td>
                <td className="p-3 text-slate-600">{s.duracao} min</td>
                <td className="p-3 font-semibold text-slate-800">{formatBRL(s.precoBase)}</td>
                <td className="p-3 text-slate-600">{s.profissionaisVinculados}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "ativo" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-3 font-medium text-primary">{formatBRL(s.receita30Dias)}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => onEditar(s.id)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Editar"><IconPencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => onDuplicar(s.id)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Duplicar"><IconClipboard className="h-4 w-4" /></button>
                    <button type="button" onClick={() => onArquivar(s.id)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Arquivar"><IconFolder className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
