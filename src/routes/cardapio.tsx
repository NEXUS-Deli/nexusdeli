import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cardapio")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/cardapio" || location.pathname === "/cardapio/") {
      throw redirect({
        to: "/cardapio/$slug",
        params: { slug: "nexusdeli" },
      });
    }
  },
});
