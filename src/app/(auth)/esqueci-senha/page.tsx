"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function getBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const redirectTo = useMemo(() => `${getBaseUrl()}/redefinir-senha`, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setErro(error.message);
        return;
      }
      setSucesso("Se o e-mail existir, você receberá um link para redefinir sua senha.");
      setEmail("");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Redefinir senha</h1>
          <p className="mt-1 text-sm text-slate-500">Informe seu e-mail para receber o link de redefinição.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {erro && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {sucesso}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-primary py-3 font-medium text-white shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
          >
            {carregando ? "Enviando…" : "Enviar link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Voltar para{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            login
          </Link>
        </p>
      </div>
    </div>
  );
}
