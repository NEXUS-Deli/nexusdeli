import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cardapio")({
  beforeLoad: () => {
    throw redirect({
      to: "/cardapio/$slug",
      params: { slug: "nexusdeli" },
    });
  },
});
