import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const agents = [
  { name: "Sofia", role: "Recuperação", msgs: 1284, conv: "32%", color: "from-primary to-warning" },
  { name: "Léo", role: "Atendimento", msgs: 962, conv: "41%", color: "from-success to-primary" },
  { name: "Júlia", role: "Pós-venda", msgs: 540, conv: "27%", color: "from-warning to-primary" },
];

export function AgentsPanel() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Funcionários digitais</div>
          <div className="mt-0.5 text-lg font-semibold">Agentes IA trabalhando</div>
        </div>
        <Bot className="h-5 w-5 text-primary" />
      </div>

      <div className="space-y-3">
        {agents.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 hover:bg-accent/50 transition-colors"
          >
            <div className="relative">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${a.color} grid place-items-center font-bold text-sm`}>
                {a.name[0]}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-background shadow-success-glow" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{a.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-success/15 text-success font-medium">online</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{a.role} · respondendo agora</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{a.msgs.toLocaleString("pt-BR")}</div>
              <div className="text-[10px] text-muted-foreground">msgs · conv {a.conv}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
