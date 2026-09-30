import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CF_REGEX, cfToEmail, normalizeCf } from "@/lib/cf";
import salaImg from "@/assets/sala-operatoria.jpg";
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
        <div className="auth-card">
          <aside className="auth-hero">
            <img className="auth-hero__bg" src={salaImg} alt="" width={1024} height={1024} />
            <div className="auth-hero__overlay" />
            <div className="auth-hero__top">
              <div className="auth-logo-glass">SO</div>
              <h2>
                Pianificazione
                <br />
                <strong>Sale Operatorie</strong>
              </h2>
              <div className="auth-hero__bar" />
              <p className="auth-hero__desc">
                Programma settimanale per sale operatorie. Web App con condivisione online.{"\u00a0"}
                {"\n"}Il personale abilitato consulta il programma da qualsiasi dispositivo e l'amministratore lo aggiorna in tempo reale.
              </p>
            </div>
            <div className="auth-hero__bottom">
              <span className="auth-hero__badge">
                <span className="dot" />
                Programma condiviso · Sempre aggiornato
              </span>
            </div>
          </aside>
          <section className="auth-panel">
            <h1>
              Chi Fa Cosa <span className="easy">- Easy</span>
            </h1>
            <p className="auth-sub">Accesso riservato al personale abilitato</p>
            <form onSubmit={submit}>
              <label>
                Codice fiscale
                <input
                  className="auth-input-cf"
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
            </form>
            <p className="auth-note">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Le credenziali sono fornite dall'amministratore. In caso di smarrimento contattare il coordinatore infermieristico.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
