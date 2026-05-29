import React, { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Flame } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, companies, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const publicRoutes = ["/login", "/criar-conta", "/esqueci-senha", "/redefinir-senha"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  const isSuperAdmin = !!profile?.is_super_admin;
  const hasCompany = companies && companies.length > 0;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!isPublicRoute) {
        navigate({ to: "/login" });
      }
      return;
    }

    // User is logged in
    if (profile?.status !== "active") {
      // Allow them to login page or stay here to see inactive message
      return;
    }

    if (isSuperAdmin) {
      // Super admin can access anything except public routes
      if (isPublicRoute) {
        navigate({ to: "/super-admin" });
      }
      return;
    }

    // Regular user
    if (!hasCompany) {
      if (location.pathname !== "/aguardando-vinculo") {
        navigate({ to: "/aguardando-vinculo" });
      }
    } else {
      // Has company, block admin-only routes and aguardando-vinculo
      if (location.pathname === "/aguardando-vinculo" || location.pathname === "/super-admin" || isPublicRoute) {
        navigate({ to: "/dashboard" });
      }
    }
  }, [user, profile, companies, loading, location.pathname, navigate, isPublicRoute, isSuperAdmin, hasCompany]);

  if (loading) {
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

  // Handle inactive user screen
  if (user && profile?.status !== "active" && !isPublicRoute) {
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
