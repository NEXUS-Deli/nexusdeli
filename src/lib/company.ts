import { supabase } from "./supabase";

const DEFAULT_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

export async function getCompanyId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
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

    if (newCompany?.id) return newCompany.id;
  }

  return DEFAULT_COMPANY_ID;
}
