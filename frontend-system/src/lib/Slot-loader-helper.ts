/**
 * slot-loader-helper.ts
 * 
 * Función utilitaria compartida para cargar slots disponibles
 * en los próximos N días, EXCLUYENDO el día actual.
 * 
 * USO: reemplazar el bloque Array.from en todos los modales que cargan slots.
 *
 * CORRECCIÓN Bug 2: el índice empieza en i=1 (mañana), no i=0 (hoy).
 * Esto hace que:
 *   - i=1 → mañana
 *   - i=2 → pasado mañana
 *   - ...
 *   - i=12 → 12 días después de hoy
 * Total: 12 días futuros, ninguno el día actual.
 */

import { getAvailableSlots } from "@/services/schedule.service";

export async function loadAvailableDates(
  doctorId?: string,
  daysAhead: number = 12,
): Promise<{ date: string; slots: string[] }[]> {

  // ── CORRECCIÓN: i=1 excluye hoy ──────────────────────────────────────────
  const promises = Array.from({ length: daysAhead }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + i + 1); // +1 para empezar desde mañana
    d.setUTCHours(0, 0, 0, 0);
    return getAvailableSlots(d.toISOString(), doctorId);
  });
  // ─────────────────────────────────────────────────────────────────────────

  const results = await Promise.allSettled(promises);

  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((item: any) => item?.slots?.length > 0);
}