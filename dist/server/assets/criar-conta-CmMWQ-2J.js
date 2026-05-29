import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { c as useAuth, s as supabase } from "./router-BotcCoyH.js";
import { toast } from "sonner";
import { Flame, User, Mail, Lock, Building, Phone, FileText, MapPin, Loader2, ArrowRight } from "lucide-react";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "framer-motion";
import "zod";
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
  const {
    refreshAuth
  } = useAuth();
  const handleRegister = async (e) => {
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
      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
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
      const {
        error: profileError
      } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName.trim(),
        email: email.trim(),
        role: "operator",
        status: "active",
        is_super_admin: false
      });
      if (profileError) {
        console.error("Profile creation error:", profileError);
        toast.error("Conta criada, mas ocorreu um erro ao registrar o perfil.");
        setLoading(false);
        return;
      }
      const baseSlug = companyName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const slug = `${baseSlug}-${Math.floor(1e3 + Math.random() * 9e3)}`;
      const {
        data: companyData,
        error: companyError
      } = await supabase.from("companies").insert({
        owner_id: userId,
        name: companyName.trim(),
        slug,
        phone: companyPhone.trim() || null,
        cnpj: companyCnpj.trim() || null,
        address: companyAddress.trim() || null,
        is_active: true,
        plan_name: "basic",
        subscription_status: "trial"
      }).select("id").single();
      if (companyError) {
        console.error("Company creation error:", companyError);
        toast.error("Conta criada, mas ocorreu um erro ao registrar a empresa.");
        setLoading(false);
        return;
      }
      const companyId = companyData.id;
      const {
        error: linkError
      } = await supabase.from("company_users").insert({
        company_id: companyId,
        user_id: userId,
        role: "admin",
        status: "active"
      });
      if (linkError) {
        console.error("Company User linkage error:", linkError);
        toast.error("Conta criada, mas falhou ao vincular usuário à empresa.");
        setLoading(false);
        return;
      }
      await refreshAuth();
      toast.success("Conta criada e vinculada com sucesso!");
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      console.error("Unexpected signup error:", err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-20 pointer-events-none" }),
    /* @__PURE__ */ jsx("div", { className: "bg-glow absolute inset-0 opacity-10 pointer-events-none" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-2xl z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-3", children: /* @__PURE__ */ jsx(Flame, { className: "h-6 w-6 text-primary-foreground", strokeWidth: 2.5 }) }),
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: [
          "Nexus",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Deli" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1", children: "central operacional" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 md:p-8 shadow-glow", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground", children: "Crie sua conta no NexusDeli" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Cadastre sua conta operacional e crie sua empresa para começar a vender." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleRegister, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-primary border-b border-border pb-1", children: "Dados do Usuário" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome Completo *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
                  /* @__PURE__ */ jsx(User, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("input", { type: "text", required: true, placeholder: "Ex: João Silva", value: fullName, onChange: (e) => setFullName(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "E-mail *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
                  /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("input", { type: "email", required: true, placeholder: "joao@email.com", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Senha *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
                  /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("input", { type: "password", required: true, placeholder: "Mínimo 6 caracteres", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Confirmar Senha *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
                  /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("input", { type: "password", required: true, placeholder: "Repita a senha", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-primary border-b border-border pb-1", children: "Dados da Empresa" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome da Empresa *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
                  /* @__PURE__ */ jsx(Building, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("input", { type: "text", required: true, placeholder: "Ex: Pizzaria Nexus", value: companyName, onChange: (e) => setCompanyName(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Telefone *" }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
                  /* @__PURE__ */ jsx(Phone, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("input", { type: "tel", required: true, placeholder: "Ex: (11) 99999-9999", value: companyPhone, onChange: (e) => setCompanyPhone(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "CNPJ (Opcional)" }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
                  /* @__PURE__ */ jsx(FileText, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("input", { type: "text", placeholder: "00.000.000/0000-00", value: companyCnpj, onChange: (e) => setCompanyCnpj(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Endereço (Opcional)" }),
                /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsx("input", { type: "text", placeholder: "Rua, Número, Bairro, Cidade", value: companyAddress, onChange: (e) => setCompanyAddress(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50", children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            "Criando conta..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Criar minha conta e empresa",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Já possui uma conta?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "font-semibold text-primary hover:underline", children: "Fazer login" })
      ] })
    ] })
  ] });
}
export {
  SignUpPage as component
};
