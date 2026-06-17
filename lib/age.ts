export const MIN_AGE = 18

/** Age in whole years from an ISO "YYYY-MM-DD" date of birth, or null if unparseable. */
export function ageFromISO(iso: string): number | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  const now = new Date()
  let age = now.getFullYear() - y
  const hadBirthday = now.getMonth() + 1 > m || (now.getMonth() + 1 === m && now.getDate() >= d)
  if (!hadBirthday) age--
  return age
}

/** Whether the date of birth meets the minimum age. */
export function isAdult(iso: string): boolean {
  const age = ageFromISO(iso)
  return age !== null && age >= MIN_AGE
}
