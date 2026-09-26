import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  createAppUser,
  deleteAppUser,
  listUsers,
  resetUserPassword,
  setUserRoles,
  updateUserProfile,
} from "@/lib/admin.functions";
import { useMe } from "@/lib/use-me";
import "../../turno.css";

export const Route = createFileRoute("/_authenticated/utenti")({
  head: () => ({
    meta: [
      { title: "Gestione utenti · Chi Fa Cosa - Easy" },
      { name: "description", content: "Crea utenti e assegna i ruoli Utente e Amministratore." },
      { property: "og:title", content: "Gestione utenti · Chi Fa Cosa - Easy" },
      { property: "og:description", content: "Amministrazione degli accessi al turno settimanale." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UtentiPage,
});

type Role = "admin" | "user";

function msg(e: unknown) {
  if (e instanceof Error) {
    try {
      const parsed = JSON.parse(e.message);
      if (Array.isArray(parsed) && parsed[0]?.message) return parsed[0].message as string;
    } catch {
      /* testo semplice */
    }
    return e.message;
  }
  return "Errore";
}

function UtentiPage() {
  const me = useMe();
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listUsers);
  const create = useServerFn(createAppUser);
  const setRoles = useServerFn(setUserRoles);
  const resetPw = useServerFn(resetUserPassword);
  const del = useServerFn(deleteAppUser);
  const update = useServerFn(updateUserProfile);

  const users = useQuery({ queryKey: ["users"], queryFn: () => fetchUsers(), enabled: !!me.data?.isAdmin });

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCf, setEditCf] = useState("");

  const [cf, setCf] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [roles, setNewRoles] = useState<Role[]>(["user"]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (me.isLoading) return <div className="turno-app"><div className="auth-wrap">Caricamento…</div></div>;
  if (!me.data?.isAdmin)
    return (
      <div className="turno-app">
        <div className="auth-wrap">
          <div className="auth-card">
            <p>Pagina riservata agli amministratori.</p>
            <Link to="/turno" className="nav-btn wide">Torna al turno</Link>
          </div>
        </div>
      </div>
    );

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setError("");
    setInfo("");
    try {
      await fn();
      setInfo(ok);
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (e) {
      setError(msg(e));
    }
  };

  const toggle = (list: Role[], r: Role) => (list.includes(r) ? list.filter((x) => x !== r) : [...list, r]);

  return (
    <div className="turno-app">
      <div className="app">
        <div className="toolbar no-print">
          <div className="toolbar__title">
            <div className="toolbar__logo">AD</div>
            <span>Gestione utenti</span>
          </div>
          <div className="toolbar__actions">
            <Link to="/turno" className="action-btn">← Torna al turno</Link>
          </div>
        </div>

        <div className="sheet admin-sheet">
          <h2>Nuovo utente</h2>
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () => create({ data: { codice_fiscale: cf, full_name: name, password: pw, roles } }),
                "Utente creato",
              ).then(() => {
                setCf("");
                setName("");
                setPw("");
                setNewRoles(["user"]);
              });
            }}
          >
            <input placeholder="Cognome Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <input
              placeholder="Codice fiscale"
              maxLength={16}
              value={cf}
              onChange={(e) => setCf(e.target.value.toUpperCase())}
            />
            <input placeholder="Password (min 8)" value={pw} onChange={(e) => setPw(e.target.value)} />
            <label><input type="checkbox" checked={roles.includes("user")} onChange={() => setNewRoles(toggle(roles, "user"))} /> Utente</label>
            <label><input type="checkbox" checked={roles.includes("admin")} onChange={() => setNewRoles(toggle(roles, "admin"))} /> Amministratore</label>
            <button className="action-btn" type="submit">Crea</button>
          </form>
          {error ? <div className="auth-error">{error}</div> : null}
          {info ? <div className="auth-info">{info}</div> : null}

          <h2>Utenti abilitati</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Nome</th><th>Codice fiscale</th><th>Utente</th><th>Amministratore</th><th>Azioni</th></tr>
            </thead>
            <tbody>
              {(users.data ?? []).map((u) =>
                editId === u.id ? (
                  <tr key={u.id}>
                    <td>
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Cognome Nome" />
                    </td>
                    <td>
                      <input
                        value={editCf}
                        maxLength={16}
                        onChange={(e) => setEditCf(e.target.value.toUpperCase())}
                        placeholder="Codice fiscale"
                      />
                    </td>
                    <td colSpan={2}></td>
                    <td className="admin-actions">
                      <button
                        className="nav-btn wide"
                        onClick={() =>
                          run(
                            () => update({ data: { id: u.id, codice_fiscale: editCf, full_name: editName } }),
                            "Utente aggiornato",
                          ).then(() => setEditId(null))
                        }
                      >
                        Salva
                      </button>
                      <button className="nav-btn wide" onClick={() => setEditId(null)}>
                        Annulla
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.codice_fiscale}</td>
                    {(["user", "admin"] as Role[]).map((r) => (
                      <td key={r} className="center">
                        <input
                          type="checkbox"
                          checked={u.roles.includes(r)}
                          onChange={() =>
                            run(() => setRoles({ data: { id: u.id, roles: toggle(u.roles, r) } }), "Ruoli aggiornati")
                          }
                        />
                      </td>
                    ))}
                    <td className="admin-actions">
                      <button
                        className="nav-btn wide"
                        onClick={() => {
                          setEditId(u.id);
                          setEditName(u.full_name);
                          setEditCf(u.codice_fiscale);
                        }}
                      >
                        Modifica
                      </button>
                      <button
                        className="nav-btn wide"
                        onClick={() => {
                          const p = window.prompt("Nuova password per " + u.full_name + " (min 8 caratteri)");
                          if (p) run(() => resetPw({ data: { id: u.id, password: p } }), "Password aggiornata");
                        }}
                      >
                        Password
                      </button>
                      {u.id !== me.data?.id ? (
                        <button
                          className="nav-btn wide"
                          onClick={() => {
                            if (window.confirm("Eliminare " + u.full_name + "?"))
                              run(() => del({ data: { id: u.id } }), "Utente eliminato");
                          }}
                        >
                          Elimina
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
