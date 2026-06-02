// Traducciones centralizadas para roles y géneros

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  DOCTOR: "Médico",
  PATIENT: "Paciente",
  SCHEDULER: "Agendador",
};

export const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Femenino",
  OTHER: "Otro",
};

/**
 * Obtiene la etiqueta en español para un rol
 * @param role - Código del rol (ADMIN, DOCTOR, PATIENT, SCHEDULER)
 * @returns Nombre del rol en español o el código original si no existe
 */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Obtiene la etiqueta en español para un género
 * @param gender - Código del género (M, F, OTHER)
 * @returns Nombre del género en español o el código original si no existe
 */
export function getGenderLabel(gender: string): string {
  return GENDER_LABELS[gender] || gender;
}

/**
 * Obtiene etiquetas en español para un array de roles
 */
export function getRoleLabels(roles: string[]): string[] {
  return roles.map(getRoleLabel);
}
