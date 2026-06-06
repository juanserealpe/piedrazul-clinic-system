"use client";

import { useState } from "react";
import { createSchedulesRequest } from "@/services/schedule.service";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/lib/api-errors";

const DAYS = [
  { label: "Lunes",     value: "MONDAY"    },
  { label: "Martes",    value: "TUESDAY"   },
  { label: "Miércoles", value: "WEDNESDAY" },
  { label: "Jueves",    value: "THURSDAY"  },
  { label: "Viernes",   value: "FRIDAY"    },
  { label: "Sábado",    value: "SATURDAY"  },
  { label: "Domingo",   value: "SUNDAY"    },
];

// Hora inicio: 0–23 como selector tipo "HH AM/PM"
// Hora fin:   1–24
const HOUR_OPTIONS_START = Array.from({ length: 24 }, (_, i) => i);  // 0..23
const HOUR_OPTIONS_END   = Array.from({ length: 24 }, (_, i) => i + 1); // 1..24

function formatHour(h: number): string {
  if (h === 0)  return "12:00 AM (medianoche)";
  if (h === 12) return "12:00 PM (mediodía)";
  if (h === 24) return "12:00 AM (medianoche +1)";
  const ampm = h < 12 ? "AM" : "PM";
  const display = h > 12 ? h - 12 : h;
  return `${display}:00 ${ampm}`;
}

interface ScheduleBlock {
  day:       string;
  startHour: number | "";
  endHour:   number | "";
  interval:  number | "";
}

// Intervalo mínimo: 10 minutos
const MIN_INTERVAL = 10;
const DEFAULT_BLOCK: ScheduleBlock = { day: "MONDAY", startHour: 8, endHour: 12, interval: 30 };

function toInt(val: number | ""): number {
  return val === "" ? 0 : Number(val);
}

// ── Validación ────────────────────────────────────────────────────────────────
function validate(schedules: ScheduleBlock[]): string | null {
  if (schedules.length === 0) return "Agrega al menos un bloque de horario.";

  for (let i = 0; i < schedules.length; i++) {
    const s   = schedules[i];
    const day = DAYS.find(d => d.value === s.day)?.label ?? s.day;
    const sH  = toInt(s.startHour);
    const eH  = toInt(s.endHour);
    const intv = toInt(s.interval);

    if (s.startHour === "" || s.endHour === "" || s.interval === "") {
      return `Bloque ${i + 1} (${day}): completa todos los campos.`;
    }
    if (sH < 0 || sH > 23) {
      return `Bloque ${i + 1} (${day}): la hora de inicio debe estar entre 0 y 23.`;
    }
    if (eH < 1 || eH > 24) {
      return `Bloque ${i + 1} (${day}): la hora de fin debe estar entre 1 y 24.`;
    }
    if (sH >= eH) {
      return `Bloque ${i + 1} (${day}): la hora de inicio (${formatHour(sH)}) debe ser menor a la hora de fin (${formatHour(eH)}).`;
    }
    // Intervalo mínimo 10 minutos
    if (intv < MIN_INTERVAL) {
      return `Bloque ${i + 1} (${day}): el intervalo mínimo es de ${MIN_INTERVAL} minutos.`;
    }
    if (intv > 60) {
      return `Bloque ${i + 1} (${day}): el intervalo máximo es de 60 minutos.`;
    }
    const durationMin = (eH - sH) * 60;
    if (durationMin % intv !== 0) {
      return `Bloque ${i + 1} (${day}): la duración total (${durationMin} min) debe ser divisible entre el intervalo (${intv} min). Prueba con ${intv === 30 ? 30 : intv} min y un rango diferente.`;
    }
  }
  return null;
}

export default function WeeklyScheduleForm() {
  const user = useAuthStore(s => s.user);
  const [loading,   setLoading]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [okMsg,     setOkMsg]     = useState("");
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([]);

  const addSchedule = () => setSchedules(prev => [...prev, { ...DEFAULT_BLOCK }]);

  // FIX campo numérico: si el usuario borra, queda "" en lugar de forzar 0
  const updateSchedule = (index: number, field: keyof ScheduleBlock, raw: string) => {
    setSchedules(prev => {
      const copy = [...prev];
      if (raw === "") {
        copy[index] = { ...copy[index], [field]: "" };
      } else {
        const num = parseInt(raw, 10);
        copy[index] = { ...copy[index], [field]: isNaN(num) ? "" : num };
      }
      return copy;
    });
  };

  // Selector de hora (startHour/endHour) usa select, no input numérico
  const updateHour = (index: number, field: "startHour" | "endHour", val: number) => {
    setSchedules(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const removeSchedule = (index: number) =>
    setSchedules(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setErrorMsg("");
    setOkMsg("");
    const validationError = validate(schedules);
    if (validationError) { setErrorMsg(validationError); return; }

    try {
      setLoading(true);
      await createSchedulesRequest({
        schedules: schedules.map(s => ({
          doctorId:  user?.id,
          day:       s.day,
          startHour: toInt(s.startHour),
          endHour:   toInt(s.endHour),
          interval:  toInt(s.interval),
        })),
      });
      setOkMsg("¡Horarios guardados correctamente!");
      setSchedules([]);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pz-card">
      {/* Cabecera */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "var(--pz-green)" }}>
            Configurar Horarios de Atención
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
            Agregue los bloques de horario en que estará disponible
          </p>
        </div>
        <button onClick={addSchedule} className="pz-btn-primary" style={{ whiteSpace: "nowrap" }}>
          + Agregar bloque
        </button>
      </div>

      {/* Mensajes globales */}
      {errorMsg && <div className="pz-error"   style={{ marginBottom: "16px" }}>⚠️ {errorMsg}</div>}
      {okMsg    && <div className="pz-success"  style={{ marginBottom: "16px" }}>✅ {okMsg}</div>}

      {/* Estado vacío */}
      {schedules.length === 0 && !okMsg && (
        <div className="pz-empty">
          <div className="pz-empty-icon">🗓️</div>
          <p style={{ fontWeight: 600 }}>Sin bloques de horario</p>
          <p style={{ fontSize: "0.88rem", marginTop: "4px" }}>
            Haga clic en "+ Agregar bloque" para comenzar.
          </p>
        </div>
      )}

      {/* Bloques */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {schedules.map((schedule, index) => {
          const sH   = toInt(schedule.startHour);
          const eH   = toInt(schedule.endHour);
          const intv = toInt(schedule.interval);
          const durMin = sH < eH ? (eH - sH) * 60 : 0;

          // Advertencia en tiempo real de divisibilidad
          const divisWarning =
            schedule.startHour !== "" &&
            schedule.endHour !== "" &&
            schedule.interval !== "" &&
            sH < eH &&
            intv >= MIN_INTERVAL &&
            durMin % intv !== 0
              ? `La duración (${durMin} min) no es divisible entre el intervalo (${intv} min)`
              : null;

          // Advertencia intervalo mínimo
          const minIntWarning =
            schedule.interval !== "" && intv > 0 && intv < MIN_INTERVAL
              ? `El intervalo mínimo es ${MIN_INTERVAL} minutos`
              : null;

          return (
            <div
              key={index}
              style={{
                border: `2px solid ${divisWarning || minIntWarning ? "var(--pz-amber)" : "var(--pz-border)"}`,
                borderRadius: "12px",
                padding: "20px",
                background: "var(--pz-cream)",
                position: "relative",
              }}
            >
              {/* Eliminar */}
              <button
                onClick={() => removeSchedule(index)}
                style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: "var(--pz-red-light)", border: "none",
                  color: "var(--pz-red)", borderRadius: "6px",
                  padding: "4px 10px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem",
                }}
              >
                Eliminar
              </button>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "14px",
                paddingRight: "80px",
              }}>
                {/* Día */}
                <div>
                  <label className="pz-label">Día de la semana</label>
                  <select
                    value={schedule.day}
                    onChange={e => updateSchedule(index, "day", e.target.value)}
                    className="pz-input"
                    style={{ cursor: "pointer" }}
                  >
                    {DAYS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ Hora inicio — SELECT con formato 12h Colombia */}
                <div>
                  <label className="pz-label">Hora inicio</label>
                  <select
                    value={schedule.startHour === "" ? "" : schedule.startHour}
                    onChange={e => updateHour(index, "startHour", parseInt(e.target.value, 10))}
                    className="pz-input"
                    style={{ cursor: "pointer" }}
                  >
                    {HOUR_OPTIONS_START.map(h => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                </div>

                {/* Hora fin — SELECT con formato 12h Colombia */}
                <div>
                  <label className="pz-label">Hora fin</label>
                  <select
                    value={schedule.endHour === "" ? "" : schedule.endHour}
                    onChange={e => updateHour(index, "endHour", parseInt(e.target.value, 10))}
                    className="pz-input"
                    style={{ cursor: "pointer" }}
                  >
                    {HOUR_OPTIONS_END.map(h => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                </div>

                {/* Intervalo — mínimo 10, sin bug del 0 */}
                <div>
                  <label className="pz-label">Intervalo (min, mín. {MIN_INTERVAL})</label>
                  <input
                    className="pz-input"
                    type="number"
                    min={MIN_INTERVAL}
                    max={60}
                    step={5}
                    value={schedule.interval === "" ? "" : schedule.interval}
                    onChange={e => updateSchedule(index, "interval", e.target.value)}
                    placeholder={`Ej: 30 (mín. ${MIN_INTERVAL})`}
                    style={{
                      borderColor: minIntWarning ? "var(--pz-amber)" : undefined,
                    }}
                  />
                  {/* Advertencia intervalo mínimo */}
                  {minIntWarning && (
                    <p style={{ color: "var(--pz-amber)", fontSize: "0.78rem", marginTop: "3px", fontWeight: 600 }}>
                      ⚠️ {minIntWarning}
                    </p>
                  )}
                </div>
              </div>

              {/* Advertencia divisibilidad en tiempo real */}
              {divisWarning && (
                <div style={{
                  marginTop: "10px",
                  padding: "8px 14px",
                  background: "var(--pz-amber-light)",
                  borderRadius: "8px",
                  fontSize: "0.83rem",
                  color: "var(--pz-amber)",
                  fontWeight: 600,
                }}>
                  ⚠️ {divisWarning}
                </div>
              )}

              {/* Preview — solo cuando todos los campos son válidos */}
              {schedule.startHour !== "" &&
                schedule.endHour !== "" &&
                schedule.interval !== "" &&
                sH < eH &&
                !divisWarning &&
                !minIntWarning && (
                <div style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "var(--pz-green-light)",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "var(--pz-green)",
                  fontWeight: 600,
                }}>
                  {DAYS.find(d => d.value === schedule.day)?.label} —{" "}
                  {formatHour(sH)} a {formatHour(eH)} — cada {intv} min
                  {" "}({Math.floor(durMin / intv)} turnos)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guardar */}
      {schedules.length > 0 && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="pz-btn-primary"
            style={{ opacity: loading ? 0.6 : 1, fontSize: "1rem", padding: "13px 28px" }}
          >
            {loading ? "Guardando..." : "Guardar todos los horarios"}
          </button>
        </div>
      )}
    </div>
  );
}