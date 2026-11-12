export type Holiday = {
  date: string;
  name: string;
  type: "nazionale" | "locale";
};

function dateIso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export type HolidaySettings = {
  additions: { id: string; monthDay: string; name: string; type: Holiday["type"] }[];
  excluded: string[];
};

export const emptyHolidaySettings: HolidaySettings = { additions: [], excluded: [] };

export function isHolidaySettings(value: unknown): value is HolidaySettings {
  if (!value || typeof value !== "object") return false;
  const v = value as HolidaySettings;
  return Array.isArray(v.excluded) && v.excluded.every((id) => typeof id === "string") &&
    Array.isArray(v.additions) && v.additions.every((h) => h && typeof h.id === "string" &&
      typeof h.name === "string" && /^\d{2}-\d{2}$/.test(h.monthDay) &&
      (h.type === "nazionale" || h.type === "locale"));
}

export function holidayId(holiday: Holiday): string {
  return `${holiday.type}:${holiday.name}`;
}

export function getHolidays(year: number, settings: HolidaySettings = emptyHolidaySettings): (Holiday & { id: string })[] {
  const easter = easterSunday(year);
  const easterMonday = easterSunday(year);
  easterMonday.setDate(easterMonday.getDate() + 1);

  const defaults: Holiday[] = [
    { date: dateIso(year, 1, 1), name: "Capodanno", type: "nazionale" },
    { date: dateIso(year, 1, 6), name: "Epifania", type: "nazionale" },
    {
      date: dateIso(easter.getFullYear(), easter.getMonth() + 1, easter.getDate()),
      name: "Pasqua",
      type: "nazionale",
    },
    {
      date: dateIso(easterMonday.getFullYear(), easterMonday.getMonth() + 1, easterMonday.getDate()),
      name: "Lunedì dell’Angelo",
      type: "nazionale",
    },
    { date: dateIso(year, 4, 25), name: "Festa della Liberazione", type: "nazionale" },
    { date: dateIso(year, 5, 1), name: "Festa dei Lavoratori", type: "nazionale" },
    { date: dateIso(year, 6, 2), name: "Festa della Repubblica", type: "nazionale" },
    { date: dateIso(year, 8, 15), name: "Assunzione di Maria", type: "nazionale" },
    { date: dateIso(year, 9, 18), name: "San Giuseppe da Copertino · Osimo", type: "locale" },
    { date: dateIso(year, 11, 1), name: "Tutti i Santi", type: "nazionale" },
    { date: dateIso(year, 12, 8), name: "Immacolata Concezione", type: "nazionale" },
    { date: dateIso(year, 12, 25), name: "Natale", type: "nazionale" },
    { date: dateIso(year, 12, 26), name: "Santo Stefano", type: "nazionale" },
  ];
  return [
    ...defaults.map((h) => ({ ...h, id: holidayId(h) })).filter((h) => !settings.excluded.includes(h.id)),
    ...settings.additions.map((h) => ({ date: `${year}-${h.monthDay}`, name: h.name, type: h.type, id: h.id }))
      .filter((h) => {
        const d = new Date(`${h.date}T12:00:00`);
        return dateIso(d.getFullYear(), d.getMonth() + 1, d.getDate()) === h.date;
      }),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

export function holidayForDate(date: Date, settings: HolidaySettings = emptyHolidaySettings) {
  const iso = dateIso(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return getHolidays(date.getFullYear(), settings).find((holiday) => holiday.date === iso);
}