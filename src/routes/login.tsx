import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, Loader2, ArrowRight, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const FOOD_SLIDES = [
  {
    image: "/food_burger.png",
    title: "Hambúrgueres Suculentos",
    description: "Desperte o desejo do seu cliente na hora com fotos que dão água na boca e campanhas que vendem sozinhas."
  },
  {
    image: "/food_pizza.png",
    title: "Pizzas Irresistíveis",
    description: "Recupere aquele cliente de pizza de domingo automaticamente com ofertas irresistíveis direto no WhatsApp."
  }
];

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { user, profile, companies, logout, refreshAuth } = useAuth();

  // Slide loop timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FOOD_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen flex bg-[#F9FAFB] text-[#1F2937]">
      {/* Left side: Premium Food Porn Crossfade Slideshow (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black items-center justify-center p-12">
        {/* Slides loop */}
        {FOOD_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === idx ? "opacity-90" : "opacity-0"
            }`}
          >
            {/* Background image covering entire container */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover transform scale-105"
            />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
          </div>
        ))}

        {/* Floating elements inside left screen */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        {/* Text information overlays */}
        <div className="relative z-10 max-w-lg text-center text-white flex flex-col items-center mt-auto pb-8">
          <div className="flex gap-2 mb-6">
            {FOOD_SLIDES.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "w-6 bg-[#FF5E36]" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
          
          <h2 className="text-4xl font-black tracking-tight drop-shadow-md transition-all duration-500 transform translate-y-0">
            {FOOD_SLIDES[currentSlide].title}
          </h2>
          <p className="mt-4 text-white/90 text-sm leading-relaxed max-w-md drop-shadow-md">
            {FOOD_SLIDES[currentSlide].description}
          </p>
          
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#FF5E36] bg-black/50 backdrop-blur-md border border-white/10 rounded-full py-1.5 px-4">
            <span>Mais pedidos</span>
            <span className="text-white/20">•</span>
            <span>Mais clientes</span>
            <span className="text-white/20">•</span>
            <span>Mais vendas</span>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />
        
        {/* Gradient blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#FF5E36]/5 to-[#FF1E56]/5 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#FF9500]/5 to-[#FF5E36]/5 blur-[60px] pointer-events-none" />

        <div className="w-full max-w-md z-10">
          {/* Brand Header using user's real logo.png */}
          <div className="flex flex-col items-center mb-8 text-center">
            <img
              src="/logo.png"
              alt="ChamAI Delivery Logo"
              className="h-28 w-auto object-contain mb-2 transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-md p-8 shadow-xl shadow-gray-200/40">
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
    </div>
  );
}
