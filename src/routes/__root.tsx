import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/components/nexus/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-destructive font-mono bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-left overflow-auto max-h-40">
          {error?.message || "Unknown error"}
          {error?.stack && <span className="block mt-2 text-xs opacity-70">{error.stack}</span>}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ChamAI Delivery — O sistema operacional do seu delivery" },
      { name: "description", content: "Mais pedidos, mais clientes, mais vendas. ChamAI Delivery automatiza seu delivery." },
      { name: "author", content: "ChamAI" },
      { property: "og:title", content: "ChamAI Delivery" },
      { property: "og:description", content: "Mais pedidos, mais clientes, mais vendas. ChamAI Delivery automatiza seu delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@ChamAIDelivery" },
      { name: "twitter:title", content: "ChamAI Delivery" },
      { name: "twitter:description", content: "Mais pedidos, mais clientes, mais vendas. ChamAI Delivery automatiza seu delivery." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='orangeGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FF5E36'/%3E%3Cstop offset='100%25' stop-color='%23FF1E56'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='46' fill='url(%23orangeGrad)'/%3E%3Cpath d='M35 55 L45 35 H60 L50 55 Z' fill='white'/%3E%3Ccircle cx='40' cy='65' r='8' fill='white'/%3E%3Ccircle cx='60' cy='65' r='8' fill='white'/%3E%3Cpath d='M58 45 L68 32 H58 Z' fill='white'/%3E%3Ccircle cx='70' cy='28' r='7' fill='white'/%3E%3C/svg%3E"
      }
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('nexus-theme')||'dark';var r=document.documentElement;r.classList.remove('dark','light');r.classList.add(t);r.style.colorScheme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/components/nexus/AuthGuard";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AuthGuard>
            <Outlet />
          </AuthGuard>
          <Toaster richColors closeButton />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
