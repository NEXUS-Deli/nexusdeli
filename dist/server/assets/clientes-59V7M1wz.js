import { jsxs, jsx } from "react/jsx-runtime";
import { useLocation } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { S as Sidebar, T as Topbar } from "./Topbar-jXAYa-6f.js";
import { s as supabase, g as getCompanyId } from "./router-BotcCoyH.js";
import { Plus, Upload, Users, Folder, Trash2, X, DollarSign, Search, Loader2, Utensils, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "zod";
function ClientsPage() {
  const [folders, setFolders] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFolderId, setActiveFolderId] = useState("all");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState("");
  const fileInputRef = useRef(null);
  const handleSelectFile = () => {
    if (!targetFolderId) {
      toast.error("Por favor, crie e selecione uma Pasta Destino antes de importar.");
      return;
    }
    fileInputRef.current?.click();
  };
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLead, setManualLead] = useState({
    name: "",
    phone: "",
    favorite_dish: "",
    total_spent: "",
    last_order: "",
    folder_id: ""
  });
  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyId();
      const [foldersResult, clientsResult] = await Promise.all([supabase.from("folders").select("*").eq("company_id", companyId).order("created_at", {
        ascending: true
      }), supabase.from("clients").select("*").eq("company_id", companyId).order("created_at", {
        ascending: false
      })]);
      if (foldersResult.error) throw foldersResult.error;
      if (clientsResult.error) throw clientsResult.error;
      setFolders(foldersResult.data || []);
      setClients(clientsResult.data || []);
      if (foldersResult.data && foldersResult.data.length > 0 && targetFolderId === "") {
        setTargetFolderId(foldersResult.data[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Falha ao carregar os clientes e pastas do banco de dados.");
    } finally {
      setIsLoading(false);
    }
  };
  useLocation();
  useEffect(() => {
    loadData();
    const folderChannel = supabase.channel("folders-channel").on("postgres_changes", {
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
      supabase.removeChannel(folderChannel);
    };
  }, []);
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const companyId = await getCompanyId();
      const {
        data,
        error
      } = await supabase.from("folders").insert([{
        name: newFolderName.trim(),
        company_id: companyId
      }]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        setFolders([...folders, data[0]]);
        setNewFolderName("");
        setIsCreatingFolder(false);
        setActiveFolderId(data[0].id);
        if (!targetFolderId) setTargetFolderId(data[0].id);
        toast.success(`Pasta "${data[0].name}" criada com sucesso!`);
      }
    } catch (err) {
      console.error("Erro ao criar pasta:", err);
      toast.error("Não foi possível criar a pasta.");
    }
  };
  const handleDeleteFolder = async (folderId, folderName) => {
    if (!window.confirm(`Tem certeza que deseja excluir a pasta "${folderName}" e TODOS os clientes associados a ela? Esta ação é irreversível.`)) return;
    try {
      const {
        error
      } = await supabase.from("folders").delete().eq("id", folderId);
      if (error) throw error;
      toast.success(`Pasta "${folderName}" excluída com sucesso.`);
      setActiveFolderId("all");
      loadData();
    } catch (err) {
      console.error("Erro ao excluir pasta:", err);
      toast.error("Não foi possível excluir a pasta.");
    }
  };
  const handleAddManualLead = async (e) => {
    e.preventDefault();
    if (!manualLead.name || !manualLead.phone || !manualLead.folder_id) {
      toast.error("Nome, Telefone e Pasta Destino são campos obrigatórios!");
      return;
    }
    try {
      const companyId = await getCompanyId();
      const {
        error
      } = await supabase.from("clients").insert([{
        name: manualLead.name,
        phone: manualLead.phone,
        favorite_dish: manualLead.favorite_dish || null,
        total_spent: Number(manualLead.total_spent) || 0,
        last_order: manualLead.last_order || null,
        folder_id: manualLead.folder_id,
        company_id: companyId
      }]);
      if (error) throw error;
      toast.success("Lead adicionado com sucesso!");
      setShowManualModal(false);
      setManualLead({
        name: "",
        phone: "",
        favorite_dish: "",
        total_spent: "",
        last_order: "",
        folder_id: ""
      });
      loadData();
    } catch (err) {
      console.error("Erro ao adicionar lead:", err);
      toast.error("Erro ao adicionar o lead.");
    }
  };
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Formato inválido. Por favor, envie apenas arquivos .csv");
      return;
    }
    if (!targetFolderId) {
      toast.error("Selecione uma Pasta Destino para os leads.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (!content) return;
      try {
        const companyId = await getCompanyId();
        const lines = content.split("\n");
        const newClientsList = [];
        lines.forEach((line, index) => {
          if (index === 0 && line.toLowerCase().includes("nome")) return;
          const parts = line.split(/[,;]/);
          if (parts.length >= 2) {
            const name = parts[0]?.trim();
            const phone = parts[1]?.trim();
            if (!name || !phone) return;
            const favorite_dish = parts[2]?.trim() || null;
            const total_spent = Number(parts[3]) || 0;
            const last_order = parts[4]?.trim() || null;
            newClientsList.push({
              name,
              phone,
              favorite_dish,
              total_spent,
              last_order,
              folder_id: targetFolderId,
              company_id: companyId
            });
          }
        });
        if (newClientsList.length > 0) {
          const {
            error
          } = await supabase.from("clients").insert(newClientsList);
          if (error) throw error;
          toast.success(`${newClientsList.length} clientes importados com sucesso para a pasta!`);
          setShowModal(false);
          loadData();
        } else {
          toast.error("Nenhum dado válido encontrado no arquivo CSV.");
        }
      } catch (err) {
        console.error("Erro ao importar CSV:", err);
        toast.error("Erro ao importar os dados. Verifique a formatação.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleDeleteClient = async (id, name) => {
    try {
      const {
        error
      } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      setClients(clients.filter((c) => c.id !== id));
      toast.success(`Cliente "${name}" foi removido do CRM.`);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      toast.error("Não foi possível excluir o cliente.");
    }
  };
  const getDaysAgo = (dateStr) => {
    if (!dateStr) return "Desconhecido";
    const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "ontem";
    return `há ${diffDays} dias`;
  };
  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
    const matchesFolder = activeFolderId === "all" || c.folder_id === activeFolderId;
    return matchesSearch && matchesFolder;
  });
  const totalSpentAll = filteredClients.reduce((acc, c) => acc + (c.total_spent || 0), 0);
  const averageSpent = filteredClients.length > 0 ? (totalSpentAll / filteredClients.length).toFixed(2) : "0";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(Sidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsx(Topbar, {}),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Clientes (CRM)" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Monitore e gerencie sua base ativa segmentada por pastas." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => setShowManualModal(true), className: "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent hover:-translate-y-0.5 transition-transform cursor-pointer", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              " Novo Lead"
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setShowModal(true), className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
              " Importar Lista"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => setActiveFolderId("all"), className: `px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${activeFolderId === "all" ? "bg-primary text-primary-foreground shadow-md" : "bg-surface border border-border text-muted-foreground hover:bg-accent hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
            " Todas as Pastas"
          ] }),
          folders.map((folder) => /* @__PURE__ */ jsxs("div", { className: `flex items-center rounded-xl transition-all ${activeFolderId === folder.id ? "bg-accent border border-border text-foreground shadow-sm" : "bg-surface border border-transparent text-muted-foreground hover:bg-accent/50"}`, children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => setActiveFolderId(folder.id), className: "px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsx(Folder, { className: "h-4 w-4" }),
              " ",
              folder.name
            ] }),
            activeFolderId === folder.id && /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteFolder(folder.id, folder.name), title: "Excluir Pasta e Clientes", className: "pr-3 pl-1 py-2 text-muted-foreground hover:text-destructive cursor-pointer transition-colors", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
          ] }, folder.id)),
          isCreatingFolder ? /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateFolder, className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("input", { type: "text", autoFocus: true, placeholder: "Nome da pasta...", value: newFolderName, onChange: (e) => setNewFolderName(e.target.value), className: "rounded-xl border border-primary bg-background px-3 py-2 text-sm font-medium outline-none w-40" }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-primary/20 hover:bg-primary/30 text-primary p-2 rounded-xl transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setIsCreatingFolder(false), className: "bg-muted hover:bg-accent text-muted-foreground p-2 rounded-xl transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
          ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => setIsCreatingFolder(true), className: "px-4 py-2 text-sm font-semibold rounded-xl border border-dashed border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 transition-colors cursor-pointer", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            " Nova Pasta"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 shadow-card relative overflow-hidden flex flex-col justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Total de Clientes" }),
                /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-3 text-2xl font-bold", children: filteredClients.length }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Clientes na pasta selecionada" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-6 shadow-card relative overflow-hidden flex flex-col justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wider text-muted-foreground font-medium", children: "Ticket Médio" }),
                /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4 text-primary" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 text-2xl font-bold", children: [
                "R$ ",
                averageSpent
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 text-[10px] text-muted-foreground", children: "Valor médio de gasto (nesta pasta)" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 border-b border-border gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-1 max-w-md items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Buscar cliente por nome ou telefone...", className: "flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground" })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border", children: [
              /* @__PURE__ */ jsx("th", { className: "text-left font-medium px-5 py-4", children: "Cliente" }),
              /* @__PURE__ */ jsx("th", { className: "text-left font-medium py-4", children: "Último Pedido" }),
              /* @__PURE__ */ jsx("th", { className: "text-left font-medium py-4", children: "Prato Favorito" }),
              /* @__PURE__ */ jsx("th", { className: "text-right font-medium py-4", children: "Total Gasto" }),
              /* @__PURE__ */ jsx("th", { className: "text-right font-medium py-4 pr-5", children: "Ações" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/60", children: isLoading ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "text-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground mx-auto" }) }) }) : filteredClients.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "text-center py-12 text-muted-foreground", children: "Nenhum cliente encontrado nesta pasta." }) }) : filteredClients.map((c, index) => {
              return /* @__PURE__ */ jsxs(motion.tr, { initial: {
                opacity: 0
              }, animate: {
                opacity: 1
              }, transition: {
                delay: index * 0.02
              }, className: "hover:bg-accent/20 transition-colors", children: [
                /* @__PURE__ */ jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-9 w-9 rounded-xl grid place-items-center font-bold text-xs shadow-sm select-none bg-muted text-muted-foreground border border-border", children: c.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground flex items-center gap-1.5", children: c.name }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground font-mono mt-0.5", children: c.phone })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxs("td", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-foreground font-medium", children: c.last_order ? new Date(c.last_order).toLocaleDateString("pt-BR") : "N/A" }),
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: getDaysAgo(c.last_order) })
                ] }),
                /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(Utensils, { className: "h-3.5 w-3.5 text-primary" }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: c.favorite_dish || "N/A" })
                ] }) }),
                /* @__PURE__ */ jsxs("td", { className: "text-right font-semibold text-foreground", children: [
                  "R$ ",
                  (c.total_spent || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2
                  })
                ] }),
                /* @__PURE__ */ jsx("td", { className: "pr-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
                  /* @__PURE__ */ jsx("button", { onClick: () => toast.success(`Mensagem manual enviada para ${c.name}`), title: "Enviar mensagem via WhatsApp", className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground hover:text-primary transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5" }) }),
                  /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteClient(c.id, c.name), title: "Remover Cliente", className: "h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive hover:text-destructive-foreground transition-colors cursor-pointer", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
                ] }) })
              ] }, c.id);
            }) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(AnimatePresence, { children: [
          showModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0,
            scale: 0.95
          }, animate: {
            opacity: 1,
            scale: 1
          }, exit: {
            opacity: 0,
            scale: 0.95
          }, className: "w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-glow relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-15" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5 text-primary" }),
                  /* @__PURE__ */ jsx("h3", { className: "font-bold text-base", children: "Importar Clientes via CSV" })
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setShowModal(false), className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-2", children: [
                /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-foreground", children: "Pasta Destino" }),
                folders.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-xs text-warning bg-warning/10 p-2 rounded-lg border border-warning/20", children: "Nenhuma pasta criada. Crie uma pasta no painel antes de importar clientes." }) : /* @__PURE__ */ jsxs("select", { value: targetFolderId, onChange: (e) => setTargetFolderId(e.target.value), className: "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-primary/50 transition-colors", children: [
                  /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Selecione a pasta destino" }),
                  folders.map((f) => /* @__PURE__ */ jsx("option", { value: f.id, children: f.name }, f.id))
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-5 bg-background/55 border border-border/80 rounded-xl p-4 space-y-2 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold text-foreground", children: "📌 Padrão de colunas do arquivo .csv:" }),
                /* @__PURE__ */ jsx("code", { className: "block bg-[#121212] border border-border/50 rounded-lg p-2 font-mono text-[10.5px] text-primary overflow-x-auto", children: "Nome, Telefone, Prato Favorito, Total Gasto, Data Ultimo Pedido" })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: handleSelectFile, disabled: folders.length === 0, className: "w-full mt-5 border-2 border-dashed border-border hover:border-primary/50 bg-background/25 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [
                /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-2xl bg-accent group-hover:bg-primary/10 group-hover:text-primary grid place-items-center text-muted-foreground transition-all shadow-sm", children: /* @__PURE__ */ jsx(Upload, { className: "h-6 w-6" }) }),
                /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: "Clique para fazer upload do arquivo" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: ".CSV com separação por vírgula ou ponto-e-vírgula" })
                ] }),
                /* @__PURE__ */ jsx("input", { type: "file", ref: fileInputRef, accept: ".csv", className: "hidden", onChange: handleFileUpload })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-5 pt-4 border-t border-border flex justify-end", children: /* @__PURE__ */ jsx("button", { onClick: () => setShowModal(false), className: "rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer", children: "Cancelar" }) })
            ] })
          ] }) }),
          showManualModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxs(motion.div, { initial: {
            opacity: 0,
            scale: 0.95
          }, animate: {
            opacity: 1,
            scale: 1
          }, exit: {
            opacity: 0,
            scale: 0.95
          }, className: "w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-glow relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "grid-bg absolute inset-0 opacity-15" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-primary" }),
                  /* @__PURE__ */ jsx("h3", { className: "font-bold text-base", children: "Adicionar Novo Lead" })
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setShowManualModal(false), className: "h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsxs("form", { onSubmit: handleAddManualLead, className: "mt-5 space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome *" }),
                    /* @__PURE__ */ jsx("input", { type: "text", required: true, value: manualLead.name, onChange: (e) => setManualLead({
                      ...manualLead,
                      name: e.target.value
                    }), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", placeholder: "Ex: João Silva" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "WhatsApp *" }),
                    /* @__PURE__ */ jsx("input", { type: "text", required: true, value: manualLead.phone, onChange: (e) => setManualLead({
                      ...manualLead,
                      phone: e.target.value
                    }), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", placeholder: "Ex: 11999999999" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Pasta Destino *" }),
                  folders.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-xs text-warning bg-warning/10 p-2 rounded-lg border border-warning/20", children: "Crie uma pasta antes de adicionar leads." }) : /* @__PURE__ */ jsxs("select", { required: true, value: manualLead.folder_id, onChange: (e) => setManualLead({
                    ...manualLead,
                    folder_id: e.target.value
                  }), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", children: [
                    /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Selecione uma pasta..." }),
                    folders.map((f) => /* @__PURE__ */ jsx("option", { value: f.id, children: f.name }, f.id))
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Prato Favorito" }),
                    /* @__PURE__ */ jsx("input", { type: "text", value: manualLead.favorite_dish, onChange: (e) => setManualLead({
                      ...manualLead,
                      favorite_dish: e.target.value
                    }), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", placeholder: "Ex: Pizza Marguerita" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Total Gasto (R$)" }),
                    /* @__PURE__ */ jsx("input", { type: "number", step: "0.01", value: manualLead.total_spent, onChange: (e) => setManualLead({
                      ...manualLead,
                      total_spent: e.target.value
                    }), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors", placeholder: "Ex: 150.00" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Data do Último Pedido" }),
                  /* @__PURE__ */ jsx("input", { type: "date", value: manualLead.last_order, onChange: (e) => setManualLead({
                    ...manualLead,
                    last_order: e.target.value
                  }), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-border flex justify-end gap-3", children: [
                  /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowManualModal(false), className: "rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer", children: "Cancelar" }),
                  /* @__PURE__ */ jsx("button", { type: "submit", disabled: folders.length === 0, className: "rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50", children: "Salvar Lead" })
                ] })
              ] })
            ] })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  ClientsPage as component
};
