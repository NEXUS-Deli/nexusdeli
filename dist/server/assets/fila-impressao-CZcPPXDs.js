import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { S as Sidebar, T as Topbar } from "./Topbar-jXAYa-6f.js";
import { RefreshCw, Loader2, Printer, Eye, RotateCcw, Trash2, FileText, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { g as getCompanyId, s as supabase, a as markPrintJobAsPrinting, b as markPrintJobError, m as markPrintJobAsPrinted } from "./router-BotcCoyH.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "zod";
function PrintQueuePage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [previewJob, setPreviewJob] = useState(null);
  const loadJobs = useCallback(async () => {
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
  useEffect(() => {
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
          icon: Loader2,
          color: "text-primary",
          bg: "bg-primary/10",
          border: "border-primary/20"
        };
      case "impresso":
        return {
          icon: CheckCircle2,
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success/20"
        };
      case "erro":
        return {
          icon: AlertCircle,
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(Sidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsx(Topbar, {}),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Fila de Impressao" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Gerencie os jobs de impressao termica" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              jobs.filter((j) => j.status === "pendente").length,
              " pendentes"
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => {
              setIsLoading(true);
              loadJobs();
            }, className: "h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start", children: [{
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
        }].map((tab) => /* @__PURE__ */ jsx("button", { onClick: () => setFilterStatus(tab.value), className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${filterStatus === tab.value ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: tab.label }, tab.value)) }),
        isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : jobs.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-20 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Printer, { className: "h-12 w-12 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsx("p", { children: "Nenhum job de impressao" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: jobs.map((job) => {
          const style = getStatusStyle(job.status);
          const StatusIcon = style.icon;
          return /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0,
            y: 5
          }, animate: {
            opacity: 1,
            y: 0
          }, className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: `h-10 w-10 rounded-xl ${style.bg} ${style.color} grid place-items-center border ${style.border}`, children: /* @__PURE__ */ jsx(StatusIcon, { className: `h-5 w-5 ${job.status === "imprimindo" ? "animate-spin" : ""}` }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-sm", children: [
                  "Pedido #",
                  job.orders?.order_number || "---"
                ] }),
                /* @__PURE__ */ jsx("span", { className: `text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${style.color} ${style.bg} ${style.border}`, children: job.printer_sector })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
                new Date(job.created_at).toLocaleString("pt-BR"),
                job.retry_count > 0 && ` · Tentativas: ${job.retry_count}`
              ] }),
              job.status === "erro" && job.error_message && /* @__PURE__ */ jsx("div", { className: "text-xs text-destructive mt-1", children: job.error_message })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
              job.status === "pendente" && /* @__PURE__ */ jsxs("button", { onClick: () => handlePrint(job), className: "h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Printer, { className: "h-3.5 w-3.5" }),
                " Imprimir"
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: () => setPreviewJob(job), className: "h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer", title: "Visualizar", children: /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsx("button", { onClick: () => handleReprint(job), className: "h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer", title: "Reimprimir", children: /* @__PURE__ */ jsx(RotateCcw, { className: "h-3.5 w-3.5" }) }),
              job.status !== "impresso" && /* @__PURE__ */ jsx("button", { onClick: () => handleCancel(job.id), className: "h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer", title: "Cancelar", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }, job.id);
        }) })
      ] })
    ] }),
    previewJob && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, className: "w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-bold text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-primary" }),
          "Recibo - Pedido #",
          previewJob.orders?.order_number || "---"
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setPreviewJob(null), className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsx("pre", { className: "bg-background border border-border rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap", children: previewJob.receipt_text || "Nenhum recibo disponivel" }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-end gap-2", children: previewJob.status === "pendente" && /* @__PURE__ */ jsxs("button", { onClick: () => {
        handlePrint(previewJob);
        setPreviewJob(null);
      }, className: "rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4" }),
        " Imprimir"
      ] }) })
    ] }) }) })
  ] });
}
export {
  PrintQueuePage as component
};
