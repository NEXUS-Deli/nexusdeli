import { S as reactExports, J as jsxRuntimeExports } from "./server-3KlhyZH_.js";
import { i as useAuth, k as useNavigate, F as Flame, a as LoaderCircle } from "./router-CgDrIRmR.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function HomeRedirector() {
  const {
    user,
    profile,
    companies,
    loading
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({
        to: "/login"
      });
      return;
    }
    const isSuperAdmin = profile?.is_super_admin || profile?.role === "super_admin";
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow mb-4 animate-bounce", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-6 w-6 text-primary-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" })
  ] });
}
export {
  HomeRedirector as component
};
