import { getSupabaseServiceRole } from "../uazapi/_auth.js";
import { generateReceiptText, generateReceiptHtml } from "../../src/lib/receipt";
import { randomUUID } from "crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const supabase = getSupabaseServiceRole();

  try {
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
