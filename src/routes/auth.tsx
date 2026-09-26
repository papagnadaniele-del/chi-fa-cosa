import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CF_REGEX, cfToEmail, normalizeCf } from "@/lib/cf";
import "../turno.css";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accesso · Chi Fa Cosa - Easy" },
      { name: "description", content: "Accedi con codice fiscale e password per consultare il turno settimanale." },
      { property: "og:title", content: "Accesso · Chi Fa Cosa - Easy" },
      { property: "og:description", content: "Area riservata al personale abilitato." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [cf, setCf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const code = normalizeCf(cf);
    if (!CF_REGEX.test(code)) return setError("Codice fiscale non valido (16 caratteri).");
    if (!password) return setError("Inserisci la password.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: cfToEmail(code), password });
    setLoading(false);
    if (error) return setError("Codice fiscale o password errati.");
    navigate({ to: "/turno", replace: true });
  };

  return (
    <div className="turno-app">
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <div className="toolbar__logo auth-logo">SO</div>
          <h1>Chi Fa Cosa - Easy</h1>
          <p className="auth-sub">Accesso riservato al personale abilitato</p>
          <label>
            Codice fiscale
            <input
              value={cf}
              onChange={(e) => setCf(e.target.value.toUpperCase())}
              maxLength={16}
              autoComplete="username"
              placeholder="RSSMRA80A01H501U"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <div className="auth-error">{error}</div> : null}
          <button className="action-btn" type="submit" disabled={loading}>
            {loading ? "Accesso…" : "Accedi"}
          </button>
          <p className="auth-note">Le credenziali sono fornite dall'amministratore.</p>
        </form>
      </div>
    </div>
  );
}
