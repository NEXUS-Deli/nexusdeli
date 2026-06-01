import { validateInstanceAccess } from "./_auth";

const BASE_URL = process.env.UAZAPI_BASE_URL || "https://nexus-360.uazapi.com";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { instanceToken, options } = req.body;
  if (!instanceToken) {
    return res.status(400).json({ error: "Token da instância é obrigatório." });
  }

  const auth = await validateInstanceAccess(req, res, instanceToken);
  if (!auth) return;

  try {
    const body: Record<string, string> = {};
    if (options?.phone) body.phone = options.phone;
    if (options?.browser) body.browser = options.browser;

    const response = await fetch(`${BASE_URL}/instance/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: instanceToken,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error || "Erro ao conectar instância." });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Erro no proxy connect:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor." });
  }
}
