import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { c as useAuth, s as supabase } from "./router-BotcCoyH.js";
import { toast } from "sonner";
import { Flame, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "framer-motion";
import "zod";
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    refreshAuth
  } = useAuth();
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) {
        toast.error(error.message || "Erro ao fazer login. Verifique suas credenciais.");
        setLoading(false);
        return;
      }
      if (data.user) {
        const {
          data: dbProfile,
          error: profileErr
        } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
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
        await refreshAuth();
        toast.success("Login realizado com sucesso!");
        const isSuperAdmin = !!dbProfile?.is_super_admin;
        if (isSuperAdmin) {
          navigate({
            to: "/super-admin"
          });
        } else {
          const {
            data: companyUsers
          } = await supabase.from("company_users").select("company_id").eq("user_id", data.user.id).eq("status", "active").limit(1);
          if (companyUsers && companyUsers.length > 0) {
            navigate({
              to: "/dashboard"
            });
          } else {
            navigate({
              to: "/aguardando-vinculo"
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-20 pointer-events-none" }),
    /* @__PURE__ */ jsx("div", { className: "bg-glow absolute inset-0 opacity-10 pointer-events-none" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md z-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-3", children: /* @__PURE__ */ jsx(Flame, { className: "h-6 w-6 text-primary-foreground", strokeWidth: 2.5 }) }),
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: [
          "Nexus",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Deli" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1", children: "central operacional" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 shadow-glow", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground", children: "Bem-vindo ao NexusDeli" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground", children: "Entre para gerenciar seu delivery, cardápio e clientes." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "E-mail" }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("input", { type: "email", required: true, placeholder: "seu@email.com", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Senha" }),
              /* @__PURE__ */ jsx(Link, { to: "/esqueci-senha", className: "text-xs font-semibold text-primary hover:underline", children: "Esqueci minha senha" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("input", { type: "password", required: true, placeholder: "Sua senha secreta", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50", children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            "Entrando..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Entrar",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Não tem uma conta?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/criar-conta", className: "font-semibold text-primary hover:underline", children: "Criar conta" })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
