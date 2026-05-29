import { S as reactExports, J as jsxRuntimeExports } from "./server-3KlhyZH_.js";
import { d as createLucideIcon, R as Route, k as useNavigate, g as getCompanyId, s as supabase, t as toast, A as AnimatePresence, h as motion, P as Plus, a as LoaderCircle, b as Smartphone, T as Trash2, X } from "./router-CgDrIRmR.js";
import { d as Sidebar, T as Topbar, M as Megaphone, U as Users, Z as Zap } from "./Topbar-CQk6A6ur.js";
import { S as ShieldAlert } from "./shield-alert-nD9aDeeh.js";
import { S as Send, A as ArrowLeft } from "./send-CTd7gOwC.js";
import { C as CircleCheck } from "./circle-check-DmOIzhw8.js";
import { C as CircleAlert } from "./circle-alert-VkLE-lHM.js";
import { C as Clock } from "./clock-DsYOe0wR.js";
import { P as Pause, a as Play } from "./play-DZp2duil.js";
import { S as Sparkles } from "./sparkles-DYcJv7Hm.js";
import { M as MessageSquare } from "./message-square-Ds86jLUh.js";
import { B as Bot } from "./bot-C3vfAsYr.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./log-out-BDyVC8AH.js";
const __iconNode = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode);
function CampaignsPage() {
  const {
    new: isNewParam
  } = Route.useSearch();
  const navigate = useNavigate({
    from: "/campanhas"
  });
  const [campaigns, setCampaigns] = reactExports.useState([]);
  const [whatsappInstances, setWhatsappInstances] = reactExports.useState([]);
  const [isLoadingList, setIsLoadingList] = reactExports.useState(true);
  const [isLoadingInstances, setIsLoadingInstances] = reactExports.useState(true);
  const [isDbError, setIsDbError] = reactExports.useState(false);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [segment, setSegment] = reactExports.useState("");
  const [instance, setInstance] = reactExports.useState("");
  const [folders, setFolders] = reactExports.useState([]);
  const agent = "Sofia";
  const [message, setMessage] = reactExports.useState("Olá, {nome_cliente}! 🍕\n\nFaz {dias_inativo} dias que você não pede seu prato favorito ({prato_favorito}) aqui na nossa loja.\n\nPara te dar uma força especial hoje, criamos um cupom especial de {desconto}% para você pedir de novo! Use: {cupom_desconto} no site ou peça direto por aqui!\n\nQue tal aproveitar?");
  const [scheduleType, setScheduleType] = reactExports.useState("imediato");
  const [scheduleDate, setScheduleDate] = reactExports.useState("");
  const [scheduleTime, setScheduleTime] = reactExports.useState("");
  const [minDelay, setMinDelay] = reactExports.useState(15);
  const [maxDelay, setMaxDelay] = reactExports.useState(30);
  const [msgDelay, setMsgDelay] = reactExports.useState(5);
  const [mediaUrl, setMediaUrl] = reactExports.useState("");
  const [mediaFile, setMediaFile] = reactExports.useState(null);
  const [mediaPreview, setMediaPreview] = reactExports.useState("");
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const localUrl = URL.createObjectURL(file);
    setMediaPreview(localUrl);
  };
  const handleRemoveFile = () => {
    setMediaFile(null);
    setMediaPreview("");
  };
  const [activeTab, setActiveTab] = reactExports.useState("todas");
  const loadWhatsappInstances = reactExports.useCallback(async () => {
    setIsLoadingInstances(true);
    try {
      const companyId = await getCompanyId();
      const {
        data,
        error
      } = await supabase.from("whatsapp_instances").select("id, name, status, token").eq("company_id", companyId);
      if (error) throw error;
      setWhatsappInstances(data || []);
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
  const loadCampaigns = reactExports.useCallback(async (hideLoading = false) => {
    if (!hideLoading) setIsLoadingList(true);
    setIsDbError(false);
    try {
      const companyId = await getCompanyId();
      const {
        data,
        error
      } = await supabase.from("vw_campaigns_with_metrics").select("*").eq("company_id", companyId).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      const mappedData = (data || []).map((c) => {
        let currentStatus = c.status;
        if (c.total_leads > 0) {
          if (c.pending_count === 0) {
            currentStatus = "finalizada";
          } else if (c.pending_count > 0 && (c.sent_count > 0 || c.failed_count > 0)) {
            currentStatus = "rodando";
          }
        }
        return {
          ...c,
          status: currentStatus
        };
      });
      setCampaigns(mappedData);
    } catch (err) {
      console.error("Erro ao carregar campanhas:", err);
      if (err?.code === "42P01" || err?.message?.includes("relation")) {
        setIsDbError(true);
      } else {
        toast.error("Erro ao conectar com o banco de dados do Supabase.");
      }
      setCampaigns([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);
  const loadFolders = reactExports.useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      const {
        data,
        error
      } = await supabase.from("folders").select("id, name").eq("company_id", companyId).order("created_at", {
        ascending: true
      });
      if (error) throw error;
      setFolders(data || []);
      if (data && data.length > 0) {
        setSegment(data[0].id);
      }
    } catch (err) {
      console.error("Erro ao carregar pastas:", err);
    }
  }, []);
  const [dbTemplates, setDbTemplates] = reactExports.useState([]);
  const [dbCoupons, setDbCoupons] = reactExports.useState([]);
  const loadTemplatesAndCoupons = reactExports.useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      const [resTemplates, resCoupons] = await Promise.all([supabase.from("message_templates").select("id, name, body").eq("company_id", companyId).order("created_at", {
        ascending: false
      }), supabase.from("coupons").select("id, code, status").eq("company_id", companyId).eq("status", "ativo").order("created_at", {
        ascending: false
      })]);
      if (resTemplates.data) setDbTemplates(resTemplates.data);
      if (resCoupons.data) setDbCoupons(resCoupons.data);
    } catch (err) {
      console.error("Erro ao carregar templates e cupons:", err);
    }
  }, []);
  reactExports.useEffect(() => {
    loadFolders();
    loadCampaigns();
    if (isNewParam) {
      loadWhatsappInstances();
      loadTemplatesAndCoupons();
    }
  }, [isNewParam, loadCampaigns, loadWhatsappInstances, loadFolders, loadTemplatesAndCoupons]);
  reactExports.useEffect(() => {
    const hasActiveCampaigns = campaigns.some((c) => c.status === "rodando" || c.status === "agendada");
    if (!hasActiveCampaigns) return;
    const intervalId = setInterval(() => {
      loadCampaigns(true);
    }, 15e3);
    return () => clearInterval(intervalId);
  }, [campaigns, loadCampaigns]);
  const handleCreateCampaign = async (e) => {
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
      const formattedDate = (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR");
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
      let uploadedMediaUrl = "";
      if (mediaFile) {
        const fileExt = mediaFile.name.split(".").pop();
        const fileName = `${companyId}/${Date.now()}.${fileExt}`;
        const {
          data: uploadData,
          error: uploadError
        } = await supabase.storage.from("campaigns").upload(fileName, mediaFile, {
          cacheControl: "3600",
          upsert: false
        });
        if (uploadError) {
          window.alert(`Erro de permissão no Storage: ${uploadError.message}

Por favor, vá no painel do Supabase -> Storage e crie uma política de leitura/escrita pública (RLS Policy) para o bucket 'campaigns'. Sem isso, o envio da mídia falhará.`);
          setIsSubmitting(false);
          return;
        }
        const {
          data: publicUrlData
        } = supabase.storage.from("campaigns").getPublicUrl(fileName);
        uploadedMediaUrl = publicUrlData.publicUrl;
      }
      const {
        data,
        error
      } = await supabase.from("campaigns").insert([{
        name: name.trim(),
        status: scheduleType === "imediato" ? "rodando" : "agendada",
        sent: 0,
        opened: 0,
        replied: 0,
        revenue: 0,
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
        media_url: uploadedMediaUrl || null
      }]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        const campaignId = data[0].id;
        setCampaigns((prev) => [data[0], ...prev]);
        try {
          const {
            data: leads,
            error: leadsError
          } = await supabase.from("clients").select("id, phone").eq("folder_id", segment).eq("company_id", companyId);
          if (leadsError) throw leadsError;
          if (leads && leads.length > 0) {
            const queuePayload = leads.map((lead) => ({
              campaign_id: campaignId,
              client_id: lead.id,
              phone: lead.phone,
              status: "pending",
              company_id: companyId
            }));
            const {
              error: queueError
            } = await supabase.from("campaign_queue").insert(queuePayload);
            if (queueError) throw queueError;
          } else {
            console.warn("Aviso: Nenhum lead encontrado para a pasta selecionada.");
          }
        } catch (qErr) {
          console.error("Erro ao gerar fila da campanha:", qErr);
          toast.warning("Campanha salva, mas houve instabilidade ao gerar a fila de envios.");
        }
        if (scheduleType === "imediato") {
          try {
            const webhookUrl = "https://nexus360.infra-conectamarketing.site/webhook/nexusdeli-disparador";
            const response = await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                campaignId: data[0].id,
                name: data[0].name,
                segment: data[0].segment,
                instance: data[0].instance,
                instanceToken: data[0].instance_token,
                agent: data[0].agent,
                message: data[0].message,
                company_id: data[0].company_id,
                schedule_type: data[0].schedule_type,
                created_at: data[0].created_at,
                min_delay: data[0].min_delay,
                max_delay: data[0].max_delay,
                msg_delay: data[0].msg_delay,
                media_url: data[0].media_url
              })
            });
            if (!response.ok) {
              console.warn("Resposta de erro do webhook:", response.statusText);
              toast.warning("Campanha salva, mas houve uma instabilidade ao iniciar os disparos.");
            } else {
              console.log("Gatilho de disparo imediato enviado com sucesso!");
            }
          } catch (webhookErr) {
            console.error("Erro ao chamar o webhook:", webhookErr);
            toast.warning("Campanha salva, mas não foi possível conectar com o motor de envio imediato.");
          }
        }
      }
      toast.success("Campanha criada com sucesso!", {
        description: scheduleType === "imediato" ? "Os disparos estão iniciando." : "A campanha foi agendada."
      });
      setName("");
      setMinDelay(15);
      setMaxDelay(30);
      setMsgDelay(5);
      setMediaUrl("");
      setMediaFile(null);
      setMediaPreview("");
      navigate({
        search: {
          new: void 0
        }
      });
    } catch (err) {
      console.error("Erro ao criar campanha:", err);
      toast.error("Falha ao salvar a campanha no banco de dados.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const toggleCampaignStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "rodando" ? "pausada" : "rodando";
    try {
      const companyId = await getCompanyId();
      const {
        error
      } = await supabase.from("campaigns").update({
        status: nextStatus
      }).eq("id", id).eq("company_id", companyId);
      if (error) throw error;
      setCampaigns((prev) => prev.map((c) => c.id === id ? {
        ...c,
        status: nextStatus
      } : c));
      toast.info(`Campanha foi ${nextStatus === "pausada" ? "pausada" : "retomada"}.`);
    } catch (err) {
      console.error("Erro ao alterar status da campanha:", err);
      toast.error("Erro ao atualizar o status no banco de dados.");
    }
  };
  const deleteCampaign = async (id, name2) => {
    const confirmed = window.confirm(`Tem certeza que deseja deletar permanentemente a campanha "${name2}"?`);
    if (!confirmed) return;
    try {
      const companyId = await getCompanyId();
      const {
        error
      } = await supabase.from("campaigns").delete().eq("id", id).eq("company_id", companyId);
      if (error) throw error;
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Campanha "${name2}" removida com sucesso.`);
    } catch (err) {
      console.error("Erro ao deletar campanha:", err);
      toast.error("Erro ao remover a campanha do banco de dados.");
    }
  };
  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "todas") return true;
    if (activeTab === "rodando") return c.status === "rodando" || c.status === "pausada";
    if (activeTab === "agendadas") return c.status === "agendada";
    if (activeTab === "finalizadas") return c.status === "finalizada";
    return true;
  });
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sent_count + c.failed_count), 0);
  const totalSuccess = campaigns.reduce((acc, c) => acc + c.sent_count, 0);
  const totalFailure = campaigns.reduce((acc, c) => acc + c.failed_count, 0);
  const successRate = totalSent > 0 ? (totalSuccess / totalSent * 100).toFixed(1) : "0";
  const failureRate = totalSent > 0 ? (totalFailure / totalSent * 100).toFixed(1) : "0";
  const getParsedPreviewMessage = () => {
    let parsed = message;
    parsed = parsed.replace(/{nome_cliente}/g, "Mateus Silva");
    parsed = parsed.replace(/{prato_favorito}/g, "Pizza de Calabresa Especial");
    parsed = parsed.replace(/{dias_inativo}/g, "32");
    parsed = parsed.replace(/{desconto}/g, "15");
    parsed = parsed.replace(/{cupom_desconto}/g, "VOLTAPRO5");
    return parsed;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Topbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        isDbError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5 sm:mt-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-destructive", children: "Tabela no Supabase Ausente!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: [
              "A tabela ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "campaigns" }),
              " não foi encontrada no seu banco de dados. Verifique se você executou a query SQL correta no seu editor de consultas."
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: !isNewParam ? (
          // ================= MONITORING VIEW =================
          /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Campanhas" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Monitore seus disparos de reativação e impulsione o retorno dos clientes." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
                search: {
                  new: true
                }
              }), className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
                " Nova Campanha"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Total de disparos" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 text-primary" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold", children: totalSent.toLocaleString("pt-BR") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Mensagens disparadas" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Campanhas Ativas" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-4 w-4 text-warning" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold", children: campaigns.filter((c) => c.status === "rodando").length }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] text-muted-foreground", children: [
                    campaigns.filter((c) => c.status === "agendada").length,
                    " agendadas para envio"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Taxa de Sucesso" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-success" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-2xl font-bold", children: [
                    successRate,
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] text-success font-medium", children: [
                    totalSuccess.toLocaleString("pt-BR"),
                    " entregues"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Taxa de Falha" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-destructive" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-2xl font-bold", children: [
                    failureRate,
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] text-destructive font-medium", children: [
                    totalFailure.toLocaleString("pt-BR"),
                    " falhas no envio"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-border gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 p-0.5 rounded-xl bg-background/50 border border-border self-start", children: ["todas", "rodando", "agendadas", "finalizadas"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab(tab), className: `px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${activeTab === tab ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: tab === "todas" ? "Todas" : tab === "rodando" ? "Em andamento" : tab === "agendadas" ? "Agendadas" : "Finalizadas" }, tab)) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground font-medium self-end sm:self-center", children: [
                  "Exibindo ",
                  filteredCampaigns.length,
                  " de ",
                  campaigns.length,
                  " campanhas"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: isDbError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 px-4 text-center gap-4 border-2 border-dashed border-destructive/20 rounded-xl m-5 bg-destructive/5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-10 w-10 text-destructive" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-destructive mb-1", children: "Atenção! Faltou rodar o Script SQL." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground max-w-md mx-auto", children: [
                    "O painel não encontrou a View de Métricas ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-background px-1 py-0.5 rounded text-xs text-foreground font-mono border border-border", children: "vw_campaigns_with_metrics" }),
                    " no seu Supabase. Suas campanhas estão salvas, mas ocultas."
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-foreground bg-background px-3 py-2 rounded-lg border border-border", children: [
                  "Vá no painel do Supabase, copie o código do arquivo ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "setup_campaign_metrics.sql" }),
                  " e rode no SQL Editor para que as campanhas voltem a aparecer."
                ] })
              ] }) : isLoadingList ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Buscando campanhas..." })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-4", children: "Campanha" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Status" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Detalhes do Envio" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-4", children: "Métricas" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-4 pr-5", children: "Ações" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: filteredCampaigns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "text-center py-12 text-muted-foreground", children: "Nenhuma campanha encontrada nesta categoria." }) }) : filteredCampaigns.map((c, idx) => {
                  const percent = c.total_leads > 0 ? Math.floor((c.sent_count + c.failed_count) / c.total_leads * 100) : 0;
                  const isRodando = c.status === "rodando";
                  const isPausada = c.status === "pausada";
                  const isAgendada = c.status === "agendada";
                  const isFinalizada = c.status === "finalizada";
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.tr, { initial: {
                    opacity: 0
                  }, animate: {
                    opacity: 1
                  }, transition: {
                    delay: idx * 0.03
                  }, className: "hover:bg-accent/20 transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-[14px]", children: c.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                        " ",
                        folders.find((f) => f.id === c.segment)?.name || c.segment,
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border/80", children: "·" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-3 w-3" }),
                        " ",
                        c.instance
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${isRodando ? "bg-success/12 border-success/30 text-success" : isPausada ? "bg-warning/12 border-warning/30 text-warning" : isAgendada ? "bg-primary/12 border-primary/30 text-primary" : "bg-muted/30 border-border text-muted-foreground"}`, children: [
                      isRodando && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success pulse-dot" }),
                      isPausada && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-warning" }),
                      isAgendada && /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                      isFinalizada && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
                      c.status
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-muted-foreground py-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground font-medium", children: c.date }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2 max-w-[150px]", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full bg-background border border-border rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded-full ${isFinalizada ? "bg-success" : "bg-primary"}`, style: {
                          width: `${percent}%`
                        } }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold", children: [
                          percent,
                          "%"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-right py-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs flex items-center justify-end gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Sucesso:" }),
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold text-success", children: c.sent_count?.toLocaleString("pt-BR") || 0 })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs mt-1 flex items-center justify-end gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Falha:" }),
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold text-destructive", children: c.failed_count?.toLocaleString("pt-BR") || 0 })
                      ] }),
                      c.pending_count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-1", children: [
                        "Faltam: ",
                        c.pending_count
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
                      (isRodando || isPausada) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleCampaignStatus(c.id, c.status), title: isRodando ? "Pausar Disparos" : "Retomar Disparos", className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground hover:text-primary transition-colors cursor-pointer", children: isRodando ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteCampaign(c.id, c.name), title: "Remover Campanha", className: "h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive hover:text-destructive-foreground transition-colors cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
                    ] }) })
                  ] }, c.id);
                }) })
              ] }) })
            ] })
          ] }, "monitor")
        ) : (
          // ================= CREATION VIEW =================
          /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
                search: {
                  new: void 0
                }
              }), className: "h-9 w-9 grid place-items-center rounded-xl border border-border hover:bg-accent transition-colors cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight", children: "Nova Campanha" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Configure seu público, mensagem e agende os disparos." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateCampaign, className: "lg:col-span-7 space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
                    " Configurações Básicas"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome da Campanha" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "Ex: Sexta-feira Pizza em Dobro", className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Público Alvo (Pasta)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: segment, onChange: (e) => setSegment(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", children: folders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Nenhuma pasta encontrada" }) : folders.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f.id, children: f.name }, f.id)) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Aparelho de Envio" }),
                      isLoadingInstances ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
                        " Carregando..."
                      ] }) : whatsappInstances.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full bg-background border border-destructive/30 text-destructive rounded-xl px-3 py-2 text-xs flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 shrink-0" }),
                        " Nenhum aparelho disponível."
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: instance, onChange: (e) => setInstance(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", children: whatsappInstances.map((inst) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: inst.name, children: [
                        inst.name,
                        " (",
                        inst.status === "connected" ? "Online" : "Offline",
                        ")"
                      ] }, inst.id)) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5" })
                  ] }),
                  whatsappInstances.length === 0 && !isLoadingInstances && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-destructive font-medium flex items-center gap-1 bg-destructive/10 border border-destructive/20 p-2.5 rounded-xl", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 shrink-0" }),
                    "Você precisa conectar pelo menos um aparelho de WhatsApp na tela anterior para poder disparar campanhas."
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
                    " Configurações de Disparo & Mídia"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Delay Mínimo (seg)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", required: true, min: 1, value: minDelay, onChange: (e) => setMinDelay(Number(e.target.value)), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Delay Máximo (seg)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", required: true, min: 1, value: maxDelay, onChange: (e) => setMaxDelay(Number(e.target.value)), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Delay entre Msg (seg)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", required: true, min: 1, value: msgDelay, onChange: (e) => setMsgDelay(Number(e.target.value)), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Mídia da Campanha (Foto ou Vídeo - Opcional)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: mediaFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border border-border bg-background rounded-xl p-3 text-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 truncate", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary truncate", children: mediaFile.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                          "(",
                          (mediaFile.size / 1024 / 1024).toFixed(2),
                          " MB)"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleRemoveFile, className: "h-6 w-6 grid place-items-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center border border-dashed border-border hover:border-primary/40 bg-background/50 rounded-xl p-5 text-center cursor-pointer relative transition-colors", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*,video/*", onChange: handleFileChange, className: "absolute inset-0 opacity-0 cursor-pointer w-full h-full" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground", children: "Clique para selecionar foto ou vídeo" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Tamanho máximo sugerido: 10MB" })
                      ] })
                    ] }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }),
                      " Mensagem Customizada"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-md border border-success/20", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
                      " IA Habilitada"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                    dbTemplates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between bg-accent/20 p-2.5 rounded-xl border border-border gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-foreground", children: "Usar Modelo Salvo:" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "bg-background border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary/60 transition-colors sm:w-2/3", onChange: (e) => {
                        const t = dbTemplates.find((x) => x.id === e.target.value);
                        if (t) setMessage(t.body);
                      }, defaultValue: "", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Selecione um modelo da página Promoções..." }),
                        dbTemplates.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.id, children: t.name }, t.id))
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { rows: 7, required: true, value: message, onChange: (e) => setMessage(e.target.value), placeholder: "Digite a mensagem...", className: "w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/60 transition-colors font-sans resize-none" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-semibold py-1", children: "Inserir variável:" }),
                      ["nome_cliente", "prato_favorito", "dias_inativo", "desconto", "cupom_desconto"].map((variable) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMessage((prev) => prev + ` {${variable}}`), className: "text-[9.5px] font-bold border border-border rounded bg-background/55 hover:bg-accent px-1.5 py-0.5 transition-colors cursor-pointer", children: `{${variable.replace("_", " ")}}` }, variable))
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 mt-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-semibold py-1", children: "Inserir Cupom Ativo:" }),
                      dbCoupons.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMessage((prev) => prev + ` ${c.code}`), className: "text-[9.5px] font-bold border border-primary/30 text-primary rounded bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 transition-colors cursor-pointer", children: c.code }, c.id)),
                      dbCoupons.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9.5px] text-muted-foreground italic py-1", children: "Nenhum cupom ativo na página Promoções" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
                    " Envio e Agendamento"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs font-semibold cursor-pointer", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "schedule", checked: scheduleType === "imediato", onChange: () => setScheduleType("imediato"), className: "accent-primary" }),
                      "Disparar Imediatamente"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs font-semibold cursor-pointer", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "schedule", checked: scheduleType === "agendado", onChange: () => setScheduleType("agendado"), className: "accent-primary" }),
                      "Agendar Disparo"
                    ] })
                  ] }),
                  scheduleType === "agendado" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
                    opacity: 0,
                    height: 0
                  }, animate: {
                    opacity: 1,
                    height: "auto"
                  }, className: "grid grid-cols-2 gap-4 pt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Data" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", required: scheduleType === "agendado", value: scheduleDate, onChange: (e) => setScheduleDate(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Horário" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", required: scheduleType === "agendado", value: scheduleTime, onChange: (e) => setScheduleTime(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => navigate({
                    search: {
                      new: void 0
                    }
                  }), className: "rounded-xl border border-border bg-background hover:bg-accent px-5 py-2.5 text-sm font-semibold transition-colors cursor-pointer", children: "Cancelar" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: whatsappInstances.length === 0 || isSubmitting, className: "rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center gap-2", children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Lançando..." })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: scheduleType === "imediato" ? "Lançar Campanha 🚀" : "Confirmar Agendamento 📅" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-5 flex flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-[370px] sticky top-24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-3", children: "Live Preview (WhatsApp)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto h-[680px] w-[340px] rounded-[42px] border-[9px] border-[#222222] bg-[#000000] shadow-glow overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 h-5 w-40 bg-[#222222] rounded-b-2xl z-20 flex items-center justify-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-background/20 mr-1.5" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-10 rounded-full bg-background/30" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-[#0b141a] pt-8 flex flex-col z-10", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#121b22] px-4 py-2.5 flex items-center gap-3 border-b border-[#222c32] shadow-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-gradient-to-br from-primary to-warning grid place-items-center text-[12px] font-bold text-white select-none", children: "MS" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-white truncate leading-tight", children: "Mateus Silva" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-success leading-none mt-0.5 flex items-center gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 bg-success rounded-full pulse-dot" }),
                          " online"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-5 w-5 text-primary" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-4 overflow-y-auto space-y-4 flex flex-col justify-end", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto bg-[#182229] border border-[#222c32] rounded-md px-2.5 py-1 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider select-none", children: "Hoje" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#005c4b] border border-[#006e5a]/30 text-white rounded-lg rounded-tr-none px-3.5 py-2.5 text-[12.5px] leading-relaxed max-w-[85%] self-end shadow-sm relative break-words whitespace-pre-wrap", children: [
                        mediaPreview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-md overflow-hidden mb-2 border border-[#006e5a]/10 max-h-[200px] flex items-center justify-center bg-black/20", children: mediaFile?.type.startsWith("video/") ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: mediaPreview, controls: true, className: "w-full h-auto object-contain max-h-[200px]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: mediaPreview, alt: "Preview", className: "w-full h-auto object-contain max-h-[200px]" }) }),
                        getParsedPreviewMessage(),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-[9.5px] text-[#8696a0] mt-1.5 flex items-center justify-end gap-1 select-none", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "13:53" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#53bdeb]", children: "✓✓" })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#121b22] px-3 py-2.5 flex items-center gap-2 border-t border-[#222c32]", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-[11.5px] text-[#8696a0] select-none truncate", children: "Mensagem" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-success grid place-items-center text-success-foreground cursor-pointer shadow-sm select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 text-black" }) })
                    ] })
                  ] })
                ] })
              ] }) })
            ] })
          ] }, "create")
        ) })
      ] })
    ] })
  ] });
}
export {
  CampaignsPage as component
};
