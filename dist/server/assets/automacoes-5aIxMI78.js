import { S as reactExports, J as jsxRuntimeExports } from "./server-tfDrSU-s.js";
import { d as createLucideIcon, j as useLocation, s as supabase, A as AnimatePresence, h as motion, a as LoaderCircle, T as Trash2, b as Smartphone, t as toast } from "./router-CjJWtfgI.js";
import { d as Sidebar, T as Topbar, U as Users, Z as Zap } from "./Topbar-CvlFCSIz.js";
import { C as Check } from "./check-UnlummQ3.js";
import { S as Save } from "./save-CK7tFrNE.js";
import { P as Phone } from "./phone-DSHBf8yl.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./log-out-D95BvSHA.js";
const __iconNode$1 = [
  ["path", { d: "M12 13v8l-4-4", key: "1f5nwf" }],
  ["path", { d: "m12 21 4-4", key: "1lfcce" }],
  ["path", { d: "M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284", key: "ui1hmy" }]
];
const CloudDownload = createLucideIcon("cloud-download", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 10v6", key: "1bos4e" }],
  ["path", { d: "M9 13h6", key: "1uhe8q" }],
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
const FolderPlus = createLucideIcon("folder-plus", __iconNode);
function AutomationsPage() {
  const [activeSubTab, setActiveSubTab] = reactExports.useState("extrator");
  const [whatsappInstances, setWhatsappInstances] = reactExports.useState([]);
  const [selectedExtratorInstance, setSelectedExtratorInstance] = reactExports.useState("");
  const [isExtracting, setIsExtracting] = reactExports.useState(false);
  const [extractedGroups, setExtractedGroups] = reactExports.useState([]);
  const [extractedLeads, setExtractedLeads] = reactExports.useState([]);
  const [selectedExtractionGroup, setSelectedExtractionGroup] = reactExports.useState("");
  const [folders, setFolders] = reactExports.useState([]);
  const [targetFolderId, setTargetFolderId] = reactExports.useState("");
  const [newFolderName, setNewFolderName] = reactExports.useState("");
  const [isCreatingFolder, setIsCreatingFolder] = reactExports.useState(false);
  const [isSavingLeads, setIsSavingLeads] = reactExports.useState(false);
  const [selectedImportInstance, setSelectedImportInstance] = reactExports.useState("");
  const [isImporting, setIsImporting] = reactExports.useState(false);
  const [importedContacts, setImportedContacts] = reactExports.useState([]);
  const [selectedExportInstance, setSelectedExportInstance] = reactExports.useState("");
  const [exportFolderId, setExportFolderId] = reactExports.useState("");
  const [isExporting, setIsExporting] = reactExports.useState(false);
  const [exportSuccess, setExportSuccess] = reactExports.useState(false);
  const [exportResult, setExportResult] = reactExports.useState(null);
  const [isCreatingExportFolder, setIsCreatingExportFolder] = reactExports.useState(false);
  const [newExportFolderName, setNewExportFolderName] = reactExports.useState("");
  const [verifyFolderId, setVerifyFolderId] = reactExports.useState("");
  const [selectedVerifyInstance, setSelectedVerifyInstance] = reactExports.useState("");
  const [isVerifying, setIsVerifying] = reactExports.useState(false);
  const [namesUpdated, setNamesUpdated] = reactExports.useState(0);
  const [verifyResult, setVerifyResult] = reactExports.useState(null);
  useLocation();
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
  reactExports.useEffect(() => {
    const loadData = async () => {
      try {
        const deliveryId = await getDeliveryId();
        const instancesRes = await supabase.from("whatsapp_instances").select("id, name, token").eq("delivery_id", deliveryId).order("created_at", {
          ascending: false
        });
        if (!instancesRes.error && instancesRes.data) {
          setWhatsappInstances(instancesRes.data);
          if (instancesRes.data.length > 0) {
            setSelectedExtratorInstance(instancesRes.data[0].name);
            setSelectedImportInstance(instancesRes.data[0].name);
            setSelectedExportInstance(instancesRes.data[0].name);
            setSelectedVerifyInstance(instancesRes.data[0].name);
          }
        }
        const foldersRes = await supabase.from("folders").select("id, name").eq("delivery_id", deliveryId).order("created_at", {
          ascending: true
        });
        if (!foldersRes.error && foldersRes.data) {
          setFolders(foldersRes.data);
          if (foldersRes.data.length > 0) setTargetFolderId(foldersRes.data[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar dados inicias do extrator:", err);
      }
    };
    loadData();
    const automationsFolderChannel = supabase.channel("automations-folders-channel").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "folders"
    }, (payload) => {
      setFolders((current) => {
        if (current.find((f) => f.id === payload.new.id)) return current;
        return [...current, payload.new];
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(automationsFolderChannel);
    };
  }, []);
  const handleExtractGroups = async () => {
    if (!selectedExtratorInstance) {
      toast.error("Selecione um WhatsApp primeiro.");
      return;
    }
    const instanceData = whatsappInstances.find((i) => i.name === selectedExtratorInstance);
    if (!instanceData) return;
    try {
      setIsExtracting(true);
      const deliveryId = await getDeliveryId();
      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/0c548d15-e025-4521-85a0-8bfe0e93bc00", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instance: instanceData.name,
          instanceToken: instanceData.token,
          delivery_id: deliveryId
        })
      });
      if (!response.ok) throw new Error("Falha na requisição");
      const responseData = await response.json();
      let gruposArray = [];
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
  const handleExtractLeads = async (grupo) => {
    const instanceData = whatsappInstances.find((i) => i.name === selectedExtratorInstance);
    if (!instanceData) {
      toast.error("Instância não encontrada.");
      return;
    }
    try {
      const deliveryId = await getDeliveryId();
      toast.info(`Iniciando extração de leads do grupo: ${grupo.nome_grupo}...`);
      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/ff773158-9e44-4c44-8efb-5a0fbcf2cd54", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
      let leadsArray = [];
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
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const deliveryId = await getDeliveryId();
      const {
        data,
        error
      } = await supabase.from("folders").insert([{
        name: newFolderName.trim(),
        delivery_id: deliveryId
      }]).select();
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
      const insertPayload = extractedLeads.map((lead) => ({
        name: lead.nome || "Lead S/ Nome",
        phone: lead.telefone || "",
        folder_id: targetFolderId,
        delivery_id: deliveryId,
        total_spent: 0
      }));
      const {
        error
      } = await supabase.from("clients").insert(insertPayload);
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
    const instanceData = whatsappInstances.find((i) => i.name === selectedImportInstance);
    if (!instanceData) return;
    try {
      setIsImporting(true);
      setImportedContacts([]);
      const deliveryId = await getDeliveryId();
      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/4e395ffa-f900-41c3-a0e9-80b2a3013ec0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instance: instanceData.name,
          instanceToken: instanceData.token,
          delivery_id: deliveryId,
          folder_id: targetFolderId
        })
      });
      if (!response.ok) throw new Error("Falha na requisição ao webhook.");
      const json = await response.json();
      let leadsArray = [];
      if (Array.isArray(json)) {
        leadsArray = json[0]?.sucesso ? json[0].participantes || [] : json;
      } else if (json?.sucesso) {
        leadsArray = json.participantes || [];
      } else if (json?.contact_name || json?.phone) {
        leadsArray = [json];
      }
      if (leadsArray.length > 0) {
        const insertPayload = leadsArray.map((lead) => ({
          name: lead.contact_name || lead.nome || "Contato Importado",
          phone: lead.phone || lead.telefone || "",
          folder_id: targetFolderId,
          delivery_id: deliveryId,
          total_spent: 0
        }));
        const {
          error
        } = await supabase.from("clients").insert(insertPayload);
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
    const instanceData = whatsappInstances.find((i) => i.name === selectedExportInstance);
    if (!instanceData) return;
    try {
      setIsExporting(true);
      setExportSuccess(false);
      setExportResult(null);
      const deliveryId = await getDeliveryId();
      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/a4077c32-1f4b-4837-8ad3-9144e48ce2e3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
        const pastaName = folders.find((f) => f.id === exportFolderId)?.name || "Pasta Selecionada";
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
  const handleCreateExportFolder = async (e) => {
    e.preventDefault();
    if (!newExportFolderName.trim()) return;
    try {
      const deliveryId = await getDeliveryId();
      const {
        data,
        error
      } = await supabase.from("folders").insert([{
        name: newExportFolderName.trim(),
        delivery_id: deliveryId
      }]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        setFolders((prev) => [...prev, data[0]]);
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
    const instanceData = whatsappInstances.find((i) => i.name === selectedVerifyInstance);
    if (!instanceData) return;
    try {
      setIsVerifying(true);
      setVerifyResult(null);
      setNamesUpdated(0);
      const deliveryId = await getDeliveryId();
      const response = await fetch("https://nexus360.infra-conectamarketing.site/webhook/b12d7a71-65d2-4865-8a82-5e84f8b4c9f9", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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
      const leadsParaAtualizar = leadsValidos.filter((lead) => lead.verifiedName && lead.verifiedName.trim() !== "");
      if (leadsParaAtualizar.length > 0) {
        const normalizePhone = (phone) => phone.replace(/\D/g, "");
        let updatedCount = 0;
        await Promise.all(leadsParaAtualizar.map(async (lead) => {
          const rawPhone = normalizePhone(lead.phone || lead.phone_original || "");
          if (!rawPhone) return;
          const variants = Array.from(/* @__PURE__ */ new Set([rawPhone, rawPhone.startsWith("55") ? rawPhone.slice(2) : `55${rawPhone}`]));
          const {
            error,
            count
          } = await supabase.from("clients").update({
            name: lead.verifiedName
          }).eq("folder_id", verifyFolderId).or(variants.map((v) => `phone.eq.${v}`).join(","));
          if (!error && (count ?? 0) > 0) updatedCount++;
        }));
        setNamesUpdated(updatedCount);
        if (updatedCount > 0) {
          toast.success(`✨ ${updatedCount} nome(s) de lead(s) atualizados com o nome real do WhatsApp!`);
        }
      }
      const pastaName = folders.find((f) => f.id === verifyFolderId)?.name || "Pasta";
      toast.success(`Verificação concluída! ${leadsValidos.length} leads com WhatsApp na pasta "${pastaName}".`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao verificar os contatos. Verifique a conexão.");
    } finally {
      setIsVerifying(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Topbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Automações" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Crie cupons, gerencie modelos de mensagens e ative gatilhos automáticos para reter clientes." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border self-start", children: ["extrator", "importador", "exportador", "verificador"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveSubTab(tab), className: `px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${activeSubTab === tab ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`, children: tab === "extrator" ? "Extrator de Grupos" : tab === "importador" ? "Importador de Contatos" : tab === "exportador" ? "Exportador de Contatos" : "Verificador de WhatsApp" }, tab)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
          activeSubTab === "extrator" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
                  " Extrator de Grupos do WhatsApp"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Selecione um aparelho conectado e inicie a extração. Nosso sistema vai varrer de forma segura todos os grupos em que o seu número participa e deixá-los prontos para suas automações." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border space-y-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Instância Conectada" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedExtratorInstance, onChange: (e) => setSelectedExtratorInstance(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Selecione um WhatsApp" }),
                    whatsappInstances.map((instance) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: instance.name, children: instance.name }, instance.id))
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleExtractGroups, disabled: isExtracting || !selectedExtratorInstance, className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed", children: isExtracting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                  "Processando..."
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-4 w-4" }),
                  "Extrair Grupos Agora"
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 shadow-card flex flex-col justify-center items-center text-center space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 bg-primary/10 text-primary rounded-full grid place-items-center mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-8 w-8" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-foreground", children: "Pronto para capturar!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "A extração varre seus chats rapidamente. Basta clicar no botão que o processo será disparado. A lista completa dos grupos aparecerá logo abaixo para você utilizar!" })
            ] }),
            extractedGroups.length > 0 && extractedLeads.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border flex justify-between items-center bg-background/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Grupos Capturados" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                    "Grupos encontrados em ",
                    selectedExtratorInstance
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20", children: [
                  extractedGroups.length,
                  " Grupos"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-surface z-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-4 w-[45%]", children: "Nome do Grupo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "ID do Grupo" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right font-medium py-4 pr-5", children: "Ações" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: extractedGroups.map((grupo, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-accent/20 transition-colors", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-foreground text-sm flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground" }),
                    grupo.nome_grupo
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border", children: grupo.id_grupo }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 pr-5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleExtractLeads(grupo), className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5" }),
                    " Extrair Leads"
                  ] }) })
                ] }, idx)) })
              ] }) })
            ] }) }),
            extractedLeads.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border bg-background/50 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-lg flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-primary" }),
                    " ",
                    extractedLeads.length,
                    " Leads Encontrados!"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
                    "Provenientes do grupo ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedExtractionGroup }),
                    "."
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto", children: [
                  isCreatingFolder ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateFolder, className: "flex w-full md:w-auto items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "text", placeholder: "Nome da nova pasta", value: newFolderName, onChange: (e) => setNewFolderName(e.target.value), className: "flex-1 min-w-[180px] bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !newFolderName.trim(), className: "p-2 rounded-xl bg-primary text-primary-foreground hover:-translate-y-0.5 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsCreatingFolder(false), className: "p-2 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full md:w-auto", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: targetFolderId, onChange: (e) => setTargetFolderId(e.target.value), className: "w-full min-w-[200px] bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                      folders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Nenhuma pasta encontrada" }),
                      folders.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f.id, children: f.name }, f.id))
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsCreatingFolder(true), className: "p-2 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0", title: "Criar nova pasta", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { className: "h-4 w-4" }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSaveExtractedLeads, disabled: isSavingLeads || !targetFolderId, className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed", children: isSavingLeads ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                    " Salvando..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4" }),
                    " Salvar Leads"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                    setExtractedLeads([]);
                    setSelectedExtractionGroup("");
                  }, className: "w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-surface border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer", children: "Cancelar" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-surface z-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-4 w-1/2", children: "Nome do Contato" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Telefone / WhatsApp" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center font-medium py-4 pr-5", children: "Admin" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: extractedLeads.map((lead, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-accent/20 transition-colors", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-foreground text-sm flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground" }),
                    lead.nome || "Sem Nome"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border inline-flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                    " ",
                    lead.telefone
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 pr-5 text-center", children: lead.admin ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20", children: "Sim" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-2 py-0.5 rounded-md bg-surface text-muted-foreground text-[10px] uppercase font-medium border border-border", children: "Não" }) })
                ] }, idx)) })
              ] }) })
            ] }) })
          ] }, "extrator"),
          activeSubTab === "importador" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "h-4 w-4" }),
                    " Importador de Contatos"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Puxe todos os contatos da agenda do seu aparelho conectado e salve-os diretamente em uma pasta do CRM em poucos segundos." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border space-y-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "1. Instância WhatsApp" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedImportInstance, onChange: (e) => setSelectedImportInstance(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Selecione um aparelho" }),
                      whatsappInstances.map((instance) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: instance.name, children: instance.name }, instance.id))
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "2. Pasta Destino (CRM)" }),
                    isCreatingFolder ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateFolder, className: "flex w-full items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "text", placeholder: "Nome da nova pasta", value: newFolderName, onChange: (e) => setNewFolderName(e.target.value), className: "flex-1 min-w-[180px] bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !newFolderName.trim(), className: "p-2.5 rounded-xl bg-primary text-primary-foreground hover:-translate-y-0.5 transition-transform cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsCreatingFolder(false), className: "p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: targetFolderId, onChange: (e) => setTargetFolderId(e.target.value), className: "flex-1 min-w-[200px] bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                        folders.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Nenhuma pasta encontrada" }),
                        folders.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f.id, children: f.name }, f.id))
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsCreatingFolder(true), className: "p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0", title: "Criar nova pasta", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { className: "h-4 w-4" }) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleImportContacts, disabled: isImporting || !selectedImportInstance || !targetFolderId, className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2", children: isImporting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                    "Importando e Salvando..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "h-4 w-4" }),
                    "Importar Contatos"
                  ] }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 shadow-card flex flex-col justify-center items-center text-center space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 bg-primary/10 text-primary rounded-full grid place-items-center mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { className: "h-8 w-8" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-foreground", children: "CRM Organizado" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "Diferente da extração de grupos, aqui nós já salvamos os seus contatos automaticamente na pasta selecionada para você disparar suas campanhas logo em seguida." })
              ] })
            ] }),
            importedContacts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border flex justify-between items-center bg-background/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Resumo da Importação" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Os seguintes contatos foram salvos e já estão no seu CRM." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20", children: [
                  importedContacts.length,
                  " Salvos"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[300px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-surface z-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-4 w-1/2", children: "Nome / Contato" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-4", children: "Telefone (WhatsApp)" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: importedContacts.map((contato, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-accent/20 transition-colors", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-foreground text-sm flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground" }),
                    contato.contact_name || contato.nome || "Contato Sem Nome"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border inline-flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                    " ",
                    contato.phone || contato.telefone
                  ] }) })
                ] }, idx)) })
              ] }) })
            ] }) })
          ] }, "importador"),
          activeSubTab === "exportador" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "h-4 w-4 rotate-180" }),
                    " Exportador de Contatos"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Envie os contatos de uma pasta do CRM diretamente para a agenda do seu celular conectado em apenas um clique." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border space-y-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "1. Instância WhatsApp" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedExportInstance, onChange: (e) => {
                      setSelectedExportInstance(e.target.value);
                      setExportSuccess(false);
                    }, className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Selecione um aparelho" }),
                      whatsappInstances.map((instance) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: instance.name, children: instance.name }, instance.id))
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "2. Pasta de Origem (CRM)" }),
                    isCreatingExportFolder ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateExportFolder, className: "flex w-full items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "text", placeholder: "Nome da nova pasta", value: newExportFolderName, onChange: (e) => setNewExportFolderName(e.target.value), className: "flex-1 min-w-[180px] bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !newExportFolderName.trim(), className: "p-2.5 rounded-xl bg-primary text-primary-foreground hover:-translate-y-0.5 transition-transform cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsCreatingExportFolder(false), className: "p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: exportFolderId, onChange: (e) => {
                        setExportFolderId(e.target.value);
                        setExportSuccess(false);
                      }, className: "flex-1 min-w-[200px] bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Selecione uma pasta" }),
                        folders.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f.id, children: f.name }, f.id))
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsCreatingExportFolder(true), className: "p-2.5 rounded-xl bg-surface border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer shrink-0", title: "Criar nova pasta", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { className: "h-4 w-4" }) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleExportContacts, disabled: isExporting || !selectedExportInstance || !exportFolderId, className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2", children: isExporting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                    "Exportando Contatos..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "h-4 w-4 rotate-180" }),
                    "Exportar Contatos"
                  ] }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 shadow-card flex flex-col justify-center items-center text-center space-y-4", children: exportSuccess && exportResult ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 bg-green-500/10 text-green-400 rounded-full grid place-items-center mb-2 animate-in zoom-in-50 duration-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-8 w-8" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-foreground", children: "Exportação Concluída!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 w-full mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-background border border-border px-3 py-3 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-foreground", children: exportResult.total_processados }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider", children: "Processados" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-3 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-400", children: exportResult.adicionados_com_sucesso }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-green-400/70 mt-0.5 uppercase tracking-wider", children: "Adicionados" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-3 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-400", children: exportResult.falhas }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-red-400/70 mt-0.5 uppercase tracking-wider", children: "Falhas" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                  setExportSuccess(false);
                  setExportResult(null);
                }, className: "text-xs font-semibold text-primary hover:underline cursor-pointer mt-1", children: "Fazer nova exportação" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 bg-primary/10 text-primary rounded-full grid place-items-center mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-8 w-8" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-foreground", children: "Sincronize sua Agenda" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "Selecione uma pasta do CRM e envie todos os seus leads diretamente para a agenda de qualquer WhatsApp conectado." })
              ] }) })
            ] }),
            exportSuccess && exportResult && exportResult.contatos_adicionados.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border flex justify-between items-center bg-background/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm", children: "Contatos Adicionados na Agenda" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Estes contatos foram salvos com sucesso no celular conectado." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold px-2.5 py-1 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20", children: [
                  exportResult.contatos_adicionados.length,
                  " Adicionados"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[280px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-surface z-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3 w-1/2", children: "Nome" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-3", children: "Telefone" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: exportResult.contatos_adicionados.map((contato, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-accent/20 transition-colors", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-foreground text-sm flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                    contato.nome || "Contato"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border border-border inline-flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                    " ",
                    contato.telefone
                  ] }) })
                ] }, idx)) })
              ] }) })
            ] }) }),
            exportSuccess && exportResult && exportResult.contatos_falharam.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-in fade-in slide-in-from-bottom-4 duration-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-red-500/20 bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-red-500/20 flex justify-between items-center bg-red-500/5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-red-400", children: "Contatos com Falha" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Estes contatos não puderam ser adicionados." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20", children: [
                  exportResult.contatos_falharam.length,
                  " Falhas"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-surface z-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3 w-1/2", children: "Nome" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-3", children: "Telefone" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: exportResult.contatos_falharam.map((contato, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-red-500/5 transition-colors", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground/70", children: contato.nome || "—" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-red-400/70", children: contato.telefone || "—" }) })
                ] }, idx)) })
              ] }) })
            ] }) })
          ] }, "exportador"),
          activeSubTab === "verificador" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            y: 10
          }, animate: {
            opacity: 1,
            y: 0
          }, exit: {
            opacity: 0,
            y: -10
          }, className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold flex items-center gap-1.5 text-primary", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4" }),
                    " Verificador de WhatsApp"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Selecione uma pasta de leads e descubra automaticamente quais deles possuem WhatsApp ativo, sem precisar verificar um por um." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-border space-y-5", children: whatsappInstances.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4 text-amber-400 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-400", children: "Nenhum WhatsApp conectado" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                      "Acesse a página de ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "WhatsApp" }),
                      " e conecte um aparelho para utilizar esta ferramenta."
                    ] })
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "1. Instância WhatsApp" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: selectedVerifyInstance, onChange: (e) => {
                      setSelectedVerifyInstance(e.target.value);
                      setVerifyResult(null);
                    }, className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Selecione um aparelho" }),
                      whatsappInstances.map((instance) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: instance.name, children: instance.name }, instance.id))
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "2. Pasta de Leads para Verificar" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: verifyFolderId, onChange: (e) => {
                      setVerifyFolderId(e.target.value);
                      setVerifyResult(null);
                    }, className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Selecione uma pasta" }),
                      folders.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: f.id, children: f.name }, f.id))
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleVerifyWhatsApp, disabled: isVerifying || !verifyFolderId || !selectedVerifyInstance, className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed", children: isVerifying ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                    "Verificando Leads..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-4 w-4" }),
                    "Iniciar Verificação"
                  ] }) })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 shadow-card flex flex-col justify-center items-center text-center space-y-4", children: verifyResult ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 bg-green-500/10 text-green-400 rounded-full grid place-items-center mb-2 animate-in zoom-in-50 duration-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-8 w-8" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-foreground", children: "Verificação Concluída!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 w-full mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-background border border-border px-3 py-3 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-foreground", children: verifyResult.total_validos + verifyResult.total_invalidos }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider", children: "Total" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-3 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-400", children: verifyResult.total_validos }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-green-400/70 mt-0.5 uppercase tracking-wider", children: "Com WA" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-3 text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-400", children: verifyResult.total_invalidos }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-red-400/70 mt-0.5 uppercase tracking-wider", children: "Sem WA" })
                  ] })
                ] }),
                namesUpdated > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-2.5 w-full mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "✨" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold text-primary", children: [
                      namesUpdated,
                      " nome(s) atualizados automaticamente"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Os leads tiveram seus nomes substituídos pelo nome real do WhatsApp." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                  setVerifyResult(null);
                  setVerifyFolderId("");
                  setNamesUpdated(0);
                }, className: "text-xs font-semibold text-primary hover:underline cursor-pointer mt-1", children: "Nova verificação" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 bg-primary/10 text-primary rounded-full grid place-items-center mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-8 w-8" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-foreground", children: "Higienize sua Lista" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-sm", children: "Selecione uma pasta e descubra quais números têm WhatsApp ativo antes de disparar sua campanha. Economize tempo e aumente suas taxas de entrega." })
              ] }) })
            ] }),
            verifyResult && verifyResult.leads_validos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-in fade-in slide-in-from-bottom-4 duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border flex justify-between items-center bg-background/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-2 w-2 rounded-full bg-green-400" }),
                    "Leads com WhatsApp Ativo"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Prontos para receber suas campanhas." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold px-2.5 py-1 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20", children: [
                  verifyResult.leads_validos.length,
                  " Leads"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[320px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-surface z-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3", children: "Nome" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-3", children: "Telefone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-3", children: "Nome Verificado (WA)" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: verifyResult.leads_validos.map((lead, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-green-500/5 transition-colors", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-foreground text-sm flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                    lead.name || "Lead"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 inline-flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                    " ",
                    lead.phone
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-5", children: lead.verifiedName ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground italic", children: lead.verifiedName }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/40", children: "—" }) })
                ] }, idx)) })
              ] }) })
            ] }) }),
            verifyResult && verifyResult.leads_invalidos.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-in fade-in slide-in-from-bottom-4 duration-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-red-500/20 bg-gradient-surface shadow-card overflow-hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-red-500/20 flex justify-between items-center bg-red-500/5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-sm text-red-400 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-2 w-2 rounded-full bg-red-400" }),
                    "Leads Sem WhatsApp"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Estes números não possuem WhatsApp ativo." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20", children: [
                  verifyResult.leads_invalidos.length,
                  " Leads"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 bg-surface z-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium px-5 py-3 w-1/2", children: "Nome" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left font-medium py-3", children: "Telefone" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: verifyResult.leads_invalidos.map((lead, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-red-500/5 transition-colors", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-foreground/70 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground/50 shrink-0" }),
                    lead.name || "Lead"
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-red-400/70", children: lead.phone || "—" }) })
                ] }, idx)) })
              ] }) })
            ] }) })
          ] }, "verificador")
        ] })
      ] })
    ] })
  ] });
}
export {
  AutomationsPage as component
};
