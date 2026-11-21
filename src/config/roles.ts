// Roles a member can hold on the ComLab platform; the label is written in the
// template's blue banner (where the designer's file says "MEMBRE").
export const ROLES = [
  { key: 'startup',        label: 'Startup' },
  { key: 'talent',         label: 'Talent' },
  { key: 'company',        label: 'Company' },
  { key: 'professionnel',  label: 'Professionnel' },
  { key: 'academique',     label: 'Institution Académique' },
  { key: 'ong',            label: 'ONG' },
  { key: 'gouvernement',   label: 'Institution Gouvernementale' },
] as const

export type RoleKey = (typeof ROLES)[number]['key']

export function roleByKey(key: string) {
  return ROLES.find((r) => r.key === key) ?? null
}
