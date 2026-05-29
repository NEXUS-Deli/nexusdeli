import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import { 
  Percent, 
  FileText, 
  Play, 
  Pause, 
  Trash2, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Cpu
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/promocoes")({
  component: PromocoesPage,
});

function PromocoesPage() {
  const [activeSubTab, setActiveSubTab] = useState<"cupons" | "templates" | "gatilhos">("cupons");

  // Coupons States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("");
  
  // Templates States
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(0);

  // Triggers States
  const [triggers, setTriggers] = useState<any[]>([]);
  const [triggerName, setTriggerName] = useState("");
  const [triggerDelay, setTriggerDelay] = useState("15 dias");
  const [triggerTemplate, setTriggerTemplate] = useState("Reativação 15 dias");
  const [triggerCoupon, setTriggerCoupon] = useState("VOLTA5");
  const [triggerPeriod, setTriggerPeriod] = useState("qualquer");

  const loadData = useCallback(async () => {
    try {
      const companyId = await getCompanyId();
      
      const [resCoupons, resTemplates, resTriggers] = await Promise.all([
        supabase.from("coupons").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("message_templates").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("triggers").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      ]);

      if (resCoupons.data) setCoupons(resCoupons.data);
      if (resTemplates.data) setTemplates(resTemplates.data);
      if (resTriggers.data) setTriggers(resTriggers.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponDiscount) {
      toast.error("Preencha todos os campos do cupom.");
      return;
    }

    try {
      const companyId = await getCompanyId();
      const { data, error } = await supabase.from("coupons").insert([{
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
    } catch (err: any) {
      console.error(">>> [DEBUG] Erro ao criar cupom:", err);
      toast.error("Erro ao criar cupom.");
      window.alert("Erro ao salvar cupom: " + (err.message || ""));
    }
  };

  // Toggle Coupon Status
  const toggleCoupon = async (id: string, currentStatus: string, code: string) => {
    try {
      const companyId = await getCompanyId();
      const nextStatus = currentStatus === "ativo" ? "pausado" : "ativo";
      const { error } = await supabase.from("coupons").update({ status: nextStatus }).eq("id", id).eq("company_id", companyId);
      if (error) throw error;

      setCoupons(coupons.map(c => c.id === id ? { ...c, status: nextStatus } : c));
      toast.info(`Cupom "${code}" foi ${nextStatus === "pausado" ? "pausado" : "ativado"}.`);
    } catch (err) {
      toast.error("Erro ao atualizar cupom.");
    }
  };

  const deleteCoupon = async (id: string, code: string) => {
    try {
      const companyId = await getCompanyId();
      const { error } = await supabase.from("coupons").delete().eq("id", id).eq("company_id", companyId);
      if (error) throw error;

      setCoupons(coupons.filter(c => c.id !== id));
      toast.success(`Cupom "${code}" removido.`);
    } catch (err) {
      toast.error("Erro ao remover cupom.");
    }
  };

  // Create Template
  const handleCreateTemplate = async (e: React.FormEvent) => {
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
      const { data, error } = await supabase.from("message_templates").insert([{
        company_id: companyId,
        name: templateName,
        body: templateBody
      }]).select();

      console.log(">>> [DEBUG] Resposta do Supabase:", { data, error });

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
    } catch (err: any) {
      console.error(">>> [DEBUG] Erro detalhado ao salvar modelo:", err);
      toast.error("Erro ao salvar modelo. Verifique o console.");
      window.alert("Erro ao salvar o modelo: " + (err.message || "Verifique se as permissões (RLS) estão corretas e se você está logado."));
    }
  };

  const deleteTemplate = async (id: string, name: string) => {
    try {
      const companyId = await getCompanyId();
      const { error } = await supabase.from("message_templates").delete().eq("id", id).eq("company_id", companyId);
      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== id));
      if (selectedTemplateIndex !== null && selectedTemplateIndex >= templates.length - 1) {
        setSelectedTemplateIndex(0);
      }
      toast.success(`Modelo "${name}" removido.`);
    } catch (err) {
      toast.error("Erro ao remover modelo.");
    }
  };

  // Create Trigger
  const handleCreateTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerName.trim()) {
      toast.error("Digite o nome da automação.");
      return;
    }

    try {
      const companyId = await getCompanyId();
      const { data, error } = await supabase.from("triggers").insert([{
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
    } catch (err: any) {
      console.error(">>> [DEBUG] Erro ao salvar automação:", err);
      toast.error("Erro ao salvar automação.");
      window.alert("Erro ao salvar automação: " + (err.message || ""));
    }
  };

  // Toggle Trigger Status
  const toggleTrigger = async (id: string, currentState: boolean, name: string) => {
    try {
      const companyId = await getCompanyId();
      const nextState = !currentState;
      const { error } = await supabase.from("triggers").update({ active: nextState }).eq("id", id).eq("company_id", companyId);
      if (error) throw error;

      setTriggers(triggers.map(t => t.id === id ? { ...t, active: nextState } : t));
      toast.success(`Automação "${name}" foi ${nextState ? "ativada" : "desativada"}.`);
    } catch (err) {
      toast.error("Erro ao atualizar automação.");
    }
  };

  const deleteTrigger = async (id: string, name: string) => {
    try {
      const companyId = await getCompanyId();
      const { error } = await supabase.from("triggers").delete().eq("id", id).eq("company_id", companyId);
      if (error) throw error;

      setTriggers(triggers.filter(t => t.id !== id));
      toast.success(`Automação "${name}" removida.`);
    } catch (err) {
      toast.error("Erro ao remover automação.");
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
              <h1 className="text-2xl font-bold tracking-tight">Promoções</h1>
              <p className="text-sm text-muted-foreground">
                Crie cupons, gerencie modelos de mensagens e ative gatilhos automáticos para reter clientes.
              </p>
            </div>
            
            {/* Custom Tab Selector */}
            <div className="flex flex-wrap items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start">
              {(["cupons", "templates", "gatilhos"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                    activeSubTab === tab
                      ? "bg-accent text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "cupons" ? "Promoções / Cupons" : tab === "templates" ? "Modelos de Mensagem" : "Gatilhos Automáticos"}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Tabs Contents */}
          <AnimatePresence mode="wait">
            
            {/* ================= TABS: CUPONS ================= */}
            {activeSubTab === "cupons" && (
              <motion.div
                key="cupons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Left Side: Create Coupon Form */}
                <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4 self-start">
                  <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                    <Percent className="h-4 w-4" /> Novo Cupom
                  </h2>

                  <form onSubmit={handleCreateCoupon} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Código do Cupom</label>
                      <input
                        type="text"
                        required
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Ex: VOLTAPRO10"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Desconto (%)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={100}
                          value={couponDiscount}
                          onChange={(e) => setCouponDiscount(e.target.value)}
                          placeholder="15"
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Mín. Pedido (R$)</label>
                        <input
                          type="number"
                          min={0}
                          value={couponMinOrder}
                          onChange={(e) => setCouponMinOrder(e.target.value)}
                          placeholder="30"
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
                    >
                      Criar Promoção 🚀
                    </button>
                  </form>
                </div>

                {/* Right Side: Coupons Table */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-bold text-sm">Promoções Disponíveis</h3>
                    <p className="text-xs text-muted-foreground">Estes cupons podem ser vinculados às campanhas e mensagens.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                          <th className="text-left font-medium px-5 py-4">Cupom</th>
                          <th className="text-left font-medium py-4">Desconto</th>
                          <th className="text-left font-medium py-4">Mínimo</th>
                          <th className="text-left font-medium py-4">Status</th>
                          <th className="text-right font-medium py-4">Uso Geral</th>
                          <th className="text-right font-medium py-4 pr-5">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {coupons.map((c) => {
                          const isActive = c.status === "ativo";
                          return (
                            <tr key={c.id} className="hover:bg-accent/20 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-foreground font-mono bg-background/60 border border-border px-2.5 py-1 rounded-lg inline-block">
                                  {c.code}
                                </div>
                              </td>
                              <td className="font-semibold text-foreground">{c.discount}% OFF</td>
                              <td className="text-muted-foreground">
                                {c.min_order > 0 ? `R$ ${c.min_order}` : "Sem mínimo"}
                              </td>
                              <td>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isActive ? "bg-success/12 border-success/30 text-success" : "bg-muted/30 border-border text-muted-foreground"
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="text-right font-semibold text-foreground">{c.usage} resgates</td>
                              <td className="pr-5">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => toggleCoupon(c.id, c.status, c.code)}
                                    title={isActive ? "Pausar Cupom" : "Ativar Cupom"}
                                    className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground transition-colors cursor-pointer"
                                  >
                                    {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => deleteCoupon(c.id, c.code)}
                                    title="Remover Cupom"
                                    className="h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= TABS: TEMPLATES ================= */}
            {activeSubTab === "templates" && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Left Side: Templates List */}
                <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4 self-start">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary" /> Modelos Salvos
                    </h3>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {templates.length} modelos
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {templates.map((t, idx) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplateIndex(idx)}
                        className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-colors ${
                          selectedTemplateIndex === idx
                            ? "border-primary bg-primary/8 font-semibold"
                            : "border-border bg-background/30 hover:bg-accent/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-xs truncate">{t.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(t.id, t.name);
                          }}
                          className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-destructive rounded hover:bg-accent cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: View/Edit & Create Form */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-1.5 text-primary">
                    <Sparkles className="h-4 w-4" /> Editor e Criador de Modelos
                  </h3>

                  {selectedTemplateIndex !== null && templates[selectedTemplateIndex] ? (
                    <div className="bg-background/45 border border-border p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center border-b border-border/60 pb-2">
                        <div className="font-bold text-sm text-foreground">
                          {templates[selectedTemplateIndex].name}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Visualização do Modelo</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans p-2 bg-background/20 rounded border border-border/40">
                        {templates[selectedTemplateIndex].body}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                      Nenhum modelo selecionado. Selecione um ao lado ou crie um novo abaixo.
                    </div>
                  )}

                  {/* Form to Create New Template */}
                  <form onSubmit={handleCreateTemplate} className="border-t border-border pt-4 mt-2 space-y-4">
                    <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Criar Novo Modelo de Mensagem</div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Nome do Modelo</label>
                      <input
                        type="text"
                        required
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Ex: Oferta de Black Friday"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-muted-foreground">Corpo da Mensagem</label>
                        <span className="text-[10px] text-muted-foreground italic">Use tags como: {'{nome_cliente}'}, {'{prato_favorito}'}</span>
                      </div>
                      <textarea
                        rows={5}
                        required
                        value={templateBody}
                        onChange={(e) => setTemplateBody(e.target.value)}
                        placeholder="Digite a mensagem padrão aqui..."
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/60 transition-colors font-sans resize-none"
                      />
                      <div className="flex flex-wrap gap-1">
                        {(["nome_cliente", "prato_favorito", "cupom_desconto"] as const).map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setTemplateBody(prev => prev + ` {${tag}}`)}
                            className="text-[9.5px] font-bold border border-border rounded bg-background hover:bg-accent px-1.5 py-0.5 transition-colors cursor-pointer"
                          >
                            {`{${tag.replace("_", " ")}}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-xl bg-gradient-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
                      >
                        Adicionar Modelo 🚀
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ================= TABS: GATILHOS ================= */}
            {activeSubTab === "gatilhos" && (
              <motion.div
                key="gatilhos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Left Side: Create Trigger Form */}
                <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4 self-start">
                  <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                    <Zap className="h-4 w-4" /> Novo Gatilho Perpétuo
                  </h2>

                  <form onSubmit={handleCreateTrigger} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Nome da Automação</label>
                      <input
                        type="text"
                        required
                        value={triggerName}
                        onChange={(e) => setTriggerName(e.target.value)}
                        placeholder="Ex: Gatilho Reativação 45d"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Gatilho (Tempo Inativo)</label>
                      <select
                        value={triggerDelay}
                        onChange={(e) => setTriggerDelay(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                      >
                        <option value="15 dias">15 dias sem pedir</option>
                        <option value="30 dias">30 dias sem pedir</option>
                        <option value="45 dias">45 dias sem pedir</option>
                        <option value="No dia do aniversário">No dia do aniversário</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Horário de Disparo (Para o n8n)</label>
                      <select
                        value={triggerPeriod}
                        onChange={(e) => setTriggerPeriod(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                      >
                        <option value="qualquer">Qualquer Horário</option>
                        <option value="almoco">Disparar no Almoço</option>
                        <option value="jantar">Disparar na Janta</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Modelo de Msg</label>
                        <select
                          value={triggerTemplate}
                          onChange={(e) => setTriggerTemplate(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                        >
                          {templates.map(t => (
                            <option key={t.name} value={t.name}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Cupom de Desconto</label>
                        <select
                          value={triggerCoupon}
                          onChange={(e) => setTriggerCoupon(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                        >
                          {coupons.map(c => (
                            <option key={c.code} value={c.code}>{c.code}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
                    >
                      Ativar Automação 🚀
                    </button>
                  </form>
                </div>

                {/* Right Side: Triggers List */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-bold text-sm">Gatilhos de Disparo Ativos</h3>
                    <p className="text-xs text-muted-foreground">Estas regras rodam 24h em segundo plano avaliando sua base de clientes.</p>
                  </div>

                  <div className="p-5 space-y-4">
                    {triggers.map(t => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-border bg-background/35 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-9 w-9 rounded-xl grid place-items-center ${t.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground border border-border"}`}>
                            <Cpu className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground flex items-center gap-2">
                              {t.name}
                              <span className="text-[10px] px-2 py-0.5 bg-accent/60 text-muted-foreground rounded border border-border/80 font-mono">
                                {t.delay}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5">
                              <span>Envia: <strong>{t.template_name}</strong></span>
                              <span className="text-border">·</span>
                              <span>Cupom: <strong className="font-mono text-primary">{t.coupon_code}</strong></span>
                              <span className="text-border">·</span>
                              <span>Horário: <strong>{t.period === "almoco" ? "Almoço" : t.period === "jantar" ? "Jantar" : "Qualquer"}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {/* Toggle switch visual */}
                          <button
                            onClick={() => toggleTrigger(t.id, t.active, t.name)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                              t.active ? "bg-success" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                t.active ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => deleteTrigger(t.id, t.name)}
                            title="Excluir regra"
                            className="h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
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
