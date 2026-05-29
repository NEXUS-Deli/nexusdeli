import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext, useRef, useMemo } from "react";
import { Toaster as Toaster$1, toast } from "sonner";
import { createClient } from "@supabase/supabase-js";
import { Flame, Loader2, ChevronLeft, Search, ShoppingCart, X, Award, TrendingUp, Star, Plus, Timer, Minus, ChevronRight, Trash2, MessageCircle, Smartphone, Banknote, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
const appCss = "/assets/styles-cbYo7-pK.css";
const ThemeCtx = createContext({ theme: "dark", toggle: () => {
} });
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("nexus-theme") || "dark";
    setTheme(saved);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    localStorage.setItem("nexus-theme", theme);
  }, [theme]);
  return /* @__PURE__ */ jsx(ThemeCtx.Provider, { value: { theme, toggle: () => setTheme((t) => t === "dark" ? "light" : "dark") }, children });
}
const useTheme = () => useContext(ThemeCtx);
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const supabaseUrl = "https://byjlarkkwuseuxlhkzyf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5amxhcmtrd3VzZXV4bGhrenlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTYxNTEsImV4cCI6MjA5NDUzMjE1MX0.RDIYHrzLNDSM1vc0Ighh8zE6Vvr_JlBiWvELd7L57uE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [activeCompanyId, setActiveCompanyIdState] = useState(null);
  const [loading, setLoading] = useState(true);
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCompanies([]);
    setActiveCompanyIdState(null);
    localStorage.removeItem("nexus_active_company_id");
  };
  const setActiveCompanyId = (id) => {
    setActiveCompanyIdState(id);
    if (id) {
      localStorage.setItem("nexus_active_company_id", id);
    } else {
      localStorage.removeItem("nexus_active_company_id");
    }
  };
  const loadUserData = async (currentUser) => {
    try {
      const { data: dbProfile, error: profileErr } = await supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle();
      if (profileErr) throw profileErr;
      let finalProfile = dbProfile;
      if (!dbProfile) {
        finalProfile = {
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || "Usuário",
          email: currentUser.email || "",
          role: "user",
          status: "active",
          is_super_admin: false
        };
      }
      setProfile(finalProfile);
      const isSuperAdmin = !!finalProfile.is_super_admin;
      if (isSuperAdmin) {
        const { data: allCompanies, error: compErr } = await supabase.from("companies").select("*").order("name");
        if (compErr) throw compErr;
        setCompanies(allCompanies || []);
        const savedId = localStorage.getItem("nexus_active_company_id");
        if (savedId && allCompanies?.some((c) => c.id === savedId)) {
          setActiveCompanyIdState(savedId);
        } else if (allCompanies && allCompanies.length > 0) {
          setActiveCompanyId(allCompanies[0].id);
        }
      } else {
        const { data: userLinks, error: linkErr } = await supabase.from("company_users").select("company_id, companies(*)").eq("user_id", currentUser.id).eq("status", "active");
        if (linkErr) throw linkErr;
        const userCompanies = (userLinks || []).map((link) => link.companies).filter(Boolean);
        setCompanies(userCompanies);
        if (userCompanies.length > 0) {
          setActiveCompanyId(userCompanies[0].id);
        } else {
          setActiveCompanyIdState(null);
        }
      }
    } catch (err) {
      console.error("Error loading user data in AuthContext:", err);
    }
  };
  const refreshAuth = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    if (currentUser) {
      await loadUserData(currentUser);
    } else {
      setProfile(null);
      setCompanies([]);
      setActiveCompanyIdState(null);
    }
    setLoading(false);
  };
  useEffect(() => {
    refreshAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setProfile(null);
        setCompanies([]);
        setActiveCompanyIdState(null);
      }
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const activeCompany = companies.find((c) => c.id === activeCompanyId) || null;
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        profile,
        companies,
        activeCompanyId,
        activeCompany,
        setActiveCompanyId,
        loading,
        logout,
        refreshAuth
      },
      children
    }
  );
}
function useAuth() {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
function AuthGuard({ children }) {
  const { user, profile, companies, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const publicRoutes = ["/login", "/criar-conta", "/esqueci-senha", "/redefinir-senha"];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const isSuperAdmin = !!profile?.is_super_admin;
  const hasCompany = companies && companies.length > 0;
  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (!isPublicRoute) {
        navigate({ to: "/login" });
      }
      return;
    }
    if (profile?.status !== "active") {
      return;
    }
    if (isSuperAdmin) {
      if (isPublicRoute) {
        navigate({ to: "/super-admin" });
      }
      return;
    }
    if (!hasCompany) {
      if (location.pathname !== "/aguardando-vinculo") {
        navigate({ to: "/aguardando-vinculo" });
      }
    } else {
      if (location.pathname === "/aguardando-vinculo" || location.pathname === "/super-admin" || isPublicRoute) {
        navigate({ to: "/dashboard" });
      }
    }
  }, [user, profile, companies, loading, location.pathname, navigate, isPublicRoute, isSuperAdmin, hasCompany]);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-background text-foreground", children: [
      /* @__PURE__ */ jsx("div", { className: "relative h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-4 animate-bounce", children: /* @__PURE__ */ jsx(Flame, { className: "h-6 w-6 text-primary-foreground" }) }),
      /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("span", { className: "mt-3 text-xs text-muted-foreground font-medium uppercase tracking-wider", children: "Carregando NexusDeli..." })
    ] });
  }
  if (user && profile?.status !== "active" && !isPublicRoute) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4 text-foreground", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-2xl border border-destructive/20 bg-gradient-surface p-6 text-center shadow-glow", children: [
      /* @__PURE__ */ jsx("div", { className: "relative h-12 w-12 rounded-2xl bg-destructive/10 grid place-items-center mx-auto mb-4 border border-destructive/20", children: /* @__PURE__ */ jsx(Flame, { className: "h-6 w-6 text-destructive" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Sua conta está inativa" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Sua conta de usuário foi desativada. Por favor, entre em contato com o administrador do sistema." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: logout,
          className: "mt-6 inline-flex w-full items-center justify-center rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-destructive/90 transition-colors cursor-pointer",
          children: "Sair"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$j = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Flow State Delivery automates WhatsApp for restaurants, recovering clients and driving recurring orders." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Flow State Delivery automates WhatsApp for restaurants, recovering clients and driving recurring orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Flow State Delivery automates WhatsApp for restaurants, recovering clients and driving recurring orders." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9c820533-4e83-410f-9b47-05f66df03abc/id-preview-0758993f--dbb69b25-81ad-42ec-bf1f-171b5fbfa33c.lovable.app-1779207920865.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9c820533-4e83-410f-9b47-05f66df03abc/id-preview-0758993f--dbb69b25-81ad-42ec-bf1f-171b5fbfa33c.lovable.app-1779207920865.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", style: { colorScheme: "dark" }, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `try{var t=localStorage.getItem('nexus-theme')||'dark';var r=document.documentElement;r.classList.remove('dark','light');r.classList.add(t);r.style.colorScheme=t;}catch(e){}`
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$j.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsx(AuthGuard, { children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx(Toaster, { richColors: true, closeButton: true })
  ] }) }) });
}
const $$splitComponentImporter$h = () => import("./whatsapp-Ah_v6JkO.js");
const Route$i = createFileRoute("/whatsapp")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./super-admin-DPbfd2BA.js");
const Route$h = createFileRoute("/super-admin")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component"),
  head: () => ({
    meta: [{
      title: "Painel Super Admin — NexusDeli"
    }]
  })
});
const $$splitComponentImporter$f = () => import("./redefinir-senha-BB5oaVWF.js");
const Route$g = createFileRoute("/redefinir-senha")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./promocoes-DXFBbW6H.js");
const Route$f = createFileRoute("/promocoes")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./produtos-PzCuK-XJ.js");
const Route$e = createFileRoute("/produtos")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./pedidos-DY2r3u1W.js");
const Route$d = createFileRoute("/pedidos")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./login-BZPBlSdw.js");
const Route$c = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./fila-impressao-CZcPPXDs.js");
const Route$b = createFileRoute("/fila-impressao")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./esqueci-senha-BM19Dr2C.js");
const Route$a = createFileRoute("/esqueci-senha")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./dashboard-BvOfJKhC.js");
const Route$9 = createFileRoute("/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component"),
  head: () => ({
    meta: [{
      title: "Nexus Deli — O sistema operacional do delivery"
    }, {
      name: "description",
      content: "Recuperação automática de clientes, campanhas no WhatsApp e IA para delivery. O fim do delivery parado."
    }]
  })
});
const $$splitComponentImporter$7 = () => import("./criar-conta-CmMWQ-2J.js");
const Route$8 = createFileRoute("/criar-conta")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./configuracoes-CFUfhf06.js");
const Route$7 = createFileRoute("/configuracoes")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./clientes-59V7M1wz.js");
const Route$6 = createFileRoute("/clientes")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const DEFAULT_COMPANY_ID = "11111111-1111-1111-1111-111111111111";
async function getCompanyId() {
  if (typeof window !== "undefined") {
    const savedId = localStorage.getItem("nexus_active_company_id");
    if (savedId) return savedId;
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role, is_super_admin").eq("id", user.id).maybeSingle();
    const isSuperAdmin = !!profile?.is_super_admin;
    if (isSuperAdmin) {
      const { data: firstCompany } = await supabase.from("companies").select("id").limit(1).maybeSingle();
      if (firstCompany) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nexus_active_company_id", firstCompany.id);
        }
        return firstCompany.id;
      }
    }
    const { data: link } = await supabase.from("company_users").select("company_id").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle();
    if (link?.company_id) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nexus_active_company_id", link.company_id);
      }
      return link.company_id;
    }
    const { data: owned } = await supabase.from("companies").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
    if (owned?.id) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nexus_active_company_id", owned.id);
      }
      return owned.id;
    }
  }
  return DEFAULT_COMPANY_ID;
}
function generateReceiptText(data) {
  const line = "=".repeat(32);
  const subline = "-".repeat(32);
  let text = "";
  text += `${line}
`;
  text += `  ${data.companyName}
`;
  if (data.companyCnpj) text += `  CNPJ: ${data.companyCnpj}
`;
  if (data.companyAddress) text += `  ${data.companyAddress}
`;
  if (data.companyPhone) text += `  Tel: ${data.companyPhone}
`;
  text += `${line}
`;
  text += `Pedido #${data.orderNumber}
`;
  text += `${new Date(data.createdAt).toLocaleDateString("pt-BR")} ${new Date(data.createdAt).toLocaleTimeString("pt-BR")}
`;
  text += `${subline}
`;
  text += `Cliente: ${data.customerName}
`;
  text += `Tel: ${data.customerPhone}
`;
  if (data.deliveryAddress) text += `Endereco: ${data.deliveryAddress}
`;
  text += `${subline}
`;
  text += `ITENS
`;
  text += `${subline}
`;
  for (const item of data.items) {
    text += `${item.quantity}x ${item.productName}
`;
    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        text += `    + ${addon.addonName}${addon.quantity > 1 ? ` (${addon.quantity}x)` : ""}: R$ ${addon.price.toFixed(2)}
`;
      }
    }
    text += `    R$ ${item.totalPrice.toFixed(2)}
`;
    if (item.notes) text += `    Obs: ${item.notes}
`;
  }
  text += `${subline}
`;
  text += `Subtotal: R$ ${data.subtotal.toFixed(2)}
`;
  if (data.deliveryFee > 0) text += `Taxa de entrega: R$ ${data.deliveryFee.toFixed(2)}
`;
  if (data.discountTotal > 0) text += `Desconto: -R$ ${data.discountTotal.toFixed(2)}
`;
  text += `TOTAL: R$ ${data.total.toFixed(2)}
`;
  text += `${subline}
`;
  text += `Forma de pagamento: ${getPaymentLabel$1(data.paymentMethod)}
`;
  text += `Status: ${data.paymentStatus === "pago" ? "PAGO" : "Pendente"}
`;
  if (data.notes) text += `Obs: ${data.notes}
`;
  text += `${line}
`;
  if (data.footerText) {
    text += `${data.footerText}
`;
    text += `${line}
`;
  }
  return text;
}
function getPaymentLabel$1(method) {
  const map = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_credito: "Cartao de Credito",
    cartao_debito: "Cartao de Debito",
    vale_refeicao: "Vale Refeicao"
  };
  return map[method] || method;
}
function generateReceiptHtml(data) {
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding: 4px 0; font-size: 13px;">${item.quantity}x ${item.productName}</td>
      <td style="padding: 4px 0; font-size: 13px; text-align: right;">R$ ${item.totalPrice.toFixed(2)}</td>
    </tr>
    ${(item.addons || []).map((a) => `
      <tr>
        <td style="padding: 2px 0 2px 12px; font-size: 11px; color: #888;">+ ${a.addonName}${a.quantity > 1 ? ` (${a.quantity}x)` : ""}</td>
        <td style="padding: 2px 0; font-size: 11px; text-align: right; color: #888;">R$ ${(a.price * a.quantity).toFixed(2)}</td>
      </tr>
    `).join("")}
    ${item.notes ? `
      <tr>
        <td colspan="2" style="padding: 2px 0 4px 12px; font-size: 11px; color: #888; font-style: italic;">Obs: ${item.notes}</td>
      </tr>
    ` : ""}
  `).join("");
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 0; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      width: ${data.paperWidth || "80mm"};
      margin: 0 auto;
      padding: 8px;
      color: #000;
    }
    table { width: 100%; border-collapse: collapse; }
    .center { text-align: center; }
    .line { border-top: 1px dashed #000; margin: 6px 0; }
    .total { font-size: 16px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="center">
    ${data.logoUrl ? `<img src="${data.logoUrl}" style="max-width: 60px; margin-bottom: 4px;" />` : ""}
    <strong>${data.companyName}</strong><br/>
    ${data.companyCnpj ? `CNPJ: ${data.companyCnpj}<br/>` : ""}
    ${data.companyAddress ? `${data.companyAddress}<br/>` : ""}
    ${data.companyPhone ? `Tel: ${data.companyPhone}<br/>` : ""}
  </div>
  <div class="line"></div>
  <div class="center">
    <strong>PEDIDO #${data.orderNumber}</strong><br/>
    ${new Date(data.createdAt).toLocaleDateString("pt-BR")} ${new Date(data.createdAt).toLocaleTimeString("pt-BR")}
  </div>
  <div class="line"></div>
  <strong>Cliente:</strong> ${data.customerName}<br/>
  <strong>Tel:</strong> ${data.customerPhone}<br/>
  ${data.deliveryAddress ? `<strong>Endereco:</strong> ${data.deliveryAddress}<br/>` : ""}
  <div class="line"></div>
  <strong>ITENS</strong>
  <div class="line"></div>
  <table>${itemsHtml}</table>
  <div class="line"></div>
  <table>
    <tr><td>Subtotal</td><td style="text-align: right;">R$ ${data.subtotal.toFixed(2)}</td></tr>
    ${data.deliveryFee > 0 ? `<tr><td>Taxa de entrega</td><td style="text-align: right;">R$ ${data.deliveryFee.toFixed(2)}</td></tr>` : ""}
    ${data.discountTotal > 0 ? `<tr><td>Desconto</td><td style="text-align: right;">-R$ ${data.discountTotal.toFixed(2)}</td></tr>` : ""}
    <tr><td class="total">TOTAL</td><td class="total" style="text-align: right;">R$ ${data.total.toFixed(2)}</td></tr>
  </table>
  <div class="line"></div>
  <strong>Pagamento:</strong> ${getPaymentLabel$1(data.paymentMethod)}<br/>
  <strong>Status:</strong> ${data.paymentStatus === "pago" ? "PAGO" : "Pendente"}<br/>
  ${data.notes ? `<strong>Obs:</strong> ${data.notes}<br/>` : ""}
  <div class="line"></div>
  ${data.footerText ? `<div class="center">${data.footerText}</div><div class="line"></div>` : ""}
</body>
</html>`;
}
async function createOrder(input) {
  const companyId = await getCompanyId();
  const { data: company } = await supabase.from("companies").select("id, name, cnpj, address, phone, delivery_fee, logo_url").eq("id", companyId).single();
  if (!company) throw new Error("Empresa nao encontrada");
  let subtotal = 0;
  let costTotal = 0;
  const orderItems = [];
  for (const item of input.items) {
    const itemTotal = item.unitPrice * item.quantity;
    const itemCost = (item.costPrice || 0) * item.quantity;
    subtotal += itemTotal;
    costTotal += itemCost;
    const addonTotal = (item.addons || []).reduce(
      (sum, a) => sum + a.price * a.quantity,
      0
    );
    orderItems.push({
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: itemTotal + addonTotal,
      cost_price: itemCost,
      notes: item.notes || null,
      company_id: companyId,
      addons: (item.addons || []).map((a) => ({
        addon_id: a.addonId,
        addon_name: a.addonName,
        quantity: a.quantity,
        price: a.price
      }))
    });
  }
  const deliveryFee = input.deliveryFee ?? company.delivery_fee ?? 0;
  const total = subtotal + deliveryFee;
  const profitTotal = total - costTotal;
  const checkoutToken = crypto.randomUUID();
  const { data: lastOrder } = await supabase.from("orders").select("order_number").eq("company_id", companyId).order("order_number", { ascending: false }).limit(1).single();
  const orderNumber = (lastOrder?.order_number || 0) + 1;
  const { data: customer } = await supabase.from("customers").upsert(
    {
      company_id: companyId,
      name: input.customer.name,
      phone: input.customer.phone,
      address: input.customer.address || null
    },
    { onConflict: "company_id,phone", ignoreDuplicates: false }
  ).select("id").single();
  const customerId = customer?.id;
  const { data: order, error: orderError } = await supabase.from("orders").insert({
    company_id: companyId,
    customer_id: customerId,
    order_number: orderNumber,
    checkout_token: checkoutToken,
    status: "aguardando_whatsapp",
    subtotal,
    delivery_fee: deliveryFee,
    total,
    cost_total: costTotal,
    profit_total: profitTotal,
    payment_method: input.paymentMethod,
    change_for: input.changeFor || null,
    delivery_address: input.customer.address || null,
    delivery_reference: input.customer.reference || null,
    notes: input.notes || null,
    coupon_code: input.couponCode || null
  }).select("id, created_at").single();
  if (orderError) throw orderError;
  for (const item of orderItems) {
    const { data: orderItem, error: itemError } = await supabase.from("order_items").insert({
      company_id: companyId,
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      cost_price: item.cost_price,
      notes: item.notes
    }).select("id").single();
    if (itemError) throw itemError;
    if (item.addons.length > 0) {
      const addonsPayload = item.addons.map((a) => ({
        company_id: companyId,
        order_item_id: orderItem.id,
        addon_id: a.addon_id || null,
        addon_name: a.addon_name,
        quantity: a.quantity,
        price: a.price
      }));
      const { error: addonError } = await supabase.from("order_item_addons").insert(addonsPayload);
      if (addonError) throw addonError;
    }
  }
  if (customerId) {
    const { data: customerStats } = await supabase.from("customers").select("total_orders, total_spent, total_profit").eq("id", customerId).single();
    await supabase.from("customers").update({
      total_orders: (customerStats?.total_orders || 0) + 1,
      total_spent: (customerStats?.total_spent || 0) + total,
      total_profit: (customerStats?.total_profit || 0) + profitTotal,
      last_order_at: (/* @__PURE__ */ new Date()).toISOString(),
      first_order_at: customerStats?.total_orders ? void 0 : (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", customerId);
  }
  const receiptText = generateReceiptText({
    companyName: company.name,
    companyCnpj: company.cnpj,
    companyAddress: company.address,
    companyPhone: company.phone,
    orderNumber,
    createdAt: order.created_at,
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    deliveryAddress: input.customer.address,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pendente",
    items: orderItems.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      notes: item.notes || void 0,
      addons: item.addons
    })),
    subtotal,
    deliveryFee,
    discountTotal: 0,
    total,
    notes: input.notes
  });
  const receiptHtml = generateReceiptHtml({
    companyName: company.name,
    companyCnpj: company.cnpj,
    companyAddress: company.address,
    companyPhone: company.phone,
    logoUrl: company.logo_url,
    orderNumber,
    createdAt: order.created_at,
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    deliveryAddress: input.customer.address,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pendente",
    items: orderItems.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      notes: item.notes || void 0,
      addons: item.addons
    })),
    subtotal,
    deliveryFee,
    discountTotal: 0,
    total,
    notes: input.notes
  });
  const { data: printers } = await supabase.from("printer_settings").select("*").eq("company_id", companyId).eq("is_active", true);
  if (printers && printers.length > 0) {
    const printJobs = printers.map((printer) => ({
      company_id: companyId,
      order_id: order.id,
      printer_setting_id: printer.id,
      printer_sector: printer.printer_sector,
      copies: printer.copies,
      receipt_text: receiptText,
      receipt_html: receiptHtml,
      receipt_data: { order_id: order.id, order_number: orderNumber }
    }));
    await supabase.from("print_jobs").insert(printJobs);
  } else {
    await supabase.from("print_jobs").insert({
      company_id: companyId,
      order_id: order.id,
      printer_sector: "balcao",
      receipt_text: receiptText,
      receipt_html: receiptHtml,
      receipt_data: { order_id: order.id, order_number: orderNumber }
    });
  }
  const { data: createdJobs } = await supabase.from("print_jobs").select("id").eq("order_id", order.id);
  if (createdJobs) {
    const printLogs = createdJobs.map((job) => ({
      company_id: companyId,
      print_job_id: job.id,
      action: "criado",
      status: "pendente",
      payload: { order_number: orderNumber }
    }));
    await supabase.from("print_logs").insert(printLogs);
  }
  const waMessage = generateWhatsAppMessage({
    companyName: company.name,
    customerName: input.customer.name,
    orderNumber,
    items: orderItems.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      totalPrice: item.total_price,
      addons: item.addons
    })),
    total,
    deliveryFee,
    paymentMethod: input.paymentMethod
  });
  const phoneCleaned = company.phone?.replace(/\D/g, "") || "";
  const waUrl = `https://wa.me/55${phoneCleaned}?text=${encodeURIComponent(waMessage)}`;
  return {
    orderId: order.id,
    orderNumber,
    checkoutToken,
    whatsappUrl: waUrl,
    whatsappMessage: waMessage
  };
}
function generateWhatsAppMessage(data) {
  let msg = `*${data.companyName}*
`;
  msg += `*Pedido #${data.orderNumber}*

`;
  msg += `Olá, ${data.customerName}! Seu pedido foi registrado:

`;
  msg += `*ITENS:*
`;
  for (const item of data.items) {
    msg += `${item.quantity}x ${item.productName} - R$ ${item.totalPrice.toFixed(2)}
`;
    if (item.addons && item.addons.length > 0) {
      for (const a of item.addons) {
        msg += `  + ${a.addonName}${a.quantity > 1 ? ` (${a.quantity}x)` : ""}
`;
      }
    }
  }
  msg += `
*Total: R$ ${data.total.toFixed(2)}*`;
  if (data.deliveryFee > 0) msg += ` (Taxa entrega: R$ ${data.deliveryFee.toFixed(2)})`;
  msg += `
*Pagamento:* ${getPaymentLabel(data.paymentMethod)}`;
  msg += `

Aguardamos a confirmacao para iniciar o preparo! 🚀`;
  return msg;
}
function getPaymentLabel(method) {
  const map = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_credito: "Cartao de Credito",
    cartao_debito: "Cartao de Debito",
    vale_refeicao: "Vale Refeicao"
  };
  return map[method] || method;
}
async function updateOrderStatus(orderId, status) {
  const timestampField = {
    confirmado: "confirmed_at",
    preparo: "preparing_at",
    entregue: "delivered_at",
    cancelado: "cancelled_at"
  };
  const updateData = { status };
  if (timestampField[status]) {
    updateData[timestampField[status]] = (/* @__PURE__ */ new Date()).toISOString();
  }
  const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
  if (error) throw error;
}
async function markPrintJobAsPrinted(jobId) {
  const { error } = await supabase.from("print_jobs").update({
    status: "impresso",
    printed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", jobId).eq("status", "pendente");
  if (error) throw error;
  await supabase.from("print_logs").insert({
    company_id: (await supabase.from("print_jobs").select("company_id").eq("id", jobId).single()).data?.company_id,
    print_job_id: jobId,
    action: "impresso",
    status: "impresso"
  });
}
async function markPrintJobAsPrinting(jobId) {
  const { error } = await supabase.from("print_jobs").update({
    status: "imprimindo",
    printing_started_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", jobId).eq("status", "pendente");
  if (error) throw error;
}
async function markPrintJobError(jobId, errorMessage) {
  const { data: job } = await supabase.from("print_jobs").select("company_id, retry_count").eq("id", jobId).single();
  if (!job) return;
  await supabase.from("print_jobs").update({
    status: "erro",
    error_message: errorMessage,
    retry_count: (job.retry_count || 0) + 1,
    last_retry_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", jobId);
  await supabase.from("print_logs").insert({
    company_id: job.company_id,
    print_job_id: jobId,
    action: "erro",
    status: "erro",
    error_message: errorMessage
  });
}
const Route$5 = createFileRoute("/cardapio")({
  component: Cardapio
});
const cardapioTheme = {
  "--background": "#FAFAFA",
  "--foreground": "#111111",
  "--card": "#FFFFFF",
  "--card-foreground": "#111111",
  "--popover": "#FFFFFF",
  "--popover-foreground": "#111111",
  "--primary": "#FF5A1F",
  "--primary-foreground": "#FFFFFF",
  "--primary-glow": "#FF7A4F",
  "--secondary": "#F5F5F5",
  "--secondary-foreground": "#111111",
  "--muted": "#F0F0F0",
  "--muted-foreground": "#999999",
  "--accent": "#F5F5F5",
  "--accent-foreground": "#111111",
  "--success": "#10B981",
  "--success-foreground": "#FFFFFF",
  "--warning": "#FFC107",
  "--warning-foreground": "#111111",
  "--destructive": "#FF4D4F",
  "--destructive-foreground": "#FFFFFF",
  "--border": "#E8E8E8",
  "--input": "#E8E8E8",
  "--ring": "#FF5A1F",
  "--gradient-primary": "linear-gradient(135deg, #FF5A1F, #FF8C42)",
  "--gradient-surface": "linear-gradient(180deg, #FFFFFF, #F5F5F5)",
  "--shadow-glow": "0 0 0 1px rgba(255, 90, 31, 0.25), 0 10px 30px -12px rgba(255, 90, 31, 0.35)",
  "--shadow-card": "0 1px 0 0 rgba(255,255,255,1) inset, 0 4px 12px -8px rgba(0,0,0,0.12)",
  "--gradient-glow": "radial-gradient(60% 80% at 50% 0%, rgba(255, 90, 31, 0.08), transparent 70%)",
  "--radius": "0.875rem"
};
function Cardapio() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [addons, setAddons] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [companyName, setCompanyName] = useState("Cardapio Digital");
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerReference, setCustomerReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [changeFor, setChangeFor] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productNotes, setProductNotes] = useState("");
  const [selectedAddons, setSelectedAddons] = useState({});
  const [companySlug, setCompanySlug] = useState("");
  const categoriesRef = useRef(null);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyId();
      const { data: company } = await supabase.from("companies").select("name, slug").eq("id", companyId).single();
      if (company) {
        setCompanyName(company.name);
        setCompanySlug(company.slug || "");
      }
      const [catResult, prodResult, addonResult] = await Promise.all([
        supabase.from("product_categories").select("*").eq("company_id", companyId).eq("is_active", true).order("display_order"),
        supabase.from("products").select("*").eq("company_id", companyId).eq("is_active", true).order("display_order"),
        supabase.from("product_addons").select("*").eq("company_id", companyId).eq("is_active", true)
      ]);
      if (catResult.data) setCategories(catResult.data);
      if (prodResult.data) setProducts(prodResult.data);
      if (addonResult.data) setAddons(addonResult.data);
    } catch (err) {
      console.error("Erro ao carregar cardapio:", err);
      toast.error("Erro ao carregar o cardapio");
    } finally {
      setIsLoading(false);
    }
  };
  const productAddons = useMemo(() => {
    if (!selectedProduct) return [];
    return addons.filter((a) => a.product_id === selectedProduct.id);
  }, [selectedProduct, addons]);
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category_id === activeCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [products, activeCategory, searchTerm]);
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const addonTotal = item.addons.reduce((s, a) => s + a.price * a.quantity, 0);
      return sum + (item.unitPrice + addonTotal) * item.quantity;
    }, 0);
  }, [cart]);
  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.is_featured || p.is_promotional).slice(0, 3);
  }, [products]);
  const getProductPrice = (product) => {
    if (product.is_promotional && product.promotional_price) {
      return product.promotional_price;
    }
    return product.price;
  };
  const addToCart = (product) => {
    const itemAddons = productAddons.filter((a) => (selectedAddons[a.id] || 0) > 0).map((a) => ({
      addonId: a.id,
      addonName: a.name,
      quantity: selectedAddons[a.id] || 0,
      price: a.price
    }));
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.notes === productNotes && JSON.stringify(item.addons) === JSON.stringify(itemAddons)
    );
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += productQuantity;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: getProductPrice(product),
          quantity: productQuantity,
          notes: productNotes,
          addons: itemAddons
        }
      ]);
    }
    setSelectedProduct(null);
    setProductQuantity(1);
    setProductNotes("");
    setSelectedAddons({});
    toast.success(`${product.name} adicionado ao carrinho!`);
  };
  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };
  const updateCartQuantity = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    if (updated[index].quantity === 0) {
      removeFromCart(index);
    } else {
      setCart(updated);
    }
  };
  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast.error("Informe seu nome");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Informe seu telefone");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createOrder({
        customer: {
          name: customerName,
          phone: customerPhone.replace(/\D/g, ""),
          address: customerAddress,
          reference: customerReference
        },
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes || void 0,
          addons: item.addons.map((a) => ({
            addonId: a.addonId,
            addonName: a.addonName,
            quantity: a.quantity,
            price: a.price
          }))
        })),
        deliveryFee: 0,
        paymentMethod,
        changeFor: paymentMethod === "dinheiro" ? Number(changeFor) || void 0 : void 0,
        notes: orderNotes || void 0
      });
      setCart([]);
      setShowCheckout(false);
      window.open(result.whatsappUrl, "_blank");
      toast.success("Pedido registrado! Redirecionando para o WhatsApp...");
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      toast.error("Erro ao criar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const quickAdd = (product, e) => {
    e.stopPropagation();
    setCart([
      ...cart,
      {
        productId: product.id,
        productName: product.name,
        unitPrice: getProductPrice(product),
        quantity: 1,
        notes: "",
        addons: []
      }
    ]);
    toast.success(`${product.name} adicionado!`);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { style: cardapioTheme, className: "min-h-screen bg-[#FAFAFA]", children: /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto px-4 pt-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "animate-pulse space-y-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-5 w-40 bg-[#E8E8E8] rounded-lg" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 w-28 bg-[#E8E8E8] rounded-lg" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "animate-pulse flex gap-2 mb-6", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: "h-9 w-20 bg-[#E8E8E8] rounded-full" }, i)) }),
      /* @__PURE__ */ jsx("div", { className: "animate-pulse grid grid-cols-2 gap-3", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-white overflow-hidden shadow-[0_4px_12px_-8px_rgba(0,0,0,0.12)]", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-square bg-[#E8E8E8]" }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-4 w-3/4 bg-[#E8E8E8] rounded" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 w-1/2 bg-[#E8E8E8] rounded" }),
          /* @__PURE__ */ jsx("div", { className: "h-4 w-1/3 bg-[#E8E8E8] rounded" })
        ] })
      ] }, i)) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: cardapioTheme,
      className: "min-h-screen bg-[#FAFAFA] text-[#111111]",
      children: [
        featuredProducts.length > 0 && !searchTerm && /* @__PURE__ */ jsx("div", { className: "relative w-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "max-w-lg mx-auto px-4 pt-4", children: /* @__PURE__ */ jsxs("div", { className: "relative rounded-3xl overflow-hidden h-44 bg-gradient-to-br from-[#FF5A1F] to-[#FF8C42]", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: featuredProducts[0].image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
              alt: "",
              className: "absolute inset-0 w-full h-full object-cover opacity-30"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10 h-full flex flex-col justify-end p-5", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 mb-1", children: /* @__PURE__ */ jsx("span", { className: "bg-[#FF5A1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full", children: featuredProducts[0].is_promotional ? "PROMOÇÃO" : "DESTAQUE" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-white text-xl font-bold leading-tight drop-shadow-sm", children: featuredProducts[0].name }),
            /* @__PURE__ */ jsx("p", { className: "text-white/80 text-xs mt-0.5 line-clamp-1", children: featuredProducts[0].description || "Peça já o seu!" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2", children: [
              featuredProducts[0].is_promotional && featuredProducts[0].promotional_price ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("span", { className: "text-white/60 text-xs line-through", children: [
                  "R$ ",
                  featuredProducts[0].price.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-white font-bold text-lg", children: [
                  "R$ ",
                  featuredProducts[0].promotional_price.toFixed(2)
                ] })
              ] }) : /* @__PURE__ */ jsxs("span", { className: "text-white font-bold text-lg", children: [
                "R$ ",
                featuredProducts[0].price.toFixed(2)
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setSelectedProduct(featuredProducts[0]);
                    setProductQuantity(1);
                    setProductNotes("");
                    setSelectedAddons({});
                  },
                  className: "ml-auto bg-white text-[#FF5A1F] text-xs font-bold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors cursor-pointer",
                  children: "Pedir"
                }
              )
            ] })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-xl", children: [
          /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto px-4 py-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => navigate({ to: "/" }),
                  className: "h-9 w-9 rounded-full bg-white border border-[#E8E8E8] grid place-items-center hover:bg-[#F5F5F5] transition-colors cursor-pointer shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)]",
                  children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4 text-[#111]" })
                }
              ),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h1", { className: "font-bold text-base text-[#111]", children: companyName }),
                /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#999]", children: "Cardápio Digital" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSearchTerm(searchTerm ? "" : " "),
                  className: "h-9 w-9 rounded-full bg-white border border-[#E8E8E8] grid place-items-center hover:bg-[#F5F5F5] transition-colors cursor-pointer shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)]",
                  children: /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-[#111]" })
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setCartOpen(true),
                  className: "relative h-9 w-9 rounded-full bg-[#FF5A1F] grid place-items-center cursor-pointer shadow-[0_2px_8px_-4px_rgba(255,90,31,0.4)]",
                  children: [
                    /* @__PURE__ */ jsx(ShoppingCart, { className: "h-4 w-4 text-white" }),
                    cartItemsCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 h-4.5 w-4.5 min-w-[18px] rounded-full bg-[#111] text-white text-[9px] font-bold grid place-items-center px-1", children: cartItemsCount })
                  ]
                }
              )
            ] })
          ] }),
          searchTerm && /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              className: "max-w-lg mx-auto px-4 pb-3",
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-full bg-white border border-[#E8E8E8] px-4 py-2.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]", children: [
                /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-[#999]" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: searchTerm === " " ? "" : searchTerm,
                    onChange: (e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                    },
                    placeholder: "Buscar no cardápio...",
                    className: "flex-1 bg-transparent outline-none text-sm text-[#111] placeholder:text-[#bbb]",
                    autoFocus: true
                  }
                ),
                searchTerm && searchTerm !== " " && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setSearchTerm(""),
                    className: "cursor-pointer",
                    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-[#999]" })
                  }
                )
              ] })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "max-w-lg mx-auto px-4 pb-3", ref: categoriesRef, children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2 overflow-x-auto scrollbar-none pb-0.5", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setActiveCategory("all"),
                className: `shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${activeCategory === "all" ? "bg-[#111] text-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.2)]" : "bg-white text-[#666] border border-[#E8E8E8] hover:border-[#ccc]"}`,
                children: "Todos"
              }
            ),
            categories.map((cat) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setActiveCategory(cat.id),
                className: `shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${activeCategory === cat.id ? "bg-[#111] text-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.2)]" : "bg-white text-[#666] border border-[#E8E8E8] hover:border-[#ccc]"}`,
                children: cat.name
              },
              cat.id
            ))
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("main", { className: "max-w-lg mx-auto px-4 pb-32", children: filteredProducts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-white border border-[#E8E8E8] grid place-items-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Search, { className: "h-6 w-6 text-[#ccc]" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-[#999] text-sm", children: "Nenhum produto encontrado" })
        ] }) : /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            className: "grid grid-cols-2 gap-3",
            children: filteredProducts.map((product, index) => {
              getProductPrice(product);
              return /* @__PURE__ */ jsxs(
                motion.button,
                {
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: index * 0.03, duration: 0.3 },
                  onClick: () => {
                    setSelectedProduct(product);
                    setProductQuantity(1);
                    setProductNotes("");
                    setSelectedAddons({});
                  },
                  className: "rounded-3xl bg-white overflow-hidden text-left hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group shadow-[0_4px_12px_-8px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)]",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "aspect-square bg-[#F5F5F5] relative overflow-hidden", children: [
                      product.image_url ? /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: product.image_url,
                          alt: product.name,
                          className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        }
                      ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full grid place-items-center", children: /* @__PURE__ */ jsx(Award, { className: "h-10 w-10 text-[#ddd]" }) }),
                      product.is_promotional && /* @__PURE__ */ jsxs("span", { className: "absolute top-2 left-2 bg-[#FF5A1F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-[0_2px_4px_rgba(255,90,31,0.3)]", children: [
                        /* @__PURE__ */ jsx(TrendingUp, { className: "h-2.5 w-2.5" }),
                        " OFF"
                      ] }),
                      product.is_featured && !product.is_promotional && /* @__PURE__ */ jsxs("span", { className: "absolute top-2 left-2 bg-[#111] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5", children: [
                        /* @__PURE__ */ jsx(Star, { className: "h-2.5 w-2.5" }),
                        " Destaque"
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "absolute bottom-2 right-2", children: /* @__PURE__ */ jsx(
                        "div",
                        {
                          onClick: (e) => quickAdd(product, e),
                          className: "h-8 w-8 rounded-full bg-[#FF5A1F] text-white grid place-items-center shadow-[0_2px_8px_-4px_rgba(255,90,31,0.5)] hover:bg-[#e54e1a] transition-colors active:scale-90",
                          children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })
                        }
                      ) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "p-3", children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-sm text-[#111] truncate leading-tight", children: product.name }),
                      product.description && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-[#999] truncate mt-0.5", children: product.description }),
                      /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
                        product.is_promotional && product.promotional_price ? /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
                          /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-[#bbb] line-through", children: [
                            "R$ ",
                            product.price.toFixed(2)
                          ] }),
                          /* @__PURE__ */ jsxs("span", { className: "font-bold text-sm text-[#FF5A1F]", children: [
                            "R$ ",
                            product.promotional_price.toFixed(2)
                          ] })
                        ] }) : /* @__PURE__ */ jsxs("span", { className: "font-bold text-sm text-[#111]", children: [
                          "R$ ",
                          product.price.toFixed(2)
                        ] }),
                        product.preparation_time > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-[#999] flex items-center gap-0.5", children: [
                          /* @__PURE__ */ jsx(Timer, { className: "h-3 w-3" }),
                          product.preparation_time,
                          "min"
                        ] })
                      ] })
                    ] })
                  ]
                },
                product.id
              );
            })
          }
        ) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: selectedProduct && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50", children: [
          /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              className: "absolute inset-0 bg-black/40 backdrop-blur-sm",
              onClick: () => setSelectedProduct(null)
            }
          ),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: "100%" },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: "100%" },
              transition: { type: "spring", damping: 28, stiffness: 300 },
              className: "absolute bottom-0 w-full max-w-lg mx-auto left-0 right-0 bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.2)]",
              children: [
                selectedProduct.image_url && /* @__PURE__ */ jsxs("div", { className: "relative h-52 overflow-hidden", children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: selectedProduct.image_url,
                      alt: selectedProduct.name,
                      className: "w-full h-full object-cover"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setSelectedProduct(null),
                      className: "absolute top-4 left-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm grid place-items-center hover:bg-white transition-colors cursor-pointer shadow-[0_2px_8px_-4px_rgba(0,0,0,0.15)]",
                      children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-[#111]" })
                    }
                  ),
                  selectedProduct.is_promotional && /* @__PURE__ */ jsx("span", { className: "absolute top-4 right-4 bg-[#FF5A1F] text-white text-[10px] font-bold px-2 py-1 rounded-full", children: "PROMOÇÃO" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-1", children: [
                    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-[#111] leading-tight", children: selectedProduct.name }),
                    !selectedProduct.image_url && /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => setSelectedProduct(null),
                        className: "h-8 w-8 rounded-full bg-[#F5F5F5] grid place-items-center hover:bg-[#E8E8E8] transition-colors cursor-pointer shrink-0 ml-2",
                        children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-[#666]" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                    selectedProduct.is_promotional && selectedProduct.promotional_price ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-sm text-[#bbb] line-through", children: [
                        "R$ ",
                        selectedProduct.price.toFixed(2)
                      ] }),
                      /* @__PURE__ */ jsxs("span", { className: "font-bold text-xl text-[#FF5A1F]", children: [
                        "R$ ",
                        selectedProduct.promotional_price.toFixed(2)
                      ] })
                    ] }) : /* @__PURE__ */ jsxs("span", { className: "font-bold text-xl text-[#111]", children: [
                      "R$ ",
                      selectedProduct.price.toFixed(2)
                    ] }),
                    selectedProduct.preparation_time > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-[#999] flex items-center gap-1 ml-auto", children: [
                      /* @__PURE__ */ jsx(Timer, { className: "h-3.5 w-3.5" }),
                      selectedProduct.preparation_time,
                      " min"
                    ] })
                  ] }),
                  selectedProduct.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-[#666] leading-relaxed mb-5", children: selectedProduct.description }),
                  productAddons.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-[#111] uppercase tracking-wider mb-3", children: "Adicionais" }),
                    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: productAddons.map((addon) => {
                      const count = selectedAddons[addon.id] || 0;
                      return /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: `flex items-center justify-between bg-[#FAFAFA] rounded-2xl px-4 py-3 border transition-all ${count > 0 ? "border-[#FF5A1F]/30 bg-[#FF5A1F]/5" : "border-[#E8E8E8]"}`,
                          children: [
                            /* @__PURE__ */ jsxs("div", { children: [
                              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-[#111]", children: addon.name }),
                              addon.price > 0 && /* @__PURE__ */ jsxs("span", { className: "text-xs text-[#999] ml-1.5", children: [
                                "+ R$ ",
                                addon.price.toFixed(2)
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                              /* @__PURE__ */ jsx(
                                "button",
                                {
                                  onClick: () => setSelectedAddons((prev) => ({
                                    ...prev,
                                    [addon.id]: Math.max(0, (prev[addon.id] || 0) - 1)
                                  })),
                                  className: `h-7 w-7 rounded-full border grid place-items-center transition-colors cursor-pointer ${count > 0 ? "bg-[#FF5A1F] border-[#FF5A1F] text-white" : "bg-white border-[#E8E8E8] text-[#666] hover:border-[#ccc]"}`,
                                  children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" })
                                }
                              ),
                              /* @__PURE__ */ jsx("span", { className: "w-5 text-center text-sm font-semibold text-[#111]", children: count }),
                              /* @__PURE__ */ jsx(
                                "button",
                                {
                                  onClick: () => {
                                    if (count < addon.max_quantity) {
                                      setSelectedAddons((prev) => ({
                                        ...prev,
                                        [addon.id]: (prev[addon.id] || 0) + 1
                                      }));
                                    }
                                  },
                                  className: `h-7 w-7 rounded-full border grid place-items-center transition-colors cursor-pointer ${count >= addon.max_quantity ? "bg-[#F5F5F5] border-[#E8E8E8] text-[#ccc]" : "bg-white border-[#E8E8E8] text-[#666] hover:border-[#ccc]"}`,
                                  children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
                                }
                              )
                            ] })
                          ]
                        },
                        addon.id
                      );
                    }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
                    /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-[#111] uppercase tracking-wider mb-2", children: "Observações" }),
                    /* @__PURE__ */ jsx(
                      "textarea",
                      {
                        value: productNotes,
                        onChange: (e) => setProductNotes(e.target.value),
                        placeholder: "Alguma observação para este item?",
                        className: "w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-3 text-sm outline-none resize-none h-20 text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "sticky bottom-0 bg-white pt-3 pb-1 border-t border-[#E8E8E8] -mx-5 px-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 bg-[#FAFAFA] rounded-2xl px-3 py-1.5", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => setProductQuantity(Math.max(1, productQuantity - 1)),
                          className: "h-8 w-8 rounded-full bg-white border border-[#E8E8E8] grid place-items-center hover:bg-[#F5F5F5] transition-colors cursor-pointer",
                          children: /* @__PURE__ */ jsx(Minus, { className: "h-4 w-4 text-[#111]" })
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-[#111] w-8 text-center", children: productQuantity }),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => setProductQuantity(productQuantity + 1),
                          className: "h-8 w-8 rounded-full bg-white border border-[#E8E8E8] grid place-items-center hover:bg-[#F5F5F5] transition-colors cursor-pointer",
                          children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 text-[#111]" })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => addToCart(selectedProduct),
                        className: "rounded-2xl bg-[#FF5A1F] px-6 py-3 text-sm font-bold text-white hover:bg-[#e54e1a] transition-colors active:scale-95 cursor-pointer shadow-[0_4px_12px_-4px_rgba(255,90,31,0.5)]",
                        children: [
                          "Adicionar • R$",
                          " ",
                          ((selectedProduct.is_promotional && selectedProduct.promotional_price ? selectedProduct.promotional_price : selectedProduct.price) * productQuantity).toFixed(2)
                        ]
                      }
                    )
                  ] }) })
                ] })
              ]
            }
          )
        ] }) }),
        cart.length > 0 && /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 z-40 p-3 pb-5 max-w-lg mx-auto pointer-events-none", children: /* @__PURE__ */ jsxs(
          motion.button,
          {
            initial: { y: 60, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            onClick: () => setCartOpen(true),
            className: "w-full rounded-2xl bg-[#111] text-white px-5 py-3.5 flex items-center justify-between shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all pointer-events-auto cursor-pointer",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5" }),
                  /* @__PURE__ */ jsx("span", { className: "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FF5A1F] text-[9px] font-bold grid place-items-center", children: cartItemsCount })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Ver carrinho" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-bold", children: [
                  "R$ ",
                  cartTotal.toFixed(2)
                ] }),
                /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-white/60" })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: cartOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50", children: [
          /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              className: "absolute inset-0 bg-black/40 backdrop-blur-sm",
              onClick: () => setCartOpen(false)
            }
          ),
          /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { x: "100%" },
              animate: { x: 0 },
              exit: { x: "100%" },
              transition: { type: "spring", damping: 28, stiffness: 300 },
              className: "absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.2)] flex flex-col",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b border-[#E8E8E8]", children: [
                  /* @__PURE__ */ jsxs("h2", { className: "font-bold text-lg text-[#111] flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(ShoppingCart, { className: "h-5 w-5 text-[#FF5A1F]" }),
                    "Carrinho"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setCartOpen(false),
                      className: "h-8 w-8 rounded-full bg-[#F5F5F5] grid place-items-center hover:bg-[#E8E8E8] transition-colors cursor-pointer",
                      children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-[#666]" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: cart.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-[#F5F5F5] grid place-items-center mx-auto mb-4", children: /* @__PURE__ */ jsx(ShoppingCart, { className: "h-6 w-6 text-[#ccc]" }) }),
                  /* @__PURE__ */ jsx("p", { className: "text-[#999] text-sm", children: "Carrinho vazio" })
                ] }) : cart.map((item, index) => {
                  const addonTotal = item.addons.reduce(
                    (sum, a) => sum + a.price * a.quantity,
                    0
                  );
                  const itemTotal = (item.unitPrice + addonTotal) * item.quantity;
                  return /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      initial: { opacity: 0, y: 8 },
                      animate: { opacity: 1, y: 0 },
                      className: "bg-[#FAFAFA] rounded-2xl border border-[#E8E8E8] p-3",
                      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 bg-white rounded-full px-2 py-0.5 border border-[#E8E8E8] shadow-[0_1px_4px_-2px_rgba(0,0,0,0.06)]", children: [
                              /* @__PURE__ */ jsx(
                                "button",
                                {
                                  onClick: () => updateCartQuantity(index, -1),
                                  className: "cursor-pointer",
                                  children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3 text-[#666]" })
                                }
                              ),
                              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold w-4 text-center text-[#111]", children: item.quantity }),
                              /* @__PURE__ */ jsx(
                                "button",
                                {
                                  onClick: () => updateCartQuantity(index, 1),
                                  className: "cursor-pointer",
                                  children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3 text-[#666]" })
                                }
                              )
                            ] }),
                            /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-[#111] truncate", children: item.productName })
                          ] }),
                          item.addons.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 text-[11px] text-[#999] pl-10", children: item.addons.map((a, i) => /* @__PURE__ */ jsxs("span", { children: [
                            "+ ",
                            a.addonName,
                            a.quantity > 1 ? ` (${a.quantity}x)` : "",
                            i < item.addons.length - 1 ? ", " : ""
                          ] }, i)) }),
                          item.notes && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-[#999] mt-0.5 pl-10 italic", children: [
                            "Obs: ",
                            item.notes
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "text-right shrink-0 ml-2", children: [
                          /* @__PURE__ */ jsxs("div", { className: "font-semibold text-sm text-[#111]", children: [
                            "R$ ",
                            itemTotal.toFixed(2)
                          ] }),
                          /* @__PURE__ */ jsx(
                            "button",
                            {
                              onClick: () => removeFromCart(index),
                              className: "text-[#999] hover:text-[#FF4D4F] mt-1 transition-colors cursor-pointer",
                              children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
                            }
                          )
                        ] })
                      ] })
                    },
                    index
                  );
                }) }),
                cart.length > 0 && /* @__PURE__ */ jsxs("div", { className: "border-t border-[#E8E8E8] p-4 space-y-3 bg-white", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-[#999]", children: "Total" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-bold text-xl text-[#111]", children: [
                      "R$ ",
                      cartTotal.toFixed(2)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => {
                        setCartOpen(false);
                        setShowCheckout(true);
                      },
                      className: "w-full rounded-2xl bg-[#FF5A1F] py-3.5 text-sm font-bold text-white hover:bg-[#e54e1a] transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_-4px_rgba(255,90,31,0.5)]",
                      children: [
                        /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
                        "Enviar Pedido pelo WhatsApp"
                      ]
                    }
                  )
                ] })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: showCheckout && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4", children: /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
            className: "w-full max-w-lg rounded-3xl bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto",
            children: /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-[#111]", children: "Finalizar Pedido" }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setShowCheckout(false),
                    className: "h-8 w-8 rounded-full bg-[#F5F5F5] grid place-items-center hover:bg-[#E8E8E8] transition-colors cursor-pointer",
                    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4 text-[#666]" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-[#999]", children: "Nome *" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: customerName,
                      onChange: (e) => setCustomerName(e.target.value),
                      placeholder: "Seu nome",
                      className: "w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-[#999]", children: "WhatsApp *" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: customerPhone,
                      onChange: (e) => setCustomerPhone(e.target.value),
                      placeholder: "(11) 99999-9999",
                      className: "w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-[#999]", children: "Endereço de entrega" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: customerAddress,
                      onChange: (e) => setCustomerAddress(e.target.value),
                      placeholder: "Rua, número, bairro",
                      className: "w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-[#999]", children: "Ponto de referência" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: customerReference,
                      onChange: (e) => setCustomerReference(e.target.value),
                      placeholder: "Próximo ao ...",
                      className: "w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-[#999]", children: "Forma de pagamento" }),
                  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: [
                    { value: "pix", label: "PIX", icon: Smartphone },
                    { value: "dinheiro", label: "Dinheiro", icon: Banknote },
                    {
                      value: "cartao_credito",
                      label: "Cartão Crédito",
                      icon: CreditCard
                    },
                    {
                      value: "cartao_debito",
                      label: "Cartão Débito",
                      icon: CreditCard
                    }
                  ].map((option) => /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setPaymentMethod(option.value),
                      className: `flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${paymentMethod === option.value ? "bg-[#FF5A1F]/10 border-[#FF5A1F] text-[#FF5A1F]" : "bg-[#FAFAFA] border-[#E8E8E8] text-[#666] hover:text-[#111]"}`,
                      children: [
                        /* @__PURE__ */ jsx(option.icon, { className: "h-4 w-4" }),
                        option.label
                      ]
                    },
                    option.value
                  )) })
                ] }),
                paymentMethod === "dinheiro" && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-[#999]", children: "Troco para" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      value: changeFor,
                      onChange: (e) => setChangeFor(e.target.value),
                      placeholder: "Valor pago",
                      className: "w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-[#999]", children: "Observações do pedido" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      value: orderNotes,
                      onChange: (e) => setOrderNotes(e.target.value),
                      placeholder: "Alguma observação geral?",
                      className: "w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none resize-none h-20 text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-[#FAFAFA] rounded-2xl border border-[#E8E8E8] p-4 space-y-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[#999]", children: "Itens" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[#111]", children: cartItemsCount })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-bold text-lg pt-1 border-t border-[#E8E8E8]", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[#111]", children: "Total" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[#FF5A1F]", children: [
                      "R$ ",
                      cartTotal.toFixed(2)
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: handleCheckout,
                    disabled: isSubmitting,
                    className: "w-full rounded-2xl bg-[#FF5A1F] py-3.5 text-sm font-bold text-white hover:bg-[#e54e1a] transition-colors disabled:opacity-50 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_-4px_rgba(255,90,31,0.5)]",
                    children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                      "Enviando..."
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
                      "Enviar Pedido pelo WhatsApp"
                    ] })
                  }
                )
              ] })
            ] })
          }
        ) }) })
      ]
    }
  );
}
const $$splitComponentImporter$4 = () => import("./campanhas-Fu5OulYj.js");
const searchSchema = z.object({
  new: z.boolean().optional()
});
const Route$4 = createFileRoute("/campanhas")({
  validateSearch: searchSchema,
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./automacoes-B9x4c8cl.js");
const Route$3 = createFileRoute("/automacoes")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./aguardando-vinculo-DGsuaJjn.js");
const Route$2 = createFileRoute("/aguardando-vinculo")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./agentes-ia-CY1g6-di.js");
const Route$1 = createFileRoute("/agentes-ia")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-j6uv4jvY.js");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  head: () => ({
    meta: [{
      title: "Nexus Deli — O sistema operacional do delivery"
    }, {
      name: "description",
      content: "Recuperação automática de clientes, campanhas no WhatsApp e IA para delivery. O fim do delivery parado."
    }]
  })
});
const WhatsappRoute = Route$i.update({
  id: "/whatsapp",
  path: "/whatsapp",
  getParentRoute: () => Route$j
});
const SuperAdminRoute = Route$h.update({
  id: "/super-admin",
  path: "/super-admin",
  getParentRoute: () => Route$j
});
const RedefinirSenhaRoute = Route$g.update({
  id: "/redefinir-senha",
  path: "/redefinir-senha",
  getParentRoute: () => Route$j
});
const PromocoesRoute = Route$f.update({
  id: "/promocoes",
  path: "/promocoes",
  getParentRoute: () => Route$j
});
const ProdutosRoute = Route$e.update({
  id: "/produtos",
  path: "/produtos",
  getParentRoute: () => Route$j
});
const PedidosRoute = Route$d.update({
  id: "/pedidos",
  path: "/pedidos",
  getParentRoute: () => Route$j
});
const LoginRoute = Route$c.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$j
});
const FilaImpressaoRoute = Route$b.update({
  id: "/fila-impressao",
  path: "/fila-impressao",
  getParentRoute: () => Route$j
});
const EsqueciSenhaRoute = Route$a.update({
  id: "/esqueci-senha",
  path: "/esqueci-senha",
  getParentRoute: () => Route$j
});
const DashboardRoute = Route$9.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$j
});
const CriarContaRoute = Route$8.update({
  id: "/criar-conta",
  path: "/criar-conta",
  getParentRoute: () => Route$j
});
const ConfiguracoesRoute = Route$7.update({
  id: "/configuracoes",
  path: "/configuracoes",
  getParentRoute: () => Route$j
});
const ClientesRoute = Route$6.update({
  id: "/clientes",
  path: "/clientes",
  getParentRoute: () => Route$j
});
const CardapioRoute = Route$5.update({
  id: "/cardapio",
  path: "/cardapio",
  getParentRoute: () => Route$j
});
const CampanhasRoute = Route$4.update({
  id: "/campanhas",
  path: "/campanhas",
  getParentRoute: () => Route$j
});
const AutomacoesRoute = Route$3.update({
  id: "/automacoes",
  path: "/automacoes",
  getParentRoute: () => Route$j
});
const AguardandoVinculoRoute = Route$2.update({
  id: "/aguardando-vinculo",
  path: "/aguardando-vinculo",
  getParentRoute: () => Route$j
});
const AgentesIaRoute = Route$1.update({
  id: "/agentes-ia",
  path: "/agentes-ia",
  getParentRoute: () => Route$j
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$j
});
const rootRouteChildren = {
  IndexRoute,
  AgentesIaRoute,
  AguardandoVinculoRoute,
  AutomacoesRoute,
  CampanhasRoute,
  CardapioRoute,
  ClientesRoute,
  ConfiguracoesRoute,
  CriarContaRoute,
  DashboardRoute,
  EsqueciSenhaRoute,
  FilaImpressaoRoute,
  LoginRoute,
  PedidosRoute,
  ProdutosRoute,
  PromocoesRoute,
  RedefinirSenhaRoute,
  SuperAdminRoute,
  WhatsappRoute
};
const routeTree = Route$j._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$4 as R,
  markPrintJobAsPrinting as a,
  markPrintJobError as b,
  useAuth as c,
  useTheme as d,
  getCompanyId as g,
  markPrintJobAsPrinted as m,
  router as r,
  supabase as s,
  updateOrderStatus as u
};
