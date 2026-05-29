import { J as jsxRuntimeExports } from "./server-3KlhyZH_.js";
import { i as useAuth, F as Flame, a as LoaderCircle } from "./router-CgDrIRmR.js";
import { L as LogOut } from "./log-out-BDyVC8AH.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function WaitingLinkagePage() {
  const {
    logout,
    loading
  } = useAuth();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20 pointer-events-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-glow absolute inset-0 opacity-10 pointer-events-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md z-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-6 w-6 text-primary-foreground", strokeWidth: 2.5 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: [
          "Nexus",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Deli" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-8 shadow-glow space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-foreground", children: "Aguardando Vínculo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: "Sua conta foi criada com sucesso, mas ela ainda não está vinculada a nenhuma empresa no sistema." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-medium text-center", children: "Entre em contato com o administrador da sua empresa ou com o suporte para habilitar seu acesso." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: logout, disabled: loading, className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-surface border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-accent cursor-pointer transition-colors", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
          "Sair"
        ] }) })
      ] })
    ] })
  ] });
}
export {
  WaitingLinkagePage as component
};
