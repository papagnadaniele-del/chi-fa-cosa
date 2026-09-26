import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import "../../turno.css";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/use-me";
import {
  afternoonRows,
  fullDayRows,
  getMonday,
  giorniNomi,
  isoDate,
  mesiNomi,
  morningRows,
  serviziAfternoonRows,
  serviziMorningRows,
  weekNumber,
  weeksData,
  type Preset,
  type RowDef,
} from "../../lib/turno-data";

export const Route = createFileRoute("/_authenticated/turno")({
  head: () => ({
    meta: [
      { title: "Chi Fa Cosa - Easy · Turno Settimanale Sale Operatorie" },
      {
        name: "description",
        content:
          "Chi Fa Cosa - Easy: pianificazione settimanale degli infermieri tra sale operatorie e servizi, con stampa A4 orizzontale.",
      },
      { property: "og:title", content: "Chi Fa Cosa - Easy · Turno Settimanale" },
      {
        property: "og:description",
        content:
          "Assegna il personale infermieristico a sale e servizi, settimana per settimana, e stampa il foglio turno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TurnoPage,
});

type CellValue = { specialty?: string; team?: string };
type CellMap = Record<string, CellValue>;

const DEFAULT_MONDAY = "2026-06-15";

async function saveWeek(week: string, cells: CellMap) {
  await supabase.from("turno_weeks").upsert({ week_iso: week, cells, updated_at: new Date().toISOString() });
}

async function saveRoomNames(value: Record<string, string>) {
  await supabase.from("app_settings").upsert({ key: "room_names", value });
}

function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1);
}

/* Textarea con auto-resize (campi Specialità / Equipe) */
function AutoField({
  value,
  onChange,
  onCommit,
  className,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  className: string;
  placeholder: string;
  readOnly?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value]);

  return (
    <textarea
      ref={ref}
      className={className}
      rows={1}
      placeholder={readOnly ? "" : placeholder}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onCommit}
    />
  );
}

function TeamField(props: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  readOnly?: boolean;
}) {
  return <AutoField {...props} className="cell-field team" placeholder="Equipe" />;
}


function StaticCell({ preset }: { preset: Preset }) {
  if (!preset || (!preset.s && !preset.t)) return <span className="empty-cell">—</span>;
  if (preset.t === "ev. urgenza" && !preset.s) {
    return <span className="tag tag-urgenza">ev. urgenza</span>;
  }
  const team = preset.t ?? "";
  const hasJ = / J$/.test(team);
  return (
    <div className="cell-content">
      {preset.s ? <span className="cell-specialty">{preset.s}</span> : null}
      {team ? <span className="cell-staff">{hasJ ? team.replace(/ J$/, "") : team}</span> : null}
      {hasJ ? <span className="tag tag-rep">J</span> : null}
    </div>
  );
}

function TurnoPage() {
  const me = useMe();
  const readOnly = !me.data?.isAdmin;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mondayIso, setMondayIso] = useState(DEFAULT_MONDAY);
  const [view, setView] = useState<"sale" | "servizi">("sale");
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [cells, setCells] = useState<CellMap>({});
  const [drafts, setDrafts] = useState<CellMap>({});

  const monday = useMemo(() => parseDate(mondayIso), [mondayIso]);

  /* Settimana iniziale: sempre quella del giorno di apertura */
  useEffect(() => {
    setMondayIso(isoDate(getMonday(new Date())));
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "room_names")
      .maybeSingle()
      .then(({ data }) => setRoomNames((data?.value as Record<string, string>) ?? {}));
  }, []);

  /* Contenuto celle salvato per la settimana visualizzata */
  useEffect(() => {
    let active = true;
    setCells({});
    setDrafts({});
    supabase
      .from("turno_weeks")
      .select("cells")
      .eq("week_iso", mondayIso)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setCells((data?.cells as CellMap) ?? {});
      });
    return () => {
      active = false;
    };
  }, [mondayIso]);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      out.push(d);
    }
    return out;
  }, [monday]);

  const data = weeksData[mondayIso] ?? {};

  const shiftWeek = (deltaDays: number) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + deltaDays);
    setMondayIso(isoDate(d));
  };

  const roomLabel = (id: string, fallback: string) => roomNames[id] ?? fallback;

  const setRoomLabel = (id: string, value: string) => {
    setRoomNames((prev) => ({ ...prev, [id]: value }));
  };

  const commitRoomNames = () => {
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(roomNames)) if (v.trim()) clean[k] = v.trim();
    setRoomNames(clean);
    void saveRoomNames(clean);
  };

  const presetFor = useCallback(
    (rowId: string, dayIndex: number): Preset => {
      const row = data[rowId];
      return row ? (row[dayIndex] ?? null) : null;
    },
    [data],
  );

  /* Valore visualizzato: bozza in corso -> salvato -> precompilato */
  const fieldValue = (cellKey: string, field: keyof CellValue, preset: Preset) => {
    const draft = drafts[cellKey]?.[field];
    if (draft !== undefined) return draft;
    const saved = cells[cellKey]?.[field];
    if (saved !== undefined) return saved;
    if (cells[cellKey]) return "";
    if (!preset) return "";
    if (preset.t === "ev. urgenza" && !preset.s) return "";
    return (field === "specialty" ? preset.s : preset.t) ?? "";
  };

  const setDraft = (cellKey: string, field: keyof CellValue, value: string) => {
    if (readOnly) return;
    setDrafts((prev) => ({ ...prev, [cellKey]: { ...prev[cellKey], [field]: value } }));
  };

  const commit = (cellKey: string, current: CellValue) => {
    if (readOnly) return;
    setCells((prev) => {
      const next = { ...prev };
      const merged: CellValue = { ...prev[cellKey], ...current };
      if (merged.specialty || merged.team) next[cellKey] = merged;
      else delete next[cellKey];
      void saveWeek(mondayIso, next);
      return next;
    });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowLeft") shiftWeek(-7);
      if (e.key === "ArrowRight") shiftWeek(7);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const mRows = view === "servizi" ? serviziMorningRows : morningRows;
  const aRows = view === "servizi" ? serviziAfternoonRows : afternoonRows;
  const fRows = view === "servizi" ? [] : fullDayRows;

  const end = new Date(monday);
  end.setDate(monday.getDate() + 6);
  const range =
    monday.getDate() +
    " " +
    (mesiNomi[monday.getMonth()] ?? "").slice(0, 3) +
    " – " +
    end.getDate() +
    " " +
    (mesiNomi[end.getMonth()] ?? "").slice(0, 3) +
    " " +
    end.getFullYear();

  const docTitle =
    view === "servizi"
      ? "Turno Settimanale Infermieri · Servizi"
      : "Turno Settimanale Infermieri · Sale Operatorie";
  const toolbarTitle =
    view === "servizi" ? "Gestione Infermieri · Servizi" : "Programma Settimanale · Sale Operatorie";
  const logo = view === "servizi" ? "SV" : "SO";

  const renderRow = (row: RowDef, sectionClass: string) => (
    <tr key={row.id} className={sectionClass + "-row cat-main"}>
      <td className={"col-cat " + sectionClass}>
        {row.editable && !readOnly ? (
          <input
            className="room-input"
            type="text"
            aria-label={"Nome " + row.label}
            placeholder={row.label}
            value={roomLabel(row.linkTo ?? row.id, row.label)}
            onChange={(e) => setRoomLabel(row.linkTo ?? row.id, e.target.value)}
            onBlur={commitRoomNames}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
        ) : row.editable ? (
          roomNames[row.linkTo ?? row.id] || row.label
        ) : (
          row.label
        )}
      </td>
      {days.map((_, i) => {
        const weekend = i >= 5;
        const preset = presetFor(row.id, i);
        const cellKey = row.id + "_" + i;
        const editableCell = row.editableCells;
        const editableTeam = row.editableTeam;
        const classes = ["cell", sectionClass];
        if (weekend) classes.push("weekend");
        if (editableCell || editableTeam) classes.push("editable");

        return (
          <td key={i} className={classes.join(" ")}>
            {editableCell ? (
              <div className="cell-fields">
                <AutoField
                  className="cell-field specialty"
                  placeholder="Specialità"
                  readOnly={readOnly}
                  value={fieldValue(cellKey, "specialty", preset)}
                  onChange={(v) => setDraft(cellKey, "specialty", v)}
                  onCommit={() =>
                    commit(cellKey, {
                      specialty: fieldValue(cellKey, "specialty", preset),
                      team: fieldValue(cellKey, "team", preset),
                    })
                  }
                />

                <TeamField
                  readOnly={readOnly}
                  value={fieldValue(cellKey, "team", preset)}
                  onChange={(v) => setDraft(cellKey, "team", v)}
                  onCommit={() =>
                    commit(cellKey, {
                      specialty: fieldValue(cellKey, "specialty", preset),
                      team: fieldValue(cellKey, "team", preset),
                    })
                  }
                />
              </div>
            ) : editableTeam ? (
              <div className="cell-fields team-only">
                <TeamField
                  readOnly={readOnly}
                  value={fieldValue(cellKey, "team", preset)}
                  onChange={(v) => setDraft(cellKey, "team", v)}
                  onCommit={() => commit(cellKey, { team: fieldValue(cellKey, "team", preset) })}
                />
              </div>
            ) : (
              <StaticCell preset={preset} />
            )}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div className="turno-app">
      <div className="app">
        {/* ============ BARRA DI CONTROLLO (non stampata) ============ */}
        <div className="toolbar no-print">
          <div className="toolbar__title">
            <div className="toolbar__logo">{logo}</div>
            <span>{toolbarTitle}</span>
          </div>

          <div className="toolbar__view-switch">
            <button
              className={"view-tab" + (view === "sale" ? " active" : "")}
              onClick={() => setView("sale")}
            >
              Sale Operatorie
            </button>
            <button
              className={"view-tab" + (view === "servizi" ? " active" : "")}
              onClick={() => setView("servizi")}
            >
              Servizi
            </button>
          </div>

          <div className="toolbar__nav">
            <button className="nav-btn" title="Settimana precedente" onClick={() => shiftWeek(-7)}>
              ‹
            </button>
            <div className="week-display">{range}</div>
            <button className="nav-btn" title="Settimana successiva" onClick={() => shiftWeek(7)}>
              ›
            </button>
            <button
              className="nav-btn wide"
              title="Settimana corrente"
              onClick={() => setMondayIso(isoDate(getMonday(new Date())))}
            >
              Oggi
            </button>
          </div>

          <div className="toolbar__actions">
            <span className="user-badge">
              {me.data?.name}
              {readOnly ? " · sola lettura" : " · Admin"}
            </span>
            {!readOnly ? (
              <Link to="/utenti" className="nav-btn wide">
                Utenti
              </Link>
            ) : null}
            <button className="action-btn" onClick={handlePrint}>
              🖨 Stampa A4
            </button>
            <button className="nav-btn wide" onClick={signOut}>
              Esci
            </button>
          </div>
        </div>

        {/* ============ FOGLIO A4 ============ */}
        <div className="sheet">
          <div className="doc-header">
            <div className="doc-header__left">
              <h1>{docTitle}</h1>
              <p>
                {view === "servizi"
                  ? "Assegnazione del personale infermieristico ai servizi di reparto"
                  : "Assegnazione del personale infermieristico alle sale e servizi di reparto"}
                {view === "sale" ? (
                  <span className="edit-hint no-print">
                    · i nomi delle sale sono modificabili (clicca sulla cella)
                  </span>
                ) : null}
              </p>
            </div>
            <div className="doc-header__right">
              <div>
                Settimana n. <strong>{weekNumber(monday)}</strong>
              </div>
              <div>{range}</div>
            </div>
          </div>

          <table className="turno">
            <thead>
              <tr>
                <th className="col-cat">{(mesiNomi[monday.getMonth()] ?? "").toUpperCase()}</th>
                {days.map((d, i) => (
                  <th key={i} className={"day" + (i >= 5 ? " weekend" : "")}>
                    <span className="day-name">{giorniNomi[d.getDay()]}</span>
                    <span className="day-num">{d.getDate()}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="section-bar morning">
                <td colSpan={8}>Mattina</td>
              </tr>
              {mRows.map((row) => renderRow(row, "morning"))}

              <tr className="section-bar afternoon">
                <td colSpan={8}>Pomeriggio</td>
              </tr>
              {aRows.map((row) => renderRow(row, "afternoon"))}

              {fRows.map((row) => renderRow(row, "neutral"))}
            </tbody>
          </table>

          <div className="doc-footer">
            <div className="signature">
              Il Coordinatore infermieristico
              <div className="signature__line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
