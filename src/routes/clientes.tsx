import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import { 
  Users, 
  Upload, 
  Search, 
  Trash2, 
  Plus, 
  X, 
  MessageSquare, 
  Utensils, 
  Folder,
  Loader2,
  TrendingUp, 
  Clock, 
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/clientes")({
  component: ClientsPage,
});

type FolderRow = {
  id: string;
  name: string;
};

type ClientRow = {
  id: string;
  name: string;
  phone: string;
  favorite_dish: string | null;
  total_spent: number;
  last_order: string | null;
  folder_id: string;
};

function ClientsPage() {
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string>("all");
  
  // Folder Creation State
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  // CSV Modal State
  const [showModal, setShowModal] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file selection
  const handleSelectFile = () => {
    if (!targetFolderId) {
      toast.error("Por favor, crie e selecione uma Pasta Destino antes de importar.");
      return;
    }
    fileInputRef.current?.click();
  };

  // Manual Lead Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLead, setManualLead] = useState({
    name: "", phone: "", favorite_dish: "", total_spent: "", last_order: "", folder_id: ""
  });

  const getDeliveryId = async (): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || "00000000-0000-0000-0000-000000000000";
    } catch {
      return "00000000-0000-0000-0000-000000000000";
    }
  };

  // Carregar dados iniciais do Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const deliveryId = await getDeliveryId();
      const [foldersResult, clientsResult] = await Promise.all([
        supabase.from("folders").select("*").eq("delivery_id", deliveryId).order("created_at", { ascending: true }),
        supabase.from("clients").select("*").eq("delivery_id", deliveryId).order("created_at", { ascending: false })
      ]);

      if (foldersResult.error) throw foldersResult.error;
      if (clientsResult.error) throw clientsResult.error;

      setFolders(foldersResult.data || []);
      setClients(clientsResult.data || []);
      
      if (foldersResult.data && foldersResult.data.length > 0 && targetFolderId === "") {
        setTargetFolderId(foldersResult.data[0].id);
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Falha ao carregar os clientes e pastas do banco de dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    loadData();

    // Listen for new folders created in real-time (by any user/machine)
    const folderChannel = supabase
      .channel('folders-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'folders' },
        (payload) => {
          setFolders((current) => {
            // Previne duplicidade caso seja a mesma tela criando
            if (current.find(f => f.id === payload.new.id)) return current;
            return [...current, payload.new as any];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(folderChannel);
    };
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const deliveryId = await getDeliveryId();
      const { data, error } = await supabase
        .from("folders")
        .insert([{ name: newFolderName.trim(), delivery_id: deliveryId }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setFolders([...folders, data[0]]);
        setNewFolderName("");
        setIsCreatingFolder(false);
        setActiveFolderId(data[0].id);
        if (!targetFolderId) setTargetFolderId(data[0].id);
        toast.success(`Pasta "${data[0].name}" criada com sucesso!`);
      }
    } catch (err: any) {
      console.error("Erro ao criar pasta:", err);
      toast.error("Não foi possível criar a pasta.");
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a pasta "${folderName}" e TODOS os clientes associados a ela? Esta ação é irreversível.`)) return;
    
    try {
      const { error } = await supabase.from("folders").delete().eq("id", folderId);
      if (error) throw error;
      
      toast.success(`Pasta "${folderName}" excluída com sucesso.`);
      setActiveFolderId("all");
      loadData();
    } catch (err) {
      console.error("Erro ao excluir pasta:", err);
      toast.error("Não foi possível excluir a pasta.");
    }
  };

  const handleAddManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLead.name || !manualLead.phone || !manualLead.folder_id) {
      toast.error("Nome, Telefone e Pasta Destino são campos obrigatórios!");
      return;
    }

    try {
      const deliveryId = await getDeliveryId();
      const { error } = await supabase.from("clients").insert([{
        name: manualLead.name,
        phone: manualLead.phone,
        favorite_dish: manualLead.favorite_dish || null,
        total_spent: Number(manualLead.total_spent) || 0,
        last_order: manualLead.last_order || null,
        folder_id: manualLead.folder_id,
        delivery_id: deliveryId
      }]);

      if (error) throw error;

      toast.success("Lead adicionado com sucesso!");
      setShowManualModal(false);
      setManualLead({ name: "", phone: "", favorite_dish: "", total_spent: "", last_order: "", folder_id: "" });
      loadData();
    } catch (err) {
      console.error("Erro ao adicionar lead:", err);
      toast.error("Erro ao adicionar o lead.");
    }
  };

  // Process uploaded CSV file to Supabase
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const deliveryId = await getDeliveryId();
        const lines = content.split("\n");
        const newClientsList: Partial<ClientRow & { delivery_id: string }>[] = [];

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
              delivery_id: deliveryId
            });
          }
        });

        if (newClientsList.length > 0) {
          const { error } = await supabase.from("clients").insert(newClientsList);
          if (error) throw error;

          toast.success(`${newClientsList.length} clientes importados com sucesso para a pasta!`);
          setShowModal(false);
          loadData(); // Recarrega para mostrar os novos
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

  const handleDeleteClient = async (id: string, name: string) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      
      setClients(clients.filter(c => c.id !== id));
      toast.success(`Cliente "${name}" foi removido do CRM.`);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      toast.error("Não foi possível excluir o cliente.");
    }
  };

  // Helper to format days since last order
  const getDaysAgo = (dateStr: string | null) => {
    if (!dateStr) return "Desconhecido";
    const diffTime = Math.abs(Date.now() - new Date(dateStr).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "ontem";
    return `há ${diffDays} dias`;
  };

  // Filter clients list
  const filteredClients = clients.filter(c => {
    // Search
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm);
    // Folder
    const matchesFolder = activeFolderId === "all" || c.folder_id === activeFolderId;
    
    return matchesSearch && matchesFolder;
  });

  // Dynamic statistics based on filtered clients
  const totalSpentAll = filteredClients.reduce((acc, c) => acc + (c.total_spent || 0), 0);
  const averageSpent = filteredClients.length > 0 ? (totalSpentAll / filteredClients.length).toFixed(2) : "0";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Clientes (CRM)</h1>
              <p className="text-sm text-muted-foreground">
                Monitore e gerencie sua base ativa segmentada por pastas.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowManualModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Novo Lead
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Importar Lista
              </button>
            </div>
          </div>

          {/* Pastas (Folders) Section */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFolderId("all")}
              className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeFolderId === "all"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-surface border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Users className="h-4 w-4" /> Todas as Pastas
            </button>
            
            {folders.map(folder => (
              <div 
                key={folder.id} 
                className={`flex items-center rounded-xl transition-all ${
                  activeFolderId === folder.id
                    ? "bg-accent border border-border text-foreground shadow-sm"
                    : "bg-surface border border-transparent text-muted-foreground hover:bg-accent/50"
                }`}
              >
                <button
                  onClick={() => setActiveFolderId(folder.id)}
                  className="px-4 py-2 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Folder className="h-4 w-4" /> {folder.name}
                </button>
                {activeFolderId === folder.id && (
                  <button
                    onClick={() => handleDeleteFolder(folder.id, folder.name)}
                    title="Excluir Pasta e Clientes"
                    className="pr-3 pl-1 py-2 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {isCreatingFolder ? (
              <form onSubmit={handleCreateFolder} className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nome da pasta..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="rounded-xl border border-primary bg-background px-3 py-2 text-sm font-medium outline-none w-40"
                />
                <button type="submit" className="bg-primary/20 hover:bg-primary/30 text-primary p-2 rounded-xl transition-colors cursor-pointer">
                  <Plus className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setIsCreatingFolder(false)} className="bg-muted hover:bg-accent text-muted-foreground p-2 rounded-xl transition-colors cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-dashed border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Nova Pasta
              </button>
            )}
          </div>

          {/* CRM KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-card relative overflow-hidden flex flex-col justify-center">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Total de Clientes</span>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 text-2xl font-bold">{filteredClients.length}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">Clientes na pasta selecionada</div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-gradient-surface p-6 shadow-card relative overflow-hidden flex flex-col justify-center">
              <div className="grid-bg absolute inset-0 opacity-20" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Ticket Médio</span>
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 text-2xl font-bold">R$ {averageSpent}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">Valor médio de gasto (nesta pasta)</div>
              </div>
            </div>
          </section>

          {/* Search & Table */}
          <div className="rounded-2xl border border-border bg-gradient-surface shadow-card overflow-hidden">
            
            {/* Table Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 border-b border-border gap-4">
              <div className="flex flex-1 max-w-md items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cliente por nome ou telefone..."
                  className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
                />
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left font-medium px-5 py-4">Cliente</th>
                    <th className="text-left font-medium py-4">Último Pedido</th>
                    <th className="text-left font-medium py-4">Prato Favorito</th>
                    <th className="text-right font-medium py-4">Total Gasto</th>
                    <th className="text-right font-medium py-4 pr-5">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                      </td>
                    </tr>
                  ) : filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        Nenhum cliente encontrado nesta pasta.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((c, index) => {
                      return (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-accent/20 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl grid place-items-center font-bold text-xs shadow-sm select-none bg-muted text-muted-foreground border border-border">
                                {c.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  {c.name}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{c.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="text-xs text-foreground font-medium">{c.last_order ? new Date(c.last_order).toLocaleDateString("pt-BR") : "N/A"}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{getDaysAgo(c.last_order)}</div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Utensils className="h-3.5 w-3.5 text-primary" />
                              <span className="font-medium text-foreground">{c.favorite_dish || "N/A"}</span>
                            </div>
                          </td>
                          <td className="text-right font-semibold text-foreground">
                            R$ {(c.total_spent || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="pr-5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => toast.success(`Mensagem manual enviada para ${c.name}`)}
                                title="Enviar mensagem via WhatsApp"
                                className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent text-foreground hover:text-primary transition-colors cursor-pointer"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClient(c.id, c.name)}
                                title="Remover Cliente"
                                className="h-8 w-8 grid place-items-center rounded-lg border border-destructive/20 hover:bg-destructive/12 text-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drag & Drop Import Modal */}
          <AnimatePresence>
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-glow relative overflow-hidden"
                >
                  <div className="grid-bg absolute inset-0 opacity-15" />

                  <div className="relative">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-base">Importar Clientes via CSV</h3>
                      </div>
                      <button
                        onClick={() => setShowModal(false)}
                        className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Pasta Selector */}
                    <div className="mt-5 space-y-2">
                      <label className="text-xs font-bold text-foreground">Pasta Destino</label>
                      {folders.length === 0 ? (
                        <div className="text-xs text-warning bg-warning/10 p-2 rounded-lg border border-warning/20">
                          Nenhuma pasta criada. Crie uma pasta no painel antes de importar clientes.
                        </div>
                      ) : (
                        <select 
                          value={targetFolderId}
                          onChange={(e) => setTargetFolderId(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-primary/50 transition-colors"
                        >
                          <option value="" disabled>Selecione a pasta destino</option>
                          {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-5 bg-background/55 border border-border/80 rounded-xl p-4 space-y-2 text-xs">
                      <div className="font-bold text-foreground">📌 Padrão de colunas do arquivo .csv:</div>
                      <code className="block bg-[#121212] border border-border/50 rounded-lg p-2 font-mono text-[10.5px] text-primary overflow-x-auto">
                        Nome, Telefone, Prato Favorito, Total Gasto, Data Ultimo Pedido
                      </code>
                    </div>

                    {/* Drag and Drop Zone */}
                    <button 
                      onClick={handleSelectFile}
                      disabled={folders.length === 0}
                      className="w-full mt-5 border-2 border-dashed border-border hover:border-primary/50 bg-background/25 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-accent group-hover:bg-primary/10 group-hover:text-primary grid place-items-center text-muted-foreground transition-all shadow-sm">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Clique para fazer upload do arquivo</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">.CSV com separação por vírgula ou ponto-e-vírgula</p>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </button>

                    {/* Modal footer */}
                    <div className="mt-5 pt-4 border-t border-border flex justify-end">
                      <button
                        onClick={() => setShowModal(false)}
                        className="rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>

                  </div>
                </motion.div>
              </div>
            )}
            
            {showManualModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-glow relative overflow-hidden"
                >
                  <div className="grid-bg absolute inset-0 opacity-15" />
                  <div className="relative">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-base">Adicionar Novo Lead</h3>
                      </div>
                      <button
                        onClick={() => setShowManualModal(false)}
                        className="h-8 w-8 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleAddManualLead} className="mt-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Nome *</label>
                          <input
                            type="text"
                            required
                            value={manualLead.name}
                            onChange={(e) => setManualLead({...manualLead, name: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                            placeholder="Ex: João Silva"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">WhatsApp *</label>
                          <input
                            type="text"
                            required
                            value={manualLead.phone}
                            onChange={(e) => setManualLead({...manualLead, phone: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                            placeholder="Ex: 11999999999"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Pasta Destino *</label>
                        {folders.length === 0 ? (
                          <div className="text-xs text-warning bg-warning/10 p-2 rounded-lg border border-warning/20">
                            Crie uma pasta antes de adicionar leads.
                          </div>
                        ) : (
                          <select
                            required
                            value={manualLead.folder_id}
                            onChange={(e) => setManualLead({...manualLead, folder_id: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                          >
                            <option value="" disabled>Selecione uma pasta...</option>
                            {folders.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Prato Favorito</label>
                          <input
                            type="text"
                            value={manualLead.favorite_dish}
                            onChange={(e) => setManualLead({...manualLead, favorite_dish: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                            placeholder="Ex: Pizza Marguerita"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Total Gasto (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={manualLead.total_spent}
                            onChange={(e) => setManualLead({...manualLead, total_spent: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                            placeholder="Ex: 150.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Data do Último Pedido</label>
                        <input
                          type="date"
                          value={manualLead.last_order}
                          onChange={(e) => setManualLead({...manualLead, last_order: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                        />
                      </div>

                      <div className="pt-4 border-t border-border flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowManualModal(false)}
                          className="rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={folders.length === 0}
                          className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Salvar Lead
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
