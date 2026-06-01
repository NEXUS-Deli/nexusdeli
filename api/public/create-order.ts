import { getSupabaseServiceRole } from "../uazapi/_auth.js";
import { randomUUID } from "crypto";

function generateReceiptText(data: {
  companyName: string;
  companyCnpj?: string;
  companyAddress?: string;
  companyPhone?: string;
  orderNumber: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    addons?: Array<{
      addonName: string;
      quantity: number;
      price: number;
    }>;
  }>;
  subtotal: number;
  deliveryFee: number;
  discountTotal: number;
  total: number;
  notes?: string;
  footerText?: string;
}): string {
  const line = "=".repeat(32);
  const subline = "-".repeat(32);
  let text = "";

  text += `${line}\n`;
  text += `  ${data.companyName}\n`;
  if (data.companyCnpj) text += `  CNPJ: ${data.companyCnpj}\n`;
  if (data.companyAddress) text += `  ${data.companyAddress}\n`;
  if (data.companyPhone) text += `  Tel: ${data.companyPhone}\n`;
  text += `${line}\n`;
  text += `Pedido #${data.orderNumber}\n`;
  text += `${new Date(data.createdAt).toLocaleDateString("pt-BR")} ${new Date(data.createdAt).toLocaleTimeString("pt-BR")}\n`;
  text += `${subline}\n`;
  text += `Cliente: ${data.customerName}\n`;
  text += `Tel: ${data.customerPhone}\n`;
  if (data.deliveryAddress) text += `Endereco: ${data.deliveryAddress}\n`;
  text += `${subline}\n`;
  text += `ITENS\n`;
  text += `${subline}\n`;

  for (const item of data.items) {
    text += `${item.quantity}x ${item.productName}\n`;
    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        text += `    + ${addon.addonName}${addon.quantity > 1 ? ` (${addon.quantity}x)` : ""}: R$ ${addon.price.toFixed(2)}\n`;
      }
    }
    text += `    R$ ${item.totalPrice.toFixed(2)}\n`;
    if (item.notes) text += `    Obs: ${item.notes}\n`;
  }

  text += `${subline}\n`;
  text += `Subtotal: R$ ${data.subtotal.toFixed(2)}\n`;
  if (data.deliveryFee > 0) text += `Taxa de entrega: R$ ${data.deliveryFee.toFixed(2)}\n`;
  if (data.discountTotal > 0) text += `Desconto: -R$ ${data.discountTotal.toFixed(2)}\n`;
  text += `TOTAL: R$ ${data.total.toFixed(2)}\n`;
  text += `${subline}\n`;
  text += `Forma de pagamento: ${getPaymentLabel(data.paymentMethod)}\n`;
  text += `Status: ${data.paymentStatus === "pago" ? "PAGO" : "Pendente"}\n`;
  if (data.notes) text += `Obs: ${data.notes}\n`;
  text += `${line}\n`;
  if (data.footerText) {
    text += `${data.footerText}\n`;
    text += `${line}\n`;
  }

  return text;
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

function generateReceiptHtml(data: {
  companyName: string;
  companyCnpj?: string;
  companyAddress?: string;
  companyPhone?: string;
  logoUrl?: string;
  orderNumber: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    addons?: Array<{
      addonName: string;
      quantity: number;
      price: number;
    }>;
  }>;
  subtotal: number;
  deliveryFee: number;
  discountTotal: number;
  total: number;
  notes?: string;
  footerText?: string;
  paperWidth?: string;
}): string {
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding: 4px 0; font-size: 13px;">${item.quantity}x ${item.productName}</td>
      <td style="padding: 4px 0; font-size: 13px; text-align: right;">R$ ${item.totalPrice.toFixed(2)}</td>
    </tr>
    ${(item.addons || []).map((a) => `
      <tr>
        <td style="padding: 2px 0 2px 12px; font-size: 11px; color: #888;">+ ${a.addonName}${a.quantity > 1 ? ` (${a.quantity}x)` : ""}</td>
        <td style="padding: 2px 0; font-size: 11px; text-align: right; color: #888;">R$ ${(a.price * a.quantity).toFixed(2)}</td>
      </tr>
    `).join("")}
    ${item.notes ? `
      <tr>
        <td colspan="2" style="padding: 2px 0 4px 12px; font-size: 11px; color: #888; font-style: italic;">Obs: ${item.notes}</td>
      </tr>
    ` : ""}
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 0; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      width: ${data.paperWidth || '80mm'};
      margin: 0 auto;
      padding: 8px;
      color: #000;
    }
    table { width: 100%; border-collapse: collapse; }
    .center { text-align: center; }
    .line { border-top: 1px dashed #000; margin: 6px 0; }
    .total { font-size: 16px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="center">
    ${data.logoUrl ? `<img src="${data.logoUrl}" style="max-width: 60px; margin-bottom: 4px;" />` : ""}
    <strong>${data.companyName}</strong><br/>
    ${data.companyCnpj ? `CNPJ: ${data.companyCnpj}<br/>` : ""}
    ${data.companyAddress ? `${data.companyAddress}<br/>` : ""}
    ${data.companyPhone ? `Tel: ${data.companyPhone}<br/>` : ""}
  </div>
  <div class="line"></div>
  <div class="center">
    <strong>PEDIDO #${data.orderNumber}</strong><br/>
    ${new Date(data.createdAt).toLocaleDateString("pt-BR")} ${new Date(data.createdAt).toLocaleTimeString("pt-BR")}
  </div>
  <div class="line"></div>
  <strong>Cliente:</strong> ${data.customerName}<br/>
  <strong>Tel:</strong> ${data.customerPhone}<br/>
  ${data.deliveryAddress ? `<strong>Endereco:</strong> ${data.deliveryAddress}<br/>` : ""}
  <div class="line"></div>
  <strong>ITENS</strong>
  <div class="line"></div>
  <table>${itemsHtml}</table>
  <div class="line"></div>
  <table>
    <tr><td>Subtotal</td><td style="text-align: right;">R$ ${data.subtotal.toFixed(2)}</td></tr>
    ${data.deliveryFee > 0 ? `<tr><td>Taxa de entrega</td><td style="text-align: right;">R$ ${data.deliveryFee.toFixed(2)}</td></tr>` : ""}
    ${data.discountTotal > 0 ? `<tr><td>Desconto</td><td style="text-align: right;">-R$ ${data.discountTotal.toFixed(2)}</td></tr>` : ""}
    <tr><td class="total">TOTAL</td><td class="total" style="text-align: right;">R$ ${data.total.toFixed(2)}</td></tr>
  </table>
  <div class="line"></div>
  <strong>Pagamento:</strong> ${getPaymentLabel(data.paymentMethod)}<br/>
  <strong>Status:</strong> ${data.paymentStatus === "pago" ? "PAGO" : "Pendente"}<br/>
  ${data.notes ? `<strong>Obs:</strong> ${data.notes}<br/>` : ""}
  <div class="line"></div>
  ${data.footerText ? `<div class="center">${data.footerText}</div><div class="line"></div>` : ""}
</body>
</html>`;
}


export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const supabase = getSupabaseServiceRole();
    const {
      companyId,
      customer,
      items,
      paymentMethod,
      changeFor,
      deliveryFee: inputDeliveryFee,
      couponCode,
      notes,
      sessionId, // UUID generated or matching customer_sessions.id
      sessionKey, // text chamai_session_id
      clientToken, // client token
    } = req.body || {};

    if (!companyId) {
      return res.status(400).json({ error: "companyId é obrigatório." });
    }

    if (!customer?.name || !customer?.phone) {
      return res.status(400).json({ error: "Dados do cliente (nome e telefone) são obrigatórios." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "O pedido deve conter pelo menos um item." });
    }

    // 1. Validar company_id e empresa ativa
    const { data: company, error: companyErr } = await supabase
      .from("companies")
      .select("id, name, cnpj, address, phone, delivery_fee, logo_url, is_active")
      .eq("id", companyId)
      .single();

    if (companyErr || !company) {
      return res.status(404).json({ error: "Empresa não encontrada ou inativa." });
    }

    let subtotal = 0;
    let costTotal = 0;
    const orderItems: any[] = [];

    // Validar e calcular os itens
    for (const item of items) {
      const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
      const itemCost = (item.costPrice || 0) * (item.quantity || 1);
      subtotal += itemTotal;
      costTotal += itemCost;

      const addonTotal = (item.addons || []).reduce(
        (sum: number, a: any) => sum + (a.price || 0) * (a.quantity || 1),
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
        addons: (item.addons || []).map((a: any) => ({
          addon_id: a.addonId || null,
          addon_name: a.addonName,
          quantity: a.quantity,
          price: a.price,
        })),
      });
    }

    const deliveryFee = inputDeliveryFee ?? company.delivery_fee ?? 0;
    const total = subtotal + deliveryFee;
    const profitTotal = total - costTotal;

    const checkoutToken = randomUUID();

    // Obter o próximo número do pedido
    const { data: lastOrder } = await supabase
      .from("orders")
      .select("order_number")
      .eq("company_id", companyId)
      .order("order_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const orderNumber = (lastOrder?.order_number || 0) + 1;

    // 2. Criar ou atualizar customer
    const cleanPhone = customer.phone.replace(/\D/g, "");
    const { data: customerRow, error: customerErr } = await supabase
      .from("customers")
      .upsert(
        {
          company_id: companyId,
          name: customer.name.trim(),
          phone: cleanPhone,
          address: customer.address || null,
        },
        { onConflict: "company_id,phone" }
      )
      .select("id")
      .single();

    if (customerErr || !customerRow) {
      throw new Error(`Erro ao salvar cliente: ${customerErr?.message || "Desconhecido"}`);
    }

    const customerId = customerRow.id;

    // Sincronizar cliente no CRM (tabela clients)
    let resolvedClientToken = clientToken || null;
    try {
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("phone", cleanPhone)
        .eq("company_id", companyId)
        .maybeSingle();

      if (existingClient) {
        resolvedClientToken = existingClient.id;
      } else {
        const { data: newClient } = await supabase
          .from("clients")
          .insert({
            name: customer.name.trim(),
            phone: cleanPhone,
            company_id: companyId,
            delivery_id: companyId
          })
          .select("id")
          .single();
        if (newClient) resolvedClientToken = newClient.id;
      }
    } catch (e) {
      console.error("Erro ao sincronizar cliente no CRM (backend):", e);
    }

    // 3. Criar a order
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
        payment_method: paymentMethod,
        change_for: paymentMethod === "dinheiro" ? Number(changeFor) || null : null,
        delivery_address: customer.address || null,
        delivery_reference: customer.reference || null,
        notes: notes || null,
        coupon_code: couponCode || null,
      })
      .select("id, created_at")
      .single();

    if (orderError || !order) {
      throw new Error(`Erro ao criar pedido: ${orderError?.message || "Desconhecido"}`);
    }

    // 4. Criar order_items e order_item_addons
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

      if (itemError || !orderItem) {
        throw new Error(`Erro ao inserir itens do pedido: ${itemError?.message || "Desconhecido"}`);
      }

      if (item.addons.length > 0) {
        const addonsPayload = item.addons.map((a: any) => ({
          company_id: companyId,
          order_item_id: orderItem.id,
          addon_id: a.addon_id,
          addon_name: a.addon_name,
          quantity: a.quantity,
          price: a.price,
        }));

        const { error: addonError } = await supabase
          .from("order_item_addons")
          .insert(addonsPayload);

        if (addonError) {
          throw new Error(`Erro ao salvar adicionais do item: ${addonError.message}`);
        }
      }
    }

    // 5. Atualizar estatísticas do customer
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
      })
      .eq("id", customerId);

    // 6. Criar job de impressão
    const receiptText = generateReceiptText({
      companyName: company.name,
      companyCnpj: company.cnpj,
      companyAddress: company.address,
      companyPhone: company.phone,
      orderNumber,
      createdAt: order.created_at,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,
      paymentMethod,
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
      notes,
    });

    const receiptHtml = generateReceiptHtml({
      companyName: company.name,
      companyCnpj: company.cnpj,
      companyAddress: company.address,
      companyPhone: company.phone,
      logoUrl: company.logo_url,
      orderNumber,
      createdAt: order.created_at,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,
      paymentMethod,
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
      notes,
    });

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
      await supabase.from("print_jobs").insert({
        company_id: companyId,
        order_id: order.id,
        printer_sector: "balcao",
        receipt_text: receiptText,
        receipt_html: receiptHtml,
        receipt_data: { order_id: order.id, order_number: orderNumber },
      });
    }

    // 7. Registrar evento de tracking (Purchase)
    if (sessionId) {
      const eventId = randomUUID();
      const uniqueEventId = randomUUID();
      await supabase.from("tracking_events").insert({
        id: eventId,
        session_id: sessionId,
        company_id: companyId,
        event_name: "Purchase",
        order_id: order.id,
        client_id: resolvedClientToken || null,
        value: total,
        currency: "BRL",
        metadata: {
          customer: {
            name: customer.name,
            phone: customer.phone,
          }
        },
        event_id: uniqueEventId,
        session_key: sessionKey || null,
      }).catch((e) => console.error("Erro ao registrar tracking Purchase backend:", e));
    }

    // Gerar mensagem do WhatsApp
    const waMessage = `*${company.name}*\n*Pedido #${orderNumber}*\n\nOlá, ${customer.name}! Seu pedido foi registrado:\n\n*ITENS:*\n` +
      orderItems.map((item) => `${item.quantity}x ${item.product_name} - R$ ${item.total_price.toFixed(2)}`).join("\n") +
      `\n\n*Total: R$ ${total.toFixed(2)}*` +
      `\n*Pagamento:* ${paymentMethod}\n\nAguardamos a confirmacao para iniciar o preparo! 🚀`;

    const phoneCleaned = company.phone?.replace(/\D/g, "") || "";
    const waUrl = `https://wa.me/55${phoneCleaned}?text=${encodeURIComponent(waMessage)}`;

    return res.status(200).json({
      success: true,
      orderId: order.id,
      orderNumber: orderNumber,
      checkoutToken: checkoutToken,
      whatsappUrl: waUrl,
      clientToken: resolvedClientToken,
    });
  } catch (error: any) {
    console.error("Erro ao criar pedido publicamente:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor." });
  }
}
