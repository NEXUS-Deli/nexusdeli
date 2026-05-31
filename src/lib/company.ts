import { supabase } from "./supabase";

const DEFAULT_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

export async function getCompanyId(): Promise<string> {
  let isSuperAdmin = false;
  try {
    // 1. Fetch current user
    const { data: { user } } = await withTimeout(supabase.auth.getUser());
    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    // 2. Check if user is super admin
    const { data: profile } = await withTimeout(
      supabase
        .from("profiles")
        .select("role, is_super_admin")
        .eq("id", user.id)
        .maybeSingle()
    );

    isSuperAdmin = !!profile?.is_super_admin;

    if (isSuperAdmin) {
      if (typeof window !== "undefined") {
        const savedId = localStorage.getItem("nexus_active_company_id");
        if (savedId) return savedId;
      }
      return DEFAULT_COMPANY_ID;
    }

    // 3. For regular users: validate if active company in localStorage is valid
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("nexus_active_company_id");
      if (savedId) {
        const { data: activeLink } = await withTimeout(
          supabase
            .from("company_users")
            .select("company_id")
            .eq("user_id", user.id)
            .eq("company_id", savedId)
            .eq("status", "active")
            .maybeSingle()
        );

        if (activeLink?.company_id) {
          return activeLink.company_id;
        }
      }
    }

    // 4. Fallback: find first company linked in company_users
    const { data: link } = await withTimeout(
      supabase
        .from("company_users")
        .select("company_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle()
    );

    if (link?.company_id) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nexus_active_company_id", link.company_id);
      }
      return link.company_id;
    }

    // 5. Fallback: check company where user is owner
    const { data: owned } = await withTimeout(
      supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .maybeSingle()
    );

    if (owned?.id) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nexus_active_company_id", owned.id);
      }
      return owned.id;
    }
  } catch (err) {
    console.error("Critical error or timeout in getCompanyId:", err);
    if (!isSuperAdmin) {
      throw new Error("Não foi possível identificar sua empresa. Tente novamente.");
    }
  }

  if (isSuperAdmin) {
    return DEFAULT_COMPANY_ID;
  }

  throw new Error("Não foi possível identificar sua empresa. Tente novamente.");
}

