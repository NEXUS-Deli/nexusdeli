import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { S as Sidebar, T as Topbar } from "./Topbar-jXAYa-6f.js";
import { ShoppingBag, AlertCircle, ChefHat, DollarSign, Search, RefreshCw, Loader2, XCircle, CheckCircle2, Bike, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { g as getCompanyId, s as supabase, u as updateOrderStatus } from "./router-BotcCoyH.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "zod";
const STATUS_FLOW = {
  aguardando_whatsapp: {
    label: "Aguardando WhatsApp",
    icon: Clock,
    color: "text-warning",
    next: "confirmado"
  },
  confirmado: {
    label: "Confirmado",
    icon: CheckCircle2,
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
    icon: CheckCircle2,
    color: "text-success",
    next: null
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-destructive",
    next: null
  }
};
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  useRef(null);
  const lastOrderCount = useRef(0);
  const loadOrders = useCallback(async () => {
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
  useEffect(() => {
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(Sidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsx(Topbar, {}),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Pedidos" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Gerencie os pedidos em tempo real" })
        ] }) }),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Total Hoje" }),
                /* @__PURE__ */ jsx(ShoppingBag, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 text-2xl font-bold", children: stats.total })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Pendentes" }),
                /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-warning" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 text-2xl font-bold text-warning", children: stats.pending })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Em Preparo" }),
                /* @__PURE__ */ jsx(ChefHat, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 text-2xl font-bold", children: stats.preparing })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Faturamento" }),
                /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4 text-success" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 text-2xl font-bold", children: [
                "R$ ",
                stats.revenue.toFixed(2)
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 border-b border-border gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 p-0.5 rounded-xl bg-background/50 border border-border flex-wrap", children: [{
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
            }].map((tab) => /* @__PURE__ */ jsx("button", { onClick: () => setStatusFilter(tab.value), className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${statusFilter === tab.value ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: tab.label }, tab.value)) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Buscar pedido...", className: "flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground w-40" })
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: () => {
                setIsLoading(true);
                loadOrders();
              }, className: "h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : sortedOrders.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(ShoppingBag, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
            /* @__PURE__ */ jsx("p", { children: "Nenhum pedido encontrado" })
          ] }) : /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left font-medium px-5 py-4", children: "Pedido" }),
              /* @__PURE__ */ jsx("th", { className: "text-left font-medium py-4", children: "Cliente" }),
              /* @__PURE__ */ jsx("th", { className: "text-left font-medium py-4", children: "Itens" }),
              /* @__PURE__ */ jsx("th", { className: "text-center font-medium py-4", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "text-right font-medium py-4", children: "Total" }),
              /* @__PURE__ */ jsx("th", { className: "text-right font-medium py-4 pr-5", children: "Acoes" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/60", children: sortedOrders.map((order) => {
              const statusInfo = STATUS_FLOW[order.status] || STATUS_FLOW.aguardando_whatsapp;
              const StatusIcon = statusInfo.icon;
              const items = order.order_items || [];
              const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
              const timeAgo = getTimeAgo(order.created_at);
              return /* @__PURE__ */ jsxs(motion.tr, { initial: {
                opacity: 0
              }, animate: {
                opacity: 1
              }, className: "hover:bg-accent/20 transition-colors cursor-pointer", onClick: () => setSelectedOrder(order), children: [
                /* @__PURE__ */ jsxs("td", { className: "px-5 py-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "font-bold text-primary", children: [
                    "#",
                    order.order_number
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: timeAgo })
                ] }),
                /* @__PURE__ */ jsxs("td", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold", children: order.customers?.name || "---" }),
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground font-mono", children: order.customers?.phone || "" })
                ] }),
                /* @__PURE__ */ jsxs("td", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-foreground", children: [
                    itemsCount,
                    " itens"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground truncate max-w-[150px]", children: items.map((i) => i.product_name).join(", ") })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "text-center", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.color} bg-${statusInfo.color}/10 border-current/20`, children: [
                  /* @__PURE__ */ jsx(StatusIcon, { className: "h-3 w-3" }),
                  statusInfo.label
                ] }) }),
                /* @__PURE__ */ jsxs("td", { className: "text-right font-bold", children: [
                  "R$ ",
                  order.total.toFixed(2)
                ] }),
                /* @__PURE__ */ jsx("td", { className: "pr-5 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1", children: [
                  statusInfo.next && /* @__PURE__ */ jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleStatusChange(order.id, statusInfo.next);
                  }, className: "h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent text-foreground hover:text-primary cursor-pointer", title: `Avancar para ${STATUS_FLOW[statusInfo.next]?.label}`, children: /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }) }),
                  order.status !== "cancelado" && order.status !== "entregue" && /* @__PURE__ */ jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    handleStatusChange(order.id, "cancelado");
                  }, className: "h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer", title: "Cancelar", children: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }) })
                ] }) })
              ] }, order.id);
            }) })
          ] }) })
        ] })
      ] })
    ] }),
    selectedOrder && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, className: "w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold", children: [
          "Pedido #",
          selectedOrder.order_number
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setSelectedOrder(null), className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-background rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Cliente" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold mt-1", children: selectedOrder.customers?.name || "---" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-mono", children: selectedOrder.customers?.phone })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-background rounded-xl border border-border p-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Status" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mt-1", children: (() => {
            const si = STATUS_FLOW[selectedOrder.status] || STATUS_FLOW.aguardando_whatsapp;
            const Icon = si.icon;
            return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${si.color} bg-${si.color}/10 border-current/20`, children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
              si.label
            ] });
          })() })
        ] })
      ] }),
      selectedOrder.delivery_address && /* @__PURE__ */ jsxs("div", { className: "bg-background rounded-xl border border-border p-3 mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Endereco" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", children: selectedOrder.delivery_address })
      ] }),
      selectedOrder.notes && /* @__PURE__ */ jsxs("div", { className: "bg-background rounded-xl border border-border p-3 mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Observacoes" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", children: selectedOrder.notes })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-background rounded-xl border border-border overflow-hidden mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "px-3 py-2 border-b border-border", children: /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Itens" }) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-border/60", children: (selectedOrder.order_items || []).map((item) => /* @__PURE__ */ jsxs("div", { className: "px-3 py-2.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium", children: [
                item.quantity,
                "x ",
                item.product_name
              ] }),
              item.notes && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground italic", children: [
                "Obs: ",
                item.notes
              ] })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold", children: [
              "R$ ",
              item.total_price.toFixed(2)
            ] })
          ] }),
          item.order_item_addons && item.order_item_addons.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 text-[11px] text-muted-foreground pl-4", children: item.order_item_addons.map((a, i) => /* @__PURE__ */ jsxs("span", { children: [
            "+ ",
            a.addon_name,
            a.quantity > 1 ? ` (${a.quantity}x)` : ""
          ] }, i)) })
        ] }, item.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-background rounded-xl border border-border p-3 space-y-1 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "R$ ",
            selectedOrder.subtotal.toFixed(2)
          ] })
        ] }),
        selectedOrder.delivery_fee > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Taxa de entrega" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "R$ ",
            selectedOrder.delivery_fee.toFixed(2)
          ] })
        ] }),
        selectedOrder.discount_total > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm text-destructive", children: [
          /* @__PURE__ */ jsx("span", { children: "Desconto" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "-R$ ",
            selectedOrder.discount_total.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-lg font-bold pt-1 border-t border-border", children: [
          /* @__PURE__ */ jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "R$ ",
            selectedOrder.total.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "Pagamento" }),
          /* @__PURE__ */ jsx("span", { children: getPaymentLabel(selectedOrder.payment_method) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        STATUS_FLOW[selectedOrder.status]?.next && /* @__PURE__ */ jsxs("button", { onClick: () => {
          handleStatusChange(selectedOrder.id, STATUS_FLOW[selectedOrder.status].next);
          setSelectedOrder(null);
        }, className: "flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer", children: [
          "Avancar para ",
          STATUS_FLOW[STATUS_FLOW[selectedOrder.status].next].label
        ] }),
        selectedOrder.status !== "cancelado" && selectedOrder.status !== "entregue" && /* @__PURE__ */ jsx("button", { onClick: () => {
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
