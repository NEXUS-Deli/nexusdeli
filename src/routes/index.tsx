import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Flame } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeRedirector,
  head: () => ({
    meta: [
      { title: "Nexus Deli — O sistema operacional do delivery" },
      { name: "description", content: "Recuperação automática de clientes, campanhas no WhatsApp e IA para delivery. O fim do delivery parado." },
    ],
  }),
});

function HomeRedirector() {
  const { user, profile, companies, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    const isSuperAdmin = profile?.is_super_admin || profile?.role === "super_admin";
    if (isSuperAdmin) {
      navigate({ to: "/super-admin" });
    } else {
      const hasCompany = companies && companies.length > 0;
      if (hasCompany) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/aguardando-vinculo" });
      }
    }
  }, [user, profile, companies, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="relative h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-4 animate-bounce">
        <Flame className="h-6 w-6 text-primary-foreground" />
      </div>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
