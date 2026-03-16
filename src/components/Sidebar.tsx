"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";
import {
  IconHome,
  IconCalendar,
  IconUsers,
  IconBriefcase,
  IconScissors,
  IconCurrency,
  IconLightBulb,
  IconChart,
  IconCog,
  IconChat,
} from "./SidebarIcons";

type MenuItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  aba?: string;
};

const menuItens: MenuItem[] = [
  { href: "/dashboard", label: "Visão Geral", Icon: IconHome, aba: "dashboard" },
  { href: "/agenda", label: "Agenda", Icon: IconCalendar, aba: "agenda" },
  { href: "/clientes", label: "Clientes", Icon: IconUsers, aba: "clientes" },
  { href: "/profissionais", label: "Profissionais", Icon: IconBriefcase, aba: "profissionais" },
  { href: "/servicos", label: "Serviços/Procedimentos", Icon: IconScissors, aba: "servicos" },
  { href: "/financeiro", label: "Financeiro", Icon: IconCurrency, aba: "financeiro" },
  { href: "/campanhas", label: "Campanhas WhatsApp", Icon: IconChat, aba: "campanhas" },
  { href: "/inteligencia", label: "Inteligência", Icon: IconLightBulb, aba: "inteligencia" },
  { href: "/analytics", label: "Analytics", Icon: IconChart, aba: "analytics" },
  { href: "/configuracoes", label: "Configurações", Icon: IconCog, aba: "configuracoes" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { canSeeAba } = usePermissions();
  const [agendaBadge, setAgendaBadge] = useState<number | null>(null);
  const itensVisiveis = menuItens.filter((item) => !item.aba || canSeeAba(item.aba));

  useEffect(() => {
    let cancelled = false;
    async function loadAgendaCount() {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const inicio = `${y}-${m}-${d}T00:00:00`;
      const fim = `${y}-${m}-${d}T23:59:59`;
      const { count, error } = await supabase
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .gte("inicio", inicio)
        .lte("inicio", fim);
      if (!cancelled && !error) {
        setAgendaBadge(count ?? 0);
      }
    }
    loadAgendaCount();

    const channel = supabase
      .channel("sidebar-agenda-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "agendamentos" }, () => { void loadAgendaCount(); })
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, []);

  async function handleSair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || (pathname.startsWith(href) && href !== "/");

  return (
    <aside className="fixed left-4 top-4 z-30 flex h-[calc(100vh-2rem)] w-60 flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-md">
      <div className="border-b border-slate-100 px-4 py-5">
        <h1 className="text-lg font-bold tracking-tight text-primary">Agendamento</h1>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-auto p-3">
        {itensVisiveis.map((item) => {
          const itemActive = isActive(item.href);
          const badge = item.href === "/agenda" ? agendaBadge ?? undefined : item.badge;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                itemActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <item.Icon className={`h-5 w-5 shrink-0 ${itemActive ? "text-white" : ""}`} />
              <span className="truncate">{item.label}</span>
              {badge != null && badge > 0 && (
                <span className="ml-auto flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary/15 px-1.5 text-xs font-semibold text-primary">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={handleSair}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800"
        >
          <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
