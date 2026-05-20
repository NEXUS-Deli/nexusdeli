import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import { 
  Bot, 
  Smartphone, 
  Settings2, 
  MessageSquare, 
  Sparkles, 
  Cpu, 
  ThumbsUp, 
  UserCheck, 
  Plus, 
  X, 
  Check, 
  Smile, 
  Zap 
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/agentes-ia")({
  component: AgentsPage,
});

// Initial active agents linked to instances
const initialAgents = [
  { 
    id: 1, 
    name: "Sofia", 
    role: "Recuperação de Clientes", 
    instanceName: "Loja Centro", 
    number: "+55 11 99821-4400", 
    status: "online", 
    conversations: 1284, 
    conversion: "32%", 
    tone: "Amigável & Persuasivo", 
    color: "from-primary to-warning",
    prompt: "Você é a Sofia, assistente virtual humanizada da Nexus Deli. Seu objetivo é fazer clientes inativos voltarem a comprar. Seja carismática, use emojis moderadamente, ofereça cupons com entusiasmo e tire dúvidas sobre o cardápio se necessário."
  },
  { 
    id: 2, 
    name: "Léo", 
    role: "Atendimento e Vendas", 
    instanceName: "Loja Zona Sul", 
    number: "+55 11 99432-8821", 
    status: "online", 
    conversations: 962, 
    conversion: "41%", 
    tone: "Rápido & Comercial", 
    color: "from-success to-primary",
    prompt: "Você é o Léo, assistente comercial ágil da Nexus Deli. Focado em tirar dúvidas de cardápio, guiar o cliente até o fechamento do carrinho e oferecer combos adicionais (bebidas e sobremesas) para aumentar o ticket médio."
  }
];

// Instances that DO NOT have an agent yet
const initialFreeInstances = [
  { name: "Delivery Hub", number: "+55 11 98821-1102", status: "online" }
];

function AgentsPage() {
  const [agents, setAgents] = useState(initialAgents);
  const [freeInstances, setFreeInstances] = useState(initialFreeInstances);
  
  // Modal / Creator State
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Atendimento Geral");
  const [newTone, setNewTone] = useState("Amigável & Carismático");
  const [newPrompt, setNewPrompt] = useState("Você é um atendente humanizado...");
  const [selectedColor, setSelectedColor] = useState("from-warning to-primary");
  const [selectedInstanceIndex, setSelectedInstanceIndex] = useState(0);

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Por favor, digite o nome do agente.");
      return;
    }

    if (freeInstances.length === 0) {
      toast.error("Não há instâncias do WhatsApp disponíveis para criar um novo agente.");
      return;
    }

    const instance = freeInstances[selectedInstanceIndex];

    const newAgent = {
      id: agents.length + 1,
      name: newName,
      role: newRole,
      instanceName: instance.name,
      number: instance.number,
      status: "online",
      conversations: 0,
      conversion: "0%",
      tone: newTone,
      color: selectedColor,
      prompt: newPrompt
    };

    setAgents([...agents, newAgent]);
    // Remove the instance from the free list (since it now has an agent)
    setFreeInstances(freeInstances.filter((_, idx) => idx !== selectedInstanceIndex));
    
    setShowModal(false);
    setNewName("");
    toast.success(`Agente de IA "${newName}" foi criado e vinculado à instância "${instance.name}"!`);
  };

  const handleDeleteAgent = (id: number, agentName: string, instanceName: string, number: string) => {
    setAgents(agents.filter(a => a.id !== id));
    // Release the instance back to the free list
    setFreeInstances([...freeInstances, { name: instanceName, number, status: "online" }]);
    toast.success(`Agente "${agentName}" foi desativado. Instância "${instanceName}" está livre novamente.`);
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
              <h1 className="text-2xl font-bold tracking-tight">Agentes de IA</h1>
              <p className="text-sm text-muted-foreground">
                Seus funcionários digitais inteligentes que atendem e recuperam clientes 24 horas por dia.
              </p>
            </div>
            {freeInstances.length > 0 ? (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Criar Agente IA
              </button>
            ) : (
              <div className="text-xs text-muted-foreground bg-accent/30 border border-border rounded-xl px-3 py-2">
                ⚠️ Todas as instâncias conectadas já possuem um agente IA ativo.
              </div>
            )}
          </div>

          {/* AI Stats KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Agentes Operando</span>
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 text-2xl font-bold">{agents.length} <span className="text-xs font-normal text-muted-foreground">de {agents.length + freeInstances.length} whatsapps</span></div>
                <div className="mt-1 text-[10px] text-muted-foreground">Atendimento ativo em tempo real</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Contatos Atendidos</span>
                  <MessageSquare className="h-4 w-4 text-success" />
                </div>
                <div className="mt-3 text-2xl font-bold">2.786</div>
                <div className="mt-1 text-[10px] text-success font-medium">Economia de 90h de digitação</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Conversão de Reativação</span>
                  <Zap className="h-4 w-4 text-warning" />
                </div>
                <div className="mt-3 text-2xl font-bold">36.5%</div>
                <div className="mt-1 text-[10px] text-muted-foreground">Média geral dos agentes IA</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Satisfação Média</span>
                  <ThumbsUp className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 text-2xl font-bold">4.9 <span className="text-xs text-muted-foreground">/ 5.0</span></div>
                <div className="mt-1 text-[10px] text-muted-foreground">Avaliações positivas dos clientes</div>
              </div>
            </div>
          </section>

          {/* Active Agents Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Agentes Rodando
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {agents.map(a => (
                <motion.div
                  key={a.id}
                  layoutId={`agent-card-${a.id}`}
                  className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="grid-bg absolute inset-0 opacity-10" />
                  
                  <div className="relative">
                    {/* Card Top */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${a.color} grid place-items-center font-bold text-lg text-white shadow-md`}>
                          {a.name[0]}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-background shadow-success-glow" />
                      </div>
                      
                      {/* Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base">{a.name}</h3>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-success/12 border border-success/20 text-success rounded-md">
                            Ativo
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.role}</p>
                        
                        <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground">
                          <Smartphone className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold text-foreground">{a.instanceName}</span>
                          <span className="text-border">|</span>
                          <span className="font-mono">{a.number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-2 bg-background/40 border border-border/60 rounded-xl p-2.5 mt-4 text-center">
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Conversas</div>
                        <div className="text-sm font-bold mt-0.5">{a.conversations.toLocaleString("pt-BR")}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Conversão</div>
                        <div className="text-sm font-bold text-success mt-0.5">{a.conversion}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Tom de Voz</div>
                        <div className="text-[10.5px] font-semibold text-foreground truncate mt-0.5">{a.tone.split(" ")[0]}</div>
                      </div>
                    </div>

                    {/* Instruction Summary */}
                    <div className="mt-4">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Instruções do Agente</div>
                      <p className="text-xs text-muted-foreground/90 mt-1 line-clamp-3 bg-background/25 border border-border/40 p-2.5 rounded-lg italic">
                        "{a.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative border-t border-border mt-4 pt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => toast.info(`Configurações avançadas do agente "${a.name}" abertas.`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold border border-border rounded-lg bg-background/50 hover:bg-accent px-3 py-2 cursor-pointer transition-colors"
                    >
                      <Settings2 className="h-3.5 w-3.5" /> Ajustar Prompt
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(a.id, a.name, a.instanceName, a.number)}
                      className="inline-flex items-center gap-1 text-xs font-semibold border border-destructive/20 rounded-lg bg-background/50 text-destructive hover:bg-destructive/10 px-3 py-2 cursor-pointer transition-colors"
                    >
                      Desativar Agente
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Connected numbers without agents */}
          {freeInstances.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-border bg-gradient-surface/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left"
            >
              <div className="flex items-center gap-3.5 flex-col md:flex-row">
                <div className="h-12 w-12 rounded-2xl bg-accent grid place-items-center text-muted-foreground">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">WhatsApp "{freeInstances[0].name}" está sem Agente de IA</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Esse número está conectado, mas as mensagens recebidas não serão respondidas automaticamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <Bot className="h-4 w-4" /> Configurar Agente de IA
              </button>
            </motion.div>
          )}

          {/* Creation Modal (Glassmorphic Backdrop overlay) */}
          <AnimatePresence>
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-glow relative overflow-hidden"
                >
                  <div className="grid-bg absolute inset-0 opacity-15" />
                  
                  <div className="relative">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-base">Configurar Novo Agente de IA</h3>
                      </div>
                      <button
                        onClick={() => setShowModal(false)}
                        className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Modal Form */}
                    <form onSubmit={handleCreateAgent} className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Nome do Agente</label>
                          <input
                            type="text"
                            required
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ex: Sofia, Júlia, Léo"
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Especialidade / Função</label>
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60"
                          >
                            <option value="Atendimento de Cardápio">Atendimento Geral</option>
                            <option value="Recuperação de Clientes">Recuperação / Reativação</option>
                            <option value="Pós-Venda e Suporte">Pós-Venda & Suporte</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">WhatsApp de Vinculação</label>
                          <select
                            value={selectedInstanceIndex}
                            onChange={(e) => setSelectedInstanceIndex(Number(e.target.value))}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60"
                          >
                            {freeInstances.map((inst, index) => (
                              <option key={inst.name} value={index}>
                                {inst.name} ({inst.number})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Tom de Voz</label>
                          <select
                            value={newTone}
                            onChange={(e) => setNewTone(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60"
                          >
                            <option value="Amigável & Carismático">Amigável & Carismático</option>
                            <option value="Rápido & Comercial">Rápido & Comercial</option>
                            <option value="Formal & Cortês">Formal & Cortês</option>
                          </select>
                        </div>
                      </div>

                      {/* Avatar Theme Selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Identidade Visual (Cor do Avatar)</label>
                        <div className="flex gap-3">
                          {[
                            { color: "from-primary to-warning", label: "Vermelho/Laranja" },
                            { color: "from-success to-primary", label: "Verde/Vermelho" },
                            { color: "from-warning to-primary", label: "Laranja/Vermelho" },
                            { color: "from-blue-500 to-indigo-600", label: "Azul" }
                          ].map(t => (
                            <button
                              key={t.color}
                              type="button"
                              onClick={() => setSelectedColor(t.color)}
                              className={`h-9 w-9 rounded-xl bg-gradient-to-br ${t.color} border-2 transition-transform cursor-pointer grid place-items-center ${
                                selectedColor === t.color ? "border-foreground scale-105 shadow-glow" : "border-transparent hover:scale-102"
                              }`}
                            >
                              {selectedColor === t.color && <Check className="h-4 w-4 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Prompt Editor */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Prompt de Instruções Base (Personalidade da IA)</label>
                        <textarea
                          rows={4}
                          required
                          value={newPrompt}
                          onChange={(e) => setNewPrompt(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/60 font-sans resize-none"
                        />
                      </div>

                      {/* Modal Actions */}
                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="rounded-xl border border-border bg-background hover:bg-accent px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="rounded-xl bg-gradient-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
                        >
                          Ativar Funcionário Digital 🚀
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
