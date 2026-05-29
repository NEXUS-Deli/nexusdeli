import { S as reactExports, J as jsxRuntimeExports } from "./server-3KlhyZH_.js";
import { d as createLucideIcon, P as Plus, a as LoaderCircle, A as AnimatePresence, h as motion, X, T as Trash2, s as supabase, t as toast } from "./router-CgDrIRmR.js";
import { d as Sidebar, T as Topbar, S as Shield, U as Users, c as ShoppingBag } from "./Topbar-CQk6A6ur.js";
import { B as Building } from "./building-CCnx5vfa.js";
import { C as CircleX } from "./circle-x-ZaRgNPvC.js";
import { S as Save } from "./save-D23I4CxB.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./log-out-BDyVC8AH.js";
const __iconNode$3 = [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const CircleCheckBig = createLucideIcon("circle-check-big", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
const SquarePen = createLucideIcon("square-pen", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
function SuperAdminPage() {
  const [companies, setCompanies] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [kpis, setKpis] = reactExports.useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalClients: 0
  });
  const [showCompanyModal, setShowCompanyModal] = reactExports.useState(false);
  const [editingCompany, setEditingCompany] = reactExports.useState(null);
  const [showUsersModal, setShowUsersModal] = reactExports.useState(false);
  const [selectedCompany, setSelectedCompany] = reactExports.useState(null);
  const [compName, setCompName] = reactExports.useState("");
  const [compPhone, setCompPhone] = reactExports.useState("");
  const [compCnpj, setCompCnpj] = reactExports.useState("");
  const [compAddress, setCompAddress] = reactExports.useState("");
  const [savingComp, setSavingComp] = reactExports.useState(false);
  const [companyMembers, setCompanyMembers] = reactExports.useState([]);
  const [allUsers, setAllUsers] = reactExports.useState([]);
  const [loadingMembers, setLoadingMembers] = reactExports.useState(false);
  const [selectedUserIdToLink, setSelectedUserIdToLink] = reactExports.useState("");
  const [linkingRole, setLinkingRole] = reactExports.useState("operator");
  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: compData,
        error: compErr
      } = await supabase.from("companies").select("*").order("name");
      if (compErr) throw compErr;
      setCompanies(compData || []);
      const {
        data: profData
      } = await supabase.from("profiles").select("id, full_name, email, role").order("email");
      setAllUsers(profData || []);
      const totalCompanies = compData?.length || 0;
      const activeCompanies = compData?.filter((c) => c.is_active).length || 0;
      const {
        count: userCount
      } = await supabase.from("profiles").select("*", {
        count: "exact",
        head: true
      });
      const {
        count: orderCount
      } = await supabase.from("orders").select("*", {
        count: "exact",
        head: true
      });
      let clientsCount = 0;
      const {
        count: cCount,
        error: cErr
      } = await supabase.from("clients").select("*", {
        count: "exact",
        head: true
      });
      if (!cErr) {
        clientsCount = cCount || 0;
      } else {
        const {
          count: custCount
        } = await supabase.from("customers").select("*", {
          count: "exact",
          head: true
        });
        clientsCount = custCount || 0;
      }
      setKpis({
        totalCompanies,
        activeCompanies,
        totalUsers: userCount || 0,
        totalOrders: orderCount || 0,
        totalClients: clientsCount
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados do painel administrador.");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadData();
  }, []);
  const handleToggleCompany = async (company) => {
    try {
      const nextState = !company.is_active;
      const {
        error
      } = await supabase.from("companies").update({
        is_active: nextState
      }).eq("id", company.id);
      if (error) throw error;
      setCompanies(companies.map((c) => c.id === company.id ? {
        ...c,
        is_active: nextState
      } : c));
      setKpis((prev) => ({
        ...prev,
        activeCompanies: prev.activeCompanies + (nextState ? 1 : -1)
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
  const openEditCompany = (company) => {
    setEditingCompany(company);
    setCompName(company.name);
    setCompPhone(company.phone || "");
    setCompCnpj(company.cnpj || "");
    setCompAddress(company.address || "");
    setShowCompanyModal(true);
  };
  const saveCompany = async (e) => {
    e.preventDefault();
    if (!compName.trim()) {
      toast.error("Nome da empresa é obrigatório.");
      return;
    }
    setSavingComp(true);
    try {
      const baseSlug = compName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const slug = `${baseSlug}-${Math.floor(1e3 + Math.random() * 9e3)}`;
      const payload = {
        name: compName.trim(),
        phone: compPhone.trim() || null,
        cnpj: compCnpj.trim() || null,
        address: compAddress.trim() || null
      };
      if (editingCompany) {
        const {
          error
        } = await supabase.from("companies").update(payload).eq("id", editingCompany.id);
        if (error) throw error;
        toast.success("Empresa atualizada.");
      } else {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        const {
          error
        } = await supabase.from("companies").insert({
          ...payload,
          slug,
          owner_id: user?.id || null,
          is_active: true
        });
        if (error) throw error;
        toast.success("Empresa criada.");
      }
      setShowCompanyModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || "Erro ao salvar empresa.");
    } finally {
      setSavingComp(false);
    }
  };
  const loadCompanyUsers = async (companyId) => {
    setLoadingMembers(true);
    try {
      const {
        data,
        error
      } = await supabase.from("company_users").select("id, company_id, user_id, role, status, profiles(full_name, email)").eq("company_id", companyId);
      if (error) throw error;
      setCompanyMembers(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar usuários da empresa.");
    } finally {
      setLoadingMembers(false);
    }
  };
  const openManageUsers = (company) => {
    setSelectedCompany(company);
    setShowUsersModal(true);
    loadCompanyUsers(company.id);
  };
  const handleLinkUser = async (e) => {
    e.preventDefault();
    if (!selectedUserIdToLink || !selectedCompany) return;
    try {
      const alreadyLinked = companyMembers.some((m) => m.user_id === selectedUserIdToLink);
      if (alreadyLinked) {
        toast.error("Este usuário já está vinculado a esta empresa.");
        return;
      }
      const {
        error
      } = await supabase.from("company_users").insert({
        company_id: selectedCompany.id,
        user_id: selectedUserIdToLink,
        role: linkingRole,
        status: "active"
      });
      if (error) throw error;
      toast.success("Usuário vinculado com sucesso!");
      loadCompanyUsers(selectedCompany.id);
      setSelectedUserIdToLink("");
    } catch (err) {
      toast.error(err.message || "Erro ao vincular usuário.");
    }
  };
  const handleUnlinkUser = async (linkId) => {
    if (!window.confirm("Remover o vínculo deste usuário com a empresa?")) return;
    try {
      const {
        error
      } = await supabase.from("company_users").delete().eq("id", linkId);
      if (error) throw error;
      toast.success("Vínculo removido.");
      if (selectedCompany) {
        loadCompanyUsers(selectedCompany.id);
      }
    } catch {
      toast.error("Erro ao remover vínculo.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Topbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
              " Painel Geral"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight mt-1.5", children: "Super Administrador" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gerencie as empresas e acessos de todo o SaaS." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: openCreateCompany, className: "inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            " Criar Empresa"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-5 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "h-5 w-5 text-primary mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: kpis.totalCompanies }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground uppercase font-medium mt-1", children: "Empresas" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-5 w-5 text-success mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: kpis.activeCompanies }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground uppercase font-medium mt-1", children: "Empresas Ativas" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5 text-warning mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: kpis.totalUsers }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground uppercase font-medium mt-1", children: "Usuários" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-5 w-5 text-primary mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: kpis.totalOrders }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground uppercase font-medium mt-1", children: "Pedidos" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-4 shadow-card col-span-2 lg:col-span-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-5 w-5 text-success mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: kpis.totalClients }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground uppercase font-medium mt-1", children: "Clientes" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-gradient-surface p-5 shadow-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-4", children: "Empresas Cadastradas" }),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3", children: "Nome / Slug" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3", children: "Telefone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3", children: "CNPJ" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 text-center", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-3 text-right", children: "Ações" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border/60", children: [
              companies.map((company) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-accent/20 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3.5 font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: company.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: company.slug })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 text-muted-foreground", children: company.phone || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 text-muted-foreground", children: company.cnpj || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleToggleCompany(company), className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer hover:brightness-110 transition-all bg-background", children: company.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3 text-success" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success text-[10px]", children: "Ativa" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3 text-destructive" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive text-[10px]", children: "Inativa" })
                ] }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditCompany(company), className: "h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer transition-colors", title: "Editar Empresa", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-3.5 w-3.5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => openManageUsers(company), className: "h-8 px-2.5 rounded-lg border border-border inline-flex items-center gap-1.5 hover:bg-accent cursor-pointer text-xs font-medium transition-colors", title: "Gerenciar Usuários", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
                    "Usuários"
                  ] })
                ] }) })
              ] }, company.id)),
              companies.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "py-8 text-center text-muted-foreground", children: "Nenhuma empresa cadastrada." }) })
            ] })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showCompanyModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, exit: {
      opacity: 0,
      scale: 0.95
    }, className: "w-full max-w-md rounded-2xl border border-border bg-surface shadow-glow overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveCompany, className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: editingCompany ? "Editar Empresa" : "Nova Empresa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowCompanyModal(false), className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground font-medium", children: "Nome da Empresa *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: compName, onChange: (e) => setCompName(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground font-medium", children: "Telefone" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", value: compPhone, onChange: (e) => setCompPhone(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground font-medium", children: "CNPJ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: compCnpj, onChange: (e) => setCompCnpj(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground font-medium", children: "Endereço" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: compAddress, onChange: (e) => setCompAddress(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border flex justify-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowCompanyModal(false), className: "rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer", children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: savingComp, className: "rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5", children: [
            savingComp ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5" }),
            "Salvar"
          ] })
        ] })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showUsersModal && selectedCompany && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, exit: {
      opacity: 0,
      scale: 0.95
    }, className: "w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Gerenciar Acessos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "Empresa: ",
            selectedCompany.name
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowUsersModal(false), className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLinkUser, className: "bg-background/40 border border-border/80 rounded-xl p-4 mb-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-primary", children: "Vincular Novo Usuário" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: selectedUserIdToLink, onChange: (e) => setSelectedUserIdToLink(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Selecione um usuário..." }),
            allUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: u.id, children: [
              u.full_name || "Sem Nome",
              " (",
              u.email,
              ")"
            ] }, u.id))
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: linkingRole, onChange: (e) => setLinkingRole(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "operator", children: "Operador" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: "Administrador" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:opacity-90 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
          "Vincular Usuário"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2", children: "Usuários Vinculados" }),
        loadingMembers ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[220px] overflow-y-auto space-y-2 pr-1", children: [
          companyMembers.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border border-border/50 bg-background/30 rounded-xl p-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground", children: member.profiles?.full_name || "Sem Nome" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: [
                member.profiles?.email,
                " · Role: ",
                member.role
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleUnlinkUser(member.id), className: "h-7 w-7 rounded-lg border border-destructive/20 hover:bg-destructive/10 grid place-items-center text-destructive cursor-pointer", title: "Remover Acesso", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] }, member.id)),
          companyMembers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-xs text-muted-foreground", children: "Nenhum usuário vinculado a esta empresa." })
        ] })
      ] })
    ] }) }) }) })
  ] });
}
export {
  SuperAdminPage as component
};
