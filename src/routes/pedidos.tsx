import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Bike,
  Search,
  RefreshCw,
  MessageCircle,
  Printer,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";
import { updateOrderStatus } from "@/lib/orders";
import { formatDateTimeBR } from "@/lib/date";

export const Route = createFileRoute("/pedidos")({
  component: OrdersPage,
});

type OrderRow = {
  id: string;
  order_number: number;
  status: string;
  customer_id: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_total: number;
  total: number;
  payment_method: string;
  payment_status: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  preparing_at: string | null;
  delivered_at: string | null;
  customers?: { name: string; phone: string } | null;
  order_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes: string | null;
    order_item_addons?: Array<{
      addon_name: string;
      quantity: number;
      price: number;
    }>;
  }>;
};

const STATUS_FLOW: Record<string, { label: string; icon: any; color: string; next: string | null }> = {
  aguardando_whatsapp: {
    label: "Aguardando WhatsApp",
    icon: Clock,
    color: "text-warning",
    next: "confirmado",
  },
  confirmado: {
    label: "Confirmado",
    icon: CheckCircle2,
    color: "text-primary",
    next: "preparo",
  },
  preparo: {
    label: "Em Preparo",
    icon: ChefHat,
    color: "text-warning",
    next: "saiu_entrega",
  },
  saiu_entrega: {
    label: "Saiu para Entrega",
    icon: Bike,
    color: "text-primary",
    next: "entregue",
  },
  entregue: {
    label: "Entregue",
    icon: CheckCircle2,
    color: "text-success",
    next: null,
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    color: "text-destructive",
    next: null,
  },
};

function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastOrderCount = useRef(0);

  const loadOrders = useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(name, phone), order_items(*, order_item_addons(*))")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        if (lastOrderCount.current > 0 && data.length > lastOrderCount.current) {
          playNotification();
        }
        lastOrderCount.current = data.length;
        setOrders(data as any);
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
    } catch {}
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
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
      return (
        customerName.includes(term) ||
        customerPhone.includes(term) ||
        `#${o.order_number}`.includes(term)
      );
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
    revenue: orders.filter((o) => o.status === "entregue").reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie os pedidos em tempo real
              </p>
            </div>
          </div>

          {/* Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Total Hoje</span>
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Pendentes</span>
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
                <div className="mt-3 text-2xl font-bold text-warning">{stats.pending}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Em Preparo</span>
                  <ChefHat className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 text-2xl font-bold">{stats.preparing}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Faturamento</span>
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <div className="mt-3 text-2xl font-bold">R$ {stats.revenue.toFixed(2)}</div>
              </div>
            </div>
          </section>

          {/* Status Tabs + Search */}
          <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 border-b border-border gap-4">
              <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-background/50 border border-border flex-wrap">
                {[
                  { value: "all", label: "Todos" },
                  { value: "aguardando_whatsapp", label: "Pendentes" },
                  { value: "confirmado", label: "Confirmados" },
                  { value: "preparo", label: "Preparo" },
                  { value: "saiu_entrega", label: "Entrega" },
                  { value: "entregue", label: "Entregues" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      statusFilter === tab.value
                        ? "bg-accent text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar pedido..."
                    className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground w-40"
                  />
                </div>
                <button
                  onClick={() => { setIsLoading(true); loadOrders(); }}
                  className="h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedOrders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum pedido encontrado</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="text-left font-medium px-5 py-4">Pedido</th>
                      <th className="text-left font-medium py-4">Cliente</th>
                      <th className="text-left font-medium py-4">Itens</th>
                      <th className="text-center font-medium py-4">Status</th>
                      <th className="text-right font-medium py-4">Total</th>
                      <th className="text-right font-medium py-4 pr-5">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {sortedOrders.map((order) => {
                      const statusInfo = STATUS_FLOW[order.status] || STATUS_FLOW.aguardando_whatsapp;
                      const StatusIcon = statusInfo.icon;
                      const items = order.order_items || [];
                      const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-accent/20 transition-colors cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="px-5 py-4">
                            <div className="font-bold text-primary">#{order.order_number}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{formatDateTimeBR(order.created_at)}</div>
                          </td>
                          <td>
                            <div className="font-semibold">{order.customers?.name || "---"}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{order.customers?.phone || ""}</div>
                          </td>
                          <td>
                            <div className="text-xs text-foreground">{itemsCount} itens</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              {items.map((i) => i.product_name).join(", ")}
                            </div>
                          </td>
                          <td className="text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.color} bg-${statusInfo.color}/10 border-current/20`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="text-right font-bold">R$ {order.total.toFixed(2)}</td>
                          <td className="pr-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {statusInfo.next && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(order.id, statusInfo.next!);
                                  }}
                                  className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent text-foreground hover:text-primary cursor-pointer"
                                  title={`Avancar para ${STATUS_FLOW[statusInfo.next!]?.label}`}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              )}
                              {order.status !== "cancelado" && order.status !== "entregue" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(order.id, "cancelado");
                                  }}
                                  className="h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer"
                                  title="Cancelar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Pedido #{selectedOrder.order_number}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-background rounded-xl border border-border p-3">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Cliente</span>
                  <p className="font-semibold mt-1">{selectedOrder.customers?.name || "---"}</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedOrder.customers?.phone}</p>
                </div>
                <div className="bg-background rounded-xl border border-border p-3">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const si = STATUS_FLOW[selectedOrder.status] || STATUS_FLOW.aguardando_whatsapp;
                      const Icon = si.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${si.color} bg-${si.color}/10 border-current/20`}>
                          <Icon className="h-3.5 w-3.5" />
                          {si.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {selectedOrder.delivery_address && (
                <div className="bg-background rounded-xl border border-border p-3 mb-4">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Endereco</span>
                  <p className="text-sm mt-1">{selectedOrder.delivery_address}</p>
                </div>
              )}

              {selectedOrder.notes && (
                <div className="bg-background rounded-xl border border-border p-3 mb-4">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Observacoes</span>
                  <p className="text-sm mt-1">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Items */}
              <div className="bg-background rounded-xl border border-border overflow-hidden mb-4">
                <div className="px-3 py-2 border-b border-border">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Itens</span>
                </div>
                <div className="divide-y divide-border/60">
                  {(selectedOrder.order_items || []).map((item) => (
                    <div key={item.id} className="px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">
                            {item.quantity}x {item.product_name}
                          </span>
                          {item.notes && (
                            <p className="text-[11px] text-muted-foreground italic">Obs: {item.notes}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold">R$ {item.total_price.toFixed(2)}</span>
                      </div>
                      {item.order_item_addons && item.order_item_addons.length > 0 && (
                        <div className="mt-1 text-[11px] text-muted-foreground pl-4">
                          {item.order_item_addons.map((a, i) => (
                            <span key={i}>
                              + {a.addon_name}{a.quantity > 1 ? ` (${a.quantity}x)` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-background rounded-xl border border-border p-3 space-y-1 mb-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.delivery_fee > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxa de entrega</span>
                    <span>R$ {selectedOrder.delivery_fee.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.discount_total > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Desconto</span>
                    <span>-R$ {selectedOrder.discount_total.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-1 border-t border-border">
                  <span>Total</span>
                  <span>R$ {selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pagamento</span>
                  <span>{getPaymentLabel(selectedOrder.payment_method)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {STATUS_FLOW[selectedOrder.status]?.next && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, STATUS_FLOW[selectedOrder.status].next!);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Avancar para {STATUS_FLOW[STATUS_FLOW[selectedOrder.status].next!].label}
                  </button>
                )}
                {selectedOrder.status !== "cancelado" && selectedOrder.status !== "entregue" && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedOrder.id, "cancelado");
                      setSelectedOrder(null);
                    }}
                    className="rounded-xl border border-destructive/30 px-4 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function getPaymentLabel(method: string): string {
  const map: Record<string, string> = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_credito: "Cartao Credito",
    cartao_debito: "Cartao Debito",
    vale_refeicao: "Vale Refeicao",
  };
  return map[method] || method;
}
