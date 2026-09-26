import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import "../turno.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chi Fa Cosa - Easy · Turno Settimanale Sale Operatorie" },
      { name: "description", content: "Chi Fa Cosa - Easy: turno settimanale degli infermieri tra sale operatorie e servizi." },
      { property: "og:title", content: "Chi Fa Cosa - Easy · Turno Settimanale" },
      { property: "og:description", content: "Consulta il turno settimanale del personale infermieristico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate({ to: data.session ? "/turno" : "/auth", replace: true });
    });
  }, [navigate]);
  return <div className="turno-app"><div className="auth-wrap">Caricamento…</div></div>;
}
