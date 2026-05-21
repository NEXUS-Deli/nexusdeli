import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Search,
  ArrowLeft,
  Flame,
  Award,
  Sparkles,
  Check,
  Loader2,
  Trash2,
  MapPin,
  Clock,
  Phone,
  ChevronRight,
  MessageCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Ticket,
  Star,
  Timer,
  ChevronLeft,
  TrendingUp,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/company";
import { createOrder } from "@/lib/orders";

export const Route = createFileRoute("/cardapio")({
  component: Cardapio,
});

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  cost_price: number;
  category_id: string | null;
  is_featured: boolean;
  is_promotional: boolean;
  promotional_price: number | null;
  preparation_time: number;
  stock_quantity: number;
};

type CategoryRow = {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
};

type AddonRow = {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  price: number;
  max_quantity: number;
};

type CartItem = {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  notes: string;
  addons: Array<{ addonId?: string; addonName: string; quantity: number; price: number }>;
};

const cardapioTheme = {
  "--background": "#FAFAFA",
  "--foreground": "#111111",
  "--card": "#FFFFFF",
  "--card-foreground": "#111111",
  "--popover": "#FFFFFF",
  "--popover-foreground": "#111111",
  "--primary": "#FF5A1F",
  "--primary-foreground": "#FFFFFF",
  "--primary-glow": "#FF7A4F",
  "--secondary": "#F5F5F5",
  "--secondary-foreground": "#111111",
  "--muted": "#F0F0F0",
  "--muted-foreground": "#999999",
  "--accent": "#F5F5F5",
  "--accent-foreground": "#111111",
  "--success": "#10B981",
  "--success-foreground": "#FFFFFF",
  "--warning": "#FFC107",
  "--warning-foreground": "#111111",
  "--destructive": "#FF4D4F",
  "--destructive-foreground": "#FFFFFF",
  "--border": "#E8E8E8",
  "--input": "#E8E8E8",
  "--ring": "#FF5A1F",
  "--gradient-primary": "linear-gradient(135deg, #FF5A1F, #FF8C42)",
  "--gradient-surface": "linear-gradient(180deg, #FFFFFF, #F5F5F5)",
  "--shadow-glow":
    "0 0 0 1px rgba(255, 90, 31, 0.25), 0 10px 30px -12px rgba(255, 90, 31, 0.35)",
  "--shadow-card": "0 1px 0 0 rgba(255,255,255,1) inset, 0 4px 12px -8px rgba(0,0,0,0.12)",
  "--gradient-glow":
    "radial-gradient(60% 80% at 50% 0%, rgba(255, 90, 31, 0.08), transparent 70%)",
  "--radius": "0.875rem",
} as React.CSSProperties;

function Cardapio() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [addons, setAddons] = useState<AddonRow[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [companyName, setCompanyName] = useState("Cardapio Digital");

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerReference, setCustomerReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [changeFor, setChangeFor] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productNotes, setProductNotes] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  const [companySlug, setCompanySlug] = useState("");

  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyId();

      const { data: company } = await supabase
        .from("companies")
        .select("name, slug")
        .eq("id", companyId)
        .single();

      if (company) {
        setCompanyName(company.name);
        setCompanySlug(company.slug || "");
      }

      const [catResult, prodResult, addonResult] = await Promise.all([
        supabase
          .from("product_categories")
          .select("*")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("products")
          .select("*")
          .eq("company_id", companyId)
          .eq("is_active", true)
          .order("display_order"),
        supabase
          .from("product_addons")
          .select("*")
          .eq("company_id", companyId)
          .eq("is_active", true),
      ]);

      if (catResult.data) setCategories(catResult.data);
      if (prodResult.data) setProducts(prodResult.data);
      if (addonResult.data) setAddons(addonResult.data);
    } catch (err) {
      console.error("Erro ao carregar cardapio:", err);
      toast.error("Erro ao carregar o cardapio");
    } finally {
      setIsLoading(false);
    }
  };

  const productAddons = useMemo(() => {
    if (!selectedProduct) return [];
    return addons.filter((a) => a.product_id === selectedProduct.id);
  }, [selectedProduct, addons]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category_id === activeCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [products, activeCategory, searchTerm]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const addonTotal = item.addons.reduce((s, a) => s + a.price * a.quantity, 0);
      return sum + (item.unitPrice + addonTotal) * item.quantity;
    }, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.is_featured || p.is_promotional).slice(0, 3);
  }, [products]);

  const getProductPrice = (product: ProductRow) => {
    if (product.is_promotional && product.promotional_price) {
      return product.promotional_price;
    }
    return product.price;
  };

  const addToCart = (product: ProductRow) => {
    const itemAddons = productAddons
      .filter((a) => (selectedAddons[a.id] || 0) > 0)
      .map((a) => ({
        addonId: a.id,
        addonName: a.name,
        quantity: selectedAddons[a.id] || 0,
        price: a.price,
      }));

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.notes === productNotes &&
        JSON.stringify(item.addons) === JSON.stringify(itemAddons)
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += productQuantity;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: getProductPrice(product),
          quantity: productQuantity,
          notes: productNotes,
          addons: itemAddons,
        },
      ]);
    }

    setSelectedProduct(null);
    setProductQuantity(1);
    setProductNotes("");
    setSelectedAddons({});
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    if (updated[index].quantity === 0) {
      removeFromCart(index);
    } else {
      setCart(updated);
    }
  };

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast.error("Informe seu nome");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Informe seu telefone");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrder({
        customer: {
          name: customerName,
          phone: customerPhone.replace(/\D/g, ""),
          address: customerAddress,
          reference: customerReference,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes || undefined,
          addons: item.addons.map((a) => ({
            addonId: a.addonId,
            addonName: a.addonName,
            quantity: a.quantity,
            price: a.price,
          })),
        })),
        deliveryFee: 0,
        paymentMethod,
        changeFor:
          paymentMethod === "dinheiro" ? Number(changeFor) || undefined : undefined,
        notes: orderNotes || undefined,
      });

      setCart([]);
      setShowCheckout(false);

      window.open(result.whatsappUrl, "_blank");
      toast.success("Pedido registrado! Redirecionando para o WhatsApp...");
    } catch (err: any) {
      console.error("Erro ao criar pedido:", err);
      toast.error("Erro ao criar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAdd = (product: ProductRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setCart([
      ...cart,
      {
        productId: product.id,
        productName: product.name,
        unitPrice: getProductPrice(product),
        quantity: 1,
        notes: "",
        addons: [],
      },
    ]);
    toast.success(`${product.name} adicionado!`);
  };

  if (isLoading) {
    return (
      <div style={cardapioTheme} className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-lg mx-auto px-4 pt-6">
          <div className="animate-pulse space-y-3 mb-6">
            <div className="h-5 w-40 bg-[#E8E8E8] rounded-lg" />
            <div className="h-3 w-28 bg-[#E8E8E8] rounded-lg" />
          </div>
          <div className="animate-pulse flex gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-20 bg-[#E8E8E8] rounded-full" />
            ))}
          </div>
          <div className="animate-pulse grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl bg-white overflow-hidden shadow-[0_4px_12px_-8px_rgba(0,0,0,0.12)]">
                <div className="aspect-square bg-[#E8E8E8]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-[#E8E8E8] rounded" />
                  <div className="h-3 w-1/2 bg-[#E8E8E8] rounded" />
                  <div className="h-4 w-1/3 bg-[#E8E8E8] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={cardapioTheme}
      className="min-h-screen bg-[#FAFAFA] text-[#111111]"
    >
      {/* ─── HERO BANNER ─── */}
      {featuredProducts.length > 0 && !searchTerm && (
        <div className="relative w-full overflow-hidden">
          <div className="max-w-lg mx-auto px-4 pt-4">
            <div className="relative rounded-3xl overflow-hidden h-44 bg-gradient-to-br from-[#FF5A1F] to-[#FF8C42]">
              <img
                src={
                  featuredProducts[0].image_url ||
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
                }
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-[#FF5A1F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {featuredProducts[0].is_promotional ? "PROMOÇÃO" : "DESTAQUE"}
                  </span>
                </div>
                <h2 className="text-white text-xl font-bold leading-tight drop-shadow-sm">
                  {featuredProducts[0].name}
                </h2>
                <p className="text-white/80 text-xs mt-0.5 line-clamp-1">
                  {featuredProducts[0].description || "Peça já o seu!"}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  {featuredProducts[0].is_promotional &&
                  featuredProducts[0].promotional_price ? (
                    <>
                      <span className="text-white/60 text-xs line-through">
                        R$ {featuredProducts[0].price.toFixed(2)}
                      </span>
                      <span className="text-white font-bold text-lg">
                        R$ {featuredProducts[0].promotional_price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-white font-bold text-lg">
                      R$ {featuredProducts[0].price.toFixed(2)}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedProduct(featuredProducts[0]);
                      setProductQuantity(1);
                      setProductNotes("");
                      setSelectedAddons({});
                    }}
                    className="ml-auto bg-white text-[#FF5A1F] text-xs font-bold px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors cursor-pointer"
                  >
                    Pedir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/95 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/" })}
              className="h-9 w-9 rounded-full bg-white border border-[#E8E8E8] grid place-items-center hover:bg-[#F5F5F5] transition-colors cursor-pointer shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)]"
            >
              <ChevronLeft className="h-4 w-4 text-[#111]" />
            </button>
            <div>
              <h1 className="font-bold text-base text-[#111]">{companyName}</h1>
              <p className="text-[11px] text-[#999]">Cardápio Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchTerm(searchTerm ? "" : " ")}
              className="h-9 w-9 rounded-full bg-white border border-[#E8E8E8] grid place-items-center hover:bg-[#F5F5F5] transition-colors cursor-pointer shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)]"
            >
              <Search className="h-4 w-4 text-[#111]" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative h-9 w-9 rounded-full bg-[#FF5A1F] grid place-items-center cursor-pointer shadow-[0_2px_8px_-4px_rgba(255,90,31,0.4)]"
            >
              <ShoppingCart className="h-4 w-4 text-white" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4.5 w-4.5 min-w-[18px] rounded-full bg-[#111] text-white text-[9px] font-bold grid place-items-center px-1">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-lg mx-auto px-4 pb-3"
          >
            <div className="flex items-center gap-2 rounded-full bg-white border border-[#E8E8E8] px-4 py-2.5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.06)]">
              <Search className="h-4 w-4 text-[#999]" />
              <input
                type="text"
                value={searchTerm === " " ? "" : searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                }}
                placeholder="Buscar no cardápio..."
                className="flex-1 bg-transparent outline-none text-sm text-[#111] placeholder:text-[#bbb]"
                autoFocus
              />
              {searchTerm && searchTerm !== " " && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="cursor-pointer"
                >
                  <X className="h-4 w-4 text-[#999]" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── CATEGORIES ─── */}
        <div className="max-w-lg mx-auto px-4 pb-3" ref={categoriesRef}>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                activeCategory === "all"
                  ? "bg-[#111] text-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.2)]"
                  : "bg-white text-[#666] border border-[#E8E8E8] hover:border-[#ccc]"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#111] text-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.2)]"
                    : "bg-white text-[#666] border border-[#E8E8E8] hover:border-[#ccc]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── PRODUCT GRID ─── */}
      <main className="max-w-lg mx-auto px-4 pb-32">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-white border border-[#E8E8E8] grid place-items-center mx-auto mb-4">
              <Search className="h-6 w-6 text-[#ccc]" />
            </div>
            <p className="text-[#999] text-sm">Nenhum produto encontrado</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-3"
          >
            {filteredProducts.map((product, index) => {
              const price = getProductPrice(product);
              return (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setProductQuantity(1);
                    setProductNotes("");
                    setSelectedAddons({});
                  }}
                  className="rounded-3xl bg-white overflow-hidden text-left hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group shadow-[0_4px_12px_-8px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)]"
                >
                  <div className="aspect-square bg-[#F5F5F5] relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center">
                        <Award className="h-10 w-10 text-[#ddd]" />
                      </div>
                    )}
                    {product.is_promotional && (
                      <span className="absolute top-2 left-2 bg-[#FF5A1F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-[0_2px_4px_rgba(255,90,31,0.3)]">
                        <TrendingUp className="h-2.5 w-2.5" /> OFF
                      </span>
                    )}
                    {product.is_featured && !product.is_promotional && (
                      <span className="absolute top-2 left-2 bg-[#111] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5" /> Destaque
                      </span>
                    )}
                    <div className="absolute bottom-2 right-2">
                      <div
                        onClick={(e) => quickAdd(product, e)}
                        className="h-8 w-8 rounded-full bg-[#FF5A1F] text-white grid place-items-center shadow-[0_2px_8px_-4px_rgba(255,90,31,0.5)] hover:bg-[#e54e1a] transition-colors active:scale-90"
                      >
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-[#111] truncate leading-tight">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-[11px] text-[#999] truncate mt-0.5">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {product.is_promotional && product.promotional_price ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-[11px] text-[#bbb] line-through">
                            R$ {product.price.toFixed(2)}
                          </span>
                          <span className="font-bold text-sm text-[#FF5A1F]">
                            R$ {product.promotional_price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-sm text-[#111]">
                          R$ {product.price.toFixed(2)}
                        </span>
                      )}
                      {product.preparation_time > 0 && (
                        <span className="text-[10px] text-[#999] flex items-center gap-0.5">
                          <Timer className="h-3 w-3" />
                          {product.preparation_time}min
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* ─── PRODUCT DETAIL (BOTTOM SHEET) ─── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-0 w-full max-w-lg mx-auto left-0 right-0 bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.2)]"
            >
              {/* Image hero */}
              {selectedProduct.image_url && (
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 left-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm grid place-items-center hover:bg-white transition-colors cursor-pointer shadow-[0_2px_8px_-4px_rgba(0,0,0,0.15)]"
                  >
                    <X className="h-4 w-4 text-[#111]" />
                  </button>
                  {selectedProduct.is_promotional && (
                    <span className="absolute top-4 right-4 bg-[#FF5A1F] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      PROMOÇÃO
                    </span>
                  )}
                </div>
              )}

              <div className="p-5">
                {/* Name + price */}
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-xl font-bold text-[#111] leading-tight">
                    {selectedProduct.name}
                  </h2>
                  {!selectedProduct.image_url && (
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="h-8 w-8 rounded-full bg-[#F5F5F5] grid place-items-center hover:bg-[#E8E8E8] transition-colors cursor-pointer shrink-0 ml-2"
                    >
                      <X className="h-4 w-4 text-[#666]" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  {selectedProduct.is_promotional &&
                  selectedProduct.promotional_price ? (
                    <>
                      <span className="text-sm text-[#bbb] line-through">
                        R$ {selectedProduct.price.toFixed(2)}
                      </span>
                      <span className="font-bold text-xl text-[#FF5A1F]">
                        R$ {selectedProduct.promotional_price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-xl text-[#111]">
                      R$ {selectedProduct.price.toFixed(2)}
                    </span>
                  )}
                  {selectedProduct.preparation_time > 0 && (
                    <span className="text-xs text-[#999] flex items-center gap-1 ml-auto">
                      <Timer className="h-3.5 w-3.5" />
                      {selectedProduct.preparation_time} min
                    </span>
                  )}
                </div>

                {selectedProduct.description && (
                  <p className="text-sm text-[#666] leading-relaxed mb-5">
                    {selectedProduct.description}
                  </p>
                )}

                {/* Addons */}
                {productAddons.length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold text-[#111] uppercase tracking-wider mb-3">
                      Adicionais
                    </h3>
                    <div className="space-y-2">
                      {productAddons.map((addon) => {
                        const count = selectedAddons[addon.id] || 0;
                        return (
                          <div
                            key={addon.id}
                            className={`flex items-center justify-between bg-[#FAFAFA] rounded-2xl px-4 py-3 border transition-all ${
                              count > 0
                                ? "border-[#FF5A1F]/30 bg-[#FF5A1F]/5"
                                : "border-[#E8E8E8]"
                            }`}
                          >
                            <div>
                              <span className="text-sm font-medium text-[#111]">
                                {addon.name}
                              </span>
                              {addon.price > 0 && (
                                <span className="text-xs text-[#999] ml-1.5">
                                  + R$ {addon.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedAddons((prev) => ({
                                    ...prev,
                                    [addon.id]: Math.max(0, (prev[addon.id] || 0) - 1),
                                  }))
                                }
                                className={`h-7 w-7 rounded-full border grid place-items-center transition-colors cursor-pointer ${
                                  count > 0
                                    ? "bg-[#FF5A1F] border-[#FF5A1F] text-white"
                                    : "bg-white border-[#E8E8E8] text-[#666] hover:border-[#ccc]"
                                }`}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-5 text-center text-sm font-semibold text-[#111]">
                                {count}
                              </span>
                              <button
                                onClick={() => {
                                  if (count < addon.max_quantity) {
                                    setSelectedAddons((prev) => ({
                                      ...prev,
                                      [addon.id]: (prev[addon.id] || 0) + 1,
                                    }));
                                  }
                                }}
                                className={`h-7 w-7 rounded-full border grid place-items-center transition-colors cursor-pointer ${
                                  count >= addon.max_quantity
                                    ? "bg-[#F5F5F5] border-[#E8E8E8] text-[#ccc]"
                                    : "bg-white border-[#E8E8E8] text-[#666] hover:border-[#ccc]"
                                }`}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mb-5">
                  <h3 className="text-xs font-bold text-[#111] uppercase tracking-wider mb-2">
                    Observações
                  </h3>
                  <textarea
                    value={productNotes}
                    onChange={(e) => setProductNotes(e.target.value)}
                    placeholder="Alguma observação para este item?"
                    className="w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-3 text-sm outline-none resize-none h-20 text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                  />
                </div>

                {/* Quantity + Add to Cart */}
                <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-[#E8E8E8] -mx-5 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-[#FAFAFA] rounded-2xl px-3 py-1.5">
                      <button
                        onClick={() =>
                          setProductQuantity(Math.max(1, productQuantity - 1))
                        }
                        className="h-8 w-8 rounded-full bg-white border border-[#E8E8E8] grid place-items-center hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                      >
                        <Minus className="h-4 w-4 text-[#111]" />
                      </button>
                      <span className="text-lg font-bold text-[#111] w-8 text-center">
                        {productQuantity}
                      </span>
                      <button
                        onClick={() => setProductQuantity(productQuantity + 1)}
                        className="h-8 w-8 rounded-full bg-white border border-[#E8E8E8] grid place-items-center hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                      >
                        <Plus className="h-4 w-4 text-[#111]" />
                      </button>
                    </div>
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      className="rounded-2xl bg-[#FF5A1F] px-6 py-3 text-sm font-bold text-white hover:bg-[#e54e1a] transition-colors active:scale-95 cursor-pointer shadow-[0_4px_12px_-4px_rgba(255,90,31,0.5)]"
                    >
                      Adicionar • R${" "}
                      {(
                        (selectedProduct.is_promotional &&
                        selectedProduct.promotional_price
                          ? selectedProduct.promotional_price
                          : selectedProduct.price) * productQuantity
                      ).toFixed(2)}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── FLOATING CART BAR ─── */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 pb-5 max-w-lg mx-auto pointer-events-none">
          <motion.button
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => setCartOpen(true)}
            className="w-full rounded-2xl bg-[#111] text-white px-5 py-3.5 flex items-center justify-between shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all pointer-events-auto cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#FF5A1F] text-[9px] font-bold grid place-items-center">
                  {cartItemsCount}
                </span>
              </div>
              <span className="text-sm font-semibold">Ver carrinho</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">R$ {cartTotal.toFixed(2)}</span>
              <ChevronRight className="h-4 w-4 text-white/60" />
            </div>
          </motion.button>
        </div>
      )}

      {/* ─── CART DRAWER ─── */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.2)] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#E8E8E8]">
                <h2 className="font-bold text-lg text-[#111] flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#FF5A1F]" />
                  Carrinho
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="h-8 w-8 rounded-full bg-[#F5F5F5] grid place-items-center hover:bg-[#E8E8E8] transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4 text-[#666]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-[#F5F5F5] grid place-items-center mx-auto mb-4">
                      <ShoppingCart className="h-6 w-6 text-[#ccc]" />
                    </div>
                    <p className="text-[#999] text-sm">Carrinho vazio</p>
                  </div>
                ) : (
                  cart.map((item, index) => {
                    const addonTotal = item.addons.reduce(
                      (sum, a) => sum + a.price * a.quantity,
                      0
                    );
                    const itemTotal = (item.unitPrice + addonTotal) * item.quantity;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#FAFAFA] rounded-2xl border border-[#E8E8E8] p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-white rounded-full px-2 py-0.5 border border-[#E8E8E8] shadow-[0_1px_4px_-2px_rgba(0,0,0,0.06)]">
                                <button
                                  onClick={() => updateCartQuantity(index, -1)}
                                  className="cursor-pointer"
                                >
                                  <Minus className="h-3 w-3 text-[#666]" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center text-[#111]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartQuantity(index, 1)}
                                  className="cursor-pointer"
                                >
                                  <Plus className="h-3 w-3 text-[#666]" />
                                </button>
                              </div>
                              <span className="font-semibold text-sm text-[#111] truncate">
                                {item.productName}
                              </span>
                            </div>
                            {item.addons.length > 0 && (
                              <div className="mt-1 text-[11px] text-[#999] pl-10">
                                {item.addons.map((a, i) => (
                                  <span key={i}>
                                    + {a.addonName}
                                    {a.quantity > 1 ? ` (${a.quantity}x)` : ""}
                                    {i < item.addons.length - 1 ? ", " : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.notes && (
                              <p className="text-[11px] text-[#999] mt-0.5 pl-10 italic">
                                Obs: {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div className="font-semibold text-sm text-[#111]">
                              R$ {itemTotal.toFixed(2)}
                            </div>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-[#999] hover:text-[#FF4D4F] mt-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-[#E8E8E8] p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#999]">Total</span>
                    <span className="font-bold text-xl text-[#111]">
                      R$ {cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setShowCheckout(true);
                    }}
                    className="w-full rounded-2xl bg-[#FF5A1F] py-3.5 text-sm font-bold text-white hover:bg-[#e54e1a] transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_-4px_rgba(255,90,31,0.5)]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar Pedido pelo WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── CHECKOUT MODAL ─── */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#111]">
                    Finalizar Pedido
                  </h2>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="h-8 w-8 rounded-full bg-[#F5F5F5] grid place-items-center hover:bg-[#E8E8E8] transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4 text-[#666]" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#999]">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#999]">
                      WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#999]">
                      Endereço de entrega
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Rua, número, bairro"
                      className="w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#999]">
                      Ponto de referência
                    </label>
                    <input
                      type="text"
                      value={customerReference}
                      onChange={(e) => setCustomerReference(e.target.value)}
                      placeholder="Próximo ao ..."
                      className="w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#999]">
                      Forma de pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "pix", label: "PIX", icon: Smartphone },
                        { value: "dinheiro", label: "Dinheiro", icon: Banknote },
                        {
                          value: "cartao_credito",
                          label: "Cartão Crédito",
                          icon: CreditCard,
                        },
                        {
                          value: "cartao_debito",
                          label: "Cartão Débito",
                          icon: CreditCard,
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPaymentMethod(option.value)}
                          className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                            paymentMethod === option.value
                              ? "bg-[#FF5A1F]/10 border-[#FF5A1F] text-[#FF5A1F]"
                              : "bg-[#FAFAFA] border-[#E8E8E8] text-[#666] hover:text-[#111]"
                          }`}
                        >
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === "dinheiro" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#999]">
                        Troco para
                      </label>
                      <input
                        type="number"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Valor pago"
                        className="w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#999]">
                      Observações do pedido
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Alguma observação geral?"
                      className="w-full bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl px-4 py-2.5 text-sm outline-none resize-none h-20 text-[#111] placeholder:text-[#bbb] focus:border-[#FF5A1F]/40 transition-colors"
                    />
                  </div>

                  <div className="bg-[#FAFAFA] rounded-2xl border border-[#E8E8E8] p-4 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#999]">Itens</span>
                      <span className="text-[#111]">{cartItemsCount}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-1 border-t border-[#E8E8E8]">
                      <span className="text-[#111]">Total</span>
                      <span className="text-[#FF5A1F]">
                        R$ {cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-[#FF5A1F] py-3.5 text-sm font-bold text-white hover:bg-[#e54e1a] transition-colors disabled:opacity-50 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_-4px_rgba(255,90,31,0.5)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Enviar Pedido pelo WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cardapio;
