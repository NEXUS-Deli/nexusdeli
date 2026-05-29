import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, User, Building, Phone, FileText, MapPin, Loader2, ArrowRight, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/criar-conta")({
  component: SignUpPage,
});

function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, profile, logout, refreshAuth } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword || !companyName || !companyPhone) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (authError) {
        toast.error(authError.message || "Erro ao criar conta.");
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Erro inesperado durante a criação do usuário.");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 2. Create Profile row
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName.trim(),
        email: email.trim(),
        role: "operator",
        status: "active",
        is_super_admin: false,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        toast.error("Conta criada, mas ocorreu um erro ao registrar o perfil.");
        setLoading(false);
        return;
      }

      // 3. Create Company row
      const baseSlug = companyName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          owner_id: userId,
          name: companyName.trim(),
          slug,
          phone: companyPhone.trim() || null,
          cnpj: companyCnpj.trim() || null,
          address: companyAddress.trim() || null,
          is_active: true,
          plan_name: "basic",
          subscription_status: "trial",
        })
        .select("id")
        .single();

      if (companyError) {
        console.error("Company creation error:", companyError);
        toast.error("Conta criada, mas ocorreu um erro ao registrar a empresa.");
        setLoading(false);
        return;
      }

      const companyId = companyData.id;

      // 4. Create Company User Linkage
      const { error: linkError } = await supabase.from("company_users").insert({
        company_id: companyId,
        user_id: userId,
        role: "admin",
        status: "active",
      });

      if (linkError) {
        console.error("Company User linkage error:", linkError);
        toast.error("Conta criada, mas falhou ao vincular usuário à empresa.");
        setLoading(false);
        return;
      }

      // 5. Refresh context and redirect to Dashboard
      await refreshAuth();
      toast.success("Conta criada e vinculada com sucesso!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.error("Unexpected signup error:", err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-[#1F2937] px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />
      
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FF5E36]/10 to-[#FF1E56]/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FF9500]/10 to-[#FF5E36]/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF5E36] to-[#FF1E56] flex items-center justify-center shadow-lg shadow-[#FF5E36]/20 mb-4 animate-pulse">
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

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground bg-white border border-[#E5E7EB] rounded-full py-1.5 px-4 shadow-sm">
            <span className="text-[#FF1E56] font-bold">Mais pedidos</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#FF5E36] font-bold">Mais clientes</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#FF9500] font-bold">Mais vendas</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-md p-6 md:p-8 shadow-xl shadow-gray-200/50">
          {user ? (
            /* Logged in state with log out option */
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Você já possui uma conta conectada</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Conectado como <span className="font-semibold text-gray-800">{profile?.full_name || user.email}</span> ({user.email})
                </p>
              </div>

              <div className="space-y-3 pt-2 max-w-sm mx-auto">
                <button
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5E36]/15 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
                >
                  Acessar Painel
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={logout}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-gray-500" />
                  Sair desta conta
                </button>
              </div>
            </div>
          ) : (
            /* Signup Form */
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#111827]">Cadastre o seu Delivery</h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Crie sua credencial de acesso e configure a sua empresa de delivery em poucos cliques.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#FF5E36] uppercase tracking-wider border-b border-gray-100 pb-2">
                      Dados do Operador
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo *</label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: João Silva"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail *</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          placeholder="joao@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Senha *</label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirmar Senha *</label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="Repita a senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#FF5E36] uppercase tracking-wider border-b border-gray-100 pb-2">
                      Dados da Empresa
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome do Delivery *</label>
                      <div className="relative flex items-center">
                        <Building className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: ChamAI Hambúrgueres"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone Comercial *</label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          required
                          placeholder="Ex: (11) 99999-9999"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CNPJ (Opcional)</label>
                      <div className="relative flex items-center">
                        <FileText className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="00.000.000/0000-00"
                          value={companyCnpj}
                          onChange={(e) => setCompanyCnpj(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Endereço (Opcional)</label>
                      <div className="relative flex items-center">
                        <MapPin className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rua, Número, Cidade"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#FF5E36]/60 focus:bg-white focus:ring-2 focus:ring-[#FF5E36]/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5E36] to-[#FF1E56] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5E36]/15 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando conta e empresa...
                    </>
                  ) : (
                    <>
                      Finalizar Cadastro e Entrar
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
            Já possui uma conta?{" "}
            <Link to="/login" className="font-bold text-[#FF5E36] hover:underline">
              Fazer login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
