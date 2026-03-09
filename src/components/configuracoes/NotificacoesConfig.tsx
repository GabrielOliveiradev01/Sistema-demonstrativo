"use client";

import type { CanalNotificacao, TemplateNotificacao } from "@/lib/dados-paginas";

interface Props {
  data: { canais: CanalNotificacao[]; templates: TemplateNotificacao[] };
  loading?: boolean;
}

export function NotificacoesConfig({ data, loading }: Props) {
  const { canais = [], templates = [] } = data ?? {};
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">6. Notificações</h2>
      <p className="text-sm text-slate-500">Canais e templates com variáveis dinâmicas.</p>
      <div className="card">
        <h4 className="mb-3 text-sm font-medium text-slate-600">Canais</h4>
        <div className="flex flex-wrap gap-4">
          {(loading ? [] : canais).map((c) => (
            <label key={c.id} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={c.ativo} />
              <span className="text-sm text-slate-800">{c.nome}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="card">
        <h4 className="mb-3 text-sm font-medium text-slate-600">Templates</h4>
        <p className="mb-2 text-xs text-slate-500">Variáveis: {"{{nome_cliente}}"}, {"{{data}}"}, {"{{profissional}}"}, {"{{horario}}"}, {"{{servico}}"}</p>
        <div className="space-y-2">
          {(loading ? [] : templates).map((t) => (
            <div key={t.tipo} className="rounded-lg border border-slate-200 p-3">
              <p className="font-medium text-slate-800">{t.tipo}</p>
              <p className="text-xs text-slate-500">{t.variaveis}</p>
              <textarea rows={2} placeholder="Conteúdo do template..." className="mt-2 w-full rounded border border-slate-200 px-2 py-1 text-sm" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
