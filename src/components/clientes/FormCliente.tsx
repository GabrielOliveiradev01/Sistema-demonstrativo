"use client";

import { useState, useEffect } from "react";
import type { Cliente } from "@/lib/mock-clientes";
import type { ClienteCreate } from "@/lib/dados-supabase";

const SEGMENTO_OPCOES = [
  { id: "vip", label: "VIP (alto LTV)" },
  { id: "recorrente", label: "Recorrentes" },
  { id: "risco_abandono", label: "Em risco de abandono" },
  { id: "risco_noshow", label: "Alto risco no-show" },
  { id: "novo", label: "Novos" },
  { id: "inativo_30", label: "Inativos 30+ dias" },
];

const CANAIS_ORIGEM = ["", "Indicação", "Site", "Instagram", "Google", "Facebook", "Outro"];

interface FormClienteProps {
  cliente?: Cliente | null;
  onSalvar: (payload: ClienteCreate) => Promise<void>;
  onCancelar: () => void;
}

function toDateInput(d: string | null): string {
  if (!d) return "";
  const x = d.slice(0, 10);
  return x;
}

export function FormCliente({ cliente, onSalvar, onCancelar }: FormClienteProps) {
  const isEdicao = !!cliente;
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [canalOrigem, setCanalOrigem] = useState(cliente?.canalOrigem ?? "");
  const [scoreConfiabilidade, setScoreConfiabilidade] = useState(cliente?.scoreConfiabilidade ?? "");
  const [scoreNoShow, setScoreNoShow] = useState(cliente?.riscoNoShow ?? "");
  const [riscoAbandono, setRiscoAbandono] = useState(cliente?.riscoAbandono ?? "");
  const [ultimaVisita, setUltimaVisita] = useState(toDateInput(cliente?.ultimaVisita ?? null));
  const [proximaVisita, setProximaVisita] = useState(toDateInput(cliente?.proximaVisita ?? null));
  const [frequenciaMedia, setFrequenciaMedia] = useState(cliente?.frequenciaMedia ?? "");
  const [ltv, setLtv] = useState(cliente?.ltv ? String(cliente.ltv) : "");
  const [totalFaltas, setTotalFaltas] = useState(cliente ? String((cliente as { totalFaltas?: number }).totalFaltas ?? 0) : "0");
  const [segmentos, setSegmentos] = useState<string[]>(cliente?.segmentos ?? []);
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome);
      setEmail(cliente.email ?? "");
      setTelefone(cliente.telefone ?? "");
      setCanalOrigem(cliente.canalOrigem ?? "");
      setScoreConfiabilidade(String(cliente.scoreConfiabilidade ?? ""));
      setScoreNoShow(String(cliente.riscoNoShow ?? ""));
      setRiscoAbandono(String(cliente.riscoAbandono ?? ""));
      setUltimaVisita(toDateInput(cliente.ultimaVisita || null));
      setProximaVisita(toDateInput(cliente.proximaVisita ?? null));
      setFrequenciaMedia(String(cliente.frequenciaMedia ?? ""));
      setLtv(String(cliente.ltv ?? ""));
      setTotalFaltas(String("totalFaltas" in cliente ? (cliente as { totalFaltas?: number }).totalFaltas ?? 0 : 0));
      setSegmentos(Array.isArray(cliente.segmentos) ? [...cliente.segmentos] : []);
    }
  }, [cliente]);

  const toggleSegmento = (id: string) => {
    setSegmentos((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) {
      setErro("Nome é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const payload: ClienteCreate = {
        nome: nome.trim(),
        email: email.trim() || null,
        telefone: telefone.trim() || null,
        canal_origem: canalOrigem.trim() || null,
        score_confiabilidade: scoreConfiabilidade === "" ? null : Math.min(100, Math.max(0, Number(scoreConfiabilidade))),
        score_no_show: scoreNoShow === "" ? null : Math.min(100, Math.max(0, Number(scoreNoShow))),
        risco_abandono: riscoAbandono === "" ? null : Math.min(100, Math.max(0, Number(riscoAbandono))),
        ultima_visita_at: ultimaVisita ? `${ultimaVisita}T12:00:00` : null,
        proxima_visita_prevista: proximaVisita || null,
        frequencia_media_mes: frequenciaMedia === "" ? null : Number(frequenciaMedia),
        ltv_cache: ltv === "" ? null : Number(ltv),
        total_faltas: totalFaltas === "" ? 0 : Math.max(0, parseInt(totalFaltas, 10) || 0),
        segmentos: segmentos.length ? segmentos : null,
        notas: notas.trim() || null,
      };
      await onSalvar(payload);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-slate-800">{isEdicao ? "Editar cliente" : "Novo cliente"}</h3>
      {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <div>
        <label className="block text-xs font-medium text-slate-600">Nome *</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Telefone</label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Canal de origem</label>
        <select
          value={canalOrigem}
          onChange={(e) => setCanalOrigem(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {CANAIS_ORIGEM.map((c) => (
            <option key={c || "vazio"} value={c}>{c || "—"}</option>
          ))}
        </select>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Campos que movimentam análises e cards</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">Score confiabilidade (0-100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={scoreConfiabilidade}
              onChange={(e) => setScoreConfiabilidade(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Score no-show (0-100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={scoreNoShow}
              onChange={(e) => setScoreNoShow(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Risco abandono (0-100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={riscoAbandono}
              onChange={(e) => setRiscoAbandono(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Última visita</label>
            <input
              type="date"
              value={ultimaVisita}
              onChange={(e) => setUltimaVisita(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Próxima visita prevista</label>
            <input
              type="date"
              value={proximaVisita}
              onChange={(e) => setProximaVisita(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Frequência (vezes/mês)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={frequenciaMedia}
              onChange={(e) => setFrequenciaMedia(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">LTV (R$)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={ltv}
              onChange={(e) => setLtv(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Total de faltas</label>
            <input
              type="number"
              min={0}
              value={totalFaltas}
              onChange={(e) => setTotalFaltas(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Segmentos</label>
        <div className="flex flex-wrap gap-2">
          {SEGMENTO_OPCOES.map((s) => (
            <label key={s.id} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={segmentos.includes(s.id)}
                onChange={() => toggleSegmento(s.id)}
                className="rounded border-slate-300"
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Notas</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2 border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Salvando…" : isEdicao ? "Salvar" : "Criar cliente"}
        </button>
        <button type="button" onClick={onCancelar} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}
