import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Bot, Zap, Smartphone } from "lucide-react";

const events = [
  { icon: CheckCircle2, color: "text-success", text: "Campanha “Sexta da pizza” converteu", meta: "Cliente Pedro R. · R$ 84,50", time: "agora" },
  { icon: Bot, color: "text-primary", text: "Sofia respondeu 12 contatos", meta: "Recuperação · últimos 5 min", time: "1 min" },
  { icon: MessageCircle, color: "text-success", text: "32 mensagens entregues", meta: "Reativação 30 dias", time: "2 min" },
  { icon: Zap, color: "text-warning", text: "Automação “Carrinho abandonado” disparou", meta: "8 clientes notificados", time: "4 min" },
  { icon: Smartphone, color: "text-success", text: "Loja Zona Sul reconectou", meta: "WhatsApp online", time: "6 min" },
  { icon: CheckCircle2, color: "text-success", text: "Cliente reativado após 47 dias", meta: "Maria F. · pediu de novo", time: "8 min" },
];

export function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Tempo real</div>
          <div className="mt-0.5 text-lg font-semibold">Operação acontecendo</div>
        </div>
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-primary pulse-dot text-primary" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary shadow-glow" />
        </span>
      </div>

      <div className="space-y-3.5">
        {events.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3"
          >
            <div className={`mt-0.5 h-7 w-7 rounded-lg bg-background/60 border border-border grid place-items-center ${e.color}`}>
              <e.icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-tight">{e.text}</div>
              <div className="text-[11px] text-muted-foreground">{e.meta}</div>
            </div>
            <div className="text-[10px] text-muted-foreground whitespace-nowrap">{e.time}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
