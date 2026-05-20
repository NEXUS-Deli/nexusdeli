import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

// Mock Initial Coupons
const initialCoupons = [
  { id: 1, code: "RECONECTA15", discount: 15, minOrder: 50, status: "ativo", usage: 142 },
  { id: 2, code: "VOLTA5", discount: 5, minOrder: 30, status: "ativo", usage: 89 },
  { id: 3, code: "VIP20", discount: 20, minOrder: 80, status: "ativo", usage: 34 },
  { id: 4, code: "FIMDESEMANA", discount: 10, minOrder: 40, status: "pausado", usage: 12 },
];

// Mock Initial Message Templates
const initialTemplates = [
  { id: 1, name: "Reativação 15 dias", body: "Olá, {nome_cliente}! Tudo bem? 🍕\n\nNotamos que já faz 15 dias desde o seu último pedido de {prato_favorito}.\n\nPara matar a saudade, que tal pedir hoje mesmo? Preparamos um presente: 5% de desconto usando o cupom {cupom_desconto}!\n\nAproveite!" },
  { id: 2, name: "Reativação Crítica 30 dias", body: "Oi, {nome_cliente}! Que saudade! ❤️\n\nFaz 30 dias que você não aproveita nossas delícias. Para comemorar seu retorno, liberamos 15% OFF no seu prato favorito ({prato_favorito})!\n\nUse o cupom {cupom_desconto} nas próximas 24 horas!\n\nPeça por aqui!" },
  { id: 3, name: "Aniversariante Especial", body: "Parabéns, {nome_cliente}! 🎂🎉\n\nHoje é seu dia especial e a Nexus Deli quer comemorar com você! Preparamos um cupom de 20% de desconto sem pedido mínimo para você aproveitar o seu prato favorito ({prato_favorito})!\n\nUse: {cupom_desconto}\n\nTenha um dia maravilhoso!" },
];

// Mock Triggers (Automations Rules)
const initialTriggers = [
  { id: 1, name: "Reativação Semanal (15 dias inativo)", delay: "15 dias", templateName: "Reativação 15 dias", couponCode: "VOLTA5", active: true },
  { id: 2, name: "Recuperação Crítica (30 dias inativo)", delay: "30 dias", templateName: "Reativação Crítica 30 dias", couponCode: "RECONECTA15", active: true },
  { id: 3, name: "Aniversário do Cliente", delay: "No dia do aniversário", templateName: "Aniversariante Especial", couponCode: "VIP20", active: true },
];

function PromocoesPage() {
  const [activeSubTab, setActiveSubTab] = useState<"cupons" | "templates" | "gatilhos">("cupons");

  // Coupons States
  const [coupons, setCoupons] = useState(initialCoupons);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("");
  
  // Templates States
  const [templates, setTemplates] = useState(initialTemplates);
  const [templateName, setTemplateName] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(0);

  // Triggers States
  const [triggers, setTriggers] = useState(initialTriggers);
  const [triggerName, setTriggerName] = useState("");
  const [triggerDelay, setTriggerDelay] = useState("15 dias");
  const [triggerTemplate, setTriggerTemplate] = useState("Reativação 15 dias");
  const [triggerCoupon, setTriggerCoupon] = useState("VOLTA5");

  // Create Coupon
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponDiscount) {
      toast.error("Preencha todos os campos do cupom.");
      return;
    }

    const newCoupon = {
      id: coupons.length + 1,
      code: couponCode.toUpperCase().replace(/\s+/g, ""),
      discount: Number(couponDiscount),
      minOrder: Number(couponMinOrder) || 0,
      status: "ativo",
      usage: 0
    };

    setCoupons([...coupons, newCoupon]);
    setCouponCode("");
    setCouponDiscount("");
    setCouponMinOrder("");
    toast.success(`Cupom "${newCoupon.code}" criado com sucesso!`);
  };

  // Toggle Coupon Status
  const toggleCoupon = (id: number) => {
    setCoupons(coupons.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "ativo" ? "pausado" : "ativo";
        toast.info(`Cupom "${c.code}" foi ${nextStatus === "pausado" ? "pausado" : "ativado"}.`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const deleteCoupon = (id: number, code: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast.success(`Cupom "${code}" removido.`);
  };

  // Create Template
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || !templateBody.trim()) {
      toast.error("Por favor, preencha o nome e o corpo do modelo.");
      return;
    }

    const newTemplate = {
      id: templates.length + 1,
      name: templateName,
      body: templateBody
    };

    setTemplates([...templates, newTemplate]);
    setSelectedTemplateIndex(templates.length); // Select new template
    setTemplateName("");
    setTemplateBody("");
    toast.success(`Modelo "${newTemplate.name}" adicionado à biblioteca.`);
  };

  const deleteTemplate = (id: number, name: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplateIndex !== null && selectedTemplateIndex >= templates.length - 1) {
      setSelectedTemplateIndex(0);
    }
    toast.success(`Modelo "${name}" removido.`);
  };

  // Create Trigger
  const handleCreateTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerName.trim()) {
      toast.error("Digite o nome da automação.");
      return;
    }

    const newTrigger = {
      id: triggers.length + 1,
      name: triggerName,
      delay: triggerDelay,
      templateName: triggerTemplate,
      couponCode: triggerCoupon,
      active: true
    };

    setTriggers([...triggers, newTrigger]);
    setTriggerName("");
    toast.success(`Automação "${newTrigger.name}" configurada e ativada!`);
  };

  // Toggle Trigger Status
  const toggleTrigger = (id: number) => {
    setTriggers(triggers.map(t => {
      if (t.id === id) {
        const nextState = !t.active;
        toast.success(`Automação "${t.name}" foi ${nextState ? "ativada" : "desativada"}.`);
        return { ...t, active: nextState };
      }
      return t;
    }));
  };

  const deleteTrigger = (id: number, name: string) => {
    setTriggers(triggers.filter(t => t.id !== id));
    toast.success(`Automação "${name}" removida.`);
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
                                {c.minOrder > 0 ? `R$ ${c.minOrder.toFixed(2)}` : "Sem mínimo"}
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
                                    onClick={() => toggleCoupon(c.id)}
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
                              <span>Envia: <strong>{t.templateName}</strong></span>
                              <span className="text-border">·</span>
                              <span>Cupom: <strong className="font-mono text-primary">{t.couponCode}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {/* Toggle switch visual */}
                          <button
                            onClick={() => toggleTrigger(t.id)}
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
