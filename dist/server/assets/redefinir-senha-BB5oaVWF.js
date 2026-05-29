import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { s as supabase } from "./router-BotcCoyH.js";
import { toast } from "sonner";
import { Flame, Lock, Loader2, Save } from "lucide-react";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "framer-motion";
import "zod";
function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");
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
        error
      } = await supabase.auth.updateUser({
        password
      });
      if (error) {
        toast.error(error.message || "Erro ao redefinir sua senha.");
        setLoading(false);
        return;
      }
      toast.success("Sua senha foi redefinida com sucesso!");
      setTimeout(() => {
        navigate({
          to: "/login"
        });
      }, 2e3);
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
        /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground", children: "Definir nova senha" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Digite e confirme a sua nova senha abaixo." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleUpdatePassword, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nova Senha" }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("input", { type: "password", required: true, placeholder: "Nova senha secreta", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Confirmar Nova Senha" }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("input", { type: "password", required: true, placeholder: "Repita a nova senha", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: loading, className: "mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50", children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            "Salvando nova senha..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Salvar nova senha",
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  ResetPasswordPage as component
};
