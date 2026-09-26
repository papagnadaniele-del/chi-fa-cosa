import { createFileRoute } from "@tanstack/react-router";
import { bootstrapAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/api/public/bootstrap")({
  server: {
    handlers: {
      POST: async () => Response.json(await bootstrapAdmin()),
    },
  },
});
