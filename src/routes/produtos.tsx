import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/nexus/Sidebar";
import { Topbar } from "@/components/nexus/Topbar";
import {
  Package,
  Plus,
  Search,
  Trash2,
  X,
  Save,
  Loader2,
  Sparkles,
  Award,
  Image as ImageIcon,
  Tag,
  Folder,
  ToggleLeft,
  ToggleRight,
  ChefHat,
  Upload,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";

export const Route = createFileRoute("/produtos")({
  component: ProductsPage,
});

type CategoryRow = {
  id: string;
  name: string;
  print_sector: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  price: number;
  cost_price: number;
  is_active: boolean;
  is_featured: boolean;
  is_promotional: boolean;
  promotional_price: number | null;
  preparation_time: number;
  stock_quantity: number;
  product_categories?: { name: string } | null;
};

function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCostPrice, setFormCostPrice] = useState("");
  const [formPrepTime, setFormPrepTime] = useState("0");
  const [formStock, setFormStock] = useState("999");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPromotional, setFormPromotional] = useState(false);
  const [formPromoPrice, setFormPromoPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImageUploading, setFormImageUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyId();
      const [prodResult, catResult] = await Promise.all([
        supabase
          .from("products")
          .select("*, product_categories(name)")
          .eq("company_id", companyId)
          .order("display_order"),
        supabase
          .from("product_categories")
          .select("*")
          .eq("company_id", companyId)
          .order("display_order"),
      ]);

      if (prodResult.error) {
        console.error("Erro produtos:", prodResult.error);
        toast.error(`Erro ao carregar produtos: ${prodResult.error.message}`);
      } else if (prodResult.data) {
        setProducts(prodResult.data as any);
      }

      if (catResult.error) {
        console.error("Erro categorias:", catResult.error);
        toast.error(`Erro ao carregar categorias: ${catResult.error.message}`);
      } else if (catResult.data) {
        setCategories(catResult.data);
      }
    } catch (err: any) {
      console.error("Erro geral no loadData:", err);
      toast.error(`Falha na conexão: ${err?.message || "Erro desconhecido"}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
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

  const openEdit = (product: ProductRow) => {
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

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    const bucket = "product-images";
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      if (uploadError.message === "The resource was not found") {
        throw new Error(
          'Bucket "product-images" não existe. Crie manualmente no Supabase: ' +
          'Storage > New Bucket > nome: product-images, público: ON, ' +
          'limite: 2MB, tipos: image/png, image/jpeg, image/webp'
        );
      }
      throw new Error(uploadError.message);
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl.publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formPrice) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const companyId = await getCompanyId();

      // Upload image if a new file was selected
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
        promotional_price: formPromotional ? (Number(formPromoPrice) || null) : null,
        image_url: imageUrl || null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Produto atualizado");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) {
          if (error.message?.includes("row-level security") || error.code === "42501") {
            const { error: rpcError } = await supabase.rpc("save_product", {
              payload: JSON.parse(JSON.stringify(payload)),
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
    } catch (err: any) {
      console.error("Erro detalhado:", err);
      const msg = err?.message || err?.details || "Erro ao salvar produto";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir "${name}"?`)) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Produto excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const handleToggleActive = async (product: ProductRow) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id);
      if (error) throw error;
      setProducts(products.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)));
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

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
              <p className="text-sm text-muted-foreground">Gerencie seu cardápio</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Novo Produto
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produto..."
                className="flex-1 bg-transparent outline-none text-foreground w-48"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="all">Todas categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const margin = product.price > 0
                  ? ((product.price - product.cost_price) / product.price * 100).toFixed(0)
                  : "0";
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-2xl border ${product.is_active ? "border-border" : "border-destructive/20"} bg-gradient-surface p-4 shadow-card ${!product.is_active ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-surface border border-border grid place-items-center overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            {product.product_categories && (
                              <span className="flex items-center gap-1">
                                <Folder className="h-3 w-3" />
                                {product.product_categories.name}
                              </span>
                            )}
                            {product.product_categories && <span>·</span>}
                            <span>Margem {margin}%</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className="cursor-pointer shrink-0"
                      >
                        {product.is_active ? (
                          <ToggleRight className="h-5 w-5 text-success" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-bold">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.is_promotional && product.promotional_price && (
                          <span className="text-xs text-success ml-1">
                            Promo R$ {product.promotional_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.preparation_time > 0 ? `${product.preparation_time}min` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {product.is_featured && (
                        <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 flex items-center gap-0.5">
                          <Sparkles className="h-2.5 w-2.5" /> Destaque
                        </span>
                      )}
                      {product.is_promotional && (
                        <span className="text-[9px] font-bold bg-success/10 text-success px-1.5 py-0.5 rounded-md border border-success/20 flex items-center gap-0.5">
                          <Tag className="h-2.5 w-2.5" /> Promo
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-border">
                      <button
                        onClick={() => openEdit(product)}
                        className="h-8 px-3 rounded-lg border border-border text-xs font-semibold hover:bg-accent transition-colors cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="h-8 w-8 rounded-lg border border-destructive/20 grid place-items-center hover:bg-destructive/12 text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleSave} className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">
                    {editingProduct ? "Editar Produto" : "Novo Produto"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Nome *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Descrição</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none resize-none h-20 focus:border-primary/60"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Categoria</label>
                      <select
                        value={formCategoryId}
                        onChange={(e) => setFormCategoryId(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                      >
                        <option value="">Sem categoria</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Preço de venda *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Preço de custo</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formCostPrice}
                        onChange={(e) => setFormCostPrice(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Tempo de preparo (min)</label>
                      <input
                        type="number"
                        value={formPrepTime}
                        onChange={(e) => setFormPrepTime(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                      />
                    </div>
                  </div>

                  {/* Image upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Imagem do produto</label>
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-xl bg-background border border-border grid place-items-center overflow-hidden shrink-0">
                        {formImagePreview ? (
                          <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent transition-colors cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {formImageUrl ? "Trocar imagem" : "Escolher imagem"}
                        </button>
                        {(formImageUrl || formImagePreview) && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="ml-2 text-xs text-destructive hover:underline cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">Máximo 2MB · PNG, JPG, WEBP</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-xs font-semibold text-muted-foreground">Produto em destaque</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPromotional}
                        onChange={(e) => setFormPromotional(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-xs font-semibold text-muted-foreground">Promocional</span>
                    </label>
                  </div>

                  {formPromotional && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Preço promocional</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formPromoPrice}
                        onChange={(e) => setFormPromoPrice(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); resetForm(); }}
                      className="rounded-xl border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving || formImageUploading}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          {formImageUploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          {formImageUploading ? "Enviando imagem..." : editingProduct ? "Atualizar" : "Salvar"}
                        </>
                      ) : (
                        <><Save className="h-3 w-3" />{editingProduct ? "Atualizar" : "Salvar"}</>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
