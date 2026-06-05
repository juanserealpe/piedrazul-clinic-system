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

interface ScheduleBlock {
  day:       string;
  startHour: number | "";
  endHour:   number | "";
  interval:  number | "";
}

const DEFAULT_BLOCK: ScheduleBlock = { day: "MONDAY", startHour: 8, endHour: 12, interval: 30 };

// ── Helper: convierte string vacío / inválido a number para el payload ────────
function toInt(val: number | ""): number {
  return val === "" ? 0 : Number(val);
}

export default function WeeklyScheduleForm() {
  const user    = useAuthStore(s => s.user);
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg,    setOkMsg]    = useState("");
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([]);

  const addSchedule = () =>
    setSchedules(prev => [...prev, { ...DEFAULT_BLOCK }]);

  // FIX: campo numérico acepta string vacío mientras se edita.
  // Si el usuario borra el campo queda vacío ("") en lugar de forzar 0.
  const updateSchedule = (index: number, field: keyof ScheduleBlock, raw: string) => {
    setSchedules(prev => {
      const copy = [...prev];
      if (raw === "") {
        // Permite campo vacío durante la edición
        copy[index] = { ...copy[index], [field]: "" };
      } else {
        const num = parseInt(raw, 10);
        copy[index] = { ...copy[index], [field]: isNaN(num) ? "" : num };
      }
      return copy;
    });
  };

  const removeSchedule = (index: number) =>
    setSchedules(prev => prev.filter((_, i) => i !== index));

  // ── Validación client-side ────────────────────────────────────────────────
  const validate = (): string | null => {
    for (let i = 0; i < schedules.length; i++) {
      const s    = schedules[i];
      const day  = DAYS.find(d => d.value === s.day)?.label ?? s.day;
      const sH   = toInt(s.startHour);
      const eH   = toInt(s.endHour);
      const intv = toInt(s.interval);

      if (s.startHour === "" || s.endHour === "" || s.interval === "") {
        return `Bloque ${i + 1} (${day}): completa todos los campos.`;
      }
      if (sH < 0 || sH > 23) return `Bloque ${i + 1} (${day}): la hora de inicio debe estar entre 0 y 23.`;
      if (eH < 1 || eH > 24) return `Bloque ${i + 1} (${day}): la hora de fin debe estar entre 1 y 24.`;
      if (sH >= eH)           return `Bloque ${i + 1} (${day}): la hora de inicio debe ser menor que la hora de fin.`;
      if (intv < 1)           return `Bloque ${i + 1} (${day}): el intervalo debe ser al menos 1 minuto.`;

      const durationMin = (eH - sH) * 60;
      if (durationMin % intv !== 0) {
        return `Bloque ${i + 1} (${day}): la duración (${durationMin} min) no es divisible entre el intervalo (${intv} min).`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    setOkMsg("");

    const validationError = validate();
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
      setOkMsg("Horarios guardados correctamente.");
      setSchedules([]);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pz-card">
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "var(--pz-green)" }}>
            Configurar Horarios de Atención
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
            Agregue los bloques de horario en que estará disponible
          </p>
        </div>
        <button onClick={addSchedule} className="pz-btn-primary" style={{ whiteSpace: "nowrap" }}>
          Agregar bloque
        </button>
      </div>

      {/* Mensajes globales */}
      {errorMsg && <div className="pz-error"  style={{ marginBottom: "16px" }}>⚠️ {errorMsg}</div>}
      {okMsg    && <div className="pz-success" style={{ marginBottom: "16px" }}>✅ {okMsg}</div>}

      {/* Estado vacío */}
      {schedules.length === 0 && !okMsg && (
        <div className="pz-empty">
          <div className="pz-empty-icon">🗓️</div>
          <p style={{ fontWeight: 600 }}>Sin bloques de horario</p>
          <p style={{ fontSize: "0.88rem", marginTop: "4px" }}>
            Haga clic en "Agregar bloque" para comenzar.
          </p>
        </div>
      )}

      {/* Bloques */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {schedules.map((schedule, index) => (
          <div key={index} style={{
            border: "2px solid var(--pz-border)", borderRadius: "12px",
            padding: "20px", background: "var(--pz-cream)", position: "relative",
          }}>
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
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "14px", paddingRight: "80px",
            }}>
              {/* Día */}
              <div>
                <label className="pz-label">Día de la semana</label>
                <select
                  value={schedule.day}
                  onChange={e => updateSchedule(index, "day", e.target.value)}
                  className="pz-input" style={{ cursor: "pointer" }}
                >
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              {/* Hora inicio — FIX: value como string, sin forzar 0 */}
              <div>
                <label className="pz-label">Hora inicio (0–23)</label>
                <input
                  className="pz-input"
                  type="number" min={0} max={23}
                  value={schedule.startHour === "" ? "" : schedule.startHour}
                  onChange={e => updateSchedule(index, "startHour", e.target.value)}
                  placeholder="ej: 8"
                />
              </div>

              {/* Hora fin */}
              <div>
                <label className="pz-label">Hora fin (1–24)</label>
                <input
                  className="pz-input"
                  type="number" min={1} max={24}
                  value={schedule.endHour === "" ? "" : schedule.endHour}
                  onChange={e => updateSchedule(index, "endHour", e.target.value)}
                  placeholder="ej: 12"
                />
              </div>

              {/* Intervalo */}
              <div>
                <label className="pz-label">Intervalo (minutos)</label>
                <input
                  className="pz-input"
                  type="number" min={1}
                  value={schedule.interval === "" ? "" : schedule.interval}
                  onChange={e => updateSchedule(index, "interval", e.target.value)}
                  placeholder="ej: 30"
                />
              </div>
            </div>

            {/* Preview — solo si los campos tienen valor */}
            {schedule.startHour !== "" && schedule.endHour !== "" && schedule.interval !== "" && (
              <div style={{
                marginTop: "12px", padding: "8px 14px",
                background: "var(--pz-green-light)", borderRadius: "8px",
                fontSize: "0.85rem", color: "var(--pz-green)", fontWeight: 600,
              }}>
                {DAYS.find(d => d.value === schedule.day)?.label} — {schedule.startHour}:00 a {schedule.endHour}:00 — cada {schedule.interval} min
              </div>
            )}
          </div>
        ))}
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