"use client";
import { useEffect, useState } from "react";
import { getDoctorSchedules } from "@/services/schedule.service";
import { getApiErrorMessage } from "@/lib/api-errors";

const DAYS_ORDER = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
  "FRIDAY", "SATURDAY", "SUNDAY",
];
const DAY_LABELS: Record<string, string> = {
  MONDAY:    "Lunes",     TUESDAY:  "Martes",
  WEDNESDAY: "Miércoles", THURSDAY: "Jueves",
  FRIDAY:    "Viernes",   SATURDAY: "Sábado",
  SUNDAY:    "Domingo",
};
const DAY_ICONS: Record<string, string> = {
  MONDAY:"🔵", TUESDAY:"🟢", WEDNESDAY:"🟡",
  THURSDAY:"🟠", FRIDAY:"🔴", SATURDAY:"🟣", SUNDAY:"⚪",
};

function formatHour(h: number): string {
  if (h === 0)  return "12:00 AM";
  if (h === 12) return "12:00 PM";
  if (h === 24) return "12:00 AM+1";
  const ampm  = h < 12 ? "AM" : "PM";
  const disp  = h > 12 ? h - 12 : h;
  return `${disp}:00 ${ampm}`;
}

export default function DoctorSchedulesList() {
  const [loading,   setLoading]   = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [errorMsg,  setErrorMsg]  = useState("");

  useEffect(() => { loadSchedules(); }, []);

  const loadSchedules = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getDoctorSchedules();
      setSchedules(data);
    } catch (err) {
      // Si el error es "no tiene horarios predefinidos" lo tratamos como lista vacía
      const msg = getApiErrorMessage(err);
      if (msg.toLowerCase().includes("horario") || msg.includes("predefinido")) {
        setSchedules([]);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const grouped = DAYS_ORDER.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day === day);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <div className="pz-loading">Cargando sus horarios...</div>;

  if (errorMsg) {
    return (
      <div className="pz-card">
        <div className="pz-error">⚠️ {errorMsg}</div>
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="pz-card">
        <div className="pz-empty">
          <div className="pz-empty-icon"></div>
          <p style={{ fontWeight: 700, color: "var(--pz-red)", fontSize: "1rem" }}>
            No tiene horarios registrados
          </p>
          <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
            Configure sus horarios de atención en el formulario de arriba.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pz-card" style={{ padding: "24px" }}>
      <h3 style={{ margin: "0 0 20px", fontSize: "1.05rem", color: "var(--pz-green)" }}>
        Sus Horarios Registrados
      </h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "12px",
      }}>
        {DAYS_ORDER.map(day => (
          <div key={day} className="pz-schedule-day">
            <div className="pz-schedule-day-header">
              {DAY_ICONS[day]} {DAY_LABELS[day]}
            </div>
            <div style={{ padding: "8px", minHeight: "90px" }}>
              {grouped[day].length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "16px 4px",
                  color: "var(--pz-text-soft)",
                  fontSize: "0.78rem",
                }}>
                  Sin horario
                </div>
              ) : (
                grouped[day].map((s, i) => (
                  <div
                    key={i}
                    className="pz-schedule-block"
                    style={{
                      opacity: s.isActive === false ? 0.5 : 1,
                      borderLeft: s.isActive === false
                        ? "3px solid var(--pz-red)"
                        : "3px solid var(--pz-green)",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--pz-green)" }}>
                      {formatHour(s.startHour)}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--pz-text-mid)" }}>
                      hasta {formatHour(s.endHour)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--pz-text-soft)", marginTop: "3px" }}>
                      c/{s.interval} min
                    </div>
                    {/* Badge activo/inactivo */}
                    <div style={{ marginTop: "5px" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: s.isActive === false ? "var(--pz-red-light)" : "var(--pz-green-light)",
                        color: s.isActive === false ? "var(--pz-red)" : "var(--pz-green)",
                        borderRadius: "999px",
                        padding: "2px 8px",
                      }}>
                        {s.isActive === false ? "Inactivo" : "Activo"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}