import { LayoutDashboard, Megaphone, Bot, MessageCircle, Users, Zap, Settings, Flame, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";

const nav = [
  { icon: LayoutDashboard, label: "Operação", to: "/" },
  { icon: Megaphone, label: "Campanhas", to: "/campanhas" },
  { icon: Percent, label: "Promoções", to: "/promocoes" },
  { icon: Bot, label: "Agentes IA", to: "/agentes-ia" },
  { icon: MessageCircle, label: "WhatsApp", to: "/whatsapp" },
  { icon: Users, label: "Clientes", to: "/clientes" },
  { icon: Zap, label: "Automações", to: "/automacoes" },
];

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (to: string) => {
    if (to === "/") return currentPath === "/";
    return currentPath.startsWith(to);
  };

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-surface/60 backdrop-blur-xl sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="relative h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
          <Flame className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-bold tracking-tight text-[15px]">Nexus<span className="text-primary">Deli</span></div>
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">central operacional</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Operação</div>
        {nav.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className="block w-full"
            >
              <motion.button
                whileHover={{ x: 2 }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-primary/12 text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary shadow-glow" />
                )}
                <item.icon className={`h-[18px] w-[18px] ${active ? "text-primary" : ""}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 rounded-xl border border-border bg-gradient-surface p-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-success pulse-dot text-success" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success shadow-success-glow" />
          </span>
          <span className="text-muted-foreground">Operação active</span>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground/80">
          3 instâncias WhatsApp · 2 agentes IA online
        </div>
        <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-2 text-xs font-medium hover:bg-accent cursor-pointer">
          <Settings className="h-3.5 w-3.5" /> Configurações
        </button>
      </div>
    </aside>
  );
}
