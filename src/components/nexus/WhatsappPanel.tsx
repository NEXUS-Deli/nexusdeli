import { Smartphone, Wifi, QrCode } from "lucide-react";

const instances = [
  { name: "Loja Centro", number: "+55 11 99821-4400", status: "online", queue: 12 },
  { name: "Loja Zona Sul", number: "+55 11 99432-8821", status: "online", queue: 4 },
  { name: "Delivery Hub", number: "+55 11 98821-1102", status: "offline", queue: 0 },
];

export function WhatsappPanel() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">WhatsApp turbo</div>
          <div className="mt-0.5 text-lg font-semibold">Instâncias conectadas</div>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1.5 text-xs font-medium text-success hover:bg-success/15">
          <QrCode className="h-3.5 w-3.5" /> Novo QR
        </button>
      </div>

      <div className="space-y-2.5">
        {instances.map((i) => {
          const online = i.status === "online";
          return (
            <div key={i.name} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3">
              <div className={`h-10 w-10 rounded-xl grid place-items-center ${online ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{i.name}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${online ? "text-success" : "text-destructive"}`}>
                    <Wifi className="h-3 w-3" /> {i.status}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">{i.number}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{i.queue}</div>
                <div className="text-[10px] text-muted-foreground">na fila</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
