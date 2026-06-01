import { randomUUID } from "crypto";
import { getSupabaseServiceRole } from "../uazapi/_auth.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const {
      companyId,
      sessionId,
      clientId,
      customerToken,
      abandonmentScore,
      context,
      source,
    } = req.body || {};

    // 7. Nunca retornar 500 por payload incompleto. Se faltar companyId/sessionId, retornar 400.
    if (!companyId || !sessionId) {
      return res.status(400).json({ error: "Os campos companyId e sessionId são obrigatórios." });
    }

    // 1. Usa lazy initialization do Supabase service_role
    const supabase = getSupabaseServiceRole();

    // 4. Mapear camelCase para snake_case antes do upsert.
    const upsertData: any = {
      id: randomUUID(), // fallback primary key caso seja insert
      company_id: companyId,
      session_id: sessionId,
      client_id: clientId || null,
      customer_token: customerToken || null,
      context: context || "delivery",
      source: source || "direct",
      updated_at: new Date().toISOString(),
    };

    if (abandonmentScore !== undefined) {
      upsertData.abandonment_score = abandonmentScore;
    }

    // 5. Usar upsert em customer_sessions com onConflict: "company_id,session_id"
    const { error } = await supabase
      .from("customer_sessions")
      .upsert(upsertData, {
        onConflict: "company_id,session_id",
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    // 3. Adicionar logs detalhados no catch
    console.error("tracking/session error", error);
    return res.status(500).json({ error: error.message || "Erro interno." });
  }
}

