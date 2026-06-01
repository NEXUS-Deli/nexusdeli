import { getSupabase } from "../uazapi/_auth.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { sessionId, companyId, clientId, abandonmentScore } = req.body || {};

    if (!sessionId || !companyId) {
      return res.status(400).json({ error: "sessionId e companyId são obrigatórios." });
    }

    const supabase = getSupabase();

    // Securely update session using service role (bypassing RLS since visitor can't update directly)
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (clientId) {
      updatePayload.client_id = clientId;
    }
    if (abandonmentScore !== undefined) {
      updatePayload.abandonment_score = abandonmentScore;
    }

    const { error } = await supabase
      .from("customer_sessions")
      .update(updatePayload)
      .eq("id", sessionId)
      .eq("company_id", companyId);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar sessão de tracking:", error);
    return res.status(500).json({ error: error.message || "Erro interno." });
  }
}
