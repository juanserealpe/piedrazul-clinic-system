export const getTodayUtc = () => {
  const today = new Date();
  return new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  ).toISOString();
};

export const toISOStringLib = (localDateTime: string) => {
  return new Date(localDateTime).toISOString();
};

/**
 * Muestra la hora de un SLOT de disponibilidad.
 * Los slots del backend se generan con setUTCHours(startHour) donde startHour
 * ya es la hora Colombia (el medico configura "8" = 8:00 AM Colombia).
 * Por eso leemos directamente getUTCHours() sin restar offset.
 */
export function formatSlotTime12h(isoStr: string): string {
  const d = new Date(isoStr);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

/**
 * Muestra la hora de una CITA ya guardada.
 * Las citas se guardan con la fecha que vino del slot, misma logica.
 * Usamos tambien getUTCHours() directamente.
 */
export function formatAppointmentTime12h(isoStr: string): string {
  return formatSlotTime12h(isoStr);
}

/**
 * Muestra fecha corta para botones de seleccion de fecha.
 * Usamos timeZone UTC para no desplazar el dia.
 */
export function formatDateShort(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

/**
 * Muestra fecha larga para encabezados.
 */
export function formatDateLong(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}