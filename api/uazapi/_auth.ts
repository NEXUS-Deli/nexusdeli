import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function validateUserAndCompany(req: any, res: any, companyId: string) {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }

    const token = authHeader.substring(7); // "Bearer ".length is 7
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }

    // Check if super admin
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr) {
      console.error("Erro ao buscar perfil RLS:", profileErr);
    }

    if (profile?.is_super_admin) {
      return { user, isSuperAdmin: true };
    }

    if (!companyId) {
      res.status(400).json({ error: "ID da empresa não informado para validação." });
      return null;
    }

    // Check if user has active link to company_id
    const { data: link, error: linkErr } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .eq("status", "active")
      .maybeSingle();

    if (linkErr || !link) {
      res.status(403).json({ error: "Forbidden" });
      return null;
    }

    return { user, isSuperAdmin: false };
  } catch (err: any) {
    console.error("Erro na validação user/company:", err);
    res.status(500).json({ error: "Erro interno na autenticação." });
    return null;
  }
}

export async function validateInstanceAccess(req: any, res: any, instanceToken: string) {
  try {
    if (!instanceToken) {
      res.status(400).json({ error: "Token da instância é obrigatório." });
      return null;
    }

    const { data: instanceRow, error: dbError } = await supabase
      .from("whatsapp_instances")
      .select("company_id")
      .eq("token", instanceToken)
      .maybeSingle();

    if (dbError || !instanceRow) {
      res.status(404).json({ error: "Instância não encontrada ou não cadastrada no sistema." });
      return null;
    }

    return await validateUserAndCompany(req, res, instanceRow.company_id);
  } catch (err: any) {
    console.error("Erro na validação de acesso da instância:", err);
    res.status(500).json({ error: "Erro interno ao buscar dados da instância." });
    return null;
  }
}
