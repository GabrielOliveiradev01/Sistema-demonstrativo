"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function getBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-lg">
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-slate-500">Preparando redefinição…</p>
            </div>
          </div>
        </div>
      }
    >
      <RedefinirSenhaConteudo />
    </Suspense>
  );
}

function RedefinirSenhaConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [ready, setReady] = useState(false);

  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");
  const redirectTo = useMemo(() => `${getBaseUrl()}/redefinir-senha`, []);

  useEffect(() => {
    let cancelled = false;

    async function initRecoverySession() {
      setErro("");

      if (errorDescription) {
        setErro(decodeURIComponent(errorDescription));
        setReady(true);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!cancelled && error) {
          setErro(error.message);
        }
        if (!cancelled) setReady(true);
        return;
      }

      // Se o usuário já tem sessão (ex: voltou do link em outra aba), permite seguir
      const { data, error } = await supabase.auth.getSession();
      if (!cancelled) {
        if (error) setErro(error.message);
        setReady(Boolean(data.session));
      }
    }

    void initRecoverySession();
    return () => {
      cancelled = true;
    };
  }, [code, errorDescription]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) {
        setErro(error.message);
        return;
      }
      setSucesso("Senha atualizada com sucesso. Redirecionando para o login…");
      setSenha("");
      setConfirmar("");
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 900);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Definir nova senha</h1>
          <p className="mt-1 text-sm text-slate-500">Escolha uma nova senha para sua conta.</p>
        </div>

        {!ready ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-slate-500">Preparando redefinição…</p>
          </div>
        ) : (
          <>
            {erro && (
              <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}
            {sucesso && (
              <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {sucesso}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nova senha
                </label>
                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label htmlFor="confirmar" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirmar nova senha
                </label>
                <input
                  id="confirmar"
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-xl bg-primary py-3 font-medium text-white shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
              >
                {carregando ? "Salvando…" : "Salvar nova senha"}
              </button>

              <button
                type="button"
                onClick={async () => {
                  // Reenvia link para o e-mail atual (se o usuário quiser)
                  const { data } = await supabase.auth.getUser();
                  const userEmail = data.user?.email;
                  if (!userEmail) {
                    setErro("Não foi possível identificar seu e-mail. Solicite um novo link.");
                    return;
                  }
                  const { error } = await supabase.auth.resetPasswordForEmail(userEmail, { redirectTo });
                  if (error) setErro(error.message);
                  else setSucesso("Link reenviado para seu e-mail.");
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Reenviar link
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Voltar para{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

