import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { S as Sidebar, T as Topbar } from "./Topbar-jXAYa-6f.js";
import { QrCode, ShieldAlert, CheckCircle2, Smartphone, RefreshCw, Loader2, Wifi, WifiOff, Sparkles, Trash2, X, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";
import { s as supabase } from "./router-BotcCoyH.js";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "zod";
const BASE_URL = "https://nexus-360.uazapi.com";
const ADMIN_TOKEN = "WxnczvZEI03AcXqL9Ty2POdCO6YWCg6A1otBW5qOtObOAdOAu6";
function adminHeaders() {
  return {
    "Content-Type": "application/json",
    admintoken: ADMIN_TOKEN
  };
}
function instanceHeaders(token) {
  return {
    "Content-Type": "application/json",
    token
  };
}
async function createInstance(name) {
  const res = await fetch(`${BASE_URL}/instance/create`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({ name })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `Erro ao criar instância (${res.status})`);
  }
  return res.json();
}
async function connectInstance(instanceToken, options) {
  const body = {};
  if (options?.phone) body.phone = options.phone;
  if (options?.browser) body.browser = options.browser;
  const res = await fetch(`${BASE_URL}/instance/connect`, {
    method: "POST",
    headers: instanceHeaders(instanceToken),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `Erro ao conectar instância (${res.status})`);
  }
  return res.json();
}
async function getInstanceStatus(instanceToken) {
  const res = await fetch(`${BASE_URL}/instance/status`, {
    method: "GET",
    headers: instanceHeaders(instanceToken)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `Erro ao buscar status (${res.status})`);
  }
  return res.json();
}
async function deleteInstance(instanceToken) {
  const res = await fetch(`${BASE_URL}/instance`, {
    method: "DELETE",
    headers: instanceHeaders(instanceToken)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `Erro ao deletar instância (${res.status})`);
  }
  return res.json();
}
const POLL_INTERVAL = 3e3;
function WhatsappPage() {
  const [instances, setInstances] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isDbError, setIsDbError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [modalStep, setModalStep] = useState("form");
  const [modalError, setModalError] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [newInstanceToken, setNewInstanceToken] = useState("");
  const pollingRef = useRef(null);
  const getDeliveryId = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      return user?.id || "00000000-0000-0000-0000-000000000000";
    } catch {
      return "00000000-0000-0000-0000-000000000000";
    }
  };
  const loadInstances = useCallback(async () => {
    setIsLoadingList(true);
    setIsDbError(false);
    try {
      const deliveryId = await getDeliveryId();
      const {
        data: dbInstances,
        error
      } = await supabase.from("whatsapp_instances").select("*").eq("delivery_id", deliveryId).order("created_at", {
        ascending: false
      });
      if (error) {
        throw error;
      }
      if (!dbInstances || dbInstances.length === 0) {
        setInstances([]);
        setIsLoadingList(false);
        return;
      }
      const rowsWithStatus = [];
      for (const dbInst of dbInstances) {
        try {
          const uazStatus = await getInstanceStatus(dbInst.token);
          rowsWithStatus.push({
            id: dbInst.id,
            name: dbInst.name,
            token: dbInst.token,
            localToken: dbInst.token,
            status: uazStatus.instance?.status ?? "disconnected",
            profileName: uazStatus.instance?.profileName ?? "",
            profilePicUrl: uazStatus.instance?.profilePicUrl ?? "",
            isBusiness: uazStatus.instance?.isBusiness ?? false,
            plataform: uazStatus.instance?.plataform ?? ""
          });
        } catch (uazErr) {
          console.warn(`Erro ao consultar status da instância ${dbInst.id} na UAZAPI:`, uazErr);
          rowsWithStatus.push({
            id: dbInst.id,
            name: dbInst.name,
            token: dbInst.token,
            localToken: dbInst.token,
            status: "disconnected"
          });
        }
      }
      setInstances(rowsWithStatus);
    } catch (err) {
      console.error("Erro ao carregar instâncias do Supabase:", err);
      if (err?.code === "42P01" || err?.message?.includes("relation")) {
        setIsDbError(true);
      } else {
        toast.error("Erro ao conectar com o banco de dados do Supabase.");
      }
      setInstances([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);
  useEffect(() => {
    loadInstances();
  }, [loadInstances]);
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);
  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }
  function closeModal() {
    stopPolling();
    setShowModal(false);
    setInstanceName("");
    setModalStep("form");
    setModalError("");
    setQrCodeBase64("");
    setNewInstanceToken("");
  }
  async function handleStartFlow(e) {
    e.preventDefault();
    if (!instanceName.trim()) {
      toast.error("Digite um nome para a instância.");
      return;
    }
    setModalStep("creating");
    setModalError("");
    try {
      const deliveryId = await getDeliveryId();
      const created = await createInstance(instanceName.trim());
      const token = created.token;
      setNewInstanceToken(token);
      const {
        error: dbError
      } = await supabase.from("whatsapp_instances").insert([{
        id: created.instance.id,
        name: instanceName.trim(),
        token,
        delivery_id: deliveryId,
        status: "disconnected"
      }]);
      if (dbError) {
        try {
          await deleteInstance(token);
        } catch {
        }
        throw new Error(`Erro ao salvar instância no Supabase: ${dbError.message}`);
      }
      await connectInstance(token, {
        browser: "auto"
      });
      const statusRes = await getInstanceStatus(token);
      if (statusRes.instance?.qrcode) {
        setQrCodeBase64(statusRes.instance.qrcode);
        setModalStep("qrcode");
      } else {
        setModalStep("qrcode");
      }
      pollingRef.current = setInterval(async () => {
        try {
          const poll = await getInstanceStatus(token);
          if (poll.instance?.qrcode) {
            setQrCodeBase64(poll.instance.qrcode);
          }
          if (poll.status?.connected && poll.status?.loggedIn) {
            stopPolling();
            setModalStep("connected");
            await supabase.from("whatsapp_instances").update({
              status: "connected"
            }).eq("id", poll.instance.id);
            const newRow = {
              ...poll.instance,
              localToken: token
            };
            setInstances((prev) => [newRow, ...prev]);
            toast.success(`WhatsApp "${instanceName}" conectado com sucesso! ✅`);
            setTimeout(() => closeModal(), 2e3);
          }
        } catch (pollErr) {
          console.warn("Polling error:", pollErr);
        }
      }, POLL_INTERVAL);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setModalStep("error");
      setModalError(msg);
      toast.error(`Falha ao conectar: ${msg}`);
    }
  }
  async function handleDeleteInstance(inst) {
    const confirmed = window.confirm(`Tem certeza que deseja remover permanentemente a instância "${inst.name}"?`);
    if (!confirmed) return;
    try {
      const deliveryId = await getDeliveryId();
      const {
        error: dbError
      } = await supabase.from("whatsapp_instances").delete().eq("id", inst.id).eq("delivery_id", deliveryId);
      if (dbError) {
        throw new Error(`Erro ao remover do banco de dados: ${dbError.message}`);
      }
      try {
        await deleteInstance(inst.localToken);
      } catch (uazErr) {
        console.warn("Falha ao deletar do UAZAPI, removendo apenas localmente:", uazErr);
      }
      setInstances((prev) => prev.filter((i) => i.id !== inst.id));
      toast.success(`Instância "${inst.name}" removida com sucesso.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao deletar";
      toast.error(msg);
    }
  }
  async function handleRefreshInstance(inst) {
    toast.promise((async () => {
      const poll = await getInstanceStatus(inst.localToken);
      await supabase.from("whatsapp_instances").update({
        status: poll.instance?.status ?? "disconnected"
      }).eq("id", inst.id);
      setInstances((prev) => prev.map((i) => i.id === inst.id ? {
        ...i,
        ...poll.instance,
        localToken: inst.localToken
      } : i));
    })(), {
      loading: `Sincronizando "${inst.name}"...`,
      success: `"${inst.name}" atualizado!`,
      error: "Erro ao sincronizar. Verifique o token."
    });
  }
  const connectedCount = instances.filter((i) => i.status === "connected").length;
  const totalInstances = instances.length;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(Sidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsx(Topbar, {}),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "WhatsApp" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Gerenciamento seguro de conexões integradas à sua conta." })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => setShowModal(true), className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: [
            /* @__PURE__ */ jsx(QrCode, { className: "h-4 w-4" }),
            " Novo QR Code"
          ] })
        ] }),
        isDbError && /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(ShieldAlert, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5 sm:mt-0" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-bold text-destructive", children: "Tabela no Supabase Ausente!" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 leading-relaxed", children: [
              "A tabela ",
              /* @__PURE__ */ jsx("code", { children: "whatsapp_instances" }),
              " não foi encontrada no seu banco de dados do Supabase. Por favor, crie-a no SQL Editor do painel do Supabase."
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-15" }),
          /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold uppercase tracking-wider text-muted-foreground", children: "Motor de Envio" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-lg font-bold flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-success" }),
                "Nexus Delí",
                /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 bg-success/12 border border-success/20 text-success rounded-full font-semibold", children: "Servidor Ativo" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed", children: "As conexões são cadastradas e gerenciadas de forma totalmente segura." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 bg-background/50 border border-border p-3 rounded-xl", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-center px-3", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-semibold uppercase", children: "Conectadas" }),
                /* @__PURE__ */ jsx("div", { className: "text-xl font-bold mt-0.5 text-success", children: connectedCount })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "h-8 w-px bg-border" }),
              /* @__PURE__ */ jsxs("div", { className: "text-center px-3", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-semibold uppercase", children: "Total" }),
                /* @__PURE__ */ jsx("div", { className: "text-xl font-bold mt-0.5", children: totalInstances })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-base font-bold flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Smartphone, { className: "h-4 w-4 text-primary" }),
              " Instâncias do WhatsApp"
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: loadInstances, title: "Recarregar lista", className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${isLoadingList ? "animate-spin" : ""}` }) })
          ] }),
          isLoadingList ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Buscando instâncias no Supabase..." })
          ] }) : instances.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-dashed border-border p-12 flex flex-col items-center justify-center gap-3 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl bg-accent grid place-items-center", children: /* @__PURE__ */ jsx(Smartphone, { className: "h-6 w-6 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-sm text-foreground", children: "Nenhuma instância cadastrada" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                "Clique em ",
                /* @__PURE__ */ jsx("strong", { children: '"Novo QR Code"' }),
                " para configurar sua primeira conexão integrada de WhatsApp."
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: instances.map((inst) => {
            const isConnected = inst.status === "connected";
            const isConnecting = inst.status === "connecting";
            return /* @__PURE__ */ jsxs(motion.div, { layout: true, initial: {
              opacity: 0,
              y: 10
            }, animate: {
              opacity: 1,
              y: 0
            }, className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card flex flex-col justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
                  /* @__PURE__ */ jsx("div", { className: `h-11 w-11 rounded-xl grid place-items-center ${isConnected ? "bg-success/15 text-success" : isConnecting ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`, children: isConnected ? /* @__PURE__ */ jsx(Wifi, { className: "h-6 w-6" }) : isConnecting ? /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin" }) : /* @__PURE__ */ jsx(WifiOff, { className: "h-6 w-6" }) }),
                  /* @__PURE__ */ jsx("span", { className: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${isConnected ? "bg-success/12 border-success/30 text-success" : isConnecting ? "bg-warning/12 border-warning/30 text-warning" : "bg-destructive/12 border-destructive/30 text-destructive"}`, children: inst.status === "connected" ? "Conectado" : inst.status === "connecting" ? "Conectando..." : "Desconectado" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-bold text-base text-foreground", children: inst.name }),
                  inst.profileName && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-medium mt-0.5", children: inst.profileName }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-mono text-muted-foreground/70 mt-1 break-all", children: [
                    "ID: ",
                    inst.id
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[9px] text-muted-foreground font-semibold uppercase", children: "Tipo" }),
                    /* @__PURE__ */ jsxs("div", { className: "text-xs font-bold text-foreground mt-0.5 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-primary" }),
                      inst.isBusiness ? "Business" : "Pessoal"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[9px] text-muted-foreground font-semibold uppercase", children: "Plataforma" }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-foreground mt-0.5", children: inst.plataform ?? "—" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "border-t border-border mt-4 pt-4 flex items-center justify-end gap-1.5", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => handleRefreshInstance(inst), title: "Atualizar status", className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteInstance(inst), title: "Deletar instância", className: "h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive hover:text-destructive-foreground transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
              ] })
            ] }, inst.id);
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxs(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, exit: {
      opacity: 0,
      scale: 0.95
    }, className: "w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-glow relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-15" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(QrCode, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-base", children: "Nova Instância WhatsApp" })
          ] }),
          modalStep !== "creating" && /* @__PURE__ */ jsx("button", { onClick: closeModal, className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
        ] }),
        modalStep === "form" && /* @__PURE__ */ jsxs("form", { onSubmit: handleStartFlow, className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome da Instância (Identificação)" }),
            /* @__PURE__ */ jsx("input", { type: "text", required: true, value: instanceName, onChange: (e) => setInstanceName(e.target.value), placeholder: "Ex: Loja Centro, Delivery Hub", className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-background/45 border border-border/80 rounded-xl p-3.5 text-xs text-muted-foreground flex gap-2", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 shrink-0 text-warning mt-0.5" }),
            /* @__PURE__ */ jsxs("p", { className: "leading-relaxed", children: [
              "Use ",
              /* @__PURE__ */ jsx("strong", { children: "contas WhatsApp Business" }),
              ". Números recém-adquiridos sem aquecimento prévio podem ser instáveis ou banidos."
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: "Gerar QR Code via Nexus Deli 🚀" })
        ] }),
        modalStep === "creating" && /* @__PURE__ */ jsxs("div", { className: "mt-8 py-10 flex flex-col items-center justify-center gap-4 text-center", children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-10 w-10 text-primary animate-spin" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: "Criando conexão no Nexus Deli..." }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Aguarde enquanto conectamos ao servidor e geramos o seu QR Code de pareamento." })
          ] })
        ] }),
        modalStep === "qrcode" && /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-5 flex flex-col items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-background/45 border border-border rounded-xl p-3 text-xs text-center text-muted-foreground max-w-xs leading-relaxed", children: [
            "Abra o ",
            /* @__PURE__ */ jsx("strong", { children: "WhatsApp" }),
            " > ",
            /* @__PURE__ */ jsx("strong", { children: "Aparelhos conectados" }),
            " >",
            " ",
            /* @__PURE__ */ jsx("strong", { children: "Conectar um aparelho" }),
            " e escaneie o QR Code abaixo."
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-3 bg-white border-4 border-white rounded-2xl shadow-glow", children: qrCodeBase64 ? /* @__PURE__ */ jsx("img", { src: qrCodeBase64.startsWith("data:") ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`, alt: "QR Code de Pareamento Nexus Deli", className: "h-52 w-52 object-contain" }) : /* @__PURE__ */ jsxs("div", { className: "h-52 w-52 flex flex-col items-center justify-center gap-3 text-gray-400", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-10 w-10 animate-spin text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold text-center", children: "Aguardando QR Code da API..." })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold text-primary animate-pulse flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
            "Verificando conexão automaticamente a cada ",
            POLL_INTERVAL / 1e3,
            "s..."
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground text-center", children: "O QR Code expira em 2 minutos. Um novo será gerado automaticamente." }),
          /* @__PURE__ */ jsx("button", { onClick: closeModal, className: "text-xs text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2", children: "Cancelar e fechar" })
        ] }),
        modalStep === "connected" && /* @__PURE__ */ jsxs("div", { className: "mt-8 py-10 flex flex-col items-center justify-center gap-4 text-center", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-14 w-14 text-success drop-shadow-[0_0_12px_oklch(0.62_0.19_145)]" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-foreground", children: "WhatsApp Conectado! ✅" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              "A instância ",
              /* @__PURE__ */ jsxs("strong", { children: [
                '"',
                instanceName,
                '"'
              ] }),
              " está online e pronta para disparos."
            ] })
          ] })
        ] }),
        modalStep === "error" && /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 py-6 text-center", children: [
            /* @__PURE__ */ jsx(ShieldAlert, { className: "h-12 w-12 text-destructive" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-bold text-sm text-foreground", children: "Falha ao criar instância" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive/80 mt-1 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2", children: modalError })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-background/45 border border-border/80 rounded-xl p-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Verifique:" }),
            /* @__PURE__ */ jsxs("ul", { className: "mt-1.5 space-y-1 list-disc list-inside", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                "As chaves de acesso no arquivo ",
                /* @__PURE__ */ jsx("code", { children: ".env" })
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                "Se o endereço do servidor no ",
                /* @__PURE__ */ jsx("code", { children: ".env" }),
                " está correto"
              ] }),
              /* @__PURE__ */ jsx("li", { children: "Se a sua conexão de rede local com o servidor está ativa" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setModalStep("form"), className: "w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: "Tentar Novamente" })
        ] })
      ] })
    ] }) }) })
  ] });
}
export {
  WhatsappPage as component
};
