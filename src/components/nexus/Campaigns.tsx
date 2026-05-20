import { motion } from "framer-motion";
import { Play, Pause, MoreHorizontal } from "lucide-react";

const campaigns = [
  { name: "Reativação 30 dias", status: "rodando", sent: 2840, opened: 2210, converted: 412, revenue: "R$ 18.420" },
  { name: "Sexta da pizza", status: "rodando", sent: 1620, opened: 1380, converted: 287, revenue: "R$ 9.870" },
  { name: "Combo família — Domingo", status: "fila", sent: 0, opened: 0, converted: 0, revenue: "R$ 0" },
  { name: "Clientes inativos 60d", status: "rodando", sent: 4120, opened: 2980, converted: 521, revenue: "R$ 22.110" },
  { name: "Aniversariantes", status: "pausada", sent: 180, opened: 142, converted: 38, revenue: "R$ 1.420" },
];

const statusStyle: Record<string, string> = {
  rodando: "bg-success/15 text-success border-success/30",
  fila: "bg-warning/15 text-warning border-warning/30",
  pausada: "bg-muted text-muted-foreground border-border",
};

export function Campaigns() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Máquina de recorrência</div>
          <div className="mt-0.5 text-lg font-semibold">Campanhas rodando</div>
        </div>
        <button className="text-xs text-primary font-semibold hover:underline">ver todas →</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-medium px-5 py-3">Campanha</th>
              <th className="text-left font-medium py-3">Status</th>
              <th className="text-right font-medium py-3">Enviadas</th>
              <th className="text-right font-medium py-3">Abertas</th>
              <th className="text-right font-medium py-3">Converteu</th>
              <th className="text-right font-medium py-3 pr-5">Faturado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <motion.tr
                key={c.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-t border-border hover:bg-accent/40"
              >
                <td className="px-5 py-3.5">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">WhatsApp · IA Sofia</div>
                </td>
                <td>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyle[c.status]}`}>
                    {c.status === "rodando" && (
                      <span className="relative inline-flex h-1.5 w-1.5">
                        <span className="absolute inset-0 rounded-full bg-success pulse-dot text-success" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
                      </span>
                    )}
                    {c.status}
                  </span>
                </td>
                <td className="text-right text-muted-foreground">{c.sent.toLocaleString("pt-BR")}</td>
                <td className="text-right text-muted-foreground">{c.opened.toLocaleString("pt-BR")}</td>
                <td className="text-right font-semibold">{c.converted}</td>
                <td className="text-right pr-5 font-semibold text-success">{c.revenue}</td>
                <td className="pr-3">
                  <div className="flex items-center justify-end gap-1">
                    <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-accent">
                      {c.status === "pausada" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                    </button>
                    <button className="h-7 w-7 grid place-items-center rounded-md hover:bg-accent">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
