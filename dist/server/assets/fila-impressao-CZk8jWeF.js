import { S as reactExports, J as jsxRuntimeExports } from "./server-3KlhyZH_.js";
import { d as Sidebar, T as Topbar, b as Printer } from "./Topbar-CQk6A6ur.js";
import { d as createLucideIcon, g as getCompanyId, s as supabase, a as LoaderCircle, h as motion, T as Trash2, e as markPrintJobAsPrinting, f as markPrintJobError, t as toast, m as markPrintJobAsPrinted } from "./router-CgDrIRmR.js";
import { R as RefreshCw } from "./refresh-cw-dWZSTNiQ.js";
import { F as FileText } from "./file-text-Tw8ONFk_.js";
import { C as Clock } from "./clock-DsYOe0wR.js";
import { C as CircleAlert } from "./circle-alert-VkLE-lHM.js";
import { C as CircleCheck } from "./circle-check-DmOIzhw8.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./log-out-BDyVC8AH.js";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode$1);
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode);
function PrintQueuePage() {
  const [jobs, setJobs] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  const [previewJob, setPreviewJob] = reactExports.useState(null);
  const loadJobs = reactExports.useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      const query = supabase.from("print_jobs").select("*, orders(order_number)").eq("company_id", companyId).order("created_at", {
        ascending: false
      }).limit(100);
      if (filterStatus !== "all") {
        query.eq("status", filterStatus);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Erro ao carregar fila de impressao:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);
  reactExports.useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5e3);
    return () => clearInterval(interval);
  }, [loadJobs]);
  const handlePrint = async (job) => {
    try {
      await markPrintJobAsPrinting(job.id);
      setJobs((prev) => prev.map((j) => j.id === job.id ? {
        ...j,
        status: "imprimindo"
      } : j));
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        await markPrintJobError(job.id, "Popup bloqueado");
        toast.error("Permita popups para impressao");
        return;
      }
      printWindow.document.write(job.receipt_html || "<pre>" + (job.receipt_text || "") + "</pre>");
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
      await markPrintJobAsPrinted(job.id);
      setJobs((prev) => prev.map((j) => j.id === job.id ? {
        ...j,
        status: "impresso",
        printed_at: (/* @__PURE__ */ new Date()).toISOString()
      } : j));
      toast.success("Impressao concluida");
    } catch (err) {
      toast.error("Erro ao imprimir");
    }
  };
  const handleReprint = async (job) => {
    try {
      const companyId = await getCompanyId();
      const {
        data: newJob
      } = await supabase.from("print_jobs").insert({
        company_id: companyId,
        order_id: job.order_id,
        printer_sector: job.printer_sector,
        copies: job.copies,
        receipt_text: job.receipt_text,
        receipt_html: job.receipt_html,
        receipt_data: job.receipt_data
      }).select("*, orders(order_number)").single();
      if (newJob) {
        setJobs((prev) => [newJob, ...prev]);
      }
      toast.success("Job de reimpressao criado");
    } catch (err) {
      toast.error("Erro ao reimprimir");
    }
  };
  const handleCancel = async (jobId) => {
    try {
      const {
        error
      } = await supabase.from("print_jobs").update({
        status: "cancelado"
      }).eq("id", jobId);
      if (error) throw error;
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Job cancelado");
    } catch {
      toast.error("Erro ao cancelar");
    }
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case "pendente":
        return {
          icon: Clock,
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning/20"
        };
      case "imprimindo":
        return {
          icon: LoaderCircle,
          color: "text-primary",
          bg: "bg-primary/10",
          border: "border-primary/20"
        };
      case "impresso":
        return {
          icon: CircleCheck,
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success/20"
        };
      case "erro":
        return {
          icon: CircleAlert,
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/20"
        };
      default:
        return {
          icon: Clock,
          color: "text-muted-foreground",
          bg: "bg-muted/10",
          border: "border-border"
        };
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Topbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Fila de Impressao" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gerencie os jobs de impressao termica" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              jobs.filter((j) => j.status === "pendente").length,
              " pendentes"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setIsLoading(true);
              loadJobs();
            }, className: "h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start", children: [{
          value: "all",
          label: "Todos"
        }, {
          value: "pendente",
          label: "Pendentes"
        }, {
          value: "imprimindo",
          label: "Imprimindo"
        }, {
          value: "impresso",
          label: "Impressos"
        }, {
          value: "erro",
          label: "Erro"
        }].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilterStatus(tab.value), className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${filterStatus === tab.value ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: tab.label }, tab.value)) }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : jobs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-20 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Nenhum job de impressao" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: jobs.map((job) => {
          const style = getStatusStyle(job.status);
          const StatusIcon = style.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 5
          }, animate: {
            opacity: 1,
            y: 0
          }, className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-10 w-10 rounded-xl ${style.bg} ${style.color} grid place-items-center border ${style.border}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: `h-5 w-5 ${job.status === "imprimindo" ? "animate-spin" : ""}` }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm", children: [
                  "Pedido #",
                  job.orders?.order_number || "---"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${style.color} ${style.bg} ${style.border}`, children: job.printer_sector })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                new Date(job.created_at).toLocaleString("pt-BR"),
                job.retry_count > 0 && ` · Tentativas: ${job.retry_count}`
              ] }),
              job.status === "erro" && job.error_message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-destructive mt-1", children: job.error_message })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
              job.status === "pendente" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handlePrint(job), className: "h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-3.5 w-3.5" }),
                " Imprimir"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPreviewJob(job), className: "h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer", title: "Visualizar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleReprint(job), className: "h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer", title: "Reimprimir", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" }) }),
              job.status !== "impresso" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleCancel(job.id), className: "h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer", title: "Cancelar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }, job.id);
        }) })
      ] })
    ] }),
    previewJob && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, className: "w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-bold text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-primary" }),
          "Recibo - Pedido #",
          previewJob.orders?.order_number || "---"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPreviewJob(null), className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "bg-background border border-border rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap", children: previewJob.receipt_text || "Nenhum recibo disponivel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 flex justify-end gap-2", children: previewJob.status === "pendente" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        handlePrint(previewJob);
        setPreviewJob(null);
      }, className: "rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }),
        " Imprimir"
      ] }) })
    ] }) }) })
  ] });
}
export {
  PrintQueuePage as component
};
