import { jsxs, jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { ArrowUpRight, Play, Pause, MoreHorizontal, Bot, QrCode, Smartphone, Wifi, CheckCircle2, MessageCircle, Zap, Flame, Repeat, Users, TrendingUp, DollarSign, Megaphone } from "lucide-react";
import { S as Sidebar, T as Topbar } from "./Topbar-jXAYa-6f.js";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import "@tanstack/react-router";
import "./router-BotcCoyH.js";
import "@tanstack/react-query";
import "react";
import "sonner";
import "@supabase/supabase-js";
import "zod";
const toneMap = {
  primary: "text-primary bg-primary/12 border-primary/25",
  success: "text-success bg-success/12 border-success/25",
  warning: "text-warning bg-warning/12 border-warning/25"
};
function KpiCard({ icon: Icon, label, value, delta, hint, tone = "primary", index = 0 }) {
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: index * 0.05, duration: 0.4, ease: "easeOut" },
      className: "group relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-5 shadow-card",
      children: [
        /* @__PURE__ */ jsx("div", { className: "bg-glow absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex items-start justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: `h-10 w-10 grid place-items-center rounded-xl border ${toneMap[tone]}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success", children: [
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3" }),
            " ",
            delta
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative mt-5", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: label }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-3xl font-bold tracking-tight", children: value }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: hint })
        ] })
      ]
    }
  );
}
const data = [
  { d: "Seg", recuperado: 4200, organico: 1800 },
  { d: "Ter", recuperado: 5100, organico: 2100 },
  { d: "Qua", recuperado: 4800, organico: 1900 },
  { d: "Qui", recuperado: 7200, organico: 2400 },
  { d: "Sex", recuperado: 9400, organico: 3100 },
  { d: "Sáb", recuperado: 12800, organico: 4200 },
  { d: "Dom", recuperado: 11200, organico: 3800 }
];
function RevenueChart() {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: "Faturamento recuperado" }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-2xl font-bold tracking-tight", children: "R$ 54.720" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-success font-medium", children: "+38% vs. semana anterior" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1 rounded-lg border border-border p-1 text-xs", children: ["7D", "30D", "90D"].map((t, i) => /* @__PURE__ */ jsx(
        "button",
        {
          className: `px-2.5 py-1 rounded-md ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
          children: t
        },
        t
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-[260px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data, margin: { top: 8, right: 8, bottom: 0, left: -20 }, children: [
      /* @__PURE__ */ jsxs("defs", { children: [
        /* @__PURE__ */ jsxs("linearGradient", { id: "gRec", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.62 0.234 27.5)", stopOpacity: 0.55 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.62 0.234 27.5)", stopOpacity: 0 })
        ] }),
        /* @__PURE__ */ jsxs("linearGradient", { id: "gOrg", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.76 0.18 152)", stopOpacity: 0.35 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.76 0.18 152)", stopOpacity: 0 })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CartesianGrid, { stroke: "oklch(1 0 0 / 0.05)", vertical: false }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "d", stroke: "oklch(0.65 0 0)", fontSize: 11, tickLine: false, axisLine: false }),
      /* @__PURE__ */ jsx(YAxis, { stroke: "oklch(0.65 0 0)", fontSize: 11, tickLine: false, axisLine: false, tickFormatter: (v) => `${v / 1e3}k` }),
      /* @__PURE__ */ jsx(
        Tooltip,
        {
          contentStyle: {
            background: "oklch(0.16 0 0)",
            border: "1px solid oklch(0.28 0 0)",
            borderRadius: 12,
            fontSize: 12
          },
          labelStyle: { color: "oklch(0.97 0 0)", fontWeight: 600 },
          formatter: (v) => `R$ ${v.toLocaleString("pt-BR")}`
        }
      ),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "organico", stroke: "oklch(0.76 0.18 152)", strokeWidth: 2, fill: "url(#gOrg)" }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "recuperado", stroke: "oklch(0.62 0.234 27.5)", strokeWidth: 2.5, fill: "url(#gRec)" })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex gap-5 text-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary shadow-glow" }),
        " Recuperado"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-success" }),
        " Orgânico"
      ] })
    ] })
  ] });
}
const campaigns = [
  { name: "Reativação 30 dias", status: "rodando", sent: 2840, opened: 2210, converted: 412, revenue: "R$ 18.420" },
  { name: "Sexta da pizza", status: "rodando", sent: 1620, opened: 1380, converted: 287, revenue: "R$ 9.870" },
  { name: "Combo família — Domingo", status: "fila", sent: 0, opened: 0, converted: 0, revenue: "R$ 0" },
  { name: "Clientes inativos 60d", status: "rodando", sent: 4120, opened: 2980, converted: 521, revenue: "R$ 22.110" },
  { name: "Aniversariantes", status: "pausada", sent: 180, opened: 142, converted: 38, revenue: "R$ 1.420" }
];
const statusStyle = {
  rodando: "bg-success/15 text-success border-success/30",
  fila: "bg-warning/15 text-warning border-warning/30",
  pausada: "bg-muted text-muted-foreground border-border"
};
function Campaigns() {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-border", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: "Máquina de recorrência" }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-lg font-semibold", children: "Campanhas rodando" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "text-xs text-primary font-semibold hover:underline", children: "ver todas →" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left font-medium px-5 py-3", children: "Campanha" }),
        /* @__PURE__ */ jsx("th", { className: "text-left font-medium py-3", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-right font-medium py-3", children: "Enviadas" }),
        /* @__PURE__ */ jsx("th", { className: "text-right font-medium py-3", children: "Abertas" }),
        /* @__PURE__ */ jsx("th", { className: "text-right font-medium py-3", children: "Converteu" }),
        /* @__PURE__ */ jsx("th", { className: "text-right font-medium py-3 pr-5", children: "Faturado" }),
        /* @__PURE__ */ jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: campaigns.map((c, i) => /* @__PURE__ */ jsxs(
        motion.tr,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { delay: i * 0.04 },
          className: "border-t border-border hover:bg-accent/40",
          children: [
            /* @__PURE__ */ jsxs("td", { className: "px-5 py-3.5", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: c.name }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "WhatsApp · IA Sofia" })
            ] }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyle[c.status]}`, children: [
              c.status === "rodando" && /* @__PURE__ */ jsxs("span", { className: "relative inline-flex h-1.5 w-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-success pulse-dot text-success" }),
                /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-success" })
              ] }),
              c.status
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "text-right text-muted-foreground", children: c.sent.toLocaleString("pt-BR") }),
            /* @__PURE__ */ jsx("td", { className: "text-right text-muted-foreground", children: c.opened.toLocaleString("pt-BR") }),
            /* @__PURE__ */ jsx("td", { className: "text-right font-semibold", children: c.converted }),
            /* @__PURE__ */ jsx("td", { className: "text-right pr-5 font-semibold text-success", children: c.revenue }),
            /* @__PURE__ */ jsx("td", { className: "pr-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
              /* @__PURE__ */ jsx("button", { className: "h-7 w-7 grid place-items-center rounded-md hover:bg-accent", children: c.status === "pausada" ? /* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Pause, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsx("button", { className: "h-7 w-7 grid place-items-center rounded-md hover:bg-accent", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-3.5 w-3.5" }) })
            ] }) })
          ]
        },
        c.name
      )) })
    ] }) })
  ] });
}
const agents = [
  { name: "Sofia", role: "Recuperação", msgs: 1284, conv: "32%", color: "from-primary to-warning" },
  { name: "Léo", role: "Atendimento", msgs: 962, conv: "41%", color: "from-success to-primary" },
  { name: "Júlia", role: "Pós-venda", msgs: 540, conv: "27%", color: "from-warning to-primary" }
];
function AgentsPanel() {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: "Funcionários digitais" }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-lg font-semibold", children: "Agentes IA trabalhando" })
      ] }),
      /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-primary" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children: agents.map((a, i) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, x: -8 },
        animate: { opacity: 1, x: 0 },
        transition: { delay: i * 0.08 },
        className: "flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 hover:bg-accent/50 transition-colors",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: `h-11 w-11 rounded-xl bg-gradient-to-br ${a.color} grid place-items-center font-bold text-sm`, children: a.name[0] }),
            /* @__PURE__ */ jsx("span", { className: "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background shadow-success-glow" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: a.name }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-md bg-success/15 text-success font-medium", children: "online" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              a.role,
              " · respondendo agora"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-bold", children: a.msgs.toLocaleString("pt-BR") }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
              "msgs · conv ",
              a.conv
            ] })
          ] })
        ]
      },
      a.name
    )) })
  ] });
}
const instances = [
  { name: "Loja Centro", number: "+55 11 99821-4400", status: "online", queue: 12 },
  { name: "Loja Zona Sul", number: "+55 11 99432-8821", status: "online", queue: 4 },
  { name: "Delivery Hub", number: "+55 11 98821-1102", status: "offline", queue: 0 }
];
function WhatsappPanel() {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: "WhatsApp turbo" }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-lg font-semibold", children: "Instâncias conectadas" })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success hover:bg-success/15", children: [
        /* @__PURE__ */ jsx(QrCode, { className: "h-3.5 w-3.5" }),
        " Novo QR"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: instances.map((i) => {
      const online = i.status === "online";
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3", children: [
        /* @__PURE__ */ jsx("div", { className: `h-10 w-10 rounded-xl grid place-items-center ${online ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`, children: /* @__PURE__ */ jsx(Smartphone, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm truncate", children: i.name }),
            /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 text-[10px] font-medium ${online ? "text-success" : "text-destructive"}`, children: [
              /* @__PURE__ */ jsx(Wifi, { className: "h-3 w-3" }),
              " ",
              i.status
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground font-mono", children: i.number })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-bold", children: i.queue }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: "na fila" })
        ] })
      ] }, i.name);
    }) })
  ] });
}
const events = [
  { icon: CheckCircle2, color: "text-success", text: "Campanha “Sexta da pizza” converteu", meta: "Cliente Pedro R. · R$ 84,50", time: "agora" },
  { icon: Bot, color: "text-primary", text: "Sofia respondeu 12 contatos", meta: "Recuperação · últimos 5 min", time: "1 min" },
  { icon: MessageCircle, color: "text-success", text: "32 mensagens entregues", meta: "Reativação 30 dias", time: "2 min" },
  { icon: Zap, color: "text-warning", text: "Automação “Carrinho abandonado” disparou", meta: "8 clientes notificados", time: "4 min" },
  { icon: Smartphone, color: "text-success", text: "Loja Zona Sul reconectou", meta: "WhatsApp online", time: "6 min" },
  { icon: CheckCircle2, color: "text-success", text: "Cliente reativado após 47 dias", meta: "Maria F. · pediu de novo", time: "8 min" }
];
function ActivityFeed() {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: "Tempo real" }),
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 text-lg font-semibold", children: "Operação acontecendo" })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "relative inline-flex h-2 w-2", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute inset-0 rounded-full bg-primary pulse-dot text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-primary shadow-glow" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3.5", children: events.map((e, i) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: i * 0.05 },
        className: "flex items-start gap-3",
        children: [
          /* @__PURE__ */ jsx("div", { className: `mt-0.5 h-7 w-7 rounded-lg bg-background/60 border border-border grid place-items-center ${e.color}`, children: /* @__PURE__ */ jsx(e.icon, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium leading-tight", children: e.text }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: e.meta })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground whitespace-nowrap", children: e.time })
        ]
      },
      i
    )) })
  ] });
}
function Dashboard() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(Sidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsx(Topbar, {}),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxs(motion.section, { initial: {
          opacity: 0,
          y: 10
        }, animate: {
          opacity: 1,
          y: 0
        }, className: "relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-6 lg:p-7 shadow-card", children: [
          /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-40" }),
          /* @__PURE__ */ jsx("div", { className: "bg-glow absolute inset-0" }),
          /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider", children: [
                /* @__PURE__ */ jsx(Flame, { className: "h-3 w-3" }),
                " Operação girando"
              ] }),
              /* @__PURE__ */ jsxs("h1", { className: "mt-3 text-2xl lg:text-3xl font-bold tracking-tight text-balance", children: [
                "Seu delivery está ",
                /* @__PURE__ */ jsx("span", { className: "text-primary", children: "vendendo agora" }),
                "."
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-sm text-muted-foreground max-w-xl", children: "Clientes voltando automaticamente · WhatsApp trabalhando · IA respondendo · campanhas convertendo em tempo real." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: "Hoje" }),
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: "R$ 8.420" }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-success font-medium", children: "+24% vs. ontem" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-12 w-px bg-border" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-[0.18em] text-muted-foreground", children: "Recuperados" }),
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: "187" }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] text-success font-medium", children: "clientes hoje" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsx(KpiCard, { index: 0, icon: Repeat, label: "Pedidos recuperados", value: "1.284", delta: "+18%", hint: "últimos 7 dias", tone: "primary" }),
          /* @__PURE__ */ jsx(KpiCard, { index: 1, icon: Users, label: "Clientes reativados", value: "612", delta: "+24%", hint: "que não voltavam há 30d+", tone: "success" }),
          /* @__PURE__ */ jsx(KpiCard, { index: 2, icon: MessageCircle, label: "Mensagens enviadas", value: "42.8k", delta: "+12%", hint: "taxa de entrega 98.6%", tone: "primary" }),
          /* @__PURE__ */ jsx(KpiCard, { index: 3, icon: TrendingUp, label: "Taxa de retorno", value: "38.4%", delta: "+9%", hint: "campanhas ativas", tone: "warning" })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 xl:grid-cols-3 gap-5", children: [
          /* @__PURE__ */ jsx("div", { className: "xl:col-span-2", children: /* @__PURE__ */ jsx(RevenueChart, {}) }),
          /* @__PURE__ */ jsx(ActivityFeed, {})
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsx(KpiCard, { index: 0, icon: DollarSign, label: "Faturamento recuperado", value: "R$ 54.7k", delta: "+38%", hint: "semana atual", tone: "success" }),
          /* @__PURE__ */ jsx(KpiCard, { index: 1, icon: Megaphone, label: "Campanhas ativas", value: "14", delta: "+3", hint: "3 em fila", tone: "primary" }),
          /* @__PURE__ */ jsx(KpiCard, { index: 2, icon: Smartphone, label: "WhatsApps conectados", value: "3 / 3", delta: "100%", hint: "estabilidade 99.8%", tone: "success" }),
          /* @__PURE__ */ jsx(KpiCard, { index: 3, icon: Bot, label: "IA respondendo", value: "2.786", delta: "+41%", hint: "contatos atendidos", tone: "warning" })
        ] }),
        /* @__PURE__ */ jsx(Campaigns, {}),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-2 gap-5", children: [
          /* @__PURE__ */ jsx(AgentsPanel, {}),
          /* @__PURE__ */ jsx(WhatsappPanel, {})
        ] }),
        /* @__PURE__ */ jsxs("footer", { className: "pt-4 pb-2 text-center text-[11px] text-muted-foreground", children: [
          "Nexus",
          /* @__PURE__ */ jsx("span", { className: "text-primary font-semibold", children: "Deli" }),
          " · o sistema operacional do delivery · clientes voltando em piloto automático"
        ] })
      ] })
    ] })
  ] });
}
export {
  Dashboard as component
};
