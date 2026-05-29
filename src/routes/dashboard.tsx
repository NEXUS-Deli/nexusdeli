import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { TrendingUp, Users, MessageCircle, Repeat, Megaphone, Bot, Smartphone, DollarSign, Flame } from "lucide-react";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import { KpiCard } from "@/components/nexus/KpiCard";
import { RevenueChart } from "@/components/nexus/RevenueChart";
import { Campaigns } from "@/components/nexus/Campaigns";
import { AgentsPanel } from "@/components/nexus/AgentsPanel";
import { WhatsappPanel } from "@/components/nexus/WhatsappPanel";
import { ActivityFeed } from "@/components/nexus/ActivityFeed";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Nexus Deli — O sistema operacional do delivery" },
      { name: "description", content: "Recuperação automática de clientes, campanhas no WhatsApp e IA para delivery. O fim do delivery parado." },
    ],
  }),
});

function Dashboard() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Hero strip */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-6 lg:p-7 shadow-card"
          >
            <div className="grid-bg absolute inset-0 opacity-40" />
            <div className="bg-glow absolute inset-0" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
                  <Flame className="h-3 w-3" /> Operação girando
                </div>
                <h1 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight text-balance">
                  Seu delivery está <span className="text-primary">vendendo agora</span>.
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
                  Clientes voltando automaticamente · WhatsApp trabalhando · IA respondendo · campanhas convertendo em tempo real.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Hoje</div>
                  <div className="text-2xl font-bold">R$ 8.420</div>
                  <div className="text-[11px] text-success font-medium">+24% vs. ontem</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Recuperados</div>
                  <div className="text-2xl font-bold">187</div>
                  <div className="text-[11px] text-success font-medium">clientes hoje</div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard index={0} icon={Repeat} label="Pedidos recuperados" value="1.284" delta="+18%" hint="últimos 7 dias" tone="primary" />
            <KpiCard index={1} icon={Users} label="Clientes reativados" value="612" delta="+24%" hint="que não voltavam há 30d+" tone="success" />
            <KpiCard index={2} icon={MessageCircle} label="Mensagens enviadas" value="42.8k" delta="+12%" hint="taxa de entrega 98.6%" tone="primary" />
            <KpiCard index={3} icon={TrendingUp} label="Taxa de retorno" value="38.4%" delta="+9%" hint="campanhas ativas" tone="warning" />
          </section>

          {/* Chart + Activity */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2"><RevenueChart /></div>
            <ActivityFeed />
          </section>

          {/* Secondary KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard index={0} icon={DollarSign} label="Faturamento recuperado" value="R$ 54.7k" delta="+38%" hint="semana atual" tone="success" />
            <KpiCard index={1} icon={Megaphone} label="Campanhas ativas" value="14" delta="+3" hint="3 em fila" tone="primary" />
            <KpiCard index={2} icon={Smartphone} label="WhatsApps conectados" value="3 / 3" delta="100%" hint="estabilidade 99.8%" tone="success" />
            <KpiCard index={3} icon={Bot} label="IA respondendo" value="2.786" delta="+41%" hint="contatos atendidos" tone="warning" />
          </section>

          {/* Campaigns */}
          <Campaigns />

          {/* Agents + Whatsapp */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AgentsPanel />
            <WhatsappPanel />
          </section>

          <footer className="pt-4 pb-2 text-center text-[11px] text-muted-foreground">
            Nexus<span className="text-primary font-semibold">Deli</span> · o sistema operacional do delivery · clientes voltando em piloto automático
          </footer>
        </main>
      </div>
    </div>
  );
}
