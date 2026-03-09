"use client";

import { useState, useMemo } from "react";
import type { Cliente } from "@/lib/mock-clientes";

const SEGMENTOS: { id: string; label: string }[] = [
  { id: "", label: "Todos" },
  { id: "vip", label: "VIP" },
  { id: "recorrente", label: "Recorrentes" },
  { id: "risco_abandono", label: "Em risco" },
  { id: "risco_noshow", label: "Alto no-show" },
  { id: "novo", label: "Novos" },
  { id: "inativo_30", label: "Inativos 30+ dias" },
];

function telefoneValido(t: string | undefined): boolean {
  if (!t) return false;
  const nums = t.replace(/\D/g, "");
  return nums.length >= 10 && nums.length <= 11;
}

export type TipoMensagem = "texto" | "texto_imagem";

interface CampanhaWhatsAppProps {
  clientes: Cliente[];
  loading?: boolean;
  segmentoPreSelecionado?: string;
  onDisparar?: (payload: {
    tipo: TipoMensagem;
    mensagem: string;
    imagemBase64?: string;
    clienteIds: string[];
  }) => void;
}

export function CampanhaWhatsApp({
  clientes,
  loading,
  segmentoPreSelecionado = "",
  onDisparar,
}: CampanhaWhatsAppProps) {
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>("texto");
  const [mensagem, setMensagem] = useState("");
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [segmentoFiltro, setSegmentoFiltro] = useState(segmentoPreSelecionado);
  const [idsSelecionados, setIdsSelecionados] = useState<Set<string>>(new Set());
  const [selecionarTodos, setSelecionarTodos] = useState(false);
  const [disparando, setDisparando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const clientesFiltrados = useMemo(() => {
    let list = clientes.filter((c) => telefoneValido(c.telefone));
    if (segmentoFiltro) {
      list = list.filter((c) => c.segmentos.includes(segmentoFiltro as never));
    }
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter((c) => c.nome.toLowerCase().includes(q) || c.telefone.includes(busca));
    }
    return list;
  }, [clientes, segmentoFiltro, busca]);

  const selecionados = useMemo(() => {
    if (selecionarTodos) return clientesFiltrados.map((c) => c.id);
    return Array.from(idsSelecionados).filter((id) => clientesFiltrados.some((c) => c.id === id));
  }, [clientesFiltrados, idsSelecionados, selecionarTodos]);

  const toggleCliente = (id: string) => {
    setIdsSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    setSelecionarTodos((v) => !v);
    if (!selecionarTodos) {
      setIdsSelecionados(new Set(clientesFiltrados.map((c) => c.id)));
    } else {
      setIdsSelecionados(new Set());
    }
  };

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErro("Selecione uma imagem (JPG, PNG ou GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErro("Imagem deve ter no máximo 5 MB");
      return;
    }
    setErro(null);
    setImagemFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagemPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImagemChange(fakeEvent);
    }
  };

  const handleDisparar = async () => {
    setErro(null);
    if (!mensagem.trim()) {
      setErro("Digite a mensagem da campanha");
      return;
    }
    if (selecionados.length === 0) {
      setErro("Selecione pelo menos um cliente");
      return;
    }
    if (tipoMensagem === "texto_imagem" && !imagemFile) {
      setErro("Selecione uma imagem para o tipo texto + imagem");
      return;
    }

    setDisparando(true);
    try {
      let imagemBase64: string | undefined;
      if (imagemFile) {
        const buf = await imagemFile.arrayBuffer();
        const b64 = btoa(
          new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), "")
        );
        imagemBase64 = `data:${imagemFile.type};base64,${b64}`;
      }
      await onDisparar?.({
        tipo: tipoMensagem,
        mensagem: mensagem.trim(),
        imagemBase64,
        clienteIds: selecionados,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao disparar campanha");
    } finally {
      setDisparando(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
      {/* Coluna esquerda: mensagem */}
      <div className="space-y-6">
        {/* Tipo */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tipo de mensagem
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTipoMensagem("texto")}
              className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                tipoMensagem === "texto"
                  ? "border-[#25D366] bg-[#25D366]/5 shadow-inner"
                  : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-100/50"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                tipoMensagem === "texto" ? "bg-[#25D366]/20" : "bg-slate-200/60 group-hover:bg-slate-200"
              }`}>
                <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${tipoMensagem === "texto" ? "text-[#25D366]" : "text-slate-600"}`}>
                Texto simples
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTipoMensagem("texto_imagem")}
              className={`group flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                tipoMensagem === "texto_imagem"
                  ? "border-[#25D366] bg-[#25D366]/5 shadow-inner"
                  : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-100/50"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                tipoMensagem === "texto_imagem" ? "bg-[#25D366]/20" : "bg-slate-200/60 group-hover:bg-slate-200"
              }`}>
                <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className={`text-sm font-medium ${tipoMensagem === "texto_imagem" ? "text-[#25D366]" : "text-slate-600"}`}>
                Texto + imagem
              </span>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Mensagem
          </p>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Olá {nome}! Temos uma novidade especial para você..."
            rows={4}
            className="mb-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-[#25D366] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25D366]/20"
          />
          {tipoMensagem === "texto_imagem" && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImagemChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {imagemPreview ? (
                <div className="relative aspect-video">
                  <img src={imagemPreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagemFile(null);
                      setImagemPreview(null);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur hover:bg-black/70"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="mb-2 rounded-full bg-slate-200/80 p-4">
                    <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">Arraste uma imagem ou clique para selecionar</p>
                  <p className="mt-0.5 text-xs text-slate-400">JPG, PNG ou GIF — até 5 MB</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Coluna direita: destinatários */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start">
        <div className="border-b border-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Destinatários
            </p>
            <span className="rounded-full bg-[#25D366]/10 px-2.5 py-0.5 text-xs font-semibold text-[#25D366]">
              {selecionados.length} selecionados
            </span>
          </div>
          <div className="space-y-2">
            <select
              value={segmentoFiltro}
              onChange={(e) => setSegmentoFiltro(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366]/30"
            >
              {SEGMENTOS.map((s) => (
                <option key={s.id || "todos"} value={s.id}>{s.label}</option>
              ))}
            </select>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-[#25D366] focus:outline-none focus:ring-1 focus:ring-[#25D366]/30"
            />
            <label className="flex cursor-pointer items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={selecionarTodos}
                onChange={toggleTodos}
                className="h-4 w-4 rounded border-slate-300 text-[#25D366] focus:ring-[#25D366]"
              />
              <span className="text-sm text-slate-600">Selecionar todos</span>
            </label>
          </div>
        </div>
        <div className="max-h-72 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#25D366] border-t-transparent" />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">Nenhum cliente com telefone</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {clientesFiltrados.map((c) => {
                const checked = selecionarTodos || idsSelecionados.has(c.id);
                return (
                  <li key={c.id}>
                    <label className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
                      checked ? "bg-[#25D366]/5" : "hover:bg-slate-50/80"
                    }`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCliente(c.id)}
                        disabled={selecionarTodos}
                        className="h-4 w-4 rounded border-slate-300 text-[#25D366] focus:ring-[#25D366]"
                      />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-sm font-semibold text-slate-600">
                        {c.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{c.nome}</p>
                        <p className="truncate text-xs text-slate-500">{c.telefone}</p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Rodapé com erro e botão */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        {erro && (
          <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Configure a integração com WhatsApp para envio real
          </p>
          <button
            type="button"
            onClick={handleDisparar}
            disabled={disparando || loading}
            className="flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/25 transition-all hover:bg-[#20BD5A] hover:shadow-[#25D366]/30 disabled:opacity-50"
          >
            {disparando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enviando…
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Disparar campanha
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
