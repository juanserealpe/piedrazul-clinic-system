"use client";
import { useState } from "react";
import { createSchedulesRequest } from "@/services/schedule.service";
import { useAuthStore } from "@/store/auth.store";
import { showSuccess, showError } from "@/lib/notifications";

const DAYS = [
  { label: "Lunes", value: "MONDAY" },
  { label: "Martes", value: "TUESDAY" },
  { label: "Miércoles", value: "WEDNESDAY" },
  { label: "Jueves", value: "THURSDAY" },
  { label: "Viernes", value: "FRIDAY" },
  { label: "Sábado", value: "SATURDAY" },
  { label: "Domingo", value: "SUNDAY" },
];

export default function WeeklyScheduleForm() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);

  const addSchedule = () => {
    setSchedules([...schedules, { day: "MONDAY", startHour: 8, endHour: 12, interval: 30 }]);
  };

  const updateSchedule = (index: number, field: string, value: any) => {
    const copy = [...schedules];
    copy[index][field] = value;
    setSchedules(copy);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createSchedulesRequest({
        schedules: schedules.map((s) => ({ doctorId: user?.id, ...s })),
      });
      showSuccess("Horarios guardados correctamente");
    } catch (err) {
      console.error(err);
      showError("Error guardando horarios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pz-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.1rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
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

      {schedules.length === 0 && (
        <div className="pz-empty">
          <div className="pz-empty-icon"></div>
          <p style={{ fontWeight: 600 }}>Sin bloques de horario</p>
          <p style={{ fontSize: "0.88rem", marginTop: "4px" }}>Haga clic en "Agregar bloque" para comenzar.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {schedules.map((schedule, index) => (
          <div key={index} style={{
            border: "2px solid var(--pz-border)", borderRadius: "12px",
            padding: "20px", background: "var(--pz-cream)",
            position: "relative",
          }}>
            {/* Remove button */}
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px", paddingRight: "80px" }}>
              {/* Día */}
              <div>
                <label className="pz-label">Día de la semana</label>
                <select
                  value={schedule.day}
                  onChange={(e) => updateSchedule(index, "day", e.target.value)}
                  className="pz-input"
                  style={{ cursor: "pointer" }}
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>

              {/* Hora inicio */}
              <div>
                <label className="pz-label">Hora inicio (0–23)</label>
                <input
                  className="pz-input"
                  type="number" min={0} max={23}
                  value={schedule.startHour}
                  onChange={(e) => updateSchedule(index, "startHour", Number(e.target.value))}
                />
              </div>

              {/* Hora fin */}
              <div>
                <label className="pz-label">Hora fin (1–24)</label>
                <input
                  className="pz-input"
                  type="number" min={1} max={24}
                  value={schedule.endHour}
                  onChange={(e) => updateSchedule(index, "endHour", Number(e.target.value))}
                />
              </div>

              {/* Intervalo */}
              <div>
                <label className="pz-label">Intervalo (minutos)</label>
                <input
                  className="pz-input"
                  type="number" min={1}
                  value={schedule.interval}
                  onChange={(e) => updateSchedule(index, "interval", Number(e.target.value))}
                />
              </div>
            </div>

            {/* Preview */}
            <div style={{
              marginTop: "12px", padding: "8px 14px",
              background: "var(--pz-green-light)", borderRadius: "8px",
              fontSize: "0.85rem", color: "var(--pz-green)", fontWeight: 600,
            }}>
              {DAYS.find(d => d.value === schedule.day)?.label} — {schedule.startHour}:00 a {schedule.endHour}:00 — cada {schedule.interval} min
            </div>
          </div>
        ))}
      </div>

      {schedules.length > 0 && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSubmit} disabled={loading} className="pz-btn-primary" style={{ opacity: loading ? 0.6 : 1, fontSize: "1rem", padding: "13px 28px" }}>
            {loading ? "Guardando..." : "Guardar todos los horarios"}
          </button>
        </div>
      )}
    </div>
  );
}
