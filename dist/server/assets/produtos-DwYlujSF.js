import { S as reactExports, J as jsxRuntimeExports } from "./server-3KlhyZH_.js";
import { d as Sidebar, T as Topbar, P as Package } from "./Topbar-CQk6A6ur.js";
import { d as createLucideIcon, g as getCompanyId, s as supabase, P as Plus, S as Search, a as LoaderCircle, h as motion, T as Trash2, A as AnimatePresence, X, t as toast } from "./router-CgDrIRmR.js";
import { F as Folder, U as Upload } from "./upload-ni-D124e.js";
import { S as Sparkles } from "./sparkles-DYcJv7Hm.js";
import { S as Save } from "./save-D23I4CxB.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./log-out-BDyVC8AH.js";
const __iconNode$3 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
const Image = createLucideIcon("image", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode$2);
const __iconNode$1 = [
  ["circle", { cx: "9", cy: "12", r: "3", key: "u3jwor" }],
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "7", key: "g7kal2" }]
];
const ToggleLeft = createLucideIcon("toggle-left", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "15", cy: "12", r: "3", key: "1afu0r" }],
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "7", key: "g7kal2" }]
];
const ToggleRight = createLucideIcon("toggle-right", __iconNode);
function ProductsPage() {
  const [products, setProducts] = reactExports.useState([]);
  const [categories, setCategories] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [filterCategory, setFilterCategory] = reactExports.useState("all");
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingProduct, setEditingProduct] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [uploadingImage, setUploadingImage] = reactExports.useState(false);
  const [formName, setFormName] = reactExports.useState("");
  const [formDescription, setFormDescription] = reactExports.useState("");
  const [formCategoryId, setFormCategoryId] = reactExports.useState("");
  const [formPrice, setFormPrice] = reactExports.useState("");
  const [formCostPrice, setFormCostPrice] = reactExports.useState("");
  const [formPrepTime, setFormPrepTime] = reactExports.useState("0");
  const [formStock, setFormStock] = reactExports.useState("999");
  const [formFeatured, setFormFeatured] = reactExports.useState(false);
  const [formPromotional, setFormPromotional] = reactExports.useState(false);
  const [formPromoPrice, setFormPromoPrice] = reactExports.useState("");
  const [formImageUrl, setFormImageUrl] = reactExports.useState("");
  const [formImagePreview, setFormImagePreview] = reactExports.useState(null);
  const [formImageFile, setFormImageFile] = reactExports.useState(null);
  const [formImageUploading, setFormImageUploading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const loadData = reactExports.useCallback(async () => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyId();
      const [prodResult, catResult] = await Promise.all([supabase.from("products").select("*, product_categories(name)").eq("company_id", companyId).order("display_order"), supabase.from("product_categories").select("*").eq("company_id", companyId).order("display_order")]);
      if (prodResult.data) setProducts(prodResult.data);
      if (catResult.data) setCategories(catResult.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    loadData();
  }, [loadData]);
  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormCategoryId("");
    setFormPrice("");
    setFormCostPrice("");
    setFormPrepTime("0");
    setFormStock("999");
    setFormFeatured(false);
    setFormPromotional(false);
    setFormPromoPrice("");
    setFormImageUrl("");
    setFormImagePreview(null);
    setFormImageFile(null);
    setEditingProduct(null);
  };
  const openEdit = (product) => {
    setFormName(product.name);
    setFormDescription(product.description || "");
    setFormCategoryId(product.category_id || "");
    setFormPrice(product.price.toString());
    setFormCostPrice(product.cost_price.toString());
    setFormPrepTime(product.preparation_time.toString());
    setFormStock(product.stock_quantity.toString());
    setFormFeatured(product.is_featured);
    setFormPromotional(product.is_promotional);
    setFormPromoPrice(product.promotional_price?.toString() || "");
    setFormImageUrl(product.image_url || "");
    setFormImagePreview(product.image_url || null);
    setFormImageFile(null);
    setEditingProduct(product);
    setShowForm(true);
  };
  const uploadImageToStorage = async (file) => {
    const bucket = "product-images";
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const {
      error: uploadError
    } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });
    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      if (uploadError.message === "The resource was not found") {
        throw new Error('Bucket "product-images" não existe. Crie manualmente no Supabase: Storage > New Bucket > nome: product-images, público: ON, limite: 2MB, tipos: image/png, image/jpeg, image/webp');
      }
      throw new Error(uploadError.message);
    }
    const {
      data: publicUrl
    } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2MB");
      return;
    }
    setFormImageFile(file);
    setFormImagePreview(URL.createObjectURL(file));
    setFormImageUrl("");
  };
  const removeImage = () => {
    setFormImageUrl("");
    setFormImagePreview(null);
    setFormImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      const companyId = await getCompanyId();
      let imageUrl = formImageUrl;
      if (formImageFile) {
        setFormImageUploading(true);
        try {
          const url = await uploadImageToStorage(formImageFile);
          if (url) imageUrl = url;
        } finally {
          setFormImageUploading(false);
        }
      }
      const payload = {
        company_id: companyId,
        name: formName.trim(),
        description: formDescription.trim() || null,
        category_id: formCategoryId || null,
        price: Number(formPrice),
        cost_price: Number(formCostPrice) || 0,
        preparation_time: Number(formPrepTime) || 0,
        stock_quantity: Number(formStock) || 0,
        is_active: true,
        is_featured: formFeatured,
        is_promotional: formPromotional,
        promotional_price: formPromotional ? Number(formPromoPrice) || null : null,
        image_url: imageUrl || null
      };
      if (editingProduct) {
        const {
          error
        } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Produto atualizado");
      } else {
        const {
          error
        } = await supabase.from("products").insert(payload);
        if (error) {
          if (error.message?.includes("row-level security") || error.code === "42501") {
            const {
              error: rpcError
            } = await supabase.rpc("save_product", {
              payload: JSON.parse(JSON.stringify(payload))
            });
            if (rpcError) throw rpcError;
          } else {
            throw error;
          }
        }
        toast.success("Produto criado");
      }
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err) {
      console.error("Erro detalhado:", err);
      const msg = err?.message || err?.details || "Erro ao salvar produto";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Excluir "${name}"?`)) return;
    try {
      const {
        error
      } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Produto excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
  };
  const handleToggleActive = async (product) => {
    try {
      const {
        error
      } = await supabase.from("products").update({
        is_active: !product.is_active
      }).eq("id", product.id);
      if (error) throw error;
      setProducts(products.map((p) => p.id === product.id ? {
        ...p,
        is_active: !p.is_active
      } : p));
    } catch {
      toast.error("Erro ao atualizar");
    }
  };
  const filteredProducts = products.filter((p) => {
    if (filterCategory !== "all" && p.category_id !== filterCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term);
    }
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Topbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-5 lg:px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Produtos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Gerencie seu cardápio" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            resetForm();
            setShowForm(true);
          }, className: "inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            " Novo Produto"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "Buscar produto...", className: "flex-1 bg-transparent outline-none text-foreground w-48" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: filterCategory, onChange: (e) => setFilterCategory(e.target.value), className: "rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "Todas categorias" }),
            categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat.id, children: cat.name }, cat.id))
          ] })
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredProducts.map((product) => {
          const margin = product.price > 0 ? ((product.price - product.cost_price) / product.price * 100).toFixed(0) : "0";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, initial: {
            opacity: 0
          }, animate: {
            opacity: 1
          }, className: `rounded-2xl border ${product.is_active ? "border-border" : "border-destructive/20"} bg-gradient-surface p-4 shadow-card ${!product.is_active ? "opacity-60" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-surface border border-border grid place-items-center overflow-hidden shrink-0", children: product.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image_url, alt: product.name, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm truncate", children: product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5", children: [
                    product.product_categories && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-3 w-3" }),
                      product.product_categories.name
                    ] }),
                    product.product_categories && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "·" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Margem ",
                      margin,
                      "%"
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleToggleActive(product), className: "cursor-pointer shrink-0", children: product.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleRight, { className: "h-5 w-5 text-success" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleLeft, { className: "h-5 w-5 text-muted-foreground" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
                  "R$ ",
                  product.price.toFixed(2)
                ] }),
                product.is_promotional && product.promotional_price && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-success ml-1", children: [
                  "Promo R$ ",
                  product.promotional_price.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: product.preparation_time > 0 ? `${product.preparation_time}min` : "" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-2", children: [
              product.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-2.5 w-2.5" }),
                " Destaque"
              ] }),
              product.is_promotional && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] font-bold bg-success/10 text-success px-1.5 py-0.5 rounded-md border border-success/20 flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-2.5 w-2.5" }),
                " Promo"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-1 mt-3 pt-3 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(product), className: "h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent transition-colors cursor-pointer", children: "Editar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(product.id, product.name), className: "h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] })
          ] }, product.id);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showForm && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      scale: 0.95
    }, animate: {
      opacity: 1,
      scale: 1
    }, exit: {
      opacity: 0,
      scale: 0.95
    }, className: "w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: editingProduct ? "Editar Produto" : "Novo Produto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setShowForm(false);
          resetForm();
        }, className: "h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Nome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: formName, onChange: (e) => setFormName(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Descrição" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: formDescription, onChange: (e) => setFormDescription(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none resize-none h-20 focus:border-primary/60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Categoria" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: formCategoryId, onChange: (e) => setFormCategoryId(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Sem categoria" }),
              categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat.id, children: cat.name }, cat.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Preço de venda *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", required: true, value: formPrice, onChange: (e) => setFormPrice(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Preço de custo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", value: formCostPrice, onChange: (e) => setFormCostPrice(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Tempo de preparo (min)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: formPrepTime, onChange: (e) => setFormPrepTime(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Imagem do produto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-xl bg-background border border-border grid place-items-center overflow-hidden shrink-0", children: formImagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: formImagePreview, alt: "Preview", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-6 w-6 text-muted-foreground/40" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", ref: fileInputRef, onChange: handleImageChange, className: "hidden" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent transition-colors cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
                formImageUrl ? "Trocar imagem" : "Escolher imagem"
              ] }),
              (formImageUrl || formImagePreview) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: removeImage, className: "ml-2 text-xs text-destructive hover:underline cursor-pointer", children: "Remover" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "Máximo 2MB · PNG, JPG, WEBP" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: formFeatured, onChange: (e) => setFormFeatured(e.target.checked), className: "rounded border-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Produto em destaque" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: formPromotional, onChange: (e) => setFormPromotional(e.target.checked), className: "rounded border-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Promocional" })
          ] })
        ] }),
        formPromotional && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Preço promocional" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", value: formPromoPrice, onChange: (e) => setFormPromoPrice(e.target.value), className: "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-border flex justify-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            setShowForm(false);
            resetForm();
          }, className: "rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer", children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: saving || formImageUploading, className: "rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2", children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            formImageUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3" }),
            formImageUploading ? "Enviando imagem..." : editingProduct ? "Atualizar" : "Salvar"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3 w-3" }),
            editingProduct ? "Atualizar" : "Salvar"
          ] }) })
        ] })
      ] })
    ] }) }) }) })
  ] });
}
export {
  ProductsPage as component
};
