import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import {
  Smartphone,
  Wifi,
  WifiOff,
  QrCode,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  X,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  createInstance,
  connectInstance,
  getInstanceStatus,
  deleteInstance,
  type UazapiInstance,
} from "@/services/uazapi";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";

export const Route = createFileRoute("/whatsapp")({
  component: WhatsappPage,
});

// ─── QR Code polling interval (ms) ────────────────────────────────────────────
const POLL_INTERVAL = 3000;

type ModalStep = "form" | "creating" | "qrcode" | "connected" | "error";

interface InstanceRow extends UazapiInstance {
  localToken: string;
}

function WhatsappPage() {
  const [instances, setInstances] = useState<InstanceRow[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isDbError, setIsDbError] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [instanceName, setInstanceName] = useState("");
  const [modalStep, setModalStep] = useState<ModalStep>("form");
  const [modalError, setModalError] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [newInstanceToken, setNewInstanceToken] = useState<string>("");

  // Polling ref para parar quando necessário
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);



  // ─── Carregar instâncias cadastradas no Supabase e buscar status real na UAZAPI ───
  const loadInstances = useCallback(async () => {
    setIsLoadingList(true);
    setIsDbError(false);
    try {
      const companyId = await getCompanyId();

      // 1. Busca no banco de dados local (Supabase) filtrando estritamente pelo company_id (Isolamento Multi-tenant)
      const { data: dbInstances, error } = await supabase
        .from("whatsapp_instances")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (!dbInstances || dbInstances.length === 0) {
        setInstances([]);
        setIsLoadingList(false);
        return;
      }

      const rowsWithStatus: InstanceRow[] = [];

      // 2. Busca o status em tempo real na UAZAPI para cada instância cadastrada no Supabase
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
            plataform: uazStatus.instance?.plataform ?? "",
          });
        } catch (uazErr) {
          console.warn(`Erro ao consultar status da instância ${dbInst.id} na UAZAPI:`, uazErr);
          // Fallback se a instância estiver offline ou com token corrompido
          rowsWithStatus.push({
            id: dbInst.id,
            name: dbInst.name,
            token: dbInst.token,
            localToken: dbInst.token,
            status: "disconnected",
          });
        }
      }

      setInstances(rowsWithStatus);
    } catch (err: any) {
      console.error("Erro ao carregar instâncias do Supabase:", err);
      // Código de erro PostgreSQL para relação (tabela) não existente é 42P01
      if (err?.code === "42P01" || err?.message?.includes("relation")) {
        setIsDbError(true);
      } else {
        toast.error(`Erro ao conectar com o Supabase: ${err?.message || err}`);
      }
      setInstances([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  // ─── Cleanup polling ao desmontar ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ─── Parar polling ──────────────────────────────────────────────────────────
  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  // ─── Fechar Modal e limpar ──────────────────────────────────────────────────
  function closeModal() {
    stopPolling();
    setShowModal(false);
    setInstanceName("");
    setModalStep("form");
    setModalError("");
    setQrCodeBase64("");
    setNewInstanceToken("");
  }

  // ─── FLUXO: Criar UAZAPI → Salvar Supabase → Conectar → Polling ──────────
  async function handleStartFlow(e: React.FormEvent) {
    e.preventDefault();
    if (!instanceName.trim()) {
      toast.error("Digite um nome para a instância.");
      return;
    }

    setModalStep("creating");
    setModalError("");

    try {
      const companyId = await getCompanyId();

      // 1. Criar a instância no UAZAPI
      const created = await createInstance(instanceName.trim(), companyId);
      const token = created.token;

      setNewInstanceToken(token);

      // 2. Persistir a instância no Supabase vinculada ao company_id
      const { error: dbError } = await supabase.from("whatsapp_instances").insert([
        {
          id: created.instance.id,
          name: instanceName.trim(),
          token: token,
          company_id: companyId,
          delivery_id: companyId,
          status: "disconnected",
        },
      ]);

      if (dbError) {
        // Tenta remover da UAZAPI caso dê erro ao persistir localmente para não deixar lixo
        try {
          await deleteInstance(token);
        } catch { }
        throw new Error(`Erro ao salvar instância no Supabase: ${dbError.message}`);
      }

      // 3. Iniciar processo de conexão na UAZAPI (gera QR Code)
      await connectInstance(token, { browser: "auto" });

      // 4. Buscar o QR Code inicial
      const statusRes = await getInstanceStatus(token);
      if (statusRes.instance?.qrcode) {
        setQrCodeBase64(statusRes.instance.qrcode);
        setModalStep("qrcode");
      } else {
        setModalStep("qrcode"); // aguarda polling gerar o QR
      }

      // 5. Polling para atualizar QR e detectar conexão bem sucedida
      pollingRef.current = setInterval(async () => {
        try {
          const poll = await getInstanceStatus(token);

          if (poll.instance?.qrcode) {
            setQrCodeBase64(poll.instance.qrcode);
          }

          if (poll.status?.connected && poll.status?.loggedIn) {
            stopPolling();
            setModalStep("connected");

            // Atualizar status no Supabase para conectado
            await supabase
              .from("whatsapp_instances")
              .update({ status: "connected" })
              .eq("id", poll.instance.id);

            const newRow: InstanceRow = {
              ...poll.instance,
              localToken: token,
            };
            setInstances((prev) => [newRow, ...prev]);
            toast.success(`WhatsApp "${instanceName}" conectado com sucesso! ✅`);

            setTimeout(() => closeModal(), 2000);
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

  // ─── Deletar instância no Supabase e na UAZAPI ─────────────────────────────
  async function handleDeleteInstance(inst: InstanceRow) {
    const confirmed = window.confirm(
      `Tem certeza que deseja remover permanentemente a instância "${inst.name}"?`
    );
    if (!confirmed) return;

    try {
      const companyId = await getCompanyId();

      // 1. Remover do Supabase primeiro (estritamente protegida por company_id)
      const { error: dbError } = await supabase
        .from("whatsapp_instances")
        .delete()
        .eq("id", inst.id)
        .eq("company_id", companyId);

      if (dbError) {
        throw new Error(`Erro ao remover do banco de dados: ${dbError.message}`);
      }

      // 2. Remover do servidor UAZAPI
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

  // ─── Refresh manual ────────────────────────────────────────────────────────
  async function handleRefreshInstance(inst: InstanceRow) {
    toast.promise(
      (async () => {
        const poll = await getInstanceStatus(inst.localToken);

        // Atualiza o status no Supabase
        await supabase
          .from("whatsapp_instances")
          .update({ status: poll.instance?.status ?? "disconnected" })
          .eq("id", inst.id);

        setInstances((prev) =>
          prev.map((i) =>
            i.id === inst.id
              ? { ...i, ...poll.instance, localToken: inst.localToken }
              : i
          )
        );
      })(),
      {
        loading: `Sincronizando "${inst.name}"...`,
        success: `"${inst.name}" atualizado!`,
        error: "Erro ao sincronizar. Verifique o token.",
      }
    );
  }

  const connectedCount = instances.filter((i) => i.status === "connected").length;
  const totalInstances = instances.length;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">WhatsApp</h1>
              <p className="text-sm text-muted-foreground">
                Gerenciamento seguro de conexões integradas à sua conta.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <QrCode className="h-4 w-4" /> Novo QR Code
            </button>
          </div>

          {/* Database Missing Error Notice */}
          {isDbError && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-bold text-destructive">Tabela no Supabase Ausente!</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    A tabela <code>whatsapp_instances</code> não foi encontrada no seu banco de dados do Supabase.
                    Por favor, crie-a no SQL Editor do painel do Supabase.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Server Info Banner */}
          <section className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card relative overflow-hidden">
            <div className="grid-bg absolute inset-0 opacity-15" />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Motor de Envio
                </div>
                <div className="mt-1 text-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Nexus Delí
                  <span className="text-xs px-2 py-0.5 bg-success/12 border border-success/20 text-success rounded-full font-semibold">
                    Servidor Ativo
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  As conexões são cadastradas e gerenciadas de forma totalmente segura.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-background/50 border border-border p-3 rounded-xl">
                <div className="text-center px-3">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Conectadas
                  </div>
                  <div className="text-xl font-bold mt-0.5 text-success">{connectedCount}</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center px-3">
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">
                    Total
                  </div>
                  <div className="text-xl font-bold mt-0.5">{totalInstances}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Instances Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" /> Instâncias do WhatsApp
              </h2>
              <button
                onClick={loadInstances}
                title="Recarregar lista"
                className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingList ? "animate-spin" : ""}`} />
              </button>
            </div>

            {isLoadingList ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Buscando instâncias no Supabase...</p>
              </div>
            ) : instances.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 flex flex-col items-center justify-center gap-3 text-center">
                <div className="h-12 w-12 rounded-2xl bg-accent grid place-items-center">
                  <Smartphone className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Nenhuma instância cadastrada</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clique em <strong>"Novo QR Code"</strong> para configurar sua primeira conexão integrada de WhatsApp.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {instances.map((inst) => {
                  const isConnected = inst.status === "connected";
                  const isConnecting = inst.status === "connecting";
                  return (
                    <motion.div
                      key={inst.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Top */}
                        <div className="flex items-start justify-between">
                          <div
                            className={`h-11 w-11 rounded-xl grid place-items-center ${isConnected
                              ? "bg-success/15 text-success"
                              : isConnecting
                                ? "bg-warning/15 text-warning"
                                : "bg-destructive/15 text-destructive"
                              }`}
                          >
                            {isConnected ? (
                              <Wifi className="h-6 w-6" />
                            ) : isConnecting ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              <WifiOff className="h-6 w-6" />
                            )}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${isConnected
                              ? "bg-success/12 border-success/30 text-success"
                              : isConnecting
                                ? "bg-warning/12 border-warning/30 text-warning"
                                : "bg-destructive/12 border-destructive/30 text-destructive"
                              }`}
                          >
                            {inst.status === "connected"
                              ? "Conectado"
                              : inst.status === "connecting"
                                ? "Conectando..."
                                : "Desconectado"}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="mt-4">
                          <h3 className="font-bold text-base text-foreground">{inst.name}</h3>
                          {inst.profileName && (
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                              {inst.profileName}
                            </p>
                          )}
                          <p className="text-[10px] font-mono text-muted-foreground/70 mt-1 break-all">
                            ID: {inst.id}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/60">
                          <div>
                            <div className="text-[9px] text-muted-foreground font-semibold uppercase">
                              Tipo
                            </div>
                            <div className="text-xs font-bold text-foreground mt-0.5 flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-primary" />
                              {inst.isBusiness ? "Business" : "Pessoal"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] text-muted-foreground font-semibold uppercase">
                              Plataforma
                            </div>
                            <div className="text-xs font-bold text-foreground mt-0.5">
                              {inst.plataform ?? "—"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-border mt-4 pt-4 flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRefreshInstance(inst)}
                          title="Atualizar status"
                          className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground transition-colors cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInstance(inst)}
                          title="Deletar instância"
                          className="h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── QR Code Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-glow relative overflow-hidden"
            >
              <div className="grid-bg absolute inset-0 opacity-15" />

              <div className="relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-base">Nova Instância WhatsApp</h3>
                  </div>
                  {modalStep !== "creating" && (
                    <button
                      onClick={closeModal}
                      className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* ── STEP: FORM ── */}
                {modalStep === "form" && (
                  <form onSubmit={handleStartFlow} className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Nome da Instância (Identificação)
                      </label>
                      <input
                        type="text"
                        required
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                        placeholder="Ex: Loja Centro, Delivery Hub"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                      />
                    </div>

                    <div className="bg-background/45 border border-border/80 rounded-xl p-3.5 text-xs text-muted-foreground flex gap-2">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-warning mt-0.5" />
                      <p className="leading-relaxed">
                        Use <strong>contas WhatsApp Business</strong>. Números recém-adquiridos sem
                        aquecimento prévio podem ser instáveis ou banidos.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
                    >
                      Gerar QR Code via Nexus Deli 🚀
                    </button>
                  </form>
                )}

                {/* ── STEP: CREATING ── */}
                {modalStep === "creating" && (
                  <div className="mt-8 py-10 flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Criando conexão no Nexus Deli...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Aguarde enquanto conectamos ao servidor e geramos o seu QR Code de pareamento.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── STEP: QR CODE ── */}
                {modalStep === "qrcode" && (
                  <div className="mt-5 space-y-5 flex flex-col items-center">
                    <div className="bg-background/45 border border-border rounded-xl p-3 text-xs text-center text-muted-foreground max-w-xs leading-relaxed">
                      Abra o <strong>WhatsApp</strong> &gt; <strong>Aparelhos conectados</strong> &gt;{" "}
                      <strong>Conectar um aparelho</strong> e escaneie o QR Code abaixo.
                    </div>

                    {/* QR Code Display */}
                    <div className="p-3 bg-white border-4 border-white rounded-2xl shadow-glow">
                      {qrCodeBase64 ? (
                        <img
                          src={qrCodeBase64.startsWith("data:") ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                          alt="QR Code de Pareamento Nexus Deli"
                          className="h-52 w-52 object-contain"
                        />
                      ) : (
                        <div className="h-52 w-52 flex flex-col items-center justify-center gap-3 text-gray-400">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                          <span className="text-[11px] font-semibold text-center">
                            Aguardando QR Code da API...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] font-bold text-primary animate-pulse flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                      <Clock className="h-3.5 w-3.5" />
                      Verificando conexão automaticamente a cada {POLL_INTERVAL / 1000}s...
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center">
                      O QR Code expira em 2 minutos. Um novo será gerado automaticamente.
                    </p>

                    <button
                      onClick={closeModal}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2"
                    >
                      Cancelar e fechar
                    </button>
                  </div>
                )}

                {/* ── STEP: CONNECTED ── */}
                {modalStep === "connected" && (
                  <div className="mt-8 py-10 flex flex-col items-center justify-center gap-4 text-center">
                    <CheckCircle2 className="h-14 w-14 text-success drop-shadow-[0_0_12px_oklch(0.62_0.19_145)]" />
                    <div>
                      <p className="text-lg font-bold text-foreground">WhatsApp Conectado! ✅</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        A instância <strong>"{instanceName}"</strong> está online e pronta para disparos.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── STEP: ERROR ── */}
                {modalStep === "error" && (
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                      <ShieldAlert className="h-12 w-12 text-destructive" />
                      <div>
                        <p className="font-bold text-sm text-foreground">Falha ao criar instância</p>
                        <p className="text-xs text-destructive/80 mt-1 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                          {modalError}
                        </p>
                      </div>
                    </div>

                    <div className="bg-background/45 border border-border/80 rounded-xl p-3 text-xs text-muted-foreground">
                      <strong className="text-foreground">Verifique:</strong>
                      <ul className="mt-1.5 space-y-1 list-disc list-inside">
                        <li>As chaves de acesso no arquivo <code>.env</code></li>
                        <li>Se o endereço do servidor no <code>.env</code> está correto</li>
                        <li>Se a sua conexão de rede local com o servidor está ativa</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => setModalStep("form")}
                      className="w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
