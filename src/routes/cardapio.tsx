import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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

  // Checkout form
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerReference, setCustomerReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [changeFor, setChangeFor] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productNotes, setProductNotes] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  const [companySlug, setCompanySlug] = useState("");

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
      const addonTotal = item.addons.reduce((a, s) => s + a.price * a.quantity, 0);
      return sum + (item.unitPrice + addonTotal) * item.quantity;
    }, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

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
        changeFor: paymentMethod === "dinheiro" ? Number(changeFor) || undefined : undefined,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Flame className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground animate-pulse">Carregando cardapio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/" })}
              className="h-9 w-9 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                <h1 className="font-bold text-lg">{companyName}</h1>
              </div>
              <p className="text-[11px] text-muted-foreground">Cardapio Digital</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative h-10 w-10 rounded-xl bg-primary grid place-items-center cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-warning text-[10px] font-bold grid place-items-center text-warning-foreground">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl bg-surface border border-border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar no cardapio..."
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-3xl mx-auto px-4 pb-2 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-muted-foreground"
            >
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum produto encontrado</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {filteredProducts.map((product) => {
                const price = getProductPrice(product);
                return (
                  <motion.button
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductQuantity(1);
                      setProductNotes("");
                      setSelectedAddons({});
                    }}
                    className="rounded-2xl border border-border bg-gradient-surface overflow-hidden text-left hover:border-primary/30 transition-all cursor-pointer group"
                  >
                    <div className="aspect-square bg-surface relative overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-muted-foreground/30">
                          <Award className="h-12 w-12" />
                        </div>
                      )}
                      {product.is_featured && (
                        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Sparkles className="h-3 w-3" /> Destaque
                        </span>
                      )}
                      {product.is_promotional && (
                        <span className="absolute top-2 right-2 bg-success text-success-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          Promo
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      {product.description && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {product.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center justify-between">
                        {product.is_promotional && product.promotional_price ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground line-through">
                              R$ {product.price.toFixed(2)}
                            </span>
                            <span className="font-bold text-sm text-success">
                              R$ {product.promotional_price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-sm">R$ {product.price.toFixed(2)}</span>
                        )}
                        <div className="h-7 w-7 rounded-full bg-primary/20 grid place-items-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="absolute bottom-0 w-full max-w-lg mx-auto left-0 right-0 bg-surface border border-border rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {selectedProduct.description && (
                  <p className="text-sm text-muted-foreground mb-4">{selectedProduct.description}</p>
                )}

                {/* Addons */}
                {productAddons.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Adicionais
                    </h3>
                    <div className="space-y-2">
                      {productAddons.map((addon) => (
                        <div
                          key={addon.id}
                          className="flex items-center justify-between bg-background rounded-xl px-3 py-2.5 border border-border"
                        >
                          <div>
                            <span className="text-sm font-medium">{addon.name}</span>
                            {addon.price > 0 && (
                              <span className="text-xs text-muted-foreground ml-1">
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
                              className="h-7 w-7 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">
                              {selectedAddons[addon.id] || 0}
                            </span>
                            <button
                              onClick={() => {
                                if ((selectedAddons[addon.id] || 0) < addon.max_quantity) {
                                  setSelectedAddons((prev) => ({
                                    ...prev,
                                    [addon.id]: (prev[addon.id] || 0) + 1,
                                  }));
                                }
                              }}
                              className="h-7 w-7 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Observacoes
                  </h3>
                  <textarea
                    value={productNotes}
                    onChange={(e) => setProductNotes(e.target.value)}
                    placeholder="Alguma observacao para este item?"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none resize-none h-20"
                  />
                </div>

                {/* Quantity + Add */}
                <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2 border border-border mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                      className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{productQuantity}</span>
                    <button
                      onClick={() => setProductQuantity(productQuantity + 1)}
                      className="h-8 w-8 rounded-lg border border-border grid place-items-center hover:bg-accent cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => addToCart(selectedProduct)}
                    className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-border shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Carrinho
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Carrinho vazio</p>
                  </div>
                ) : (
                  cart.map((item, index) => {
                    const addonTotal = item.addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
                    const itemTotal = (item.unitPrice + addonTotal) * item.quantity;
                    return (
                      <div
                        key={index}
                        className="bg-background rounded-xl border border-border p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-surface rounded-lg px-2 py-0.5 border border-border">
                                <button
                                  onClick={() => updateCartQuantity(index, -1)}
                                  className="cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(index, 1)}
                                  className="cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="font-semibold text-sm">{item.productName}</span>
                            </div>
                            {item.addons.length > 0 && (
                              <div className="mt-1 text-[11px] text-muted-foreground pl-10">
                                {item.addons.map((a, i) => (
                                  <span key={i}>
                                    + {a.addonName}{a.quantity > 1 ? ` (${a.quantity}x)` : ""}
                                    {i < item.addons.length - 1 ? ", " : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.notes && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 pl-10 italic">
                                Obs: {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">R$ {itemTotal.toFixed(2)}</div>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-muted-foreground hover:text-destructive mt-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-border p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-lg">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setShowCheckout(true);
                    }}
                    className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
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

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-glow max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">Finalizar Pedido</h2>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="h-8 w-8 rounded-xl border border-border grid place-items-center hover:bg-accent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Nome *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">WhatsApp *</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Endereco de entrega</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Rua, numero, bairro"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  {/* Reference */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Ponto de referencia</label>
                    <input
                      type="text"
                      value={customerReference}
                      onChange={(e) => setCustomerReference(e.target.value)}
                      placeholder="Proximo ao ..."
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Forma de pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "pix", label: "PIX", icon: Smartphone },
                        { value: "dinheiro", label: "Dinheiro", icon: Banknote },
                        { value: "cartao_credito", label: "Cartao Credito", icon: CreditCard },
                        { value: "cartao_debito", label: "Cartao Debito", icon: CreditCard },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPaymentMethod(option.value)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                            paymentMethod === option.value
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-background border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Change for (dinheiro only) */}
                  {paymentMethod === "dinheiro" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Troco para</label>
                      <input
                        type="number"
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        placeholder="Valor pago"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                      />
                    </div>
                  )}

                  {/* Order Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Observacoes do pedido</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Alguma observacao geral?"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none resize-none h-20 focus:border-primary/60"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-background rounded-xl border border-border p-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Itens</span>
                      <span>{cartItemsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total</span>
                      <span>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
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
