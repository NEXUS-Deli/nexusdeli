import { supabase } from "./supabase";

export async function getCompanyId(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "00000000-0000-0000-0000-000000000000";

    const { data } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (data) return data.id;

    const { data: newCompany } = await supabase
      .from("companies")
      .insert([{ name: "Minha Loja", owner_id: user.id }])
      .select("id")
      .single();

    if (newCompany?.id) {
      await supabase.from("company_users").upsert(
        { company_id: newCompany.id, user_id: user.id, role: "admin" },
        { onConflict: "company_id,user_id" }
      );
    }

    return newCompany?.id || "00000000-0000-0000-0000-000000000000";
  } catch {
    return "00000000-0000-0000-0000-000000000000";
  }
}
