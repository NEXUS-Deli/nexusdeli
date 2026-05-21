export function generateReceiptText(data: {
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

export function generateReceiptHtml(data: {
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
