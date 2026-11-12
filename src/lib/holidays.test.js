import { describe, expect, test } from "bun:test";
import { getHolidays, holidayForDate, emptyHolidaySettings } from "./holidays";

describe("Festività condivise", () => {
  test("aggiunge una festività nazionale ogni anno", () => {
    const settings = { ...emptyHolidaySettings, additions: [{ id: "n", monthDay: "03-12", name: "Nazionale aggiunta", type: "nazionale" }] };
    expect(holidayForDate(new Date(2027, 2, 12), settings)?.name).toBe("Nazionale aggiunta");
  });
  test("rimuove una festività nazionale anche negli anni successivi", () => {
    const settings = { ...emptyHolidaySettings, excluded: ["nazionale:Natale"] };
    expect(getHolidays(2027, settings).some((h) => h.date === "2027-12-25")).toBe(false);
  });
  test("aggiunge una festività locale al programma", () => {
    const settings = { ...emptyHolidaySettings, additions: [{ id: "l", monthDay: "11-12", name: "Patrono locale", type: "locale" }] };
    expect(holidayForDate(new Date(2026, 10, 12), settings)?.type).toBe("locale");
  });
  test("mantiene Pasquetta automatica", () => {
    expect(holidayForDate(new Date(2026, 3, 6))?.name).toBe("Lunedì dell’Angelo");
  });
});