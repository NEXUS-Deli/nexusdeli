import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import {
  Megaphone,
  Plus,
  ArrowLeft,
  Smartphone,
  Send,
  Bot,
  Calendar,
  Sparkles,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  DollarSign,
  X,
  Loader2,
  ShieldAlert,
  Zap,
  Users,
} from "lucide-react";

import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";
import { triggerN8NWebhook } from "@/services/n8n";
import { formatDateTimeBR } from "@/lib/date";

const searchSchema = z.object({
  new: z.boolean().optional(),
});

export const Route = createFileRoute("/campanhas")({
  validateSearch: searchSchema,
  component: CampaignsPage,
});

interface CampaignRow {
  id: string;
  name: string;
  status: "rodando" | "pausada" | "agendada" | "finalizada";
  sent: number;
  opened: number;
  replied: number;
  revenue: number;
  date: string;
  segment: string;
  instance: string;
  agent: string;
  message: string;
  schedule_type: "imediato" | "agendado";
  schedule_date?: string;
  schedule_time?: string;
  schedule_time?: string;
  total_leads: number;
  sent_count: number;
  failed_count: number;
  pending_count: number;
  min_delay?: number;
  max_delay?: number;
  msg_delay?: number;
  media_url?: string;
  instance_token?: string;
  created_at?: string;
}

interface WhatsappInstanceRow {
  id: string;
  name: string;
  status: string;
  token: string;
}

function CampaignsPage() {
  const { new: isNewParam } = Route.useSearch();
  const navigate = useNavigate({ from: "/campanhas" });

  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [whatsappInstances, setWhatsappInstances] = useState<WhatsappInstanceRow[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingInstances, setIsLoadingInstances] = useState(true);
  const [isDbError, setIsDbError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Form States
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [instance, setInstance] = useState("");
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const agent = "Sofia";
  const [message, setMessage] = useState(
    "Olá, {nome_cliente}! 🍕\n\nFaz {dias_inativo} dias que você não pede seu prato favorito ({prato_favorito}) aqui na nossa loja.\n\nPara te dar uma força especial hoje, criamos um cupom especial de {desconto}% para você pedir de novo! Use: {cupom_desconto} no site ou peça direto por aqui!\n\nQue tal aproveitar?"
  );
  const [scheduleType, setScheduleType] = useState<"imediato" | "agendado">("imediato");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [minDelay, setMinDelay] = useState(15);
  const [maxDelay, setMaxDelay] = useState(30);
  const [msgDelay, setMsgDelay] = useState(5);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);

    // Cria preview local temporário para a tela do celular virtual
    const localUrl = URL.createObjectURL(file);
    setMediaPreview(localUrl);
  };

  const handleRemoveFile = () => {
    setMediaFile(null);
    setMediaPreview("");
  };

  const [activeTab, setActiveTab] = useState<"todas" | "rodando" | "agendadas" | "finalizadas">("todas");
  const hasActiveCampaignsRef = useRef(false);

  // ─── Carregar aparelhos de WhatsApp reais cadastrados no Supabase ───────────
  const loadWhatsappInstances = useCallback(async () => {
    setIsLoadingInstances(true);
    try {
      const companyId = await getCompanyId();
      const { data, error } = await supabase
        .from("whatsapp_instances")
        .select("id, name, status, token")
        .eq("company_id", companyId);

      if (error) throw error;

      setWhatsappInstances(data || []);
      // Seleciona o primeiro aparelho por padrão se houver
      if (data && data.length > 0) {
        setInstance(data[0].name);
      } else {
        setInstance("");
      }
    } catch (err) {
      console.error("Erro ao carregar conexões de WhatsApp:", err);
    } finally {
      setIsLoadingInstances(false);
    }
  }, []);

  // ─── Carregar campanhas do banco ───────────────────────────────────────────
  const loadCampaigns = useCallback(async (hideLoading = false) => {
    if (!hideLoading) setIsLoadingList(true);
    setIsDbError(false);
    try {
      const companyId = await getCompanyId();
      const { data, error } = await supabase
        .from("vw_campaigns_with_metrics")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Auto-update status para a UI dependendo dos contadores em tempo real
      const mappedData = (data || []).map((c: any) => {
        let currentStatus = c.status;
        if (c.total_leads > 0) {
          if (c.pending_count === 0) {
            currentStatus = "finalizada";
          } else if (c.pending_count > 0 && (c.sent_count > 0 || c.failed_count > 0)) {
            currentStatus = "rodando";
          }
        }
        return { ...c, status: currentStatus };
      });

      setCampaigns(mappedData);
    } catch (err: any) {
      console.error("Erro ao carregar campanhas:", err);
      if (err?.code === "42P01" || err?.message?.includes("relation")) {
        setIsDbError(true);
      } else {
        toast.error(`Erro ao conectar com o Supabase: ${err?.message || err}`);
      }
      setCampaigns([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // ─── Carregar pastas do CRM ────────────────────────────────────────────────
  const loadFolders = useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      const { data, error } = await supabase
        .from("folders")
        .select("id, name")
        .eq("company_id", companyId)
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      setFolders(data || []);
      if (data && data.length > 0) {
        setSegment(data[0].id);
      }
    } catch (err) {
      console.error("Erro ao carregar pastas:", err);
    }
  }, []);

  const [dbTemplates, setDbTemplates] = useState<{ id: string; name: string; body: string }[]>([]);
  const [dbCoupons, setDbCoupons] = useState<{ id: string; code: string; status: string }[]>([]);

  const loadTemplatesAndCoupons = useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      
      const [resTemplates, resCoupons] = await Promise.all([
        supabase.from("message_templates").select("id, name, body").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("coupons").select("id, code, status").eq("company_id", companyId).eq("status", "ativo").order("created_at", { ascending: false })
      ]);

      if (resTemplates.data) setDbTemplates(resTemplates.data);
      if (resCoupons.data) setDbCoupons(resCoupons.data);
    } catch (err) {
      console.error("Erro ao carregar templates e cupons:", err);
    }
  }, []);

  useEffect(() => {
    loadFolders();
    loadCampaigns();
    if (isNewParam) {
      loadWhatsappInstances();
      loadTemplatesAndCoupons();
    }
  }, [isNewParam, loadCampaigns, loadWhatsappInstances, loadFolders, loadTemplatesAndCoupons]);

  // Auto-Refresh (Live Sync a cada 15 segundos)
  useEffect(() => {
    hasActiveCampaignsRef.current = campaigns.some(c => c.status === "rodando" || c.status === "agendada");
  }, [campaigns]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (hasActiveCampaignsRef.current) {
        loadCampaigns(true);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [loadCampaigns]);

  // ─── Criar nova campanha ──────────────────────────────────────────────────
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor, dê um nome para a campanha.");
      return;
    }

    if (!instance) {
      toast.error("Por favor, selecione um aparelho de WhatsApp para disparo. Se não houver, crie um antes.");
      return;
    }

    try {
      setIsSubmitting(true);
      const companyId = await getCompanyId();
      const formattedDate = new Date().toLocaleDateString("pt-BR");

      let campaignDateText = "";
      if (scheduleType === "imediato") {
        campaignDateText = `Iniciada em ${formattedDate}`;
      } else {
        const [year, month, day] = scheduleDate.split("-");
        const formattedScheduleDate = `${day}/${month}/${year}`;
        campaignDateText = `Agendada para ${formattedScheduleDate} às ${scheduleTime}`;
      }

      const selectedInst = whatsappInstances.find((i) => i.name === instance);
      const instanceToken = selectedInst ? selectedInst.token : "";

      // Upload do arquivo físico de mídia para o Supabase Storage
      let uploadedMediaUrl = "";
      if (mediaFile) {
        const fileExt = mediaFile.name.split(".").pop();
        const fileName = `${companyId}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("campaigns")
          .upload(fileName, mediaFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          window.alert(`Erro de permissão no Storage: ${uploadError.message}\n\nPor favor, vá no painel do Supabase -> Storage e crie uma política de leitura/escrita pública (RLS Policy) para o bucket 'campaigns'. Sem isso, o envio da mídia falhará.`);
          setIsSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("campaigns")
          .getPublicUrl(fileName);

        uploadedMediaUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase.from("campaigns").insert([
        {
          name: name.trim(),
          status: scheduleType === "imediato" ? "rodando" : "agendada",
          sent: 0,
          opened: 0,
          replied: 0,
          revenue: 0.0,
          date: campaignDateText,
          segment,
          instance,
          instance_token: instanceToken,
          agent,
          message,
          schedule_type: scheduleType,
          schedule_date: scheduleType === "agendado" ? scheduleDate : null,
          schedule_time: scheduleType === "agendado" ? scheduleTime : null,
          company_id: companyId,
          min_delay: minDelay,
          max_delay: maxDelay,
          msg_delay: msgDelay,
          media_url: uploadedMediaUrl || null,
        },
      ]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        const campaignId = data[0].id;
        setCampaigns((prev) => [data[0] as CampaignRow, ...prev]);

        // ─── Gerar a Fila de Disparos (Campaign Queue) ──────────────────────────
        try {
          const { data: leads, error: leadsError } = await supabase
            .from("clients")
            .select("id, phone")
            .eq("folder_id", segment)
            .eq("company_id", companyId);

          if (leadsError) throw leadsError;

          if (leads && leads.length > 0) {
            const queuePayload = leads.map((lead) => ({
              campaign_id: campaignId,
              client_id: lead.id,
              phone: lead.phone,
              status: "pending",
              company_id: companyId,
              delivery_id: companyId
            }));

            const { error: queueError } = await supabase.from("campaign_queue").insert(queuePayload);
            if (queueError) throw queueError;
          } else {
            console.warn("Aviso: Nenhum lead encontrado para a pasta selecionada.");
          }
        } catch (qErr) {
          console.error("Erro ao gerar fila da campanha:", qErr);
          toast.warning("Campanha salva, mas houve instabilidade ao gerar a fila de envios.");
        }

        // Se for disparo imediato, aciona o webhook do n8n
        if (scheduleType === "imediato") {
          try {
            await triggerN8NWebhook({
              webhookKey: "immediate_disparador",
              payload: {
                campaignId: data[0].id,
                name: data[0].name,
                segment: data[0].segment,
                instance: data[0].instance,
                instanceToken: data[0].instance_token,
                agent: data[0].agent,
                message: data[0].message,
                company_id: companyId,
                delivery_id: companyId,
                created_at: data[0].created_at,
                min_delay: data[0].min_delay,
                max_delay: data[0].max_delay,
                msg_delay: data[0].msg_delay,
                media_url: data[0].media_url,
              }
            });
            console.log("Gatilho de disparo imediato enviado com sucesso!");
          } catch (webhookErr) {
            console.error("Erro ao chamar o webhook:", webhookErr);
            toast.warning("Campanha salva, mas não foi possível conectar com o motor de envio imediato.");
          }
        }
      }

      toast.success("Campanha criada com sucesso!", {
        description: scheduleType === "imediato" ? "Os disparos estão iniciando." : "A campanha foi agendada.",
      });

      // Reset Form
      setName("");
      setMinDelay(15);
      setMaxDelay(30);
      setMsgDelay(5);
      setMediaUrl("");
      setMediaFile(null);
      setMediaPreview("");
      navigate({ search: { new: undefined } });
    } catch (err: any) {
      console.error("Erro ao criar campanha:", err);
      toast.error("Falha ao salvar a campanha no banco de dados.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Alternar status da campanha (Pausar/Retomar) ──────────────────────────
  const toggleCampaignStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "rodando" ? "pausada" : "rodando";
    try {
      const companyId = await getCompanyId();
      const { error } = await supabase
        .from("campaigns")
        .update({ status: nextStatus })
        .eq("id", id)
        .eq("company_id", companyId);

      if (error) throw error;

      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
      );
      toast.info(`Campanha foi ${nextStatus === "pausada" ? "pausada" : "retomada"}.`);
    } catch (err) {
      console.error("Erro ao alterar status da campanha:", err);
      toast.error("Erro ao atualizar o status no banco de dados.");
    }
  };

  // ─── Deletar campanha ──────────────────────────────────────────────────────
  const deleteCampaign = async (id: string, name: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja deletar permanentemente a campanha "${name}"?`);
    if (!confirmed) return;

    try {
      const companyId = await getCompanyId();
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id)
        .eq("company_id", companyId);

      if (error) throw error;

      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Campanha "${name}" removida com sucesso.`);
    } catch (err) {
      console.error("Erro ao deletar campanha:", err);
      toast.error("Erro ao remover a campanha do banco de dados.");
    }
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "todas") return true;
    if (activeTab === "rodando") return c.status === "rodando" || c.status === "pausada";
    if (activeTab === "agendadas") return c.status === "agendada";
    if (activeTab === "finalizadas") return c.status === "finalizada";
    return true;
  });

  // Calculate dynamic stats
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sent_count + c.failed_count), 0);
  const totalSuccess = campaigns.reduce((acc, c) => acc + c.sent_count, 0);
  const totalFailure = campaigns.reduce((acc, c) => acc + c.failed_count, 0);
  const successRate = totalSent > 0 ? ((totalSuccess / totalSent) * 100).toFixed(1) : "0";
  const failureRate = totalSent > 0 ? ((totalFailure / totalSent) * 100).toFixed(1) : "0";

  // Parse template variables for preview
  const getParsedPreviewMessage = () => {
    let parsed = message;
    parsed = parsed.replace(/{nome_cliente}/g, "Mateus Silva");
    parsed = parsed.replace(/{prato_favorito}/g, "Pizza de Calabresa Especial");
    parsed = parsed.replace(/{dias_inativo}/g, "32");
    parsed = parsed.replace(/{desconto}/g, "15");
    parsed = parsed.replace(/{cupom_desconto}/g, "VOLTAPRO5");
    return parsed;
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Missing Table Warning */}
          {isDbError && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-bold text-destructive">Tabela no Supabase Ausente!</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    A tabela <code>campaigns</code> não foi encontrada no seu banco de dados.
                    Verifique se você executou a query SQL correta no seu editor de consultas.
                  </p>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isNewParam ? (
              // ================= MONITORING VIEW =================
              <motion.div
                key="monitor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Campanhas</h1>
                    <p className="text-sm text-muted-foreground">
                      Monitore seus disparos de reativação e impulsione o retorno dos clientes.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate({ search: { new: true } })}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Nova Campanha
                  </button>
                </div>

                {/* Campaign KPIs */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
                    <div className="grid-bg absolute inset-0 opacity-20" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                          Total de disparos
                        </span>
                        <Send className="h-4 w-4 text-primary" />
                      </div>
                      <div className="mt-3 text-2xl font-bold">{totalSent.toLocaleString("pt-BR")}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">Mensagens disparadas</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
                    <div className="grid-bg absolute inset-0 opacity-20" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                          Campanhas Ativas
                        </span>
                        <Megaphone className="h-4 w-4 text-warning" />
                      </div>
                      <div className="mt-3 text-2xl font-bold">
                        {campaigns.filter((c) => c.status === "rodando").length}
                      </div>
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {campaigns.filter((c) => c.status === "agendada").length} agendadas para envio
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
                    <div className="grid-bg absolute inset-0 opacity-20" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                          Taxa de Sucesso
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <div className="mt-3 text-2xl font-bold">{successRate}%</div>
                      <div className="mt-1 text-[10px] text-success font-medium">
                        {totalSuccess.toLocaleString("pt-BR")} entregues
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
                    <div className="grid-bg absolute inset-0 opacity-20" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                          Taxa de Falha
                        </span>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="mt-3 text-2xl font-bold">{failureRate}%</div>
                      <div className="mt-1 text-[10px] text-destructive font-medium">
                        {totalFailure.toLocaleString("pt-BR")} falhas no envio
                      </div>
                    </div>
                  </div>
                </section>

                {/* Tabs & Table */}
                <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
                  {/* Tab Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-border gap-3">
                    <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-background/50 border border-border self-start">
                      {(["todas", "rodando", "agendadas", "finalizadas"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${activeTab === tab
                              ? "bg-accent text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {tab === "todas"
                            ? "Todas"
                            : tab === "rodando"
                              ? "Em andamento"
                              : tab === "agendadas"
                                ? "Agendadas"
                                : "Finalizadas"}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
                      Exibindo {filteredCampaigns.length} de {campaigns.length} campanhas
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    {isDbError ? (
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4 border-2 border-dashed border-destructive/20 rounded-xl m-5 bg-destructive/5">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <div>
                          <h3 className="font-bold text-lg text-destructive mb-1">Atenção! Faltou rodar o Script SQL.</h3>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            O painel não encontrou a View de Métricas <code className="bg-background px-1 py-0.5 rounded text-xs text-foreground font-mono border border-border">vw_campaigns_with_metrics</code> no seu Supabase. Suas campanhas estão salvas, mas ocultas.
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-foreground bg-background px-3 py-2 rounded-lg border border-border">
                          Vá no painel do Supabase, copie o código do arquivo <span className="text-primary">setup_campaign_metrics.sql</span> e rode no SQL Editor para que as campanhas voltem a aparecer.
                        </p>
                      </div>
                    ) : isLoadingList ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm">Buscando campanhas...</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                            <th className="text-left font-medium px-5 py-4">Campanha</th>
                            <th className="text-left font-medium py-4">Status</th>
                            <th className="text-left font-medium py-4">Detalhes do Envio</th>
                            <th className="text-right font-medium py-4">Métricas</th>
                            <th className="text-right font-medium py-4 pr-5">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {filteredCampaigns.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                Nenhuma campanha encontrada nesta categoria.
                              </td>
                            </tr>
                          ) : (
                            filteredCampaigns.map((c, idx) => {
                              const percent = c.total_leads > 0 
                                ? Math.floor(((c.sent_count + c.failed_count) / c.total_leads) * 100) 
                                : 0;
                              
                              const isRodando = c.status === "rodando";
                              const isPausada = c.status === "pausada";
                              const isAgendada = c.status === "agendada";
                              const isFinalizada = c.status === "finalizada";

                              return (
                                <motion.tr
                                  key={c.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className="hover:bg-accent/20 transition-colors"
                                >
                                  <td className="px-5 py-4">
                                    <div className="font-semibold text-[14px]">{c.name}</div>
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1.5">
                                      <Users className="h-3 w-3" /> {folders.find(f => f.id === c.segment)?.name || c.segment}
                                      <span className="text-border/80">·</span>
                                      <Smartphone className="h-3 w-3" /> {c.instance}
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${isRodando
                                          ? "bg-success/12 border-success/30 text-success"
                                          : isPausada
                                            ? "bg-warning/12 border-warning/30 text-warning"
                                            : isAgendada
                                              ? "bg-primary/12 border-primary/30 text-primary"
                                              : "bg-muted/30 border-border text-muted-foreground"
                                        }`}
                                    >
                                      {isRodando && <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />}
                                      {isPausada && <span className="h-1.5 w-1.5 rounded-full bg-warning" />}
                                      {isAgendada && <Clock className="h-3 w-3" />}
                                      {isFinalizada && <CheckCircle2 className="h-3 w-3" />}
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="text-muted-foreground py-4">
                                    <div className="text-xs text-foreground font-medium">
                                      {c.created_at ? formatDateTimeBR(c.created_at) : c.date}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 max-w-[150px]">
                                      <div className="h-1.5 w-full bg-background border border-border rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${isFinalizada ? "bg-success" : "bg-primary"}`}
                                          style={{ width: `${percent}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-bold">{percent}%</span>
                                    </div>
                                  </td>
                                  <td className="text-right py-4">
                                    <div className="text-xs flex items-center justify-end gap-1.5">
                                      <span className="text-muted-foreground">Sucesso:</span>{" "}
                                      <strong className="font-semibold text-success">
                                        {c.sent_count?.toLocaleString("pt-BR") || 0}
                                      </strong>
                                    </div>
                                    <div className="text-xs mt-1 flex items-center justify-end gap-1.5">
                                      <span className="text-muted-foreground">Falha:</span>{" "}
                                      <strong className="font-semibold text-destructive">
                                        {c.failed_count?.toLocaleString("pt-BR") || 0}
                                      </strong>
                                    </div>
                                    {c.pending_count > 0 && (
                                      <div className="text-[10px] text-muted-foreground mt-1">
                                        Faltam: {c.pending_count}
                                      </div>
                                    )}

                                  </td>
                                  <td className="pr-5 py-4">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {(isRodando || isPausada) && (
                                        <button
                                          onClick={() => toggleCampaignStatus(c.id, c.status)}
                                          title={isRodando ? "Pausar Disparos" : "Retomar Disparos"}
                                          className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground hover:text-primary transition-colors cursor-pointer"
                                        >
                                          {isRodando ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                        </button>
                                      )}
                                      <button
                                        onClick={() => deleteCampaign(c.id, c.name)}
                                        title="Remover Campanha"
                                        className="h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              // ================= CREATION VIEW =================
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate({ search: { new: undefined } })}
                    className="h-9 w-9 grid place-items-center rounded-xl border border-border hover:bg-accent transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Nova Campanha</h1>
                    <p className="text-xs text-muted-foreground">
                      Configure seu público, mensagem e agende os disparos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form */}
                  <form onSubmit={handleCreateCampaign} className="lg:col-span-7 space-y-5">
                    {/* Settings */}
                    <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                      <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                        <Sparkles className="h-4 w-4" /> Configurações Básicas
                      </h2>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Nome da Campanha</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Sexta-feira Pizza em Dobro"
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Público Alvo (Pasta)</label>
                          <select
                            value={segment}
                            onChange={(e) => setSegment(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                          >
                            {folders.length === 0 ? (
                              <option value="" disabled>Nenhuma pasta encontrada</option>
                            ) : (
                              folders.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Aparelho de Envio</label>
                          {isLoadingInstances ? (
                            <div className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" /> Carregando...
                            </div>
                          ) : whatsappInstances.length === 0 ? (
                            <div className="w-full bg-background border border-destructive/30 text-destructive rounded-xl px-3 py-2 text-xs flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Nenhum aparelho disponível.
                            </div>
                          ) : (
                            <select
                              value={instance}
                              onChange={(e) => setInstance(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                            >
                              {whatsappInstances.map((inst) => (
                                <option key={inst.id} value={inst.name}>
                                  {inst.name} ({inst.status === "connected" ? "Online" : "Offline"})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="space-y-1.5"></div>
                      </div>

                      {whatsappInstances.length === 0 && !isLoadingInstances && (
                        <p className="text-[11px] text-destructive font-medium flex items-center gap-1 bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          Você precisa conectar pelo menos um aparelho de WhatsApp na tela anterior para poder disparar campanhas.
                        </p>
                      )}
                    </div>

                    {/* Delays & Media Configurations */}
                    <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                      <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                        <Zap className="h-4 w-4" /> Configurações de Disparo & Mídia
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Delay Mínimo (seg)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={minDelay}
                            onChange={(e) => setMinDelay(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Delay Máximo (seg)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={maxDelay}
                            onChange={(e) => setMaxDelay(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Delay entre Msg (seg)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={msgDelay}
                            onChange={(e) => setMsgDelay(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Mídia da Campanha (Foto ou Vídeo - Opcional)</label>
                        <div className="relative">
                          {mediaFile ? (
                            <div className="flex items-center justify-between border border-border bg-background rounded-xl p-3 text-sm">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-semibold text-primary truncate">{mediaFile.name}</span>
                                <span className="text-xs text-muted-foreground">({(mediaFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="h-6 w-6 grid place-items-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center border border-dashed border-border hover:border-primary/40 bg-background/50 rounded-xl p-5 text-center cursor-pointer relative transition-colors">
                              <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-foreground">Clique para selecionar foto ou vídeo</p>
                                <p className="text-[10px] text-muted-foreground">Tamanho máximo sugerido: 10MB</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                          <MessageSquare className="h-4 w-4" /> Mensagem Customizada
                        </h2>
                        <span className="text-[10px] font-bold text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-md border border-success/20">
                          <Sparkles className="h-3 w-3" /> IA Habilitada
                        </span>
                      </div>

                      <div className="space-y-2">
                        {dbTemplates.length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-accent/20 p-2.5 rounded-xl border border-border gap-2">
                            <label className="text-xs font-semibold text-foreground">Usar Modelo Salvo:</label>
                            <select 
                              className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary/60 transition-colors sm:w-2/3"
                              onChange={(e) => {
                                const t = dbTemplates.find(x => x.id === e.target.value);
                                if (t) setMessage(t.body);
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Selecione um modelo da página Promoções...</option>
                              {dbTemplates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <textarea
                          rows={7}
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Digite a mensagem..."
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/60 transition-colors font-sans resize-none"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-muted-foreground font-semibold py-1">
                            Inserir variável:
                          </span>
                          {(
                            ["nome_cliente", "prato_favorito", "dias_inativo", "desconto", "cupom_desconto"] as const
                          ).map((variable) => (
                            <button
                              key={variable}
                              type="button"
                              onClick={() => setMessage((prev) => prev + ` {${variable}}`)}
                              className="text-[9.5px] font-bold border border-border rounded bg-background/55 hover:bg-accent px-1.5 py-0.5 transition-colors cursor-pointer"
                            >
                              {`{${variable.replace("_", " ")}}`}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] text-muted-foreground font-semibold py-1">
                            Inserir Cupom Ativo:
                          </span>
                          {dbCoupons.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setMessage((prev) => prev + ` ${c.code}`)}
                              className="text-[9.5px] font-bold border border-primary/30 text-primary rounded bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 transition-colors cursor-pointer"
                            >
                              {c.code}
                            </button>
                          ))}
                          {dbCoupons.length === 0 && <span className="text-[9.5px] text-muted-foreground italic py-1">Nenhum cupom ativo na página Promoções</span>}
                        </div>
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                      <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                        <Calendar className="h-4 w-4" /> Envio e Agendamento
                      </h2>

                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="schedule"
                            checked={scheduleType === "imediato"}
                            onChange={() => setScheduleType("imediato")}
                            className="accent-primary"
                          />
                          Disparar Imediatamente
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="schedule"
                            checked={scheduleType === "agendado"}
                            onChange={() => setScheduleType("agendado")}
                            className="accent-primary"
                          />
                          Agendar Disparo
                        </label>
                      </div>

                      {scheduleType === "agendado" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="grid grid-cols-2 gap-4 pt-1"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Data
                            </label>
                            <input
                              type="date"
                              required={scheduleType === "agendado"}
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Horário
                            </label>
                            <input
                              type="time"
                              required={scheduleType === "agendado"}
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => navigate({ search: { new: undefined } })}
                        className="rounded-xl border border-border bg-background hover:bg-accent px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={whatsappInstances.length === 0 || isSubmitting}
                        className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Lançando...</span>
                          </>
                        ) : (
                          <>{scheduleType === "imediato" ? "Lançar Campanha 🚀" : "Confirmar Agendamento 📅"}</>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Right Column: Live Smartphone Preview */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="w-full max-w-[370px] sticky top-24">
                      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-3">
                        Live Preview (WhatsApp)
                      </div>

                      {/* Outer Phone Mockup */}
                      <div className="relative mx-auto h-[680px] w-[340px] rounded-[42px] border-[9px] border-[#222222] bg-[#000000] shadow-glow overflow-hidden">
                        {/* Phone Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-40 bg-[#222222] rounded-b-2xl z-20 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-background/20 mr-1.5" />
                          <div className="h-1.5 w-10 rounded-full bg-background/30" />
                        </div>

                        {/* Phone Screen */}
                        <div className="absolute inset-0 bg-[#0b141a] pt-8 flex flex-col z-10">
                          {/* Chat Header */}
                          <div className="bg-[#121b22] px-4 py-2.5 flex items-center gap-3 border-b border-[#222c32] shadow-sm">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-warning grid place-items-center text-[12px] font-bold text-white select-none">
                              MS
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate leading-tight">Mateus Silva</div>
                              <div className="text-[10px] text-success leading-none mt-0.5 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 bg-success rounded-full pulse-dot" /> online
                              </div>
                            </div>
                            <Bot className="h-5 w-5 text-primary" />
                          </div>

                          {/* Chat Area */}
                          <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col justify-end">
                            {/* Message Date */}
                            <div className="mx-auto bg-[#182229] border border-[#222c32] rounded-md px-2.5 py-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider select-none">
                              Hoje
                            </div>

                             {/* Message Bubble */}
                            <div className="bg-[#005c4b] border border-[#006e5a]/30 text-white rounded-lg rounded-tr-none px-3.5 py-2.5 text-[12.5px] leading-relaxed max-w-[85%] self-end shadow-sm relative break-words whitespace-pre-wrap">
                              {mediaPreview && (
                                <div className="w-full rounded-md overflow-hidden mb-2 border border-[#006e5a]/10 max-h-[200px] flex items-center justify-center bg-black/20">
                                  {mediaFile?.type.startsWith("video/") ? (
                                    <video src={mediaPreview} controls className="w-full h-auto object-contain max-h-[200px]" />
                                  ) : (
                                    <img src={mediaPreview} alt="Preview" className="w-full h-auto object-contain max-h-[200px]" />
                                  )}
                                </div>
                              )}
                              {getParsedPreviewMessage()}
                              <div className="text-right text-[9.5px] text-[#8696a0] mt-1.5 flex items-center justify-end gap-1 select-none">
                                <span>13:53</span>
                                <span className="text-[#53bdeb]">✓✓</span>
                              </div>
                            </div>
                          </div>

                          {/* Chat Input */}
                          <div className="bg-[#121b22] px-3 py-2.5 flex items-center gap-2 border-t border-[#222c32]">
                            <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-[11.5px] text-[#8696a0] select-none truncate">
                              Mensagem
                            </div>
                            <div className="h-8 w-8 rounded-full bg-success grid place-items-center text-success-foreground cursor-pointer shadow-sm select-none">
                              <Send className="h-4 w-4 text-black" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
