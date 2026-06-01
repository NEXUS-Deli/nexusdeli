import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function validateUserAndCompany(req: any, res: any, companyId: string) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Token de autorização ausente." });
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
    return null;
  }

  // Check if super admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_super_admin) {
    return { user, isSuperAdmin: true };
  }

  // Check if user has active link to company_id
  const { data: link } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .eq("status", "active")
    .maybeSingle();

  if (!link) {
    res.status(403).json({ error: "Acesso negado. Você não pertence a esta empresa." });
    return null;
  }

  return { user, isSuperAdmin: false };
}

export async function validateInstanceAccess(req: any, res: any, instanceToken: string) {
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
}
