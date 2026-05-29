import { supabase } from "./supabase";

const DEFAULT_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

export async function getCompanyId(): Promise<string> {
  // 1. Try reading the active company stored in localStorage
  if (typeof window !== "undefined") {
    const savedId = localStorage.getItem("nexus_active_company_id");
    if (savedId) return savedId;
  }

  // 2. Fetch the current logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // 3. Fallback: check if user is a super admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_super_admin")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = !!profile?.is_super_admin;

    if (isSuperAdmin) {
      // Return first company or default
      const { data: firstCompany } = await supabase
        .from("companies")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (firstCompany) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nexus_active_company_id", firstCompany.id);
        }
        return firstCompany.id;
      }
    }

    // 4. Fallback: find first company linked in company_users
    const { data: link } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (link?.company_id) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nexus_active_company_id", link.company_id);
      }
      return link.company_id;
    }

    // 5. Fallback: check company where user is owner
    const { data: owned } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (owned?.id) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nexus_active_company_id", owned.id);
      }
      return owned.id;
    }
  }

  return DEFAULT_COMPANY_ID;
}
