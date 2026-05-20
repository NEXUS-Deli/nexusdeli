import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
  hint: string;
  tone?: "primary" | "success" | "warning";
  index?: number;
}

const toneMap = {
  primary: "text-primary bg-primary/12 border-primary/25",
  success: "text-success bg-success/12 border-success/25",
  warning: "text-warning bg-warning/12 border-warning/25",
};

export function KpiCard({ icon: Icon, label, value, delta, hint, tone = "primary", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-5 shadow-card"
    >
      <div className="bg-glow absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div className={`h-10 w-10 grid place-items-center rounded-xl border ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
          <ArrowUpRight className="h-3 w-3" /> {delta}
        </div>
      </div>
      <div className="relative mt-5">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      </div>
    </motion.div>
  );
}
