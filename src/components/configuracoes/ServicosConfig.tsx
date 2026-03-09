"use client";

import Link from "next/link";

export function ServicosConfig() {
  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">3. Serviços</h2>
      <p className="text-sm text-slate-500">
        Nome, duração, preço, profissional, comissão, categoria, buffer. Preço variável por profissional, preço dinâmico por horário, recorrente, sinal obrigatório.
      </p>
      <div className="card max-w-md">
        <p className="text-sm text-slate-600">A configuração completa de serviços fica no módulo <strong>Serviços</strong>.</p>
        <Link href="/servicos" className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Abrir Serviços</Link>
      </div>
    </section>
  );
}
