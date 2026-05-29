import { S as reactExports, J as jsxRuntimeExports } from "./server-3KlhyZH_.js";
import { d as Sidebar, T as Topbar, c as ShoppingBag } from "./Topbar-CQk6A6ur.js";
import { d as createLucideIcon, g as getCompanyId, s as supabase, S as Search, a as LoaderCircle, h as motion, u as updateOrderStatus, t as toast } from "./router-CgDrIRmR.js";
import { C as CircleAlert } from "./circle-alert-VkLE-lHM.js";
import { D as DollarSign } from "./dollar-sign-B-X6l9Uf.js";
import { R as RefreshCw } from "./refresh-cw-dWZSTNiQ.js";
import { C as CircleX } from "./circle-x-ZaRgNPvC.js";
import { C as CircleCheck } from "./circle-check-DmOIzhw8.js";
import { C as Clock } from "./clock-DsYOe0wR.js";
import { A as ArrowRight } from "./arrow-right-BPJBg54d.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./log-out-BDyVC8AH.js";
const __iconNode$1 = [
  ["circle", { cx: "18.5", cy: "17.5", r: "3.5", key: "15x4ox" }],
  ["circle", { cx: "5.5", cy: "17.5", r: "3.5", key: "1noe27" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["path", { d: "M12 17.5V14l-3-3 4-3 2 3h2", key: "1npguv" }]
];
const Bike = createLucideIcon("bike", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z",
      key: "1qvrer"
    }
  ],
  ["path", { d: "M6 17h12", key: "1jwigz" }]
];
const ChefHat = createLucideIcon("chef-hat", __iconNode);
const STATUS_FLOW = {
  aguardando_whatsapp: {
    label: "Aguardando WhatsApp",
    icon: Clock,
    color: "text-warning",
    next: "confirmado"
  },
  confirmado: {
    label: "Confirmado",
    icon: CircleCheck,
    color: "text-primary",
    next: "preparo"
  },
  preparo: {
    label: "Em Preparo",
    icon: ChefHat,
    color: "text-warning",
    next: "saiu_entrega"
  },
  saiu_entrega: {
    label: "Saiu para Entrega",
    icon: Bike,
    color: "text-primary",
    next: "entregue"
  },
  entregue: {
    label: "Entregue",
    icon: CircleCheck,
    color: "text-success",
    next: null
  },
  cancelado: {
    label: "Cancelado",
    icon: CircleX,
    color: "text-destructive",
    next: null
  }
};
function OrdersPage() {
  const [orders, setOrders] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [selectedOrder, setSelectedOrder] = reactExports.useState(null);
  reactExports.useRef(null);
  const lastOrderCount = reactExports.useRef(0);
  const loadOrders = reactExports.useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      const {
        data,
        error
      } = await supabase.from("orders").select("*, customers(name, phone), order_items(*, order_item_addons(*))").eq("company_id", companyId).order("created_at", {
        ascending: false
      }).limit(50);
      if (error) throw error;
      if (data) {
        if (lastOrderCount.current > 0 && data.length > lastOrderCount.current) {
          playNotification();
        }
        lastOrderCount.current = data.length;
        setOrders(data);
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const playNotification = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = "sine";
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
    }
  };
  reactExports.useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 1e4);
    return () => clearInterval(interval);
  }, [loadOrders]);
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => o.id === orderId ? {
        ...o,
        status: newStatus
      } : o));
      toast.success(`Pedido atualizado para ${STATUS_FLOW[newStatus]?.label}`);
    } catch (err) {
      toast.error("Erro ao atualizar status");
    }
  };
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const customerName = o.customers?.name?.toLowerCase() || "";
      const customerPhone = o.customers?.phone || "";
      return customerName.includes(term) || customerPhone.includes(term) || `#${o.order_number}`.includes(term);
    }
    return true;
  });
  const statusOrder = ["aguardando_whatsapp", "confirmado", "preparo", "saiu_entrega", "entregue"];
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aIdx = statusOrder.indexOf(a.status);
    const bIdx = statusOrder.indexOf(b.status);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "aguardando_whatsapp").length,
    preparing: orders.filter((o) => o.status === "preparo").length,
    delivered: orders.filter((o) => o.status === "entregue").length,
    revenue: orders.filter((o) => o.status === "entregue").reduce((sum, o) => sum + o.total, 0)
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Topbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Pedidos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gerencie os pedidos em tempo real" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Total Hoje" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold", children: stats.total })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Pendentes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-warning" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold text-warning", children: stats.pending })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Em Preparo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChefHat, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold", children: stats.preparing })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Faturamento" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-success" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-2xl font-bold", children: [
                "R$ ",
                stats.revenue.toFixed(2)
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 border-b border-border gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 p-0.5 rounded-xl bg-background/50 border border-border flex-wrap", children: [{
              value: "all",
              label: "Todos"
            }, {
              value: "aguardando_whatsapp",
              label: "Pendentes"
            }, {
              value: "confirmado",
              label: "Confirmados"
            }, {
              value: "preparo",
              label: "Preparo"
            }, {
              value: "saiu_entrega",
              label: "Entrega"
            }, {
              value: "entregue",
              label: "Entregues"
            }].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatusFilter(tab.value), className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${statusFilter === tab.value ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: tab.label }, tab.value)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Buscar pedido...", className: "flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground w-40" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                setIsLoading(true);
                loadOrders();
              }, className: "h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : sortedOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Nenhum pedido encontrado" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-4", children: "Pedido" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Cliente" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Itens" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium py-4", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-4", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-4 pr-5", children: "Acoes" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: sortedOrders.map((order) => {
              const statusInfo = STATUS_FLOW[order.status] || STATUS_FLOW.aguardando_whatsapp;
              const StatusIcon = statusInfo.icon;
              const items = order.order_items || [];
              const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
              const timeAgo = getTimeAgo(order.created_at);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.tr, { initial: {
                opacity: 0
              }, animate: {
                opacity: 1
              }, className: "hover:bg-accent/20 transition-colors cursor-pointer", onClick: () => setSelectedOrder(order), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-primary", children: [
                    "#",
                    order.order_number
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: timeAgo })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: order.customers?.name || "---" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground font-mono", children: order.customers?.phone || "" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground", children: [
                    itemsCount,
                    " itens"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground truncate max-w-[150px]", children: items.map((i) => i.product_name).join(", ") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.color} bg-${statusInfo.color}/10 border-current/20`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "h-3 w-3" }),
                  statusInfo.label
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-right font-bold", children: [
                  "R$ ",
                  order.total.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                  statusInfo.next && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleStatusChange(order.id, statusInfo.next);
                  }, className: "h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent text-foreground hover:text-primary cursor-pointer", title: `Avancar para ${STATUS_FLOW[statusInfo.next]?.label}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) }),
                  order.status !== "cancelado" && order.status !== "entregue" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleStatusChange(order.id, "cancelado");
                  }, className: "h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer", title: "Cancelar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }) })
                ] }) })
              ] }, order.id);
            }) })
          ] }) })
        ] })
      ] })
    ] }),
    selectedOrder && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, className: "w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold", children: [
          "Pedido #",
          selectedOrder.order_number
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedOrder(null), className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mt-1", children: selectedOrder.customers?.name || "---" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-mono", children: selectedOrder.customers?.phone })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 mt-1", children: (() => {
            const si = STATUS_FLOW[selectedOrder.status] || STATUS_FLOW.aguardando_whatsapp;
            const Icon = si.icon;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${si.color} bg-${si.color}/10 border-current/20`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
              si.label
            ] });
          })() })
        ] })
      ] }),
      selectedOrder.delivery_address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-xl border border-border p-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Endereco" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: selectedOrder.delivery_address })
      ] }),
      selectedOrder.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-xl border border-border p-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Observacoes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: selectedOrder.notes })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-xl border border-border overflow-hidden mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Itens" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/60", children: (selectedOrder.order_items || []).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
                item.quantity,
                "x ",
                item.product_name
              ] }),
              item.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground italic", children: [
                "Obs: ",
                item.notes
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold", children: [
              "R$ ",
              item.total_price.toFixed(2)
            ] })
          ] }),
          item.order_item_addons && item.order_item_addons.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] text-muted-foreground pl-4", children: item.order_item_addons.map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "+ ",
            a.addon_name,
            a.quantity > 1 ? ` (${a.quantity}x)` : ""
          ] }, i)) })
        ] }, item.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background rounded-xl border border-border p-3 space-y-1 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "R$ ",
            selectedOrder.subtotal.toFixed(2)
          ] })
        ] }),
        selectedOrder.delivery_fee > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Taxa de entrega" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "R$ ",
            selectedOrder.delivery_fee.toFixed(2)
          ] })
        ] }),
        selectedOrder.discount_total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Desconto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "-R$ ",
            selectedOrder.discount_total.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-lg font-bold pt-1 border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "R$ ",
            selectedOrder.total.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pagamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getPaymentLabel(selectedOrder.payment_method) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        STATUS_FLOW[selectedOrder.status]?.next && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          handleStatusChange(selectedOrder.id, STATUS_FLOW[selectedOrder.status].next);
          setSelectedOrder(null);
        }, className: "flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer", children: [
          "Avancar para ",
          STATUS_FLOW[STATUS_FLOW[selectedOrder.status].next].label
        ] }),
        selectedOrder.status !== "cancelado" && selectedOrder.status !== "entregue" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          handleStatusChange(selectedOrder.id, "cancelado");
          setSelectedOrder(null);
        }, className: "rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer", children: "Cancelar" })
      ] })
    ] }) }) })
  ] });
}
function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
function getPaymentLabel(method) {
  const map = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_credito: "Cartao Credito",
    cartao_debito: "Cartao Debito",
    vale_refeicao: "Vale Refeicao"
  };
  return map[method] || method;
}
export {
  OrdersPage as component
};
