import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-100/90">
        <div className="w-64 shrink-0" aria-hidden />
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto rounded-l-2xl border border-slate-200/50 border-l-0 bg-white/80 py-4 pr-4 shadow-md backdrop-blur-sm">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
