import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Flame, Mail, Lock, User, Building, Phone, FileText, MapPin, Loader2, ArrowRight } from "lucide-react";
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
  const { refreshAuth } = useAuth();

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-20 pointer-events-none" />
      <div className="bg-glow absolute inset-0 opacity-10 pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
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
        <div className="rounded-2xl border border-border bg-gradient-surface p-6 md:p-8 shadow-glow">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Crie sua conta no NexusDeli</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Cadastre sua conta operacional e crie sua empresa para começar a vender.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b border-border pb-1">
                  Dados do Usuário
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Nome Completo *</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: João Silva"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">E-mail *</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="joao@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Senha *</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Confirmar Senha *</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Company Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b border-border pb-1">
                  Dados da Empresa
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Nome da Empresa *</label>
                  <div className="relative flex items-center">
                    <Building className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pizzaria Nexus"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Telefone *</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      placeholder="Ex: (11) 99999-9999"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">CNPJ (Opcional)</label>
                  <div className="relative flex items-center">
                    <FileText className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={companyCnpj}
                      onChange={(e) => setCompanyCnpj(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Endereço (Opcional)</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Rua, Número, Bairro, Cidade"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar minha conta e empresa
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já possui uma conta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
