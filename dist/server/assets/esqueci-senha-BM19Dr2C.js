import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { s as supabase } from "./router-BotcCoyH.js";
import { toast } from "sonner";
import { Flame, ArrowLeft, Mail, Loader2, Send } from "lucide-react";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "framer-motion";
import "zod";
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, informe seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/redefinir-senha`;
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });
      if (error) {
        toast.error(error.message || "Erro ao solicitar recuperação de senha.");
        setLoading(false);
        return;
      }
      setSent(true);
      toast.success("E-mail de recuperação enviado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado. Tente novamente.");
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
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 shadow-glow", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Link, { to: "/login", className: "p-1.5 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground", children: "Recuperar senha" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Informe o seu e-mail para receber as instruções." })
          ] })
        ] }),
        sent ? /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-center py-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm font-medium", children: "Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha." }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Verifique sua caixa de entrada e pasta de spam." }),
          /* @__PURE__ */ jsx(Link, { to: "/login", className: "mt-2 block w-full", children: /* @__PURE__ */ jsx("button", { className: "w-full bg-background border border-border rounded-xl py-2.5 text-sm font-semibold hover:bg-accent transition-all cursor-pointer", children: "Voltar para o login" }) })
        ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleReset, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "E-mail" }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("input", { type: "email", required: true, placeholder: "seu@email.com", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50", children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            "Enviando..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Enviar link de recuperação",
            /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  ForgotPasswordPage as component
};
