import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, Loader2, ArrowRight, LogOut, ShieldAlert, Heart, Activity, Compass, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, profile, companies, logout, refreshAuth } = useAuth();

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

        // Route redirection
        const isSuperAdmin = !!dbProfile?.is_super_admin;
        if (isSuperAdmin) {
          navigate({ to: "/super-admin" });
        } else {
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

  const handleGoToDashboard = () => {
    if (!user) return;
    const isSuperAdmin = !!profile?.is_super_admin;
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-[#1F2937] px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />
      
      {/* Dynamic colorful blobs representing ChamAI identity */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FF5E36]/10 to-[#FF1E56]/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FF9500]/10 to-[#FF5E36]/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          {/* Custom SVG logo for ChamAI */}
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF5E36] to-[#FF1E56] flex items-center justify-center shadow-lg shadow-[#FF5E36]/20 mb-4 animate-pulse">
            {/* Scooter Icon shape */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-10 h-10 fill-white">
              <path d="M35 55 L45 35 H60 L50 55 Z" />
              <circle cx="40" cy="65" r="8" />
              <circle cx="60" cy="65" r="8" />
              <path d="M58 45 L68 32 H58 Z" />
              <circle cx="70" cy="28" r="7" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
            Cham<span className="bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-sm font-semibold tracking-wider text-[#FF5E36] uppercase mt-1">
            Delivery
          </p>

          {/* Slogan with Taglines */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground bg-white border border-[#E5E7EB] rounded-full py-1.5 px-4 shadow-sm">
            <span className="text-[#FF1E56] font-bold">Mais pedidos</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#FF5E36] font-bold">Mais clientes</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#FF9500] font-bold">Mais vendas</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-md p-8 shadow-xl shadow-gray-200/50">
          {user ? (
            /* Already logged in state with exit/logout option */
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Você já está conectado!</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Conectado como <span className="font-semibold text-gray-800">{profile?.full_name || user.email}</span> ({user.email})
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Acesso rápido</span>
                {profile?.is_super_admin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 border border-red-100">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Super Administrador
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-[#FF5E36] border border-orange-100">
                    Operador
                  </span>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5E36]/15 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
                >
                  Entrar no Painel
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={logout}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-gray-500" />
                  Sair da Conta (Fazer Logout)
                </button>
              </div>
            </div>
          ) : (
            /* Normal Login Form */
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#111827]">Gerencie seu Delivery</h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Entre com suas credenciais para acessar a plataforma ChamAI.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Senha</label>
                    <Link
                      to="/esqueci-senha"
                      className="text-xs font-bold text-[#FF5E36] hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5E36]/15 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    <>
                      Entrar na Plataforma
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer info */}
        {!user && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Não tem uma conta operacional?{" "}
            <Link to="/criar-conta" className="font-bold text-[#FF5E36] hover:underline">
              Cadastre-se
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
