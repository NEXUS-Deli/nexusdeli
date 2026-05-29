import { S as reactExports, J as jsxRuntimeExports } from "./server-tfDrSU-s.js";
import { g as getCompanyId, s as supabase, A as AnimatePresence, h as motion, T as Trash2, t as toast } from "./router-CjJWtfgI.js";
import { d as Sidebar, T as Topbar, a as Percent, Z as Zap } from "./Topbar-CvlFCSIz.js";
import { P as Pause, a as Play } from "./play-eNNAgooA.js";
import { F as FileText } from "./file-text-eBQL8n2j.js";
import { M as MessageSquare } from "./message-square-DhnLg4LD.js";
import { S as Sparkles } from "./sparkles-BKz0_Lze.js";
import { C as Cpu } from "./cpu-BTj8hYoK.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./log-out-D95BvSHA.js";
function PromocoesPage() {
  const [activeSubTab, setActiveSubTab] = reactExports.useState("cupons");
  const [coupons, setCoupons] = reactExports.useState([]);
  const [couponCode, setCouponCode] = reactExports.useState("");
  const [couponDiscount, setCouponDiscount] = reactExports.useState("");
  const [couponMinOrder, setCouponMinOrder] = reactExports.useState("");
  const [templates, setTemplates] = reactExports.useState([]);
  const [templateName, setTemplateName] = reactExports.useState("");
  const [templateBody, setTemplateBody] = reactExports.useState("");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = reactExports.useState(0);
  const [triggers, setTriggers] = reactExports.useState([]);
  const [triggerName, setTriggerName] = reactExports.useState("");
  const [triggerDelay, setTriggerDelay] = reactExports.useState("15 dias");
  const [triggerTemplate, setTriggerTemplate] = reactExports.useState("Reativação 15 dias");
  const [triggerCoupon, setTriggerCoupon] = reactExports.useState("VOLTA5");
  const [triggerPeriod, setTriggerPeriod] = reactExports.useState("qualquer");
  const loadData = reactExports.useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      const [resCoupons, resTemplates, resTriggers] = await Promise.all([supabase.from("coupons").select("*").eq("company_id", companyId).order("created_at", {
        ascending: false
      }), supabase.from("message_templates").select("*").eq("company_id", companyId).order("created_at", {
        ascending: false
      }), supabase.from("triggers").select("*").eq("company_id", companyId).order("created_at", {
        ascending: false
      })]);
      if (resCoupons.data) setCoupons(resCoupons.data);
      if (resTemplates.data) setTemplates(resTemplates.data);
      if (resTriggers.data) setTriggers(resTriggers.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }, []);
  reactExports.useEffect(() => {
    loadData();
  }, [loadData]);
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponDiscount) {
      toast.error("Preencha todos os campos do cupom.");
      return;
    }
    try {
      const companyId = await getCompanyId();
      const {
        data,
        error
      } = await supabase.from("coupons").insert([{
        company_id: companyId,
        code: couponCode.toUpperCase().replace(/\s+/g, ""),
        discount: Number(couponDiscount),
        min_order: Number(couponMinOrder) || 0,
        status: "ativo",
        usage: 0
      }]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        setCoupons([data[0], ...coupons]);
        setCouponCode("");
        setCouponDiscount("");
        setCouponMinOrder("");
        toast.success(`Cupom "${data[0].code}" criado com sucesso!`);
      } else {
        throw new Error("Nenhum dado retornado (bloqueio RLS).");
      }
    } catch (err) {
      console.error(">>> [DEBUG] Erro ao criar cupom:", err);
      toast.error("Erro ao criar cupom.");
      window.alert("Erro ao salvar cupom: " + (err.message || ""));
    }
  };
  const toggleCoupon = async (id, currentStatus, code) => {
    try {
      const companyId = await getCompanyId();
      const nextStatus = currentStatus === "ativo" ? "pausado" : "ativo";
      const {
        error
      } = await supabase.from("coupons").update({
        status: nextStatus
      }).eq("id", id).eq("company_id", companyId);
      if (error) throw error;
      setCoupons(coupons.map((c) => c.id === id ? {
        ...c,
        status: nextStatus
      } : c));
      toast.info(`Cupom "${code}" foi ${nextStatus === "pausado" ? "pausado" : "ativado"}.`);
    } catch (err) {
      toast.error("Erro ao atualizar cupom.");
    }
  };
  const deleteCoupon = async (id, code) => {
    try {
      const companyId = await getCompanyId();
      const {
        error
      } = await supabase.from("coupons").delete().eq("id", id).eq("company_id", companyId);
      if (error) throw error;
      setCoupons(coupons.filter((c) => c.id !== id));
      toast.success(`Cupom "${code}" removido.`);
    } catch (err) {
      toast.error("Erro ao remover cupom.");
    }
  };
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    console.log(">>> [DEBUG] handleCreateTemplate chamado!");
    if (!templateName.trim() || !templateBody.trim()) {
      console.log(">>> [DEBUG] Erro de validação: campos vazios");
      toast.error("Por favor, preencha o nome e o corpo do modelo.");
      return;
    }
    try {
      console.log(">>> [DEBUG] Pegando companyId...");
      const companyId = await getCompanyId();
      console.log(">>> [DEBUG] companyId:", companyId);
      console.log(">>> [DEBUG] Inserindo no Supabase...");
      const {
        data,
        error
      } = await supabase.from("message_templates").insert([{
        company_id: companyId,
        name: templateName,
        body: templateBody
      }]).select();
      console.log(">>> [DEBUG] Resposta do Supabase:", {
        data,
        error
      });
      if (error) throw error;
      if (data && data.length > 0) {
        setTemplates([data[0], ...templates]);
        setSelectedTemplateIndex(0);
        setTemplateName("");
        setTemplateBody("");
        toast.success(`Modelo "${data[0].name}" adicionado à biblioteca.`);
      } else {
        throw new Error("Nenhum dado retornado da inserção. Pode ser um bloqueio de RLS.");
      }
    } catch (err) {
      console.error(">>> [DEBUG] Erro detalhado ao salvar modelo:", err);
      toast.error("Erro ao salvar modelo. Verifique o console.");
      window.alert("Erro ao salvar o modelo: " + (err.message || "Verifique se as permissões (RLS) estão corretas e se você está logado."));
    }
  };
  const deleteTemplate = async (id, name) => {
    try {
      const companyId = await getCompanyId();
      const {
        error
      } = await supabase.from("message_templates").delete().eq("id", id).eq("company_id", companyId);
      if (error) throw error;
      setTemplates(templates.filter((t) => t.id !== id));
      if (selectedTemplateIndex !== null && selectedTemplateIndex >= templates.length - 1) {
        setSelectedTemplateIndex(0);
      }
      toast.success(`Modelo "${name}" removido.`);
    } catch (err) {
      toast.error("Erro ao remover modelo.");
    }
  };
  const handleCreateTrigger = async (e) => {
    e.preventDefault();
    if (!triggerName.trim()) {
      toast.error("Digite o nome da automação.");
      return;
    }
    try {
      const companyId = await getCompanyId();
      const {
        data,
        error
      } = await supabase.from("triggers").insert([{
        company_id: companyId,
        name: triggerName,
        delay: triggerDelay,
        template_name: triggerTemplate,
        coupon_code: triggerCoupon,
        period: triggerPeriod,
        active: true
      }]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        setTriggers([data[0], ...triggers]);
        setTriggerName("");
        toast.success(`Automação "${data[0].name}" configurada e ativada!`);
      } else {
        throw new Error("Nenhum dado retornado (bloqueio RLS).");
      }
    } catch (err) {
      console.error(">>> [DEBUG] Erro ao salvar automação:", err);
      toast.error("Erro ao salvar automação.");
      window.alert("Erro ao salvar automação: " + (err.message || ""));
    }
  };
  const toggleTrigger = async (id, currentState, name) => {
    try {
      const companyId = await getCompanyId();
      const nextState = !currentState;
      const {
        error
      } = await supabase.from("triggers").update({
        active: nextState
      }).eq("id", id).eq("company_id", companyId);
      if (error) throw error;
      setTriggers(triggers.map((t) => t.id === id ? {
        ...t,
        active: nextState
      } : t));
      toast.success(`Automação "${name}" foi ${nextState ? "ativada" : "desativada"}.`);
    } catch (err) {
      toast.error("Erro ao atualizar automação.");
    }
  };
  const deleteTrigger = async (id, name) => {
    try {
      const companyId = await getCompanyId();
      const {
        error
      } = await supabase.from("triggers").delete().eq("id", id).eq("company_id", companyId);
      if (error) throw error;
      setTriggers(triggers.filter((t) => t.id !== id));
      toast.success(`Automação "${name}" removida.`);
    } catch (err) {
      toast.error("Erro ao remover automação.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Topbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Promoções" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Crie cupons, gerencie modelos de mensagens e ative gatilhos automáticos para reter clientes." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start", children: ["cupons", "templates", "gatilhos"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveSubTab(tab), className: `px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${activeSubTab === tab ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: tab === "cupons" ? "Promoções / Cupons" : tab === "templates" ? "Modelos de Mensagem" : "Gatilhos Automáticos" }, tab)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
          activeSubTab === "cupons" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4 self-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "h-4 w-4" }),
                " Novo Cupom"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateCoupon, className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Código do Cupom" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: couponCode, onChange: (e) => setCouponCode(e.target.value), placeholder: "Ex: VOLTAPRO10", className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors uppercase" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Desconto (%)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", required: true, min: 1, max: 100, value: couponDiscount, onChange: (e) => setCouponDiscount(e.target.value), placeholder: "15", className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Mín. Pedido (R$)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, value: couponMinOrder, onChange: (e) => setCouponMinOrder(e.target.value), placeholder: "30", className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: "Criar Promoção 🚀" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Promoções Disponíveis" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Estes cupons podem ser vinculados às campanhas e mensagens." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-4", children: "Cupom" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Desconto" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Mínimo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Status" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-4", children: "Uso Geral" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-4 pr-5", children: "Ações" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: coupons.map((c) => {
                  const isActive = c.status === "ativo";
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-accent/20 transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-foreground font-mono bg-background/60 border border-border px-2.5 py-1 rounded-lg inline-block", children: c.code }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "font-semibold text-foreground", children: [
                      c.discount,
                      "% OFF"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-muted-foreground", children: c.min_order > 0 ? `R$ ${c.min_order}` : "Sem mínimo" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? "bg-success/12 border-success/30 text-success" : "bg-muted/30 border-border text-muted-foreground"}`, children: c.status }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "text-right font-semibold text-foreground", children: [
                      c.usage,
                      " resgates"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "pr-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleCoupon(c.id, c.status, c.code), title: isActive ? "Pausar Cupom" : "Ativar Cupom", className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground transition-colors cursor-pointer", children: isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteCoupon(c.id, c.code), title: "Remover Cupom", className: "h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive hover:text-destructive-foreground transition-colors cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
                    ] }) })
                  ] }, c.id);
                }) })
              ] }) })
            ] })
          ] }, "cupons"),
          activeSubTab === "templates" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4 self-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-primary" }),
                  " Modelos Salvos"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-muted-foreground", children: [
                  templates.length,
                  " modelos"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 max-h-[350px] overflow-y-auto pr-1", children: templates.map((t, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setSelectedTemplateIndex(idx), className: `flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-colors ${selectedTemplateIndex === idx ? "border-primary bg-primary/8 font-semibold" : "border-border bg-background/30 hover:bg-accent/40"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs truncate", children: t.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                  e.stopPropagation();
                  deleteTemplate(t.id, t.name);
                }, className: "h-6 w-6 grid place-items-center text-muted-foreground hover:text-destructive rounded hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
              ] }, t.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm flex items-center gap-1.5 text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
                " Editor e Criador de Modelos"
              ] }),
              selectedTemplateIndex !== null && templates[selectedTemplateIndex] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background/45 border border-border p-4 rounded-xl space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border/60 pb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground", children: templates[selectedTemplateIndex].name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Visualização do Modelo" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans p-2 bg-background/20 rounded border border-border/40", children: templates[selectedTemplateIndex].body })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl", children: "Nenhum modelo selecionado. Selecione um ao lado ou crie um novo abaixo." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateTemplate, className: "border-t border-border pt-4 mt-2 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs uppercase tracking-wider text-muted-foreground", children: "Criar Novo Modelo de Mensagem" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome do Modelo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: templateName, onChange: (e) => setTemplateName(e.target.value), placeholder: "Ex: Oferta de Black Friday", className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Corpo da Mensagem" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground italic", children: [
                      "Use tags como: ",
                      "{nome_cliente}",
                      ", ",
                      "{prato_favorito}"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { rows: 5, required: true, value: templateBody, onChange: (e) => setTemplateBody(e.target.value), placeholder: "Digite a mensagem padrão aqui...", className: "w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/60 transition-colors font-sans resize-none" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: ["nome_cliente", "prato_favorito", "cupom_desconto"].map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTemplateBody((prev) => prev + ` {${tag}}`), className: "text-[9.5px] font-bold border border-border rounded bg-background hover:bg-accent px-1.5 py-0.5 transition-colors cursor-pointer", children: `{${tag.replace("_", " ")}}` }, tag)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "rounded-xl bg-gradient-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: "Adicionar Modelo 🚀" }) })
              ] })
            ] })
          ] }, "templates"),
          activeSubTab === "gatilhos" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4 self-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
                " Novo Gatilho Perpétuo"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateTrigger, className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome da Automação" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: triggerName, onChange: (e) => setTriggerName(e.target.value), placeholder: "Ex: Gatilho Reativação 45d", className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Gatilho (Tempo Inativo)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: triggerDelay, onChange: (e) => setTriggerDelay(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "15 dias", children: "15 dias sem pedir" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "30 dias", children: "30 dias sem pedir" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "45 dias", children: "45 dias sem pedir" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "No dia do aniversário", children: "No dia do aniversário" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Horário de Disparo (Para o n8n)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: triggerPeriod, onChange: (e) => setTriggerPeriod(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "qualquer", children: "Qualquer Horário" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "almoco", children: "Disparar no Almoço" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "jantar", children: "Disparar na Janta" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Modelo de Msg" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: triggerTemplate, onChange: (e) => setTriggerTemplate(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", children: templates.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.name, children: t.name }, t.name)) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Cupom de Desconto" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: triggerCoupon, onChange: (e) => setTriggerCoupon(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", children: coupons.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.code, children: c.code }, c.code)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: "Ativar Automação 🚀" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Gatilhos de Disparo Ativos" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Estas regras rodam 24h em segundo plano avaliando sua base de clientes." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 space-y-4", children: triggers.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 rounded-xl grid place-items-center ${t.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground border border-border"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "h-5 w-5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-sm text-foreground flex items-center gap-2", children: [
                      t.name,
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 bg-accent/60 text-muted-foreground rounded border border-border/80 font-mono", children: t.delay })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "Envia: ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: t.template_name })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border", children: "·" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "Cupom: ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono text-primary", children: t.coupon_code })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border", children: "·" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "Horário: ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: t.period === "almoco" ? "Almoço" : t.period === "jantar" ? "Jantar" : "Qualquer" })
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 self-end sm:self-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleTrigger(t.id, t.active, t.name), className: `relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${t.active ? "bg-success" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${t.active ? "translate-x-5" : "translate-x-0"}` }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteTrigger(t.id, t.name), title: "Excluir regra", className: "h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive transition-colors cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
                ] })
              ] }, t.id)) })
            ] })
          ] }, "gatilhos")
        ] })
      ] })
    ] })
  ] });
}
export {
  PromocoesPage as component
};
