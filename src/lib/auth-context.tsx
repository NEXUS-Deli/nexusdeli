import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  status: string;
  is_super_admin: boolean;
  created_at?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  cnpj?: string | null;
  is_active: boolean;
  owner_id?: string | null;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  companies: Company[];
  activeCompanyId: string | null;
  activeCompany: Company | null;
  setActiveCompanyId: (id: string | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCompanies([]);
    setActiveCompanyIdState(null);
    localStorage.removeItem("nexus_active_company_id");
  };

  const setActiveCompanyId = (id: string | null) => {
    setActiveCompanyIdState(id);
    if (id) {
      localStorage.setItem("nexus_active_company_id", id);
    } else {
      localStorage.removeItem("nexus_active_company_id");
    }
  };

  const loadUserData = async (currentUser: User) => {
    try {
      // 1. Fetch user profile
      const { data: dbProfile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileErr) throw profileErr;

      let finalProfile: Profile | null = dbProfile as Profile;

      // Safe fallback if profile does not exist yet (but auth session does)
      if (!dbProfile) {
        finalProfile = {
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || "Usuário",
          email: currentUser.email || "",
          role: "user",
          status: "active",
          is_super_admin: false,
        };
      }

      setProfile(finalProfile);

      const isSuperAdmin = !!finalProfile.is_super_admin;

      if (isSuperAdmin) {
        // Super Admin sees all companies
        const { data: allCompanies, error: compErr } = await supabase
          .from("companies")
          .select("*")
          .order("name");

        if (compErr) throw compErr;

        setCompanies(allCompanies || []);

        // Retrieve persisted active company or default to first
        const savedId = localStorage.getItem("nexus_active_company_id");
        if (savedId && allCompanies?.some((c) => c.id === savedId)) {
          setActiveCompanyIdState(savedId);
        } else if (allCompanies && allCompanies.length > 0) {
          setActiveCompanyId(allCompanies[0].id);
        }
      } else {
        // Regular user sees linked companies from company_users
        const { data: userLinks, error: linkErr } = await supabase
          .from("company_users")
          .select("company_id, companies(*)")
          .eq("user_id", currentUser.id)
          .eq("status", "active");

        if (linkErr) throw linkErr;

        const userCompanies: Company[] = (userLinks || [])
          .map((link: any) => link.companies)
          .filter(Boolean);

        setCompanies(userCompanies);

        // Load automatically the first linked company
        if (userCompanies.length > 0) {
          setActiveCompanyId(userCompanies[0].id);
        } else {
          setActiveCompanyIdState(null);
        }
      }
    } catch (err) {
      console.error("Error loading user data in AuthContext:", err);
    }
  };

  const refreshAuth = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    if (currentUser) {
      await loadUserData(currentUser);
    } else {
      setProfile(null);
      setCompanies([]);
      setActiveCompanyIdState(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check active session on mount
    refreshAuth();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setProfile(null);
        setCompanies([]);
        setActiveCompanyIdState(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const activeCompany = companies.find((c) => c.id === activeCompanyId) || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        companies,
        activeCompanyId,
        activeCompany,
        setActiveCompanyId,
        loading,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
