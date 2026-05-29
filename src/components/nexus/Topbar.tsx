import { Search, Bell, Plus, Flame, Sun, Moon, LogOut, Shield } from "lucide-react";
import { useTheme } from "@/components/nexus/ThemeProvider";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { profile, companies, activeCompanyId, setActiveCompanyId, logout } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = !!profile?.is_super_admin;

  const getInitials = () => {
    if (!profile) return "US";
    if (profile.full_name) {
      const parts = profile.full_name.trim().split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return profile.email[0].toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/70 px-5 backdrop-blur-xl lg:px-8">
      <div className="lg:hidden flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
          <Flame className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold">Nexus<span className="text-primary">Deli</span></span>
      </div>

      <div className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        <input
          placeholder="Buscar campanhas, clientes, agentes…"
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden lg:inline rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </div>

      <div className="flex-1 md:flex-none" />

      {/* Super Admin Company Selector */}
      {isSuperAdmin && companies.length > 0 && (
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs">
          <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[9px] select-none">Empresa Ativa:</span>
          <select
            value={activeCompanyId || ""}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="bg-transparent border-none outline-none font-semibold text-foreground cursor-pointer focus:ring-0 text-xs pr-6"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id} className="bg-background text-foreground text-xs">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1.5 text-xs">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-success pulse-dot text-success" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="font-medium text-foreground">Online</span>
          <span className="text-muted-foreground">· 3 WhatsApps</span>
        </div>

        <button
          onClick={toggle}
          aria-label="Alternar tema"
          className="h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className="relative h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-accent cursor-pointer">
          <Search className="h-4 w-4 sm:hidden" />
          <Bell className="h-4 w-4 hidden sm:block" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-glow hidden sm:block" />
        </button>

        <Link to="/campanhas" search={{ new: true }} className="hidden sm:inline-flex">
          <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 cursor-pointer">
            <Plus className="h-4 w-4" /> Nova campanha
          </button>
        </Link>

        {/* User profile bubble */}
        <div 
          className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-warning grid place-items-center text-xs font-bold select-none cursor-help"
          title={profile?.full_name || profile?.email || ""}
        >
          {getInitials()}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="h-9 w-9 grid place-items-center rounded-lg border border-border/80 hover:border-destructive hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
