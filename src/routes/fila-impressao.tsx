import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import {
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Trash2,
  Eye,
  RotateCcw,
  FileText,
  PrinterCheck,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";
import { markPrintJobAsPrinted, markPrintJobAsPrinting, markPrintJobError } from "@/lib/orders";
import { formatDateTimeBR } from "@/lib/date";

export const Route = createFileRoute("/fila-impressao")({
  component: PrintQueuePage,
});

type PrintJobRow = {
  id: string;
  order_id: string | null;
  printer_sector: string;
  status: string;
  copies: number;
  receipt_text: string | null;
  receipt_html: string | null;
  receipt_data: any;
  retry_count: number;
  error_message: string | null;
  created_at: string;
  printing_started_at: string | null;
  printed_at: string | null;
  orders?: { order_number: number } | null;
};

function PrintQueuePage() {
  const [jobs, setJobs] = useState<PrintJobRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [previewJob, setPreviewJob] = useState<PrintJobRow | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const companyId = await getCompanyId();

      const query = supabase
        .from("print_jobs")
        .select("*, orders(order_number)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (filterStatus !== "all") {
        query.eq("status", filterStatus);
      }

      const { data, error } = await query;
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
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  const handlePrint = async (job: PrintJobRow) => {
    try {
      await markPrintJobAsPrinting(job.id);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "imprimindo" } : j))
      );

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
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "impresso", printed_at: new Date().toISOString() } : j))
      );
      toast.success("Impressao concluida");
    } catch (err) {
      toast.error("Erro ao imprimir");
    }
  };

  const handleReprint = async (job: PrintJobRow) => {
    try {
      const companyId = await getCompanyId();
      const { data: newJob } = await supabase
        .from("print_jobs")
        .insert({
          company_id: companyId,
          order_id: job.order_id,
          printer_sector: job.printer_sector,
          copies: job.copies,
          receipt_text: job.receipt_text,
          receipt_html: job.receipt_html,
          receipt_data: job.receipt_data,
        })
        .select("*, orders(order_number)")
        .single();

      if (newJob) {
        setJobs((prev) => [newJob as any, ...prev]);
      }
      toast.success("Job de reimpressao criado");
    } catch (err) {
      toast.error("Erro ao reimprimir");
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("print_jobs")
        .update({ status: "cancelado" })
        .eq("id", jobId);
      if (error) throw error;
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Job cancelado");
    } catch {
      toast.error("Erro ao cancelar");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pendente":
        return { icon: Clock, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" };
      case "imprimindo":
        return { icon: Loader2, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
      case "impresso":
        return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", border: "border-success/20" };
      case "erro":
        return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" };
      default:
        return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border" };
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Fila de Impressao</h1>
              <p className="text-sm text-muted-foreground">Gerencie os jobs de impressao termica</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {jobs.filter((j) => j.status === "pendente").length} pendentes
              </span>
              <button
                onClick={() => { setIsLoading(true); loadJobs(); }}
                className="h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start">
            {[
              { value: "all", label: "Todos" },
              { value: "pendente", label: "Pendentes" },
              { value: "imprimindo", label: "Imprimindo" },
              { value: "impresso", label: "Impressos" },
              { value: "erro", label: "Erro" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterStatus === tab.value
                    ? "bg-accent text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Jobs */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Printer className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum job de impressao</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const style = getStatusStyle(job.status);
                const StatusIcon = style.icon;
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card flex items-center gap-4"
                  >
                    <div className={`h-10 w-10 rounded-xl ${style.bg} ${style.color} grid place-items-center border ${style.border}`}>
                      <StatusIcon className={`h-5 w-5 ${job.status === "imprimindo" ? "animate-spin" : ""}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          Pedido #{job.orders?.order_number || "---"}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${style.color} ${style.bg} ${style.border}`}>
                          {job.printer_sector}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTimeBR(job.created_at)}
                        {job.retry_count > 0 && ` · Tentativas: ${job.retry_count}`}
                      </div>
                      {job.status === "erro" && job.error_message && (
                        <div className="text-xs text-destructive mt-1">{job.error_message}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {job.status === "pendente" && (
                        <button
                          onClick={() => handlePrint(job)}
                          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Printer className="h-3.5 w-3.5" /> Imprimir
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewJob(job)}
                        className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer"
                        title="Visualizar"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleReprint(job)}
                        className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer"
                        title="Reimprimir"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      {job.status !== "impresso" && (
                        <button
                          onClick={() => handleCancel(job.id)}
                          className="h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer"
                          title="Cancelar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Preview Modal */}
      {previewJob && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recibo - Pedido #{previewJob.orders?.order_number || "---"}
                </h2>
                <button
                  onClick={() => setPreviewJob(null)}
                  className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <pre className="bg-background border border-border rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {previewJob.receipt_text || "Nenhum recibo disponivel"}
              </pre>
              <div className="mt-4 flex justify-end gap-2">
                {previewJob.status === "pendente" && (
                  <button
                    onClick={() => {
                      handlePrint(previewJob);
                      setPreviewJob(null);
                    }}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" /> Imprimir
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
