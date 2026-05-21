import { supabase } from "./supabase";
import { getCompanyId } from "./company";
import { generateReceiptText, generateReceiptHtml } from "./receipt";

export type CreateOrderInput = {
  customer: {
    name: string;
    phone: string;
    address?: string;
    reference?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
    notes?: string;
    addons?: Array<{
      addonId?: string;
      addonName: string;
      quantity: number;
      price: number;
    }>;
  }>;
  paymentMethod: string;
  changeFor?: number;
  deliveryFee?: number;
  couponCode?: string;
  notes?: string;
};

export async function createOrder(input: CreateOrderInput) {
  const companyId = await getCompanyId();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, cnpj, address, phone, delivery_fee, logo_url")
    .eq("id", companyId)
    .single();

  if (!company) throw new Error("Empresa nao encontrada");

  let subtotal = 0;
  let costTotal = 0;
  const orderItems: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    cost_price: number;
    notes: string | null;
    company_id: string;
    addons: Array<{
      addon_id?: string;
      addon_name: string;
      quantity: number;
      price: number;
    }>;
  }> = [];

  for (const item of input.items) {
    const itemTotal = item.unitPrice * item.quantity;
    const itemCost = (item.costPrice || 0) * item.quantity;
    subtotal += itemTotal;
    costTotal += itemCost;

    const addonTotal = (item.addons || []).reduce(
      (sum, a) => sum + a.price * a.quantity,
      0
    );

    orderItems.push({
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: itemTotal + addonTotal,
      cost_price: itemCost,
      notes: item.notes || null,
      company_id: companyId,
      addons: (item.addons || []).map((a) => ({
        addon_id: a.addonId,
        addon_name: a.addonName,
        quantity: a.quantity,
        price: a.price,
      })),
    });
  }

  const deliveryFee = input.deliveryFee ?? company.delivery_fee ?? 0;
  const total = subtotal + deliveryFee;
  const profitTotal = total - costTotal;

  const checkoutToken = crypto.randomUUID();

  // Get next order number
  const { data: lastOrder } = await supabase
    .from("orders")
    .select("order_number")
    .eq("company_id", companyId)
    .order("order_number", { ascending: false })
    .limit(1)
    .single();

  const orderNumber = (lastOrder?.order_number || 0) + 1;

  // Upsert customer
  const { data: customer } = await supabase
    .from("customers")
    .upsert(
      {
        company_id: companyId,
        name: input.customer.name,
        phone: input.customer.phone,
        address: input.customer.address || null,
      },
      { onConflict: "company_id,phone", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  const customerId = customer?.id;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      company_id: companyId,
      customer_id: customerId,
      order_number: orderNumber,
      checkout_token: checkoutToken,
      status: "aguardando_whatsapp",
      subtotal,
      delivery_fee: deliveryFee,
      total,
      cost_total: costTotal,
      profit_total: profitTotal,
      payment_method: input.paymentMethod,
      change_for: input.changeFor || null,
      delivery_address: input.customer.address || null,
      delivery_reference: input.customer.reference || null,
      notes: input.notes || null,
      coupon_code: input.couponCode || null,
    })
    .select("id, created_at")
    .single();

  if (orderError) throw orderError;

  // Create order items
  for (const item of orderItems) {
    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .insert({
        company_id: companyId,
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        cost_price: item.cost_price,
        notes: item.notes,
      })
      .select("id")
      .single();

    if (itemError) throw itemError;

    if (item.addons.length > 0) {
      const addonsPayload = item.addons.map((a) => ({
        company_id: companyId,
        order_item_id: orderItem.id,
        addon_id: a.addon_id || null,
        addon_name: a.addon_name,
        quantity: a.quantity,
        price: a.price,
      }));

      const { error: addonError } = await supabase
        .from("order_item_addons")
        .insert(addonsPayload);

      if (addonError) throw addonError;
    }
  }

  // Update customer stats
  if (customerId) {
    const { data: customerStats } = await supabase
      .from("customers")
      .select("total_orders, total_spent, total_profit")
      .eq("id", customerId)
      .single();

    await supabase
      .from("customers")
      .update({
        total_orders: (customerStats?.total_orders || 0) + 1,
        total_spent: (customerStats?.total_spent || 0) + total,
        total_profit: (customerStats?.total_profit || 0) + profitTotal,
        last_order_at: new Date().toISOString(),
        first_order_at: customerStats?.total_orders
          ? undefined
          : new Date().toISOString(),
      })
      .eq("id", customerId);
  }

  // Generate receipt and create print job
  const receiptText = generateReceiptText({
    companyName: company.name,
    companyCnpj: company.cnpj,
    companyAddress: company.address,
    companyPhone: company.phone,
    orderNumber,
    createdAt: order.created_at,
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    deliveryAddress: input.customer.address,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pendente",
    items: orderItems.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      notes: item.notes || undefined,
      addons: item.addons,
    })),
    subtotal,
    deliveryFee,
    discountTotal: 0,
    total,
    notes: input.notes,
  });

  const receiptHtml = generateReceiptHtml({
    companyName: company.name,
    companyCnpj: company.cnpj,
    companyAddress: company.address,
    companyPhone: company.phone,
    logoUrl: company.logo_url,
    orderNumber,
    createdAt: order.created_at,
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    deliveryAddress: input.customer.address,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pendente",
    items: orderItems.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      notes: item.notes || undefined,
      addons: item.addons,
    })),
    subtotal,
    deliveryFee,
    discountTotal: 0,
    total,
    notes: input.notes,
  });

  // Find printer settings for each sector
  const { data: printers } = await supabase
    .from("printer_settings")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (printers && printers.length > 0) {
    const printJobs = printers.map((printer) => ({
      company_id: companyId,
      order_id: order.id,
      printer_setting_id: printer.id,
      printer_sector: printer.printer_sector,
      copies: printer.copies,
      receipt_text: receiptText,
      receipt_html: receiptHtml,
      receipt_data: { order_id: order.id, order_number: orderNumber },
    }));

    await supabase.from("print_jobs").insert(printJobs);
  } else {
    // Create a default print job for general sector
    await supabase.from("print_jobs").insert({
      company_id: companyId,
      order_id: order.id,
      printer_sector: "balcao",
      receipt_text: receiptText,
      receipt_html: receiptHtml,
      receipt_data: { order_id: order.id, order_number: orderNumber },
    });
  }

  // Log print job creation
  const { data: createdJobs } = await supabase
    .from("print_jobs")
    .select("id")
    .eq("order_id", order.id);

  if (createdJobs) {
    const printLogs = createdJobs.map((job) => ({
      company_id: companyId,
      print_job_id: job.id,
      action: "criado",
      status: "pendente",
      payload: { order_number: orderNumber },
    }));
    await supabase.from("print_logs").insert(printLogs);
  }

  // Generate WhatsApp message
  const waMessage = generateWhatsAppMessage({
    companyName: company.name,
    customerName: input.customer.name,
    orderNumber,
    items: orderItems.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      totalPrice: item.total_price,
      addons: item.addons,
    })),
    total,
    deliveryFee,
    paymentMethod: input.paymentMethod,
  });

  const phoneCleaned = company.phone?.replace(/\D/g, "") || "";
  const waUrl = `https://wa.me/55${phoneCleaned}?text=${encodeURIComponent(waMessage)}`;

  return {
    orderId: order.id,
    orderNumber,
    checkoutToken,
    whatsappUrl: waUrl,
    whatsappMessage: waMessage,
  };
}

function generateWhatsAppMessage(data: {
  companyName: string;
  customerName: string;
  orderNumber: number;
  items: Array<{
    productName: string;
    quantity: number;
    totalPrice: number;
    addons?: Array<{ addonName: string; quantity: number; price: number }>;
  }>;
  total: number;
  deliveryFee: number;
  paymentMethod: string;
}): string {
  let msg = `*${data.companyName}*\n`;
  msg += `*Pedido #${data.orderNumber}*\n\n`;
  msg += `Olá, ${data.customerName}! Seu pedido foi registrado:\n\n`;
  msg += `*ITENS:*\n`;

  for (const item of data.items) {
    msg += `${item.quantity}x ${item.productName} - R$ ${item.totalPrice.toFixed(2)}\n`;
    if (item.addons && item.addons.length > 0) {
      for (const a of item.addons) {
        msg += `  + ${a.addonName}${a.quantity > 1 ? ` (${a.quantity}x)` : ""}\n`;
      }
    }
  }

  msg += `\n*Total: R$ ${data.total.toFixed(2)}*`;
  if (data.deliveryFee > 0) msg += ` (Taxa entrega: R$ ${data.deliveryFee.toFixed(2)})`;
  msg += `\n*Pagamento:* ${getPaymentLabel(data.paymentMethod)}`;
  msg += `\n\nAguardamos a confirmacao para iniciar o preparo! 🚀`;

  return msg;
}

function getPaymentLabel(method: string): string {
  const map: Record<string, string> = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_credito: "Cartao de Credito",
    cartao_debito: "Cartao de Debito",
    vale_refeicao: "Vale Refeicao",
  };
  return map[method] || method;
}

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  const timestampField: Record<string, string> = {
    confirmado: "confirmed_at",
    preparo: "preparing_at",
    entregue: "delivered_at",
    cancelado: "cancelled_at",
  };

  const updateData: any = { status };
  if (timestampField[status]) {
    updateData[timestampField[status]] = new Date().toISOString();
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) throw error;
}

export async function markPrintJobAsPrinted(jobId: string) {
  const { error } = await supabase
    .from("print_jobs")
    .update({
      status: "impresso",
      printed_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "pendente");

  if (error) throw error;

  await supabase.from("print_logs").insert({
    company_id: (await supabase.from("print_jobs").select("company_id").eq("id", jobId).single()).data
      ?.company_id,
    print_job_id: jobId,
    action: "impresso",
    status: "impresso",
  });
}

export async function markPrintJobAsPrinting(jobId: string) {
  const { error } = await supabase
    .from("print_jobs")
    .update({
      status: "imprimindo",
      printing_started_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "pendente");

  if (error) throw error;
}

export async function markPrintJobError(jobId: string, errorMessage: string) {
  await supabase
    .from("print_jobs")
    .update({
      status: "erro",
      error_message: errorMessage,
      retry_count: supabase.rpc("increment"),
    } as any)
    .eq("id", jobId);

  const { data: job } = await supabase
    .from("print_jobs")
    .select("company_id")
    .eq("id", jobId)
    .single();

  if (job) {
    await supabase.from("print_logs").insert({
      company_id: job.company_id,
      print_job_id: jobId,
      action: "erro",
      status: "erro",
      error_message: errorMessage,
    });
  }
}
