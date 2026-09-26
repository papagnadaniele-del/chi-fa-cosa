// ============= Full file contents =============

1: import { createFileRoute, useNavigate } from "@tanstack/react-router";
2: import { useState } from "react";
3: import { supabase } from "@/integrations/supabase/client";
4: import { CF_REGEX, cfToEmail, normalizeCf } from "@/lib/cf";
5: import "../turno.css";
6: 
7: export const Route = createFileRoute("/auth")({
8:   head: () => ({
9:     meta: [
10:       { title: "Accesso · Chi Fa Cosa - Easy" },
11:       { name: "description", content: "Accedi con codice fiscale e password per consultare il turno settimanale." },
12:       { property: "og:title", content: "Accesso · Chi Fa Cosa - Easy" },
13:       { property: "og:description", content: "Area riservata al personale abilitato." },
14:       { property: "og:type", content: "website" },
15:       { name: "twitter:card", content: "summary_large_image" },
16:     ],
17:   }),
18:   component: AuthPage,
19: });
20: 
21: function AuthPage() {
22:   const navigate = useNavigate();
23:   const [cf, setCf] = useState("");
24:   const [password, setPassword] = useState("");
25:   const [error, setError] = useState("");
26:   const [loading, setLoading] = useState(false);
27: 
28:   const submit = async (e: React.FormEvent) => {
29:     e.preventDefault();
30:     setError("");
31:     const code = normalizeCf(cf);
32:     if (!CF_REGEX.test(code)) return setError("Codice fiscale non valido (16 caratteri).");
33:     if (!password) return setError("Inserisci la password.");
34:     setLoading(true);
35:     const { error } = await supabase.auth.signInWithPassword({ email: cfToEmail(code), password });
36:     setLoading(false);
37:     if (error) return setError("Codice fiscale o password errati.");
38:     navigate({ to: "/turno", replace: true });
39:   };
40: 
41:   return (
42:     <div className="turno-app">
43:       <div className="auth-wrap">
44:         <div className="auth-card">
45:           <aside className="auth-hero">
46:             <img className="auth-hero__bg" src={salaImg} alt="" width={1024} height={1024} />
47:             <div className="auth-hero__overlay" />
48:             <div className="auth-hero__top">
49:               <div className="auth-logo-glass">SO</div>
50:               <h2>
51:                 Pianificazione
52:                 <br />
53:                 <strong>Sale Operatorie</strong>
54:               </h2>
55:               <div className="auth-hero__bar" />
56:               <p className="auth-hero__desc">
57:                 Turno settimanale delle sale operatorie e dei servizi, condiviso online:
58:                 il personale abilitato consulta il programma da qualsiasi dispositivo
59:                 e l'amministratore lo aggiorna in tempo reale.
60:               </p>
61:             </div>
62:             <div className="auth-hero__bottom">
63:               <span className="auth-hero__badge">
64:                 <span className="dot" />
65:                 Programma condiviso · Sempre aggiornato
66:               </span>
67:             </div>
68:           </aside>
69:           <section className="auth-panel">
70:             <h1>
71:               Chi Fa Cosa <span className="easy">- Easy</span>
72:             </h1>
73:             <p className="auth-sub">Accesso riservato al personale abilitato</p>
74:             <form onSubmit={submit}>
75:               <label>
76:                 Codice fiscale
77:                 <input
78:                   className="auth-input-cf"
79:                   value={cf}
80:                   onChange={(e) => setCf(e.target.value.toUpperCase())}
81:                   maxLength={16}
22:                   autoComplete="username"
23:                   placeholder="RSSMRA80A01H501U"
24:                 />
25:               </label>
26:               <label>
27:                 Password
28:                 <input
29:                   type="password"
30:                   value={password}
31:                   onChange={(e) => setPassword(e.target.value)}
32:                   autoComplete="current-password"
33:                 />
34:               </label>
35:               {error ? <div className="auth-error">{error}</div> : null}
36:               <button className="action-btn" type="submit" disabled={loading}>
37:                 {loading ? "Accesso…" : "Accedi"}
38:               </button>
39:             </form>
40:             <p className="auth-note">
41:               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
42:                 <circle cx="12" cy="12" r="10" />
43:                 <path d="M12 16v-4M12 8h.01" />
44:               </svg>
45:               Le credenziali sono fornite dall'amministratore. In caso di smarrimento contattare il coordinatore infermieristico.
46:             </p>
47:           </section>
48:         </div>
49:       </div>
50:     </div>
51:   );
52: }
