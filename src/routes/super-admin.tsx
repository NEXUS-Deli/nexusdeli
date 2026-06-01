import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import { toast } from "sonner";
import {
  Building,
  Users,
  ShoppingBag,
  UserCheck,
  Plus,
  Edit,
  UserPlus,
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Shield,
  Trash2,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/super-admin")({
  component: SuperAdminPage,
  head: () => ({
    meta: [
      { title: "Painel Super Admin — NexusDeli" },
    ],
  }),
});

interface Company {
  id: string;
  name: string;
  slug: string;
  cnpj: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  owner_id: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}

interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: string;
  status: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

function SuperAdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // KPIs
  const [kpis, setKpis] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalClients: 0,
  });

  // Modal States
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Forms
  const [compName, setCompName] = useState("");
  const [compPhone, setCompPhone] = useState("");
  const [compCnpj, setCompCnpj] = useState("");
  const [compAddress, setCompAddress] = useState("");
  const [savingComp, setSavingComp] = useState(false);

  // Manage Users
  const [companyMembers, setCompanyMembers] = useState<CompanyUser[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [linkingRole, setLinkingRole] = useState("operator");
  const [selectedUserIdToLink, setSelectedUserIdToLink] = useState("");

  // Tracking settings states
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingCompany, setTrackingCompany] = useState<Company | null>(null);
  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaTestEventCode, setMetaTestEventCode] = useState("");
  const [metaEnabled, setMetaEnabled] = useState(false);
  const [capiEnabled, setCapiEnabled] = useState(false);
  const [savingTracking, setSavingTracking] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Companies
      const { data: compData, error: compErr } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (compErr) throw compErr;
      setCompanies(compData || []);

      // 2. Fetch all profiles for linkage dropdown
      const { data: profData } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .order("email");
      setAllUsers(profData || []);

      // 3. Fetch KPI Counts
      const totalCompanies = compData?.length || 0;
      const activeCompanies = compData?.filter((c) => c.is_active).length || 0;

      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Fallback count check if clients or customers table is active
      let clientsCount = 0;
      const { count: cCount, error: cErr } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true });
      if (!cErr) {
        clientsCount = cCount || 0;
      } else {
        const { count: custCount } = await supabase
          .from("customers")
          .select("*", { count: "exact", head: true });
        clientsCount = custCount || 0;
      }

      setKpis({
        totalCompanies,
        activeCompanies,
        totalUsers: userCount || 0,
        totalOrders: orderCount || 0,
        totalClients: clientsCount,
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao carregar dados do painel administrador.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCompany = async (company: Company) => {
    try {
      const nextState = !company.is_active;
      const { error } = await supabase
        .from("companies")
        .update({ is_active: nextState })
        .eq("id", company.id);

      if (error) throw error;

      setCompanies(companies.map((c) => (c.id === company.id ? { ...c, is_active: nextState } : c)));
      setKpis((prev) => ({
        ...prev,
        activeCompanies: prev.activeCompanies + (nextState ? 1 : -1),
      }));
      toast.success(`Empresa ${nextState ? "ativada" : "desativada"} com sucesso!`);
    } catch {
      toast.error("Erro ao alterar status da empresa.");
    }
  };

  const openCreateCompany = () => {
    setEditingCompany(null);
    setCompName("");
    setCompPhone("");
    setCompCnpj("");
    setCompAddress("");
    setShowCompanyModal(true);
  };

  const openEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompName(company.name);
    setCompPhone(company.phone || "");
    setCompCnpj(company.cnpj || "");
    setCompAddress(company.address || "");
    setShowCompanyModal(true);
  };

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      toast.error("Nome da empresa é obrigatório.");
      return;
    }

    setSavingComp(true);
    try {
      const baseSlug = compName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        name: compName.trim(),
        phone: compPhone.trim() || null,
        cnpj: compCnpj.trim() || null,
        address: compAddress.trim() || null,
      };

      if (editingCompany) {
        const { error } = await supabase
          .from("companies")
          .update(payload)
          .eq("id", editingCompany.id);

        if (error) throw error;
        toast.success("Empresa atualizada.");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("companies").insert({
          ...payload,
          slug,
          owner_id: user?.id || null,
          is_active: true,
        });

        if (error) throw error;
        toast.success("Empresa criada.");
      }

      setShowCompanyModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar empresa.");
    } finally {
      setSavingComp(false);
    }
  };

  const loadCompanyUsers = async (companyId: string) => {
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
        .from("company_users")
        .select("id, company_id, user_id, role, status, profiles(full_name, email)")
        .eq("company_id", companyId);

      if (error) throw error;
      setCompanyMembers((data as any) || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar usuários da empresa.");
    } finally {
      setLoadingMembers(false);
    }
  };

  const openManageUsers = (company: Company) => {
    setSelectedCompany(company);
    setShowUsersModal(true);
    loadCompanyUsers(company.id);
  };

  const handleLinkUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserIdToLink || !selectedCompany) return;

    try {
      // Check if user is already linked
      const alreadyLinked = companyMembers.some((m) => m.user_id === selectedUserIdToLink);
      if (alreadyLinked) {
        toast.error("Este usuário já está vinculado a esta empresa.");
        return;
      }

      const { error } = await supabase.from("company_users").insert({
        company_id: selectedCompany.id,
        user_id: selectedUserIdToLink,
        role: linkingRole,
        status: "active",
      });

      if (error) throw error;

      toast.success("Usuário vinculado com sucesso!");
      loadCompanyUsers(selectedCompany.id);
      setSelectedUserIdToLink("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao vincular usuário.");
    }
  };

  const handleUnlinkUser = async (linkId: string) => {
    if (!window.confirm("Remover o vínculo deste usuário com a empresa?")) return;

    try {
      const { error } = await supabase.from("company_users").delete().eq("id", linkId);
      if (error) throw error;

      toast.success("Vínculo removido.");
      if (selectedCompany) {
        loadCompanyUsers(selectedCompany.id);
      }
    } catch {
      toast.error("Erro ao remover vínculo.");
    }
  };

  const openTrackingSettings = async (company: Company) => {
    setTrackingCompany(company);
    setShowTrackingModal(true);
    setLoadingTracking(true);
    setMetaPixelId("");
    setMetaAccessToken("");
    setMetaTestEventCode("");
    setMetaEnabled(false);
    setCapiEnabled(false);
    try {
      const { data, error } = await supabase
        .from("company_tracking_settings")
        .select("*")
        .eq("company_id", company.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setMetaPixelId(data.meta_pixel_id || "");
        setMetaAccessToken(data.meta_access_token || "");
        setMetaTestEventCode(data.meta_test_event_code || "");
        setMetaEnabled(data.meta_enabled || false);
        setCapiEnabled(data.capi_enabled || false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar configurações de rastreamento.");
    } finally {
      setLoadingTracking(false);
    }
  };

  const saveTrackingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCompany) return;

    setSavingTracking(true);
    try {
      const { error } = await supabase
        .from("company_tracking_settings")
        .upsert({
          company_id: trackingCompany.id,
          meta_pixel_id: metaPixelId.trim() || null,
          meta_access_token: metaAccessToken.trim() || null,
          meta_test_event_code: metaTestEventCode.trim() || null,
          meta_enabled: metaEnabled,
          capi_enabled: capiEnabled,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Configurações de rastreamento salvas com sucesso!");
      setShowTrackingModal(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar configurações de rastreamento.");
    } finally {
      setSavingTracking(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
                <Shield className="h-3 w-3" /> Painel Geral
              </div>
              <h1 className="text-2xl font-bold tracking-tight mt-1.5">Super Administrador</h1>
              <p className="text-sm text-muted-foreground">Gerencie as empresas e acessos de todo o SaaS.</p>
            </div>
            <button
              onClick={openCreateCompany}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Criar Empresa
            </button>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card">
              <Building className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-bold">{kpis.totalCompanies}</div>
              <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Empresas</div>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card">
              <CheckCircle className="h-5 w-5 text-success mb-2" />
              <div className="text-2xl font-bold">{kpis.activeCompanies}</div>
              <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Empresas Ativas</div>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card">
              <Users className="h-5 w-5 text-warning mb-2" />
              <div className="text-2xl font-bold">{kpis.totalUsers}</div>
              <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Usuários</div>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card">
              <ShoppingBag className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-bold">{kpis.totalOrders}</div>
              <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Pedidos</div>
            </div>
            <div className="rounded-2xl border border-border bg-gradient-surface p-4 shadow-card col-span-2 lg:col-span-1">
              <UserCheck className="h-5 w-5 text-success mb-2" />
              <div className="text-2xl font-bold">{kpis.totalClients}</div>
              <div className="text-[11px] text-muted-foreground uppercase font-medium mt-1">Clientes</div>
            </div>
          </div>

          {/* Companies List */}
          <div className="rounded-2xl border border-border bg-gradient-surface p-5 shadow-card">
            <h2 className="text-lg font-bold mb-4">Empresas Cadastradas</h2>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                      <th className="pb-3">Nome / Slug</th>
                      <th className="pb-3">Telefone</th>
                      <th className="pb-3">CNPJ</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-accent/20 transition-colors">
                        <td className="py-3.5 font-medium">
                          <div>{company.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{company.slug}</div>
                        </td>
                        <td className="py-3.5 text-muted-foreground">{company.phone || "—"}</td>
                        <td className="py-3.5 text-muted-foreground">{company.cnpj || "—"}</td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleToggleCompany(company)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:brightness-110 transition-all bg-background"
                          >
                            {company.is_active ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-success" />
                                <span className="text-success text-[10px]">Ativa</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-destructive" />
                                <span className="text-destructive text-[10px]">Inativa</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEditCompany(company)}
                              className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer transition-colors"
                              title="Editar Empresa"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openManageUsers(company)}
                              className="h-8 px-2.5 rounded-lg border border-border inline-flex items-center gap-1.5 hover:bg-accent cursor-pointer text-xs font-medium transition-colors"
                              title="Gerenciar Usuários"
                            >
                              <UserPlus className="h-3.5 w-3.5" />
                              Usuários
                            </button>
                            <button
                              onClick={() => openTrackingSettings(company)}
                              className="h-8 px-2.5 rounded-lg border border-border inline-flex items-center gap-1.5 hover:bg-accent cursor-pointer text-xs font-medium transition-colors"
                              title="Configurações de Rastreamento (Meta)"
                            >
                              <Target className="h-3.5 w-3.5" />
                              Integrações
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          Nenhuma empresa cadastrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create / Edit Company Modal */}
      <AnimatePresence>
        {showCompanyModal && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-glow overflow-hidden"
            >
              <form onSubmit={saveCompany} className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">
                    {editingCompany ? "Editar Empresa" : "Nova Empresa"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowCompanyModal(false)}
                    className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground font-medium">Nome da Empresa *</label>
                    <input
                      type="text"
                      required
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground font-medium">Telefone</label>
                    <input
                      type="tel"
                      value={compPhone}
                      onChange={(e) => setCompPhone(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground font-medium">CNPJ</label>
                    <input
                      type="text"
                      value={compCnpj}
                      onChange={(e) => setCompCnpj(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground font-medium">Endereço</label>
                    <input
                      type="text"
                      value={compAddress}
                      onChange={(e) => setCompAddress(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCompanyModal(false)}
                      className="rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingComp}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingComp ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Salvar
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Users Linkage Modal */}
      <AnimatePresence>
        {showUsersModal && selectedCompany && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Gerenciar Acessos</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Empresa: {selectedCompany.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUsersModal(false)}
                    className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Add link form */}
                <form onSubmit={handleLinkUser} className="bg-background/40 border border-border/80 rounded-xl p-4 mb-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Vincular Novo Usuário</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <select
                        required
                        value={selectedUserIdToLink}
                        onChange={(e) => setSelectedUserIdToLink(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/60"
                      >
                        <option value="">Selecione um usuário...</option>
                        {allUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name || "Sem Nome"} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={linkingRole}
                        onChange={(e) => setLinkingRole(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/60"
                      >
                        <option value="operator">Operador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:opacity-90 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Vincular Usuário
                  </button>
                </form>

                {/* Users List */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Usuários Vinculados</h3>
                  {loadingMembers ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                      {companyMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between border border-border/50 bg-background/30 rounded-xl p-3 text-xs">
                          <div>
                            <div className="font-semibold text-foreground">
                              {member.profiles?.full_name || "Sem Nome"}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {member.profiles?.email} · Role: {member.role}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlinkUser(member.id)}
                            className="h-7 w-7 rounded-lg border border-destructive/20 hover:bg-destructive/10 grid place-items-center text-destructive cursor-pointer"
                            title="Remover Acesso"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {companyMembers.length === 0 && (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          Nenhum usuário vinculado a esta empresa.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Tracking Settings Modal */}
      <AnimatePresence>
        {showTrackingModal && trackingCompany && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-glow overflow-hidden"
            >
              <form onSubmit={saveTrackingSettings} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Configurações de Analytics</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Empresa: {trackingCompany.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTrackingModal(false)}
                    className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {loadingTracking ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Meta Pixel ID</label>
                      <input
                        type="text"
                        placeholder="Ex: 1234567890"
                        value={metaPixelId}
                        onChange={(e) => setMetaPixelId(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Meta Access Token (CAPI)</label>
                      <textarea
                        rows={3}
                        placeholder="EAABw..."
                        value={metaAccessToken}
                        onChange={(e) => setMetaAccessToken(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60 resize-none font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Meta Test Event Code (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: TEST12345"
                        value={metaTestEventCode}
                        onChange={(e) => setMetaTestEventCode(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-b border-border/60">
                      <div>
                        <div className="text-xs font-semibold text-foreground">Habilitar Meta Pixel (Browser)</div>
                        <div className="text-[10px] text-muted-foreground">Rastrear eventos via navegador</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={metaEnabled}
                        onChange={(e) => setMetaEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border/60">
                      <div>
                        <div className="text-xs font-semibold text-foreground">Habilitar Conversions API (CAPI)</div>
                        <div className="text-[10px] text-muted-foreground">Enviar evento de Purchase via servidor</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={capiEnabled}
                        onChange={(e) => setCapiEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTrackingModal(false)}
                        className="rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingTracking}
                        className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {savingTracking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
