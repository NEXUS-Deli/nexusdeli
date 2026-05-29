import { S as reactExports, J as jsxRuntimeExports } from "./server-3KlhyZH_.js";
import { d as Sidebar, T as Topbar, Z as Zap } from "./Topbar-CQk6A6ur.js";
import { d as createLucideIcon, P as Plus, h as motion, b as Smartphone, t as toast, A as AnimatePresence, X } from "./router-CgDrIRmR.js";
import { B as Bot } from "./bot-C3vfAsYr.js";
import { M as MessageSquare } from "./message-square-Ds86jLUh.js";
import { C as Cpu } from "./cpu-Bc4keBOv.js";
import { C as Check } from "./check-CnhrgnkV.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./log-out-BDyVC8AH.js";
const __iconNode$1 = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
];
const Settings2 = createLucideIcon("settings-2", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ],
  ["path", { d: "M7 10v12", key: "1qc93n" }]
];
const ThumbsUp = createLucideIcon("thumbs-up", __iconNode);
const initialAgents = [{
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
}, {
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
}];
const initialFreeInstances = [{
  name: "Delivery Hub",
  number: "+55 11 98821-1102",
  status: "online"
}];
function AgentsPage() {
  const [agents, setAgents] = reactExports.useState(initialAgents);
  const [freeInstances, setFreeInstances] = reactExports.useState(initialFreeInstances);
  const [showModal, setShowModal] = reactExports.useState(false);
  const [newName, setNewName] = reactExports.useState("");
  const [newRole, setNewRole] = reactExports.useState("Atendimento Geral");
  const [newTone, setNewTone] = reactExports.useState("Amigável & Carismático");
  const [newPrompt, setNewPrompt] = reactExports.useState("Você é um atendente humanizado...");
  const [selectedColor, setSelectedColor] = reactExports.useState("from-warning to-primary");
  const [selectedInstanceIndex, setSelectedInstanceIndex] = reactExports.useState(0);
  const handleCreateAgent = (e) => {
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
    setFreeInstances(freeInstances.filter((_, idx) => idx !== selectedInstanceIndex));
    setShowModal(false);
    setNewName("");
    toast.success(`Agente de IA "${newName}" foi criado e vinculado à instância "${instance.name}"!`);
  };
  const handleDeleteAgent = (id, agentName, instanceName, number) => {
    setAgents(agents.filter((a) => a.id !== id));
    setFreeInstances([...freeInstances, {
      name: instanceName,
      number,
      status: "online"
    }]);
    toast.success(`Agente "${agentName}" foi desativado. Instância "${instanceName}" está livre novamente.`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Topbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Agentes de IA" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Seus funcionários digitais inteligentes que atendem e recuperam clientes 24 horas por dia." })
          ] }),
          freeInstances.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowModal(true), className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            " Criar Agente IA"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground bg-accent/30 border border-border rounded-xl px-3 py-2", children: "⚠️ Todas as instâncias conectadas já possuem um agente IA ativo." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Agentes Operando" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-2xl font-bold", children: [
                agents.length,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-normal text-muted-foreground", children: [
                  "de ",
                  agents.length + freeInstances.length,
                  " whatsapps"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Atendimento ativo em tempo real" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Contatos Atendidos" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 text-success" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold", children: "2.786" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-success font-medium", children: "Economia de 90h de digitação" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Conversão de Reativação" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4 text-warning" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-2xl font-bold", children: "36.5%" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Média geral dos agentes IA" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Satisfação Média" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-2xl font-bold", children: [
                "4.9 ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "/ 5.0" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Avaliações positivas dos clientes" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "h-4 w-4 text-primary" }),
            " Agentes Rodando"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: agents.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layoutId: `agent-card-${a.id}`, className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-14 w-14 rounded-2xl bg-gradient-to-br ${a.color} grid place-items-center font-bold text-lg text-white shadow-md`, children: a.name[0] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-background shadow-success-glow" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-base", children: a.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase px-2 py-0.5 bg-success/12 border border-success/20 text-success rounded-md", children: "Ativo" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: a.role }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-3.5 w-3.5 text-primary" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: a.instanceName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border", children: "|" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: a.number })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 bg-background/40 border border-border/60 rounded-xl p-2.5 mt-4 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold uppercase", children: "Conversas" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold mt-0.5", children: a.conversations.toLocaleString("pt-BR") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold uppercase", children: "Conversão" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-success mt-0.5", children: a.conversion })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold uppercase", children: "Tom de Voz" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10.5px] font-semibold text-foreground truncate mt-0.5", children: a.tone.split(" ")[0] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-bold uppercase tracking-wider", children: "Instruções do Agente" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/90 mt-1 line-clamp-3 bg-background/25 border border-border/40 p-2.5 rounded-lg italic", children: [
                  '"',
                  a.prompt,
                  '"'
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative border-t border-border mt-4 pt-4 flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toast.info(`Configurações avançadas do agente "${a.name}" abertas.`), className: "inline-flex items-center gap-1 text-xs font-semibold border border-border rounded-lg bg-background/50 hover:bg-accent px-3 py-2 cursor-pointer transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { className: "h-3.5 w-3.5" }),
                " Ajustar Prompt"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteAgent(a.id, a.name, a.instanceName, a.number), className: "inline-flex items-center gap-1 text-xs font-semibold border border-destructive/20 rounded-lg bg-background/50 text-destructive hover:bg-destructive/10 px-3 py-2 cursor-pointer transition-colors", children: "Desativar Agente" })
            ] })
          ] }, a.id)) })
        ] }),
        freeInstances.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0
        }, animate: {
          opacity: 1
        }, className: "rounded-2xl border border-dashed border-border bg-gradient-surface/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5 flex-col md:flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl bg-accent grid place-items-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm text-foreground", children: [
                'WhatsApp "',
                freeInstances[0].name,
                '" está sem Agente de IA'
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Esse número está conectado, mas as mensagens recebidas não serão respondidas automaticamente." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowModal(true), className: "inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4" }),
            " Configurar Agente de IA"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          scale: 0.95
        }, animate: {
          opacity: 1,
          scale: 1
        }, exit: {
          opacity: 0,
          scale: 0.95
        }, className: "w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-glow relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-15" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-5 w-5 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-base", children: "Configurar Novo Agente de IA" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowModal(false), className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateAgent, className: "mt-4 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome do Agente" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: newName, onChange: (e) => setNewName(e.target.value), placeholder: "Ex: Sofia, Júlia, Léo", className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Especialidade / Função" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newRole, onChange: (e) => setNewRole(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Atendimento de Cardápio", children: "Atendimento Geral" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Recuperação de Clientes", children: "Recuperação / Reativação" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pós-Venda e Suporte", children: "Pós-Venda & Suporte" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "WhatsApp de Vinculação" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: selectedInstanceIndex, onChange: (e) => setSelectedInstanceIndex(Number(e.target.value)), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60", children: freeInstances.map((inst, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: index, children: [
                    inst.name,
                    " (",
                    inst.number,
                    ")"
                  ] }, inst.name)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Tom de Voz" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newTone, onChange: (e) => setNewTone(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Amigável & Carismático", children: "Amigável & Carismático" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Rápido & Comercial", children: "Rápido & Comercial" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Formal & Cortês", children: "Formal & Cortês" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Identidade Visual (Cor do Avatar)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3", children: [{
                  color: "from-primary to-warning",
                  label: "Vermelho/Laranja"
                }, {
                  color: "from-success to-primary",
                  label: "Verde/Vermelho"
                }, {
                  color: "from-warning to-primary",
                  label: "Laranja/Vermelho"
                }, {
                  color: "from-blue-500 to-indigo-600",
                  label: "Azul"
                }].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSelectedColor(t.color), className: `h-9 w-9 rounded-xl bg-gradient-to-br ${t.color} border-2 transition-transform cursor-pointer grid place-items-center ${selectedColor === t.color ? "border-foreground scale-105 shadow-glow" : "border-transparent hover:scale-102"}`, children: selectedColor === t.color && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-white" }) }, t.color)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Prompt de Instruções Base (Personalidade da IA)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { rows: 4, required: true, value: newPrompt, onChange: (e) => setNewPrompt(e.target.value), className: "w-full bg-background border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/60 font-sans resize-none" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2.5 pt-2 border-t border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowModal(false), className: "rounded-xl border border-border bg-background hover:bg-accent px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer", children: "Cancelar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "rounded-xl bg-gradient-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: "Ativar Funcionário Digital 🚀" })
              ] })
            ] })
          ] })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  AgentsPage as component
};
