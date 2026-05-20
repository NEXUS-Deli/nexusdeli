import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { d: "Seg", recuperado: 4200, organico: 1800 },
  { d: "Ter", recuperado: 5100, organico: 2100 },
  { d: "Qua", recuperado: 4800, organico: 1900 },
  { d: "Qui", recuperado: 7200, organico: 2400 },
  { d: "Sex", recuperado: 9400, organico: 3100 },
  { d: "Sáb", recuperado: 12800, organico: 4200 },
  { d: "Dom", recuperado: 11200, organico: 3800 },
];

export function RevenueChart() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Faturamento recuperado</div>
          <div className="mt-1 text-2xl font-bold tracking-tight">R$ 54.720</div>
          <div className="text-xs text-success font-medium">+38% vs. semana anterior</div>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1 text-xs">
          {["7D", "30D", "90D"].map((t, i) => (
            <button
              key={t}
              className={`px-2.5 py-1 rounded-md ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.234 27.5)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="oklch(0.62 0.234 27.5)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gOrg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.76 0.18 152)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.76 0.18 152)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
            <XAxis dataKey="d" stroke="oklch(0.65 0 0)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.65 0 0)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.16 0 0)",
                border: "1px solid oklch(0.28 0 0)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "oklch(0.97 0 0)", fontWeight: 600 }}
              formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`}
            />
            <Area type="monotone" dataKey="organico" stroke="oklch(0.76 0.18 152)" strokeWidth={2} fill="url(#gOrg)" />
            <Area type="monotone" dataKey="recuperado" stroke="oklch(0.62 0.234 27.5)" strokeWidth={2.5} fill="url(#gRec)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex gap-5 text-xs">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary shadow-glow" /> Recuperado</div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" /> Orgânico</div>
      </div>
    </div>
  );
}
