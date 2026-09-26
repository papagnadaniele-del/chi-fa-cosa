export const CF_REGEX = /^[A-Z0-9]{16}$/;

export function normalizeCf(cf: string) {
  return cf.trim().toUpperCase();
}

/** Email tecnica derivata dal codice fiscale (non riceve posta). */
export function cfToEmail(cf: string) {
  return normalizeCf(cf).toLowerCase() + "@chifacosa.local";
}
