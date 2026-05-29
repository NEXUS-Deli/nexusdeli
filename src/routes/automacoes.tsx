import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";
import { 
  Zap, 
  Percent, 
  FileText, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Check, 
  MessageSquare, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Smartphone,
  Cpu,
  Loader2,
  Users,
  FolderPlus,
  Save,
  Phone,
  CloudDownload
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/automacoes")({
  component: AutomationsPage,
});

// Mock data (Cupons, Templates e Gatilhos) migrados para /promocoes

function AutomationsPage() {
  const [activeSubTab, setActiveSubTab] = useState<"extrator" | "importador" | "exportador" | "verificador">("extrator");
  
  // WhatsApp Instances State
  const [whatsappInstances, setWhatsappInstances] = useState<{ id: string; name: string; token: string }[]>([]);
  const [selectedExtratorInstance, setSelectedExtratorInstance] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedGroups, setExtractedGroups] = useState<{ id_grupo: string; nome_grupo: string }[]>([]);

  // Extracted Leads & Folders States
  const [extractedLeads, setExtractedLeads] = useState<{nome: string, telefone: string, admin: boolean}[]>([]);
  const [selectedExtractionGroup, setSelectedExtractionGroup] = useState("");
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [targetFolderId, setTargetFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isSavingLeads, setIsSavingLeads] = useState(false);
  
  // Importador States
  const [selectedImportInstance, setSelectedImportInstance] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importedContacts, setImportedContacts] = useState<any[]>([]);

  // Exportador States
  const [selectedExportInstance, setSelectedExportInstance] = useState("");
  const [exportFolderId, setExportFolderId] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportResult, setExportResult] = useState<{
    total_processados: number;
    adicionados_com_sucesso: number;
    falhas: number;
    contatos_adicionados: {nome: string; telefone: string}[];
    contatos_falharam: {nome?: string; telefone?: string}[];
  } | null>(null);
  const [isCreatingExportFolder, setIsCreatingExportFolder] = useState(false);
  const [newExportFolderName, setNewExportFolderName] = useState("");

  // Verificador States
  const [verifyFolderId, setVerifyFolderId] = useState("");
  const [selectedVerifyInstance, setSelectedVerifyInstance] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [namesUpdated, setNamesUpdated] = useState(0);
  const [verifyResult, setVerifyResult] = useState<{
    total_validos: number;
    total_invalidos: number;
    leads_validos: {id?: string; name: string; phone: string; phone_original?: string; jid?: string; verifiedName?: string}[];
    leads_invalidos: {id?: string; name: string; phone: string}[];
  } | null>(null);

  const location = useLocation();

  const getDeliveryId = async (): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || "00000000-0000-0000-0000-000000000000";
    } catch {
      return "00000000-0000-0000-0000-000000000000";
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const deliveryId = await getDeliveryId();
        
        // Instances
        const instancesRes = await supabase
          .from("whatsapp_instances")
          .select("id, name, token")
          .eq("delivery_id", deliveryId)
          .order("created_at", { ascending: false });
        
        if (!instancesRes.error && instancesRes.data) {
          setWhatsappInstances(instancesRes.data);
          if (instancesRes.data.length > 0) {
            setSelectedExtratorInstance(instancesRes.data[0].name);
            setSelectedImportInstance(instancesRes.data[0].name);
            setSelectedExportInstance(instancesRes.data[0].name);
            setSelectedVerifyInstance(instancesRes.data[0].name);
          }
        }

        // Folders
        const foldersRes = await supabase
          .from("folders")
          .select("id, name")
          .eq("delivery_id", deliveryId)
          .order("created_at", { ascending: true });
          
        if (!foldersRes.error && foldersRes.data) {
          setFolders(foldersRes.data);
          if (foldersRes.data.length > 0) setTargetFolderId(foldersRes.data[0].id);
        }
        
      } catch (err) {
        console.error("Erro ao carregar dados inicias do extrator:", err);
      }
    };
    loadData();

    const automationsFolderChannel = supabase
      .channel('automations-folders-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'folders' },
        (payload) => {
          setFolders((current) => {
            if (current.find(f => f.id === payload.new.id)) return current;
            return [...current, payload.new as any];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(automationsFolderChannel);
    };
  }, []);

  const handleExtractGroups = async () => {
    if (!selectedExtratorInstance) {
      toast.error("Selecione um WhatsApp primeiro.");
      return;
    }

    const instanceData = whatsappInstances.find(i => i.name === selectedExtratorInstance);
    if (!instanceData) {
      toast.error("Instância não encontrada. Reconecte o WhatsApp.");
      return;
    }

    try {
      setIsExtracting(true);
      const deliveryId = await getDeliveryId();
      
      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/0c548d15-e025-4521-85a0-8bfe0e93bc00", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: instanceData.name,
          instanceToken: instanceData.token,
          delivery_id: deliveryId
        })
      });

      if (!response.ok) throw new Error("Falha na requisição");
      
      const responseData = await response.json();
      
      let gruposArray: any[] = [];
      if (Array.isArray(responseData) && responseData[0]?.sucesso) {
        gruposArray = responseData[0].grupos || [];
      } else if (responseData?.sucesso) {
        gruposArray = responseData.grupos || [];
      }

      setExtractedGroups(gruposArray);
      
      if (gruposArray.length > 0) {
        toast.success(`Captura concluída! ${gruposArray.length} grupos encontrados.`);
      } else {
        toast.info("A requisição finalizou, mas nenhum grupo foi retornado.");
      }

    } catch (err) {
      console.error(err);
      toast.error("Erro ao solicitar a extração de grupos.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractLeads = async (grupo: { id_grupo: string; nome_grupo: string }) => {
    const instanceData = whatsappInstances.find(i => i.name === selectedExtratorInstance);
    if (!instanceData) {
      toast.error("Instância não encontrada.");
      return;
    }

    try {
      const deliveryId = await getDeliveryId();
      toast.info(`Iniciando extração de leads do grupo: ${grupo.nome_grupo}...`);
      
      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/ff773158-9e44-4c44-8efb-5a0fbcf2cd54", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: instanceData.name,
          instanceToken: instanceData.token,
          delivery_id: deliveryId,
          id_grupo: grupo.id_grupo,
          nome_grupo: grupo.nome_grupo
        })
      });

      if (!response.ok) throw new Error("Falha na requisição");
      
      const json = await response.json();
      
      let leadsArray: any[] = [];
      if (Array.isArray(json) && json[0]?.sucesso) {
        leadsArray = json[0].participantes || [];
      } else if (json?.sucesso) {
        leadsArray = json.participantes || [];
      }
      
      if (leadsArray.length > 0) {
        setExtractedLeads(leadsArray);
        setSelectedExtractionGroup(grupo.nome_grupo);
        toast.success(`Capturados ${leadsArray.length} leads do grupo!`);
      } else {
        toast.info("Nenhum lead encontrado neste grupo.");
      }

    } catch (err) {
      console.error(err);
      toast.error("Erro ao solicitar a extração de leads deste grupo.");
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const deliveryId = await getDeliveryId();
      const companyId = await getCompanyId();
      const { data, error } = await supabase
        .from("folders")
        .insert([{ name: newFolderName.trim(), delivery_id: deliveryId, company_id: companyId }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setFolders([...folders, data[0]]);
        setTargetFolderId(data[0].id);
        setNewFolderName("");
        setIsCreatingFolder(false);
        toast.success(`Pasta "${data[0].name}" criada com sucesso!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar a pasta.");
    }
  };

  const handleSaveExtractedLeads = async () => {
    if (!targetFolderId) {
      toast.error("Por favor, selecione ou crie uma pasta primeiro.");
      return;
    }
    if (extractedLeads.length === 0) return;

    try {
      setIsSavingLeads(true);
      const deliveryId = await getDeliveryId();
      const companyId = await getCompanyId();

      const insertPayload = extractedLeads.map(lead => ({
        name: lead.nome || "Lead S/ Nome",
        phone: lead.telefone || "",
        folder_id: targetFolderId,
        delivery_id: deliveryId,
        company_id: companyId,
        total_spent: 0
      }));

      const { error } = await supabase.from("clients").insert(insertPayload);
      if (error) throw error;

      toast.success(`${extractedLeads.length} leads salvos com sucesso no seu CRM!`);
      setExtractedLeads([]);
      setSelectedExtractionGroup("");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar os leads. Verifique sua conexão.");
    } finally {
      setIsSavingLeads(false);
    }
  };

  const handleImportContacts = async () => {
    if (!selectedImportInstance) {
      toast.error("Selecione um WhatsApp para importar os contatos.");
      return;
    }
    if (!targetFolderId) {
      toast.error("Por favor, selecione ou crie uma pasta destino primeiro.");
      return;
    }

    const instanceData = whatsappInstances.find(i => i.name === selectedImportInstance);
    if (!instanceData) {
      toast.error("Instância não encontrada. Reconecte o WhatsApp.");
      return;
    }

    try {
      setIsImporting(true);
      setImportedContacts([]);
      const deliveryId = await getDeliveryId();
      
      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/4e395ffa-f900-41c3-a0e9-80b2a3013ec0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: instanceData.name,
          instanceToken: instanceData.token,
          delivery_id: deliveryId,
          folder_id: targetFolderId
        })
      });

      if (!response.ok) throw new Error("Falha na requisição ao webhook.");
      
      const json = await response.json();
      
      let leadsArray: any[] = [];
      if (Array.isArray(json)) {
        // Se já for o array direto dos contatos (como no novo formato)
        leadsArray = json[0]?.sucesso ? (json[0].participantes || []) : json;
      } else if (json?.sucesso) {
        leadsArray = json.participantes || [];
      } else if (json?.contact_name || json?.phone) {
        // Caso retorne apenas 1 contato direto
        leadsArray = [json];
      }
      
      if (leadsArray.length > 0) {
        const companyId = await getCompanyId();
        // Inserção em massa direto no Supabase
        const insertPayload = leadsArray.map(lead => ({
          name: lead.contact_name || lead.nome || "Contato Importado",
          phone: lead.phone || lead.telefone || "",
          folder_id: targetFolderId,
          delivery_id: deliveryId,
          company_id: companyId,
          total_spent: 0
        }));

        const { error } = await supabase.from("clients").insert(insertPayload);
        if (error) throw error;

        setImportedContacts(leadsArray);
        toast.success(`Fantástico! ${leadsArray.length} contatos importados e salvos com sucesso na sua pasta!`);
      } else {
        toast.info("Nenhum contato retornado pelo WhatsApp ou pela requisição.");
      }

    } catch (err) {
      console.error(err);
      toast.error("Erro ao importar contatos. Verifique a conexão com o N8N.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportContacts = async () => {
    if (!selectedExportInstance) {
      toast.error("Selecione um WhatsApp para exportar os contatos.");
      return;
    }
    if (!exportFolderId) {
      toast.error("Por favor, selecione ou crie uma pasta para exportar.");
      return;
    }

    const instanceData = whatsappInstances.find(i => i.name === selectedExportInstance);
    if (!instanceData) {
      toast.error("Instância não encontrada. Reconecte o WhatsApp.");
      return;
    }

    try {
      setIsExporting(true);
      setExportSuccess(false);
      setExportResult(null);
      const deliveryId = await getDeliveryId();

      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/a4077c32-1f4b-4837-8ad3-9144e48ce2e3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: instanceData.name,
          instanceToken: instanceData.token,
          folder_id: exportFolderId,
          delivery_id: deliveryId
        })
      });

      if (!response.ok) throw new Error("Falha na requisição ao webhook.");

      const json = await response.json();
      const resultData = Array.isArray(json) ? json[0] : json;

      if (resultData?.sucesso) {
        const resumo = resultData.resumo || {};
        setExportResult({
          total_processados: resumo.total_processados ?? 0,
          adicionados_com_sucesso: resumo.adicionados_com_sucesso ?? 0,
          falhas: resumo.falhas ?? 0,
          contatos_adicionados: resultData.contatos_adicionados || [],
          contatos_falharam: resultData.contatos_falharam || []
        });
        setExportSuccess(true);
        const pastaName = folders.find(f => f.id === exportFolderId)?.name || "Pasta Selecionada";
        toast.success(`${resumo.adicionados_com_sucesso ?? 0} contatos da pasta "${pastaName}" exportados para o celular!`);
      } else {
        toast.info("Nenhum resultado retornado pelo servidor.");
      }

    } catch (err) {
      console.error(err);
      toast.error("Erro ao exportar contatos. Verifique a conexão.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateExportFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExportFolderName.trim()) return;
    try {
      const deliveryId = await getDeliveryId();
      const companyId = await getCompanyId();
      const { data, error } = await supabase
        .from("folders")
        .insert([{ name: newExportFolderName.trim(), delivery_id: deliveryId, company_id: companyId }])
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        setFolders(prev => [...prev, data[0]]);
        setExportFolderId(data[0].id);
        setNewExportFolderName("");
        setIsCreatingExportFolder(false);
        toast.success(`Pasta "${data[0].name}" criada com sucesso!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar a pasta.");
    }
  };

  const handleVerifyWhatsApp = async () => {
    if (!selectedVerifyInstance) {
      toast.error("Selecione uma instância do WhatsApp primeiro.");
      return;
    }
    if (!verifyFolderId) {
      toast.error("Selecione uma pasta para iniciar a verificação.");
      return;
    }

    const instanceData = whatsappInstances.find(i => i.name === selectedVerifyInstance);
    if (!instanceData) {
      toast.error("Instância não encontrada. Reconecte o WhatsApp.");
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyResult(null);
      setNamesUpdated(0);
      const deliveryId = await getDeliveryId();

      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/b12d7a71-65d2-4865-8a82-5e84f8b4c9f9", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instance: instanceData.name,
          instanceToken: instanceData.token,
          folder_id: verifyFolderId,
          delivery_id: deliveryId
        })
      });

      if (!response.ok) throw new Error("Falha na requisição ao webhook.");

      const json = await response.json();
      const resultData = Array.isArray(json) ? json[0] : json;

      const leadsValidos = resultData?.leads_validos ?? [];
      const leadsInvalidos = resultData?.leads_invalidos ?? [];

      setVerifyResult({
        total_validos: resultData?.total_validos ?? leadsValidos.length,
        total_invalidos: resultData?.total_invalidos ?? leadsInvalidos.length,
        leads_validos: leadsValidos,
        leads_invalidos: leadsInvalidos
      });

      // ── Enriquecimento automático de nomes ──────────────────────────────
      // Filtra apenas leads que têm verifiedName e que o nome é diferente do atual
      const leadsParaAtualizar = leadsValidos.filter(
        (lead) => lead.verifiedName && lead.verifiedName.trim() !== ""
      );

      if (leadsParaAtualizar.length > 0) {
        // Normaliza telefone: remove tudo que não é dígito
        const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

        let updatedCount = 0;

        // Executa as atualizações em paralelo
        await Promise.all(
          leadsParaAtualizar.map(async (lead) => {
            const rawPhone = normalizePhone(lead.phone || lead.phone_original || "");
            if (!rawPhone) return;

            // Gera variantes do número (com e sem prefixo 55)
            const variants = Array.from(new Set([
              rawPhone,
              rawPhone.startsWith("55") ? rawPhone.slice(2) : `55${rawPhone}`,
            ]));

            // Tenta fazer o UPDATE para qualquer uma das variantes dentro da pasta
            const { error, count } = await supabase
              .from("clients")
              .update({ name: lead.verifiedName })
              .eq("folder_id", verifyFolderId)
              .or(variants.map((v) => `phone.eq.${v}`).join(","));

            if (!error && (count ?? 0) > 0) updatedCount++;
          })
        );

        setNamesUpdated(updatedCount);
        if (updatedCount > 0) {
          toast.success(`✨ ${updatedCount} nome(s) de lead(s) atualizados com o nome real do WhatsApp!`);
        }
      }
      // ─────────────────────────────────────────────────────────────────────

      const pastaName = folders.find(f => f.id === verifyFolderId)?.name || "Pasta";
      toast.success(`Verificação concluída! ${leadsValidos.length} leads com WhatsApp na pasta "${pastaName}".`);

    } catch (err) {
      console.error(err);
      toast.error("Erro ao verificar os contatos. Verifique a conexão.");
    } finally {
      setIsVerifying(false);
    }
  };
  // States e Handlers de cupons, templates e gatilhos migrados para /promocoes
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Automações</h1>
              <p className="text-sm text-muted-foreground">
                Crie cupons, gerencie modelos de mensagens e ative gatilhos automáticos para reter clientes.
              </p>
            </div>
            
            {/* Custom Tab Selector */}
            <div className="flex flex-wrap items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start">
              {(["extrator", "importador", "exportador", "verificador"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                    activeSubTab === tab
                      ? "bg-accent text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "extrator" ? "Extrator de Grupos" : tab === "importador" ? "Importador de Contatos" : tab === "exportador" ? "Exportador de Contatos" : "Verificador de WhatsApp"}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Tabs Contents */}
          <AnimatePresence mode="wait">
            {/* Tabs de cupons, templates e gatilhos migrados para /promocoes */}
            {/* ================= TABS: EXTRATOR DE GRUPOS ================= */}
            {activeSubTab === "extrator" && (
              <motion.div
                key="extrator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Form Section */}
                <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                  <div>
                    <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                      <Users className="h-4 w-4" /> Extrator de Grupos do WhatsApp
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Selecione um aparelho conectado e inicie a extração. Nosso sistema vai varrer de forma segura  
                      todos os grupos em que o seu número participa e deixá-los prontos para suas automações.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Instância Conectada</label>
                      <select
                        value={selectedExtratorInstance}
                        onChange={(e) => setSelectedExtratorInstance(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                      >
                        <option value="" disabled>Selecione um WhatsApp</option>
                        {whatsappInstances.map(instance => (
                          <option key={instance.id} value={instance.name}>
                            {instance.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleExtractGroups}
                      disabled={isExtracting || !selectedExtratorInstance}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Extrair Grupos Agora
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Instructions / Info panel */}
                <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-card flex flex-col justify-center items-center text-center space-y-4">
                  <div className="h-16 w-16 bg-primary/10 text-primary rounded-full grid place-items-center mb-2">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Pronto para capturar!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    A extração varre seus chats rapidamente. Basta clicar no botão que o processo 
                    será disparado. A lista completa dos grupos aparecerá logo abaixo para você utilizar!
                  </p>
                </div>

                {/* Table with Extracted Groups */}
                {extractedGroups.length > 0 && extractedLeads.length === 0 && (
                  <div className="lg:col-span-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
                      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background/50">
                        <div>
                          <h3 className="font-bold text-sm">Grupos Capturados</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Grupos encontrados em {selectedExtratorInstance}</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                          {extractedGroups.length} Grupos
                        </span>
                      </div>

                      <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                              <th className="text-left font-medium px-5 py-4 w-[45%]">Nome do Grupo</th>
                              <th className="text-left font-medium py-4">ID do Grupo</th>
                              <th className="text-right font-medium py-4 pr-5">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {extractedGroups.map((grupo, idx) => (
                              <tr key={idx} className="hover:bg-accent/20 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    {grupo.nome_grupo}
                                  </div>
                                </td>
                                <td>
                                  <span className="font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                                    {grupo.id_grupo}
                                  </span>
                                </td>
                                <td className="py-3.5 pr-5 text-right">
                                  <button
                                    onClick={() => handleExtractLeads(grupo)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                                  >
                                    <Zap className="h-3.5 w-3.5" /> Extrair Leads
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extracted Leads Save Panel */}
                {extractedLeads.length > 0 && (
                  <div className="lg:col-span-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                    <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
                      
                      {/* Leads Header & Action Bar */}
                      <div className="p-5 border-b border-border bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> {extractedLeads.length} Leads Encontrados!
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Provenientes do grupo <strong>{selectedExtractionGroup}</strong>.
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                          {/* Folder Selector */}
                          {isCreatingFolder ? (
                            <form onSubmit={handleCreateFolder} className="flex w-full md:w-auto items-center gap-2">
                              <input 
                                autoFocus
                                type="text"
                                placeholder="Nome da nova pasta"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                className="flex-1 min-w-[180px] bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50"
                              />
                              <button type="submit" disabled={!newFolderName.trim()} className="p-2 rounded-xl bg-primary text-primary-foreground hover:-translate-y-0.5 transition-transform">
                                <Check className="h-4 w-4" />
                              </button>
                              <button type="button" onClick={() => setIsCreatingFolder(false)} className="p-2 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <select
                                value={targetFolderId}
                                onChange={(e) => setTargetFolderId(e.target.value)}
                                className="w-full min-w-[200px] bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                              >
                                {folders.length === 0 && <option value="" disabled>Nenhuma pasta encontrada</option>}
                                {folders.map(f => (
                                  <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => setIsCreatingFolder(true)}
                                className="p-2 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0"
                                title="Criar nova pasta"
                              >
                                <FolderPlus className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {/* Save Button */}
                          <button
                            onClick={handleSaveExtractedLeads}
                            disabled={isSavingLeads || !targetFolderId}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                          >
                            {isSavingLeads ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                            ) : (
                              <><Save className="h-4 w-4" /> Salvar Leads</>
                            )}
                          </button>
                          
                          <button
                            onClick={() => { setExtractedLeads([]); setSelectedExtractionGroup(""); }}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-surface border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>

                      {/* Leads Table */}
                      <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                              <th className="text-left font-medium px-5 py-4 w-1/2">Nome do Contato</th>
                              <th className="text-left font-medium py-4">Telefone / WhatsApp</th>
                              <th className="text-center font-medium py-4 pr-5">Admin</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {extractedLeads.map((lead, idx) => (
                              <tr key={idx} className="hover:bg-accent/20 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    {lead.nome || "Sem Nome"}
                                  </div>
                                </td>
                                <td>
                                  <span className="font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border inline-flex items-center gap-1.5">
                                    <Phone className="h-3 w-3" /> {lead.telefone}
                                  </span>
                                </td>
                                <td className="py-3.5 pr-5 text-center">
                                  {lead.admin ? (
                                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                                      Sim
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2 py-0.5 rounded-md bg-surface text-muted-foreground text-[10px] uppercase font-medium border border-border">
                                      Não
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ================= TABS: IMPORTADOR DE CONTATOS ================= */}
            {activeSubTab === "importador" && (
              <motion.div
                key="importador"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                    <div>
                      <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                        <CloudDownload className="h-4 w-4" /> Importador de Contatos
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Puxe todos os contatos da agenda do seu aparelho conectado e salve-os diretamente em uma pasta do CRM em poucos segundos.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">1. Instância WhatsApp</label>
                        <select
                          value={selectedImportInstance}
                          onChange={(e) => setSelectedImportInstance(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                        >
                          <option value="" disabled>Selecione um aparelho</option>
                          {whatsappInstances.map(instance => (
                            <option key={instance.id} value={instance.name}>
                              {instance.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">2. Pasta Destino (CRM)</label>
                        {isCreatingFolder ? (
                          <form onSubmit={handleCreateFolder} className="flex w-full items-center gap-2">
                            <input 
                              autoFocus
                              type="text"
                              placeholder="Nome da nova pasta"
                              value={newFolderName}
                              onChange={e => setNewFolderName(e.target.value)}
                              className="flex-1 min-w-[180px] bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50"
                            />
                            <button type="submit" disabled={!newFolderName.trim()} className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:-translate-y-0.5 transition-transform cursor-pointer">
                              <Check className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setIsCreatingFolder(false)} className="p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <select
                              value={targetFolderId}
                              onChange={(e) => setTargetFolderId(e.target.value)}
                              className="flex-1 min-w-[200px] bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                            >
                              {folders.length === 0 && <option value="" disabled>Nenhuma pasta encontrada</option>}
                              {folders.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => setIsCreatingFolder(true)}
                              className="p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0"
                              title="Criar nova pasta"
                            >
                              <FolderPlus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleImportContacts}
                        disabled={isImporting || !selectedImportInstance || !targetFolderId}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2"
                      >
                        {isImporting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Importando e Salvando...
                          </>
                        ) : (
                          <>
                            <CloudDownload className="h-4 w-4" />
                            Importar Contatos
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Instructions / Info panel */}
                  <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-card flex flex-col justify-center items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-primary/10 text-primary rounded-full grid place-items-center mb-2">
                      <FolderPlus className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">CRM Organizado</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Diferente da extração de grupos, aqui nós já salvamos os seus contatos automaticamente na 
                      pasta selecionada para você disparar suas campanhas logo em seguida.
                    </p>
                  </div>
                </div>

                {/* Tabela de Contatos Recém Importados */}
                {importedContacts.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
                      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background/50">
                        <div>
                          <h3 className="font-bold text-sm">Resumo da Importação</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Os seguintes contatos foram salvos e já estão no seu CRM.</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                          {importedContacts.length} Salvos
                        </span>
                      </div>

                      <div className="overflow-x-auto max-h-[300px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                              <th className="text-left font-medium px-5 py-4 w-1/2">Nome / Contato</th>
                              <th className="text-left font-medium py-4">Telefone (WhatsApp)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {importedContacts.map((contato, idx) => (
                              <tr key={idx} className="hover:bg-accent/20 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    {contato.contact_name || contato.nome || "Contato Sem Nome"}
                                  </div>
                                </td>
                                <td>
                                  <span className="font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border inline-flex items-center gap-1.5">
                                    <Phone className="h-3 w-3" /> {contato.phone || contato.telefone}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ================= TABS: EXPORTADOR DE CONTATOS ================= */}
            {activeSubTab === "exportador" && (
              <motion.div
                key="exportador"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                    <div>
                      <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                        <CloudDownload className="h-4 w-4 rotate-180" /> Exportador de Contatos
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Envie os contatos de uma pasta do CRM diretamente para a agenda do seu celular conectado em apenas um clique.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">1. Instância WhatsApp</label>
                        <select
                          value={selectedExportInstance}
                          onChange={(e) => { setSelectedExportInstance(e.target.value); setExportSuccess(false); }}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                        >
                          <option value="" disabled>Selecione um aparelho</option>
                          {whatsappInstances.map(instance => (
                            <option key={instance.id} value={instance.name}>
                              {instance.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">2. Pasta de Origem (CRM)</label>
                        {isCreatingExportFolder ? (
                          <form onSubmit={handleCreateExportFolder} className="flex w-full items-center gap-2">
                            <input
                              autoFocus
                              type="text"
                              placeholder="Nome da nova pasta"
                              value={newExportFolderName}
                              onChange={e => setNewExportFolderName(e.target.value)}
                              className="flex-1 min-w-[180px] bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50"
                            />
                            <button type="submit" disabled={!newExportFolderName.trim()} className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:-translate-y-0.5 transition-transform cursor-pointer">
                              <Check className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setIsCreatingExportFolder(false)} className="p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <select
                              value={exportFolderId}
                              onChange={(e) => { setExportFolderId(e.target.value); setExportSuccess(false); }}
                              className="flex-1 min-w-[200px] bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                            >
                              <option value="" disabled>Selecione uma pasta</option>
                              {folders.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => setIsCreatingExportFolder(true)}
                              className="p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0"
                              title="Criar nova pasta"
                            >
                              <FolderPlus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleExportContacts}
                        disabled={isExporting || !selectedExportInstance || !exportFolderId}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2"
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Exportando Contatos...
                          </>
                        ) : (
                          <>
                            <CloudDownload className="h-4 w-4 rotate-180" />
                            Exportar Contatos
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Info / Success Panel */}
                  <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-card flex flex-col justify-center items-center text-center space-y-4">
                    {exportSuccess && exportResult ? (
                      <>
                        <div className="h-16 w-16 bg-green-500/10 text-green-400 rounded-full grid place-items-center mb-2 animate-in zoom-in-50 duration-300">
                          <Check className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">Exportação Concluída!</h3>

                        {/* Resumo em 3 cards */}
                        <div className="grid grid-cols-3 gap-3 w-full mt-2">
                          <div className="rounded-xl bg-background border border-border px-3 py-3 text-center">
                            <p className="text-2xl font-bold text-foreground">{exportResult.total_processados}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Processados</p>
                          </div>
                          <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-3 text-center">
                            <p className="text-2xl font-bold text-green-400">{exportResult.adicionados_com_sucesso}</p>
                            <p className="text-[10px] text-green-400/70 mt-0.5 uppercase tracking-wider">Adicionados</p>
                          </div>
                          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-3 text-center">
                            <p className="text-2xl font-bold text-red-400">{exportResult.falhas}</p>
                            <p className="text-[10px] text-red-400/70 mt-0.5 uppercase tracking-wider">Falhas</p>
                          </div>
                        </div>

                        <button
                          onClick={() => { setExportSuccess(false); setExportResult(null); }}
                          className="text-xs font-semibold text-primary hover:underline cursor-pointer mt-1"
                        >
                          Fazer nova exportação
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full grid place-items-center mb-2">
                          <Save className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">Sincronize sua Agenda</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Selecione uma pasta do CRM e envie todos os seus leads diretamente para a agenda de qualquer WhatsApp conectado.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Tabela Detalhada de Resultados */}
                {exportSuccess && exportResult && exportResult.contatos_adicionados.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
                      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background/50">
                        <div>
                          <h3 className="font-bold text-sm">Contatos Adicionados na Agenda</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Estes contatos foram salvos com sucesso no celular conectado.</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
                          {exportResult.contatos_adicionados.length} Adicionados
                        </span>
                      </div>
                      <div className="overflow-x-auto max-h-[280px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                              <th className="text-left font-medium px-5 py-3 w-1/2">Nome</th>
                              <th className="text-left font-medium py-3">Telefone</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {exportResult.contatos_adicionados.map((contato, idx) => (
                              <tr key={idx} className="hover:bg-accent/20 transition-colors">
                                <td className="px-5 py-3">
                                  <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                                    {contato.nome || "Contato"}
                                  </div>
                                </td>
                                <td>
                                  <span className="font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border inline-flex items-center gap-1.5">
                                    <Phone className="h-3 w-3" /> {contato.telefone}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabela de Falhas */}
                {exportSuccess && exportResult && exportResult.contatos_falharam.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="rounded-2xl border border-red-500/20 bg-gradient-surface shadow-card overflow-hidden">
                      <div className="px-5 py-4 border-b border-red-500/20 flex justify-between items-center bg-red-500/5">
                        <div>
                          <h3 className="font-bold text-sm text-red-400">Contatos com Falha</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Estes contatos não puderam ser adicionados.</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                          {exportResult.contatos_falharam.length} Falhas
                        </span>
                      </div>
                      <div className="overflow-x-auto max-h-[200px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                              <th className="text-left font-medium px-5 py-3 w-1/2">Nome</th>
                              <th className="text-left font-medium py-3">Telefone</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {exportResult.contatos_falharam.map((contato, idx) => (
                              <tr key={idx} className="hover:bg-red-500/5 transition-colors">
                                <td className="px-5 py-3">
                                  <span className="text-sm text-foreground/70">{contato.nome || "—"}</span>
                                </td>
                                <td>
                                  <span className="font-mono text-xs text-red-400/70">{contato.telefone || "—"}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}

            {/* ================= TABS: VERIFICADOR DE WHATSAPP ================= */}
            {activeSubTab === "verificador" && (
              <motion.div
                key="verificador"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4">
                    <div>
                      <h2 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                        <Smartphone className="h-4 w-4" /> Verificador de WhatsApp
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Selecione uma pasta de leads e descubra automaticamente quais deles possuem WhatsApp ativo, sem precisar verificar um por um.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border space-y-5">

                      {/* Aviso: sem instâncias */}
                      {whatsappInstances.length === 0 ? (
                        <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5">
                          <Smartphone className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-amber-400">Nenhum WhatsApp conectado</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Acesse a página de <span className="font-semibold text-foreground">WhatsApp</span> e conecte um aparelho para utilizar esta ferramenta.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">1. Instância WhatsApp</label>
                            <select
                              value={selectedVerifyInstance}
                              onChange={(e) => { setSelectedVerifyInstance(e.target.value); setVerifyResult(null); }}
                              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                            >
                              <option value="" disabled>Selecione um aparelho</option>
                              {whatsappInstances.map(instance => (
                                <option key={instance.id} value={instance.name}>{instance.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">2. Pasta de Leads para Verificar</label>
                            <select
                              value={verifyFolderId}
                              onChange={(e) => { setVerifyFolderId(e.target.value); setVerifyResult(null); }}
                              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors"
                            >
                              <option value="" disabled>Selecione uma pasta</option>
                              {folders.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={handleVerifyWhatsApp}
                            disabled={isVerifying || !verifyFolderId || !selectedVerifyInstance}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Verificando Leads...
                              </>
                            ) : (
                              <>
                                <Smartphone className="h-4 w-4" />
                                Iniciar Verificação
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Result Summary Panel */}
                  <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-card flex flex-col justify-center items-center text-center space-y-4">
                    {verifyResult ? (
                      <>
                        <div className="h-16 w-16 bg-green-500/10 text-green-400 rounded-full grid place-items-center mb-2 animate-in zoom-in-50 duration-300">
                          <Check className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">Verificação Concluída!</h3>
                        <div className="grid grid-cols-3 gap-3 w-full mt-2">
                          <div className="rounded-xl bg-background border border-border px-3 py-3 text-center">
                            <p className="text-2xl font-bold text-foreground">{verifyResult.total_validos + verifyResult.total_invalidos}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Total</p>
                          </div>
                          <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-3 text-center">
                            <p className="text-2xl font-bold text-green-400">{verifyResult.total_validos}</p>
                            <p className="text-[10px] text-green-400/70 mt-0.5 uppercase tracking-wider">Com WA</p>
                          </div>
                          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-3 text-center">
                            <p className="text-2xl font-bold text-red-400">{verifyResult.total_invalidos}</p>
                            <p className="text-[10px] text-red-400/70 mt-0.5 uppercase tracking-wider">Sem WA</p>
                          </div>
                        </div>

                        {/* Badge de nomes atualizados */}
                        {namesUpdated > 0 && (
                          <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-2.5 w-full mt-1">
                            <span className="text-lg">✨</span>
                            <div className="text-left">
                              <p className="text-xs font-bold text-primary">{namesUpdated} nome(s) atualizados automaticamente</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Os leads tiveram seus nomes substituídos pelo nome real do WhatsApp.</p>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => { setVerifyResult(null); setVerifyFolderId(""); setNamesUpdated(0); }}
                          className="text-xs font-semibold text-primary hover:underline cursor-pointer mt-1"
                        >
                          Nova verificação
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full grid place-items-center mb-2">
                          <Smartphone className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">Higienize sua Lista</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Selecione uma pasta e descubra quais números têm WhatsApp ativo antes de disparar sua campanha. Economize tempo e aumente suas taxas de entrega.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Tabela - Com WhatsApp */}
                {verifyResult && verifyResult.leads_validos.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
                      <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-background/50">
                        <div>
                          <h3 className="font-bold text-sm flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                            Leads com WhatsApp Ativo
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Prontos para receber suas campanhas.</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
                          {verifyResult.leads_validos.length} Leads
                        </span>
                      </div>
                      <div className="overflow-x-auto max-h-[320px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                              <th className="text-left font-medium px-5 py-3">Nome</th>
                              <th className="text-left font-medium py-3">Telefone</th>
                              <th className="text-left font-medium py-3">Nome Verificado (WA)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {verifyResult.leads_validos.map((lead, idx) => (
                              <tr key={idx} className="hover:bg-green-500/5 transition-colors">
                                <td className="px-5 py-3">
                                  <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                                    {lead.name || "Lead"}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <span className="font-mono text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 inline-flex items-center gap-1.5">
                                    <Phone className="h-3 w-3" /> {lead.phone}
                                  </span>
                                </td>
                                <td className="py-3 pr-5">
                                  {lead.verifiedName ? (
                                    <span className="text-xs text-muted-foreground italic">{lead.verifiedName}</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground/40">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabela - Sem WhatsApp */}
                {verifyResult && verifyResult.leads_invalidos.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="rounded-2xl border border-red-500/20 bg-gradient-surface shadow-card overflow-hidden">
                      <div className="px-5 py-4 border-b border-red-500/20 flex justify-between items-center bg-red-500/5">
                        <div>
                          <h3 className="font-bold text-sm text-red-400 flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-red-400"></span>
                            Leads Sem WhatsApp
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Estes números não possuem WhatsApp ativo.</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                          {verifyResult.leads_invalidos.length} Leads
                        </span>
                      </div>
                      <div className="overflow-x-auto max-h-[200px]">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                              <th className="text-left font-medium px-5 py-3 w-1/2">Nome</th>
                              <th className="text-left font-medium py-3">Telefone</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {verifyResult.leads_invalidos.map((lead, idx) => (
                              <tr key={idx} className="hover:bg-red-500/5 transition-colors">
                                <td className="px-5 py-3">
                                  <span className="text-sm text-foreground/70 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                                    {lead.name || "Lead"}
                                  </span>
                                </td>
                                <td>
                                  <span className="font-mono text-xs text-red-400/70">{lead.phone || "—"}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
