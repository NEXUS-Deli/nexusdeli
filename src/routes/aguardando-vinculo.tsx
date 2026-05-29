import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Flame, LogOut, Loader2 } from "lucide-react";

export const Route = createFileRoute("/aguardando-vinculo")({
  component: WaitingLinkagePage,
});

function WaitingLinkagePage() {
  const { logout, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-20 pointer-events-none" />
      <div className="bg-glow absolute inset-0 opacity-10 pointer-events-none" />

      <div className="w-full max-w-md z-10 text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-3">
            <Flame className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nexus<span className="text-primary">Deli</span>
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-gradient-surface p-8 shadow-glow space-y-5">
          <h2 className="text-xl font-bold text-foreground">Aguardando Vínculo</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sua conta foi criada com sucesso, mas ela ainda não está vinculada a nenhuma empresa no sistema.
          </p>
          <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-medium text-center">
            Entre em contato com o administrador da sua empresa ou com o suporte para habilitar seu acesso.
          </div>

          <button
            onClick={logout}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-accent cursor-pointer transition-colors"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Sair
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
