import { validateUserAndCompany } from "./_auth.js";

const BASE_URL = process.env.UAZAPI_BASE_URL || "https://nexus-360.uazapi.com";
const ADMIN_TOKEN = process.env.UAZAPI_ADMIN_TOKEN || "";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { name, companyId } = req.body;
  if (!name || !companyId) {
    return res.status(400).json({ error: "Nome e ID da empresa são obrigatórios." });
  }

  const auth = await validateUserAndCompany(req, res, companyId);
  if (!auth) return;

  try {
    const response = await fetch(`${BASE_URL}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        admintoken: ADMIN_TOKEN,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error || "Erro ao criar instância na UAZAPI." });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Erro no proxy create-instance:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor." });
  }
}
