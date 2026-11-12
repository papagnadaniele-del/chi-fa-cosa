import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useHolidaySettings, useSaveHolidaySettings } from "@/lib/holiday-settings";
import { getHolidays, type Holiday } from "@/lib/holidays";

export function AdminHolidays() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<Holiday["type"]>("locale");
  const [error, setError] = useState("");
  const query = useHolidaySettings();
  const save = useSaveHolidaySettings();
  const settings = query.data;

  return <section className="admin-sheet" aria-labelledby="holidays-heading">
    <div className="admin-section-heading holiday-heading">
      <h2 id="holidays-heading">Festività</h2>
      <label className="holiday-year">Anno
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => <option key={y}>{y}</option>)}
        </select>
      </label>
    </div>
    {!settings ? <p>{query.error?.message ?? "Caricamento…"}</p> : <>
      <h3>Nuova festività</h3>
      <form className="admin-form" onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const monthDay = date.slice(5);
        if (getHolidays(Number(date.slice(0, 4)), settings).some((h) => h.date === date && h.name.toLowerCase() === name.trim().toLowerCase())) {
          setError("Questa festività è già presente."); return;
        }
        try {
          await save.mutateAsync({ ...settings, additions: [...settings.additions, { id: crypto.randomUUID(), monthDay, name: name.trim(), type }] });
          setName(""); setDate("");
        } catch { /* errore visualizzato sotto */ }
      }}>
        <input aria-label="Nome festività" placeholder="Nome festività" required value={name} onChange={(e) => setName(e.target.value)} disabled={save.isPending} />
        <input aria-label="Data festività" type="date" required value={date} onChange={(e) => setDate(e.target.value)} disabled={save.isPending} />
        <select aria-label="Tipo festività" value={type} onChange={(e) => setType(e.target.value === "nazionale" ? "nazionale" : "locale")} disabled={save.isPending} className="rounded-md border border-input bg-background px-3 py-2 text-foreground">
          <option value="nazionale">Nazionale</option><option value="locale">Locale</option>
        </select>
        <Button type="submit" disabled={save.isPending || !name.trim()}>Aggiungi festività</Button>
      </form>
      <p className="text-sm text-muted-foreground mb-4">Ricorrenza annuale</p>
      {error || save.error ? <div className="auth-error">{error || save.error?.message}</div> : null}
      {save.isSuccess ? <div className="auth-info" role="status">Festività aggiornate</div> : null}
      <div className="holiday-list">
        {getHolidays(year, settings).map((h) => <div className="holiday-row" key={h.id}>
          <time dateTime={h.date}>{new Date(`${h.date}T12:00:00`).toLocaleDateString("it-IT", { day: "2-digit", month: "long" })}</time>
          <strong>{h.name}</strong>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className={"holiday-type " + h.type}>{h.type === "locale" ? "Locale" : "Nazionale"}</span>
            <Button variant="outline" size="sm" disabled={save.isPending} aria-label={`Rimuovi ${h.name}`} onClick={() => {
              setError("");
              const custom = settings.additions.some((a) => a.id === h.id);
              save.mutate(custom ? { ...settings, additions: settings.additions.filter((a) => a.id !== h.id) } : { ...settings, excluded: [...settings.excluded, h.id] });
            }}>Rimuovi</Button>
          </div>
        </div>)}
      </div>
    </>}
  </section>;
}