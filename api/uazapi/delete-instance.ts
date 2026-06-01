console.log("UAZAPI DELETE-INSTANCE FUNCTION LOADED");

import { validateInstanceAccess } from "./_auth.js";

const BASE_URL = process.env.UAZAPI_BASE_URL || "https://nexus-360.uazapi.com";

export default async function handler(req: any, res: any) {
  console.log("HANDLER STARTED");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const { instanceToken } = req.body || {};
    if (!instanceToken) {
      return res.status(400).json({ error: "Token da instância é obrigatório." });
    }

    const auth = await validateInstanceAccess(req, res, instanceToken);
    if (!auth) return;

    const response = await fetch(`${BASE_URL}/instance`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        token: instanceToken,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error || "Erro ao deletar instância." });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Erro no proxy delete-instance:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor." });
  }
}
