export type RowDef = {
  id: string;
  label: string;
  /** Il nome della riga è modificabile (le sale) */
  editable?: boolean;
  /** Condivide il nome con un'altra riga (sale pomeriggio -> sale mattino) */
  linkTo?: string;
  /** Celle con Specialità + Equipe modificabili (lun-ven) */
  editableCells?: boolean;
  /** Celle con solo Equipe modificabile (tutti i 7 giorni) */
  editableTeam?: boolean;
};

export type StaticCell = {
  specialty?: string;
  staff?: string;
  tag?: { text: string; cls: string };
};

/** Contenuto testuale precompilato di una cella */
export type Preset = { s?: string; t?: string } | null;

export const giorniNomi = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];

export const mesiNomi = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

export const morningRows: RowDef[] = [
  { id: "salaA", label: "Sala A", editable: true, editableCells: true },
  { id: "salaB", label: "Sala B", editable: true, editableCells: true },
  { id: "salaE", label: "Sala E", editable: true, editableCells: true },
];

export const afternoonRows: RowDef[] = [
  { id: "salaA_pom", label: "Sala A", editable: true, linkTo: "salaA", editableCells: true },
  { id: "salaB_pom", label: "Sala B", editable: true, linkTo: "salaB", editableCells: true },
  { id: "salaE_pom", label: "Sala E", editable: true, linkTo: "salaE", editableCells: true },
];

export const fullDayRows: RowDef[] = [
  { id: "rep", label: "Reperibilità", editableTeam: true },
  { id: "assenze", label: "Assenze", editableTeam: true },
];

export const serviziMorningRows: RowDef[] = [
  { id: "ancona", label: "Ancona", editableTeam: true },
  { id: "accVasc", label: "Accessi Vascolari", editableTeam: true },
  { id: "ster1", label: "Sterilizzazione", editableTeam: true },
  { id: "uff1", label: "Ufficio", editableTeam: true },
];

export const serviziAfternoonRows: RowDef[] = [
  { id: "ster2", label: "Sterilizzazione", editableTeam: true },
  { id: "uff2", label: "Ufficio", editableTeam: true },
];

const E: Preset = null;
const URG: Preset = { t: "ev. urgenza" };

type WeekData = Record<string, Preset[]>;

/* Settimana 1: Lun 15 Giugno 2026 */
const week1: WeekData = {
  salaA: [
    { s: "Oculistica", t: "CHIUCCONI · SDEO · GHINELLI" },
    { s: "Chir. Torrette", t: "BORRONI · SDEO" },
    { s: "Ortopedia", t: "GIUGGIO · SCHIRO · GHINELLI" },
    { s: "Chir. Osimo", t: "MARCHETTI · SDEO · SCHIRONE" },
    { s: "Chir. Osimo", t: "GIUGGIOLONI · SCHIRONE" },
    { t: "BORRONI · SDEO J" },
    E,
  ],
  salaB: [URG, URG, URG, URG, { s: "Ortopedia Torrette", t: "CHIUCCONI · MARCHETTI · GHINELLI" }, E, E],
  salaE: [
    { s: "Amb. Dermatologia", t: "GIUGGIOLONI · SCHIRONE" },
    { s: "Amb. Chirurgico", t: "MOBIDONI · PESARESI" },
    { s: "Amb. Dermatologia", t: "PAPAGGI · GABBANI" },
    { s: "Amb. Ortopedia", t: "CHIUCCONI · PESARESI" },
    { s: "Amb. Medicazioni", t: "GABBANELLI" },
    { t: "PAPAGNA · GABBANELLI J" },
    E,
  ],
  ancona: [{ t: "PAPAGNA" }, E, E, E, E, E, E],
  accVasc: [E, E, E, E, E, E, E],
  ster1: [
    { t: "GIUGGIOLONI / PILESI" },
    { t: "MARCHETTI" },
    { t: "CHIUCCI · PILESI" },
    { t: "ORTOPEDIA Osimo" },
    { t: "CHIRURGIA Torrette" },
    E,
    E,
  ],
  uff1: [
    E,
    E,
    E,
    { t: "MARCHETTI · GABBANELLI · PESARESI" },
    { t: "PAPAGNA · GHINELLI · SCHIRONE" },
    { t: "MORBIDONI · SDEO J" },
    E,
  ],
  salaA_pom: [E, E, E, E, { t: "BORRONI · SDEO" }, { t: "GIUGGIOLONI · SCHIRONE J" }, E],
  salaB_pom: [E, E, E, E, URG, E, E],
  salaE_pom: [E, E, E, E, { s: "Amb. Medicazioni", t: "GABBANELLI" }, { t: "PAPAGNA · GABBANELLI J" }, E],
  ster2: [E, E, E, E, E, E, E],
  uff2: [E, E, E, E, E, E, E],
  rep: [
    { t: "MORBIDONI REP" },
    { t: "PAPAGNA (+sale) REP" },
    { t: "PILESI REP" },
    { t: "CHIR. Osimo / Amb. Chir. REP" },
    { t: "PAPAGNA · GHINELLI · GABBANELLI REP" },
    { t: "MORBIDONI · PESARESI REP J" },
    { t: "MORBIDONI · PESARESI REP" },
  ],
  assenze: [
    { t: "MORBIDONI RIP · ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE · GABBANELLI RIP · CHIUCCONI 104" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE · BORRONI CS" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
  ],
};

/* Settimana 2: Lun 22 Giugno 2026 */
const week2: WeekData = {
  salaA: [
    { s: "Chir. Torrette", t: "BORRONI · SDEO · MARCHETTI" },
    { s: "Ortopedia", t: "GIUGGIO · SCHIRO · GHINELLI" },
    { s: "Oculistica", t: "CHIUCCONI · SDEO · GHINELLI" },
    { s: "Chir. Osimo", t: "GIUGGIOLONI · SCHIRONE" },
    { s: "Ortopedia Torrette", t: "CHIUCCONI · MARCHETTI · GHINELLI" },
    { t: "PAPAGNA · GABBANELLI J" },
    E,
  ],
  salaB: [URG, URG, URG, URG, URG, E, E],
  salaE: [
    { s: "Amb. Chirurgico", t: "MOBIDONI · PESARESI" },
    { s: "Amb. Dermatologia", t: "PAPAGGI · GABBANI" },
    { s: "Amb. Dermatologia", t: "GIUGGIOLONI · SCHIRONE" },
    { s: "Amb. Ortopedia", t: "CHIUCCONI · PESARESI" },
    { s: "Amb. Medicazioni", t: "GABBANELLI · MARCHETTI" },
    E,
    E,
  ],
  ancona: [E, E, E, E, E, E, E],
  accVasc: [E, E, E, E, E, E, E],
  ster1: [
    { t: "PILESI · CHIUCCI" },
    { t: "MARCHETTI · GIUGGIOLONI" },
    { t: "ORTOPEDIA Osimo" },
    { t: "CHIRURGIA Torrette" },
    { t: "CHIR. Osimo" },
    E,
    E,
  ],
  uff1: [
    E,
    E,
    E,
    { t: "GABBANELLI · PESARESI · SCHIRONE" },
    { t: "PAPAGNA · GHINELLI" },
    { t: "MORBIDONI · SDEO J" },
    E,
  ],
  salaA_pom: [
    E,
    E,
    E,
    E,
    { s: "Ortopedia Torrette", t: "CHIUCCONI · MARCHETTI · GHINELLI" },
    { t: "PAPAGNA · GABBANELLI J" },
    E,
  ],
  salaB_pom: [E, E, E, E, URG, E, E],
  salaE_pom: [E, E, E, E, { s: "Amb. Medicazioni", t: "GABBANELLI · MARCHETTI" }, E, E],
  ster2: [E, E, E, E, E, E, E],
  uff2: [E, E, E, E, E, E, E],
  rep: [
    { t: "PILESI REP" },
    { t: "MORBIDONI REP" },
    { t: "PAPAGNA (+sale) REP" },
    { t: "CHIR. Osimo / Amb. Chir. REP" },
    { t: "BORRONI · SDEO · PESARESI REP" },
    { t: "GIUGGIOLONI · MORBIDONI REP" },
    { t: "GIUGGIOLONI · MORBIDONI REP" },
  ],
  assenze: [
    { t: "ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE · MORBIDONI RIP" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
    { t: "ZITTI FERIE · GRASSI FERIE" },
  ],
};

export const weeksData: Record<string, WeekData> = {
  "2026-06-15": week1,
  "2026-06-22": week2,
};

/* ---------- Date helpers ---------- */
export function getMonday(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThu = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return (
    1 +
    Math.round(
      ((date.getTime() - firstThu.getTime()) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7,
    )
  );
}
