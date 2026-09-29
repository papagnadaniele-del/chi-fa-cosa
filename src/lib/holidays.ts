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

export function getHolidays(year: number): Holiday[] {
  const easterMonday = easterSunday(year);
  easterMonday.setDate(easterMonday.getDate() + 1);

  return [
    { date: dateIso(year, 1, 1), name: "Capodanno", type: "nazionale" },
    { date: dateIso(year, 1, 6), name: "Epifania", type: "nazionale" },
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
  ].sort((a, b) => a.date.localeCompare(b.date)) as Holiday[];
}

export function holidayForDate(date: Date) {
  const iso = dateIso(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return getHolidays(date.getFullYear()).find((holiday) => holiday.date === iso);
}