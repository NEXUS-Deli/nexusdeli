import React, { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Flame } from "lucide-react";

const isPublicRoute = (pathname: string) => {
  return pathname === "/cardapio"
    || pathname.startsWith("/cardapio/")
    || pathname === "/login"
    || pathname.startsWith("/checkout/")
    || pathname.startsWith("/pedido/");
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, companies, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const publicRouteActive = isPublicRoute(location.pathname);

  const isSuperAdmin = !!profile?.is_super_admin;
  const hasCompany = companies && companies.length > 0;

  useEffect(() => {
    if (loading) return;

    // Public routes don't require login checks or dashboard routing
    if (publicRouteActive) {
      return;
    }

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    // User is logged in (for non-public routes)
    if (profile?.status !== "active") {
      // Allow them to see the inactive message
      return;
    }

    if (isSuperAdmin) {
      // Super admin is allowed in everything (no redirect)
      return;
    }

    // Regular user
    if (!hasCompany) {
      if (location.pathname !== "/aguardando-vinculo") {
        navigate({ to: "/aguardando-vinculo" });
      }
    } else {
      // Has company, block admin-only routes and aguardando-vinculo
      if (location.pathname === "/aguardando-vinculo" || location.pathname === "/super-admin") {
        navigate({ to: "/dashboard" });
      }
    }
  }, [user, profile, companies, loading, location.pathname, navigate, publicRouteActive, isSuperAdmin, hasCompany]);

  if (loading && !publicRouteActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="relative h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-4 animate-bounce">
          <Flame className="h-6 w-6 text-primary-foreground" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mt-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Carregando NexusDeli...
        </span>
      </div>
    );
  }

  // Handle inactive user screen (only on non-public routes!)
  if (user && profile?.status !== "active" && !publicRouteActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
        <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-gradient-surface p-6 text-center shadow-glow">
          <div className="relative h-12 w-12 rounded-2xl bg-destructive/10 grid place-items-center mx-auto mb-4 border border-destructive/20">
            <Flame className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sua conta está inativa</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta de usuário foi desativada. Por favor, entre em contato com o administrador do sistema.
          </p>
          <button
            onClick={logout}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-destructive/90 transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
