import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Flame, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message || "Erro ao fazer login. Verifique suas credenciais.");
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch profile to verify status
        const { data: dbProfile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileErr) {
          toast.error("Erro ao carregar perfil de usuário.");
          setLoading(false);
          return;
        }

        if (dbProfile && dbProfile.status !== "active") {
          toast.error("Sua conta está inativa. Entre em contato com o suporte.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Trigger auth context refresh
        await refreshAuth();
        toast.success("Login realizado com sucesso!");

        // The AuthGuard will handle redirection, but let's do a proactive push:
        const isSuperAdmin = dbProfile?.is_super_admin || dbProfile?.role === "super_admin";
        if (isSuperAdmin) {
          navigate({ to: "/super-admin" });
        } else {
          // Check company linkage
          const { data: companyUsers } = await supabase
            .from("company_users")
            .select("company_id")
            .eq("user_id", data.user.id)
            .eq("status", "active")
            .limit(1);

          if (companyUsers && companyUsers.length > 0) {
            navigate({ to: "/dashboard" });
          } else {
            navigate({ to: "/aguardando-vinculo" });
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="grid-bg absolute inset-0 opacity-20 pointer-events-none" />
      <div className="bg-glow absolute inset-0 opacity-10 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-3">
            <Flame className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nexus<span className="text-primary">Deli</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
            central operacional
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-glow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Bem-vindo ao NexusDeli</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Entre para gerenciar seu delivery, cardápio e clientes.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">E-mail</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground">Senha</label>
                <Link
                  to="/esqueci-senha"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="Sua senha secreta"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link to="/criar-conta" className="font-semibold text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
