import { getSupabaseServiceRole } from "../uazapi/_auth.js";
import { createHash } from "crypto";

function hashData(data: string): string {
  if (!data) return "";
  return createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { 
      companyId, 
      eventId, 
      value, 
      customerData, 
      sourceUrl, 
      userAgent, 
      ipAddress 
    } = req.body || {};

    if (!companyId || !eventId) {
      return res.status(400).json({ error: "companyId e eventId são obrigatórios." });
    }

    const supabase = getSupabaseServiceRole();

    // 1. Buscar configurações de tracking da empresa
    const { data: trackingSettings, error: settingsError } = await supabase
      .from("company_tracking_settings")
      .select("meta_pixel_id, meta_access_token, meta_test_event_code, capi_enabled")
      .eq("company_id", companyId)
      .maybeSingle();

    if (settingsError || !trackingSettings) {
      return res.status(404).json({ error: "Configurações de tracking não encontradas para a empresa." });
    }

    if (!trackingSettings.capi_enabled || !trackingSettings.meta_access_token || !trackingSettings.meta_pixel_id) {
      return res.status(400).json({ error: "Conversions API (CAPI) desabilitada ou não configurada." });
    }

    // 2. Montar payload do evento Meta CAPI
    const eventTime = Math.floor(Date.now() / 1000);
    const metaPayload: any = {
      data: [
        {
          event_name: "Purchase",
          event_time: eventTime,
          event_id: eventId,
          event_source_url: sourceUrl || "",
          action_source: "website",
          user_data: {
            client_ip_address: ipAddress || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "",
            client_user_agent: userAgent || req.headers["user-agent"] || "",
          },
          custom_data: {
            currency: "BRL",
            value: Number(value || 0),
          }
        }
      ]
    };

    // Adicionar hash de dados se disponíveis
    if (customerData?.email) {
      metaPayload.data[0].user_data.em = [hashData(customerData.email)];
    }
    if (customerData?.phone) {
      metaPayload.data[0].user_data.ph = [hashData(customerData.phone)];
    }
    if (customerData?.name) {
      metaPayload.data[0].user_data.fn = [hashData(customerData.name.split(" ")[0])];
    }

    if (trackingSettings.meta_test_event_code) {
      metaPayload.test_event_code = trackingSettings.meta_test_event_code;
    }

    // 3. Chamar a API da Meta
    const metaUrl = `https://graph.facebook.com/v19.0/${trackingSettings.meta_pixel_id}/events?access_token=${trackingSettings.meta_access_token}`;
    
    const metaResponse = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metaPayload),
    });

    const metaResult = await metaResponse.json();
    const isSuccess = metaResponse.ok;

    // 4. Gravar log do envio
    const { error: logError } = await supabase
      .from("tracking_event_logs")
      .insert({
        company_id: companyId,
        provider: "meta",
        event_name: "Purchase",
        event_id: eventId,
        status: isSuccess ? "sucesso" : "erro",
        request_payload: metaPayload,
        response_payload: metaResult,
        error_message: isSuccess ? null : (metaResult?.error?.message || "Erro desconhecido Meta CAPI"),
      });

    if (logError) {
      console.error("Erro ao salvar log de CAPI:", logError);
    }

    return res.status(metaResponse.status).json(metaResult);
  } catch (error: any) {
    console.error("Erro no proxy CAPI Meta:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor." });
  }
}
