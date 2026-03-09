"use client";

import { useEffect, useState } from "react";
import { IconX } from "@/components/SidebarIcons";
import type { ServicoCompleto } from "@/lib/mock-servicos";
import type { CategoriaItem } from "@/lib/dados-paginas";

type Aba = "basicas" | "operacional" | "profissionais" | "regras" | "recorrencia";

const abas: { id: Aba; label: string; dot: string }[] = [
  { id: "basicas", label: "Informações Básicas", dot: "bg-green-500" },
  { id: "operacional", label: "Operacional", dot: "bg-amber-500" },
  { id: "profissionais", label: "Profissionais", dot: "bg-blue-500" },
  { id: "regras", label: "Regras Avançadas", dot: "bg-violet-500" },
  { id: "recorrencia", label: "Recorrência", dot: "bg-red-500" },
];

interface CadastroServicoProps {
  servico: ServicoCompleto | null;
  categorias: CategoriaItem[];
  isNovo: boolean;
  onFechar: () => void;
  onSalvar: (data: Partial<ServicoCompleto>) => void;
}

export function CadastroServico({ servico, categorias, isNovo, onFechar, onSalvar }: CadastroServicoProps) {
  const [aba, setAba] = useState<Aba>("basicas");
  const base = servico ?? null;
  const [form, setForm] = useState<Partial<ServicoCompleto>>(base || {});

  useEffect(() => {
    setForm(base || {});
  }, [base?.id, isNovo]);

  if (!base && !isNovo) return null;

  const data = { ...base, ...form } as ServicoCompleto;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900">{isNovo ? "Novo serviço" : data.nome}</h3>
        <button type="button" onClick={onFechar} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Fechar"><IconX className="h-5 w-5" /></button>
      </div>
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${aba === a.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${a.dot}`} />
            {a.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {aba === "basicas" && (
          <div className="space-y-4 max-w-lg">
            <div><label className="block text-sm font-medium text-slate-600">Nome</label><input type="text" value={form.nome ?? data.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-slate-600">Descrição</label><textarea value={form.descricao ?? data.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-slate-600">Categoria</label><select value={form.categoriaId ?? data.categoriaId} onChange={(e) => setForm((p) => ({ ...p, categoriaId: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">{categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-600">Duração base (min)</label><input type="number" value={form.duracao ?? data.duracao} onChange={(e) => setForm((p) => ({ ...p, duracao: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div><div><label className="block text-sm font-medium text-slate-600">Preço base</label><input type="number" value={form.precoBase ?? data.precoBase} onChange={(e) => setForm((p) => ({ ...p, precoBase: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div></div>
            <div><label className="block text-sm font-medium text-slate-600">Cor no calendário</label><input type="color" value={form.corCalendario ?? data.corCalendario} onChange={(e) => setForm((p) => ({ ...p, corCalendario: e.target.value }))} className="mt-1 h-10 w-20 rounded border border-slate-200" /></div>
            <div><label className="block text-sm font-medium text-slate-600">Imagem (URL)</label><input type="text" value={form.imagemUrl ?? data.imagemUrl ?? ""} onChange={(e) => setForm((p) => ({ ...p, imagemUrl: e.target.value }))} placeholder="Para página pública" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div>
          </div>
        )}
        {aba === "operacional" && (
          <div className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-600">Buffer antes (min)</label><input type="number" value={form.bufferAntes ?? data.bufferAntes} onChange={(e) => setForm((p) => ({ ...p, bufferAntes: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div><div><label className="block text-sm font-medium text-slate-600">Buffer depois (min)</label><input type="number" value={form.bufferDepois ?? data.bufferDepois} onChange={(e) => setForm((p) => ({ ...p, bufferDepois: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={form.exigirSinal ?? data.exigirSinal} onChange={(e) => setForm((p) => ({ ...p, exigirSinal: e.target.checked }))} /><label className="text-sm text-slate-700">Exigir sinal?</label></div>
            <div><label className="block text-sm font-medium text-slate-600">% do sinal</label><input type="number" value={form.percentualSinal ?? data.percentualSinal} onChange={(e) => setForm((p) => ({ ...p, percentualSinal: Number(e.target.value) }))} className="mt-1 w-full max-w-[100px] rounded-lg border border-slate-200 px-3 py-2" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={form.permitirDesconto ?? data.permitirDesconto} onChange={(e) => setForm((p) => ({ ...p, permitirDesconto: e.target.checked }))} /><label className="text-sm text-slate-700">Permitir desconto?</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={form.disponivelOnline ?? data.disponivelOnline} onChange={(e) => setForm((p) => ({ ...p, disponivelOnline: e.target.checked }))} /><label className="text-sm text-slate-700">Disponível online?</label></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-600">Antecedência mín. (min)</label><input type="number" value={form.antecedenciaMinima ?? data.antecedenciaMinima} onChange={(e) => setForm((p) => ({ ...p, antecedenciaMinima: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div><div><label className="block text-sm font-medium text-slate-600">Antecedência máx. (dias)</label><input type="number" value={form.antecedenciaMaxima ?? data.antecedenciaMaxima} onChange={(e) => setForm((p) => ({ ...p, antecedenciaMaxima: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div></div>
          </div>
        )}
        {aba === "profissionais" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Preço e duração personalizados por profissional (ex: Manicure A R$ 80, Manicure B R$ 100).</p>
            {!data.profissionais?.length && <p className="text-sm text-slate-400">Nenhum profissional vinculado. Adicione na configuração geral.</p>}
            {data.profissionais?.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2"><input type="checkbox" defaultChecked={p.ativo} /><span className="font-medium text-slate-800">{p.nome}</span></div>
                <div><label className="text-xs text-slate-500">Preço</label><input type="number" defaultValue={p.precoPersonalizado ?? data.precoBase} className="ml-1 w-20 rounded border border-slate-200 px-2 py-1 text-sm" /></div>
                <div><label className="text-xs text-slate-500">Duração (min)</label><input type="number" defaultValue={p.duracaoPersonalizada ?? data.duracao} className="ml-1 w-16 rounded border border-slate-200 px-2 py-1 text-sm" /></div>
                <div><label className="text-xs text-slate-500">Comissão %</label><input type="number" defaultValue={p.comissaoPersonalizada ?? 0} className="ml-1 w-14 rounded border border-slate-200 px-2 py-1 text-sm" /></div>
              </div>
            ))}
          </div>
        )}
        {aba === "regras" && (
          <div className="space-y-4 max-w-lg">
            <div><label className="block text-sm font-medium text-slate-600">Preço dinâmico por dia</label><p className="mt-1 text-xs text-slate-500">Ex: Segunda R$ 70, Sábado R$ 95</p><input type="text" placeholder="Configurar" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-slate-600">Preço por faixa de horário</label><p className="mt-1 text-xs text-slate-500">Ex: Sábado 10h-14h +R$ 15</p><input type="text" placeholder="Configurar" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></div>
            <div><label className="block text-sm font-medium text-slate-600">Limite diário de atendimentos</label><input type="number" placeholder="Ilimitado" className="mt-1 w-full max-w-[120px] rounded-lg border border-slate-200 px-3 py-2" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked={data.apenasRecorrentes} /><label className="text-sm text-slate-700">Só permitir para clientes recorrentes</label></div>
            <div><label className="block text-sm font-medium text-slate-600">Score mínimo do cliente</label><input type="number" placeholder="Nenhum" className="mt-1 w-full max-w-[100px] rounded-lg border border-slate-200 px-3 py-2" /></div>
          </div>
        )}
        {aba === "recorrencia" && (
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked={data.recorrente} /><label className="text-sm text-slate-700">Serviço recorrente?</label></div>
            <div><label className="block text-sm font-medium text-slate-600">Intervalo automático (dias)</label><input type="number" defaultValue={data.intervaloDias ?? 30} placeholder="Ex: 30" className="mt-1 w-full max-w-[120px] rounded-lg border border-slate-200 px-3 py-2" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" defaultChecked={data.gerarProximosAutomatico} /><label className="text-sm text-slate-700">Gerar próximos agendamentos automaticamente?</label></div>
            <div><label className="block text-sm font-medium text-slate-600">Limite de repetições</label><input type="number" placeholder="Ilimitado" className="mt-1 w-full max-w-[120px] rounded-lg border border-slate-200 px-3 py-2" /></div>
          </div>
        )}
      </div>
      <div className="border-t border-slate-200 p-4">
        <button type="button" onClick={() => onSalvar(form)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Salvar serviço</button>
      </div>
    </div>
  );
}
