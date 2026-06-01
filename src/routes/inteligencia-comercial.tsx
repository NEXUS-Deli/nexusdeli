import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import { toast } from "sonner";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Eye,
  DollarSign,
  Filter,
  RefreshCw,
  BarChart3,
  AlertCircle,
  Code,
  ArrowRight,
  TrendingDown,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/inteligencia-comercial")({
  component: InteligenciaComercialPage,
  head: () => ({
    meta: [
      { title: "Inteligência Comercial — NexusDeli" },
      { name: "description", content: "Funil de vendas, analytics e auditoria de CAPI em tempo real." },
    ],
  }),
});

interface FunnelData {
  pageViews: number;
  viewContents: number;
  addToCarts: number;
  initiateCheckouts: number;
  purchases: number;
  totalRevenue: number;
}

interface CapiLog {
  id: string;
  provider: string;
  event_name: string;
  event_id: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

function InteligenciaComercialPage() {
  const { activeCompanyId, profile } = useAuth();
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d">("7d");
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<FunnelData>({
    pageViews: 0,
    viewContents: 0,
    addToCarts: 0,
    initiateCheckouts: 0,
    purchases: 0,
    totalRevenue: 0,
  });
  const [capiLogs, setCapiLogs] = useState<CapiLog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const isSuperAdmin = !!profile?.is_super_admin;

  const loadAnalytics = async () => {
    if (!activeCompanyId) return;
    setLoading(true);
    try {
      // Compute date limit
      const dateLimit = new Date();
      if (timeRange === "today") {
        dateLimit.setHours(0, 0, 0, 0);
      } else if (timeRange === "7d") {
        dateLimit.setDate(dateLimit.getDate() - 7);
      } else if (timeRange === "30d") {
        dateLimit.setDate(dateLimit.getDate() - 30);
      }

      // 1. Fetch tracking events
      const { data: events, error: eventsErr } = await supabase
        .from("tracking_events")
        .select("event_name, session_id, value, created_at")
        .eq("company_id", activeCompanyId)
        .gte("created_at", dateLimit.toISOString());

      if (eventsErr) throw eventsErr;

      // Group and count unique sessions per event
      const sessionsPerEvent: Record<string, Set<string>> = {
        PageView: new Set(),
        ViewContent: new Set(),
        AddToCart: new Set(),
        InitiateCheckout: new Set(),
        Purchase: new Set(),
      };

      let revenue = 0;

      events?.forEach((evt) => {
        const name = evt.event_name;
        if (sessionsPerEvent[name]) {
          sessionsPerEvent[name].add(evt.session_id);
        }
        if (name === "Purchase" && evt.value) {
          revenue += Number(evt.value);
        }
      });

      setFunnel({
        pageViews: sessionsPerEvent.PageView.size,
        viewContents: sessionsPerEvent.ViewContent.size,
        addToCarts: sessionsPerEvent.AddToCart.size,
        initiateCheckouts: sessionsPerEvent.InitiateCheckout.size,
        purchases: sessionsPerEvent.Purchase.size,
        totalRevenue: revenue,
      });

      // 2. Fetch CAPI logs
      const { data: logs, error: logsErr } = await supabase
        .from("tracking_event_logs")
        .select("id, provider, event_name, event_id, status, error_message, created_at")
        .eq("company_id", activeCompanyId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (logsErr) throw logsErr;
      setCapiLogs(logs || []);

    } catch (err: any) {
      console.error("Error loading intelligence dashboard:", err);
      toast.error("Erro ao carregar dados de Inteligência Comercial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [activeCompanyId, timeRange, refreshKey]);

  // Funnel calculations
  const viewContentRate = funnel.pageViews > 0 ? (funnel.viewContents / funnel.pageViews) * 100 : 0;
  const addToCartRate = funnel.viewContents > 0 ? (funnel.addToCarts / funnel.viewContents) * 100 : 0;
  const checkoutRate = funnel.addToCarts > 0 ? (funnel.initiateCheckouts / funnel.addToCarts) * 100 : 0;
  const purchaseRate = funnel.initiateCheckouts > 0 ? (funnel.purchases / funnel.initiateCheckouts) * 100 : 0;
  const globalConversionRate = funnel.pageViews > 0 ? (funnel.purchases / funnel.pageViews) * 100 : 0;
  const cartAbandonmentRate = funnel.addToCarts > 0 ? ((funnel.addToCarts - funnel.purchases) / funnel.addToCarts) * 100 : 0;
  const averageOrderValue = funnel.purchases > 0 ? funnel.totalRevenue / funnel.purchases : 0;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
                <BarChart3 className="h-3 w-3" /> Inteligência de Negócio
              </div>
              <h1 className="text-2xl font-bold tracking-tight mt-1.5">Inteligência Comercial</h1>
              <p className="text-sm text-muted-foreground">
                Monitore o funil de vendas do cardápio e audite os disparos do Meta Pixel / Conversions API.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-border bg-surface/50 p-1">
                {(["today", "7d", "30d"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      timeRange === range
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    {range === "today" ? "Hoje" : range === "7d" ? "7 Dias" : "30 Dias"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="h-9 w-9 border border-border bg-surface/50 hover:bg-accent grid place-items-center rounded-xl transition-colors cursor-pointer"
                title="Atualizar dados"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm text-muted-foreground">Carregando métricas e dados do funil...</span>
            </div>
          ) : (
            <>
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold mt-2">{funnel.pageViews.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Acessos Cardápio</div>
                </div>

                <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start">
                    <TrendingUp className="h-5 w-5 text-success" />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${globalConversionRate > 2 ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                      {globalConversionRate.toFixed(1)}% Conv
                    </span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{funnel.purchases.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Pedidos Finalizados</div>
                </div>

                <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start">
                    <TrendingDown className={`h-5 w-5 ${cartAbandonmentRate > 60 ? 'text-destructive' : 'text-warning'}`} />
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${cartAbandonmentRate > 60 ? 'bg-destructive/15 text-destructive' : 'bg-success/15 text-success'}`}>
                      {cartAbandonmentRate.toFixed(0)}% Taxa
                    </span>
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {funnel.addToCarts > 0 ? (funnel.addToCarts - funnel.purchases).toLocaleString() : 0}
                  </div>
                  <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Abandonos de Carrinho</div>
                </div>

                <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start">
                    <DollarSign className="h-5 w-5 text-success" />
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Tkt Méd: R$ {averageOrderValue.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    R$ {funnel.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Faturamento Analytics</div>
                </div>
              </div>

              {/* Sales Funnel Display */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold">Funil de Vendas do Cardápio</h2>
                    <span className="text-[11px] text-muted-foreground">Conversões por etapa (Sessões Únicas)</span>
                  </div>

                  <div className="space-y-4">
                    {/* PageView */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-muted-foreground" /> 1. Visitantes (PageView)</span>
                        <span>{funnel.pageViews} sessões (100%)</span>
                      </div>
                      <div className="h-3 w-full bg-border/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500" style={{ width: "100%" }} />
                      </div>
                    </div>

                    {/* ViewContent */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" /> 2. Visualizaram Produto (ViewContent)</span>
                        <span className="text-muted-foreground">{funnel.viewContents} sessões ({viewContentRate.toFixed(1)}%)</span>
                      </div>
                      <div className="h-3 w-full bg-border/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary/80 to-primary/60 rounded-full transition-all duration-500" style={{ width: `${viewContentRate}%` }} />
                      </div>
                    </div>

                    {/* AddToCart */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><ShoppingBag className="h-3.5 w-3.5 text-primary" /> 3. Adicionaram ao Carrinho (AddToCart)</span>
                        <span className="text-muted-foreground">{funnel.addToCarts} sessões ({addToCartRate.toFixed(1)}% do anterior)</span>
                      </div>
                      <div className="h-3 w-full bg-border/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary/60 to-warning rounded-full transition-all duration-500" style={{ width: `${(funnel.pageViews > 0 ? (funnel.addToCarts / funnel.pageViews) * 100 : 0)}%` }} />
                      </div>
                    </div>

                    {/* InitiateCheckout */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-warning" /> 4. Iniciaram Finalização (InitiateCheckout)</span>
                        <span className="text-muted-foreground">{funnel.initiateCheckouts} sessões ({checkoutRate.toFixed(1)}% do anterior)</span>
                      </div>
                      <div className="h-3 w-full bg-border/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-warning to-success/80 rounded-full transition-all duration-500" style={{ width: `${(funnel.pageViews > 0 ? (funnel.initiateCheckouts / funnel.pageViews) * 100 : 0)}%` }} />
                      </div>
                    </div>

                    {/* Purchase */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-success" /> 5. Compra Realizada (Purchase)</span>
                        <span className="text-success font-bold">{funnel.purchases} sessões ({purchaseRate.toFixed(1)}% do anterior)</span>
                      </div>
                      <div className="h-3 w-full bg-border/40 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-success/80 to-success rounded-full transition-all duration-500" style={{ width: `${globalConversionRate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro Metrics Sidebar */}
                <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                  <h3 className="text-sm font-bold">Diagnóstico do Funil</h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Conversão Geral</span>
                      <span className="font-bold text-success">{globalConversionRate.toFixed(2)}%</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Abandono de Carrinho</span>
                      <span className={`font-bold ${cartAbandonmentRate > 70 ? 'text-destructive' : 'text-warning'}`}>{cartAbandonmentRate.toFixed(1)}%</span>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Média Faturamento por Sessão</span>
                      <span className="font-bold text-foreground">
                        R$ {funnel.pageViews > 0 ? (funnel.totalRevenue / funnel.pageViews).toFixed(2) : "0.00"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">Taxa de Checkout</span>
                      <span className="font-bold text-foreground">{checkoutRate.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 mt-4">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
                        <p className="font-semibold text-foreground text-xs">Dica de Conversão:</p>
                        {cartAbandonmentRate > 65 ? (
                          <p>Sua taxa de abandono está acima de 65%. Considere criar uma automação de <strong>Carrinho Abandonado</strong> via WhatsApp para recuperar estes contatos.</p>
                        ) : (
                          <p>O funil está saudável! Acompanhe o ROI das suas campanhas de tráfego pago associando o Meta Pixel no Super Admin.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta CAPI logs */}
              <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-1.5">
                      <Code className="h-4 w-4 text-primary" /> Logs de Envio de CAPI (Meta)
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Monitore e audite o envio do evento de `Purchase` via API de Conversão.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
                    Servidor ativo
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                        <th className="pb-2.5">Data / Hora</th>
                        <th className="pb-2.5">Provedor</th>
                        <th className="pb-2.5">Evento</th>
                        <th className="pb-2.5">Event ID</th>
                        <th className="pb-2.5 text-center">Status</th>
                        <th className="pb-2.5 text-right">Mensagem / Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {capiLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-accent/20 transition-colors">
                          <td className="py-2.5 text-muted-foreground font-mono">
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </td>
                          <td className="py-2.5 font-semibold text-foreground uppercase tracking-wider text-[10px]">
                            {log.provider}
                          </td>
                          <td className="py-2.5 text-foreground font-medium">
                            {log.event_name}
                          </td>
                          <td className="py-2.5 text-muted-foreground font-mono text-[10px]">
                            {log.event_id}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              log.status === "sucesso"
                                ? "bg-success/15 border-success/30 text-success"
                                : "bg-destructive/15 border-destructive/30 text-destructive"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-medium max-w-xs truncate text-muted-foreground" title={log.error_message || "Enviado com sucesso"}>
                            {log.error_message || "Sem erros"}
                          </td>
                        </tr>
                      ))}
                      {capiLogs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground italic">
                            Nenhum log de envio CAPI registrado para este período.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
