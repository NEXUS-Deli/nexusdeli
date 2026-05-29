import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { c as useAuth } from "./router-BotcCoyH.js";
import { Flame, Loader2 } from "lucide-react";
import "@tanstack/react-query";
import "sonner";
import "@supabase/supabase-js";
import "framer-motion";
import "zod";
function HomeRedirector() {
  const {
    user,
    profile,
    companies,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({
        to: "/login"
      });
      return;
    }
    const isSuperAdmin = !!profile?.is_super_admin;
    if (isSuperAdmin) {
      navigate({
        to: "/super-admin"
      });
    } else {
      const hasCompany = companies && companies.length > 0;
      if (hasCompany) {
        navigate({
          to: "/dashboard"
        });
      } else {
        navigate({
          to: "/aguardando-vinculo"
        });
      }
    }
  }, [user, profile, companies, loading, navigate]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("div", { className: "relative h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-4 animate-bounce", children: /* @__PURE__ */ jsx(Flame, { className: "h-6 w-6 text-primary-foreground" }) }),
    /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
  ] });
}
export {
  HomeRedirector as component
};
