import { jsxs, jsx } from "react/jsx-runtime";
import { Flame, LayoutDashboard, ShoppingBag, Printer, Megaphone, Percent, Package, MessageCircle, Users, Zap, Settings, Shield, Smartphone, Search, Sun, Moon, Bell, Plus, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, Link, useNavigate } from "@tanstack/react-router";
import { c as useAuth, d as useTheme } from "./router-BotcCoyH.js";
const baseNav = [
  { icon: LayoutDashboard, label: "Operação", to: "/dashboard" },
  { icon: ShoppingBag, label: "Pedidos", to: "/pedidos" },
  { icon: Printer, label: "Impressão", to: "/fila-impressao" },
  { icon: Megaphone, label: "Campanhas", to: "/campanhas" },
  { icon: Percent, label: "Promoções", to: "/promocoes" },
  { icon: Package, label: "Produtos", to: "/produtos" },
  { icon: MessageCircle, label: "WhatsApp", to: "/whatsapp" },
  { icon: Users, label: "Clientes", to: "/clientes" },
  { icon: Zap, label: "Automações", to: "/automacoes" },
  { icon: Settings, label: "Configurações", to: "/configuracoes" }
];
function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { profile } = useAuth();
  const isSuperAdmin = !!profile?.is_super_admin;
  const nav = isSuperAdmin ? [...baseNav, { icon: Shield, label: "Super Admin", to: "/super-admin" }] : baseNav;
  const isActive = (to) => {
    if (to === "/dashboard") return currentPath === "/dashboard";
    return currentPath.startsWith(to);
  };
  return /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-surface/60 backdrop-blur-xl sticky top-0 h-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-5 h-16 border-b border-border", children: [
      /* @__PURE__ */ jsx("div", { className: "relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow", children: /* @__PURE__ */ jsx(Flame, { className: "h-5 w-5 text-primary-foreground", strokeWidth: 2.5 }) }),
      /* @__PURE__ */ jsxs("div", { className: "leading-tight", children: [
        /* @__PURE__ */ jsxs("div", { className: "font-bold tracking-tight text-[15px]", children: [
          "Nexus",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Deli" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground", children: "central operacional" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "flex-1 px-3 py-4 space-y-1", children: [
      /* @__PURE__ */ jsx("div", { className: "px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Operação" }),
      nav.map((item) => {
        const active = isActive(item.to);
        return /* @__PURE__ */ jsx(
          Link,
          {
            to: item.to,
            className: "block w-full",
            children: /* @__PURE__ */ jsxs(
              motion.button,
              {
                whileHover: { x: 2 },
                className: `group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${active ? "bg-primary/12 text-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"}`,
                children: [
                  active && /* @__PURE__ */ jsx("span", { className: "absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary shadow-glow" }),
                  /* @__PURE__ */ jsx(item.icon, { className: `h-[18px] w-[18px] ${active ? "text-primary" : ""}` }),
                  /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: item.label }),
                  item.badge && /* @__PURE__ */ jsx("span", { className: "rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground", children: item.badge })
                ]
              }
            )
          },
          item.label
        );
      })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-3 mb-3 rounded-xl border border-border bg-gradient-surface p-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
        /* @__PURE__ */ jsxs("span", { className: "relative inline-flex h-2 w-2", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-success pulse-dot text-success" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-success shadow-success-glow" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Operação active" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 text-[11px] text-muted-foreground/80", children: "3 instâncias WhatsApp · 2 agentes IA online" }),
      /* @__PURE__ */ jsxs(Link, { to: "/cardapio", className: "mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-2 text-xs font-medium text-primary hover:bg-primary/20 cursor-pointer", children: [
        /* @__PURE__ */ jsx(Smartphone, { className: "h-3.5 w-3.5" }),
        " Ver Cardápio Digital"
      ] })
    ] })
  ] });
}
function Topbar() {
  const { theme, toggle } = useTheme();
  const { profile, companies, activeCompanyId, setActiveCompanyId, logout } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = !!profile?.is_super_admin;
  const getInitials = () => {
    if (!profile) return "US";
    if (profile.full_name) {
      const parts = profile.full_name.trim().split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return profile.email[0].toUpperCase();
  };
  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };
  return /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/70 px-5 backdrop-blur-xl lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "lg:hidden flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow", children: /* @__PURE__ */ jsx(Flame, { className: "h-4 w-4 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
        "Nexus",
        /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Deli" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:flex flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          placeholder: "Buscar campanhas, clientes, agentes…",
          className: "flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        }
      ),
      /* @__PURE__ */ jsx("kbd", { className: "hidden lg:inline rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px]", children: "⌘K" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 md:flex-none" }),
    isSuperAdmin && companies.length > 0 && /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs", children: [
      /* @__PURE__ */ jsx(Shield, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-semibold uppercase tracking-wider text-[9px] select-none", children: "Empresa Ativa:" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: activeCompanyId || "",
          onChange: (e) => setActiveCompanyId(e.target.value),
          className: "bg-transparent border-none outline-none font-semibold text-foreground cursor-pointer focus:ring-0 text-xs pr-6",
          children: companies.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, className: "bg-background text-foreground text-xs", children: c.name }, c.id))
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1.5 text-xs", children: [
        /* @__PURE__ */ jsxs("span", { className: "relative inline-flex h-2 w-2", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-success pulse-dot text-success" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-success" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: "Online" }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "· 3 WhatsApps" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggle,
          "aria-label": "Alternar tema",
          className: "h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer",
          children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxs("button", { className: "relative h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer", children: [
        /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 sm:hidden" }),
        /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4 hidden sm:block" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-glow hidden sm:block" })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/campanhas", search: { new: true }, className: "hidden sm:inline-flex", children: /* @__PURE__ */ jsxs("button", { className: "inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 cursor-pointer", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " Nova campanha"
      ] }) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-9 w-9 rounded-full bg-gradient-to-br from-primary to-warning grid place-items-center text-xs font-bold select-none cursor-help",
          title: profile?.full_name || profile?.email || "",
          children: getInitials()
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleLogout,
          className: "h-9 w-9 grid place-items-center rounded-lg border border-border/80 hover:border-destructive hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer",
          title: "Sair",
          children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" })
        }
      )
    ] })
  ] });
}
export {
  Sidebar as S,
  Topbar as T
};
