"use client";
import { useEffect, useState } from "react";
import { getDoctorSchedules } from "@/services/schedule.service";

const DAYS_ORDER = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const DAY_LABELS: Record<string, string> = {
  MONDAY:"Lunes", TUESDAY:"Martes", WEDNESDAY:"Miércoles",
  THURSDAY:"Jueves", FRIDAY:"Viernes", SATURDAY:"Sábado", SUNDAY:"Domingo",
};
const DAY_ICONS: Record<string, string> = {
  MONDAY:"🔵",TUESDAY:"🟢",WEDNESDAY:"🟡",THURSDAY:"🟠",FRIDAY:"🔴",SATURDAY:"🟣",SUNDAY:"⚪",
};

export default function DoctorSchedulesList() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => { loadSchedules(); }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getDoctorSchedules();
      setSchedules(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const grouped = DAYS_ORDER.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day === day);
    return acc;
  }, {} as Record<string, any[]>);

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return `${h}:00 ${period}`;
  };

  if (loading) return <div className="pz-loading">Cargando sus horarios...</div>;

  if (schedules.length === 0) {
    return (
      <div className="pz-card">
        <div className="pz-empty">
          <div className="pz-empty-icon">🗓️</div>
          <p style={{ fontWeight: 700, color: "var(--pz-red)", fontSize: "1rem" }}>No tiene horarios registrados</p>
          <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>Configure sus horarios de atención en el formulario de arriba.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pz-card" style={{ padding: "24px" }}>
      <h3 style={{ margin: "0 0 20px", fontSize: "1.05rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        Sus Horarios Registrados
      </h3>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: "12px",
      }}>
        {DAYS_ORDER.map((day) => (
          <div key={day} className="pz-schedule-day">
            <div className="pz-schedule-day-header">
              {DAY_ICONS[day]} {DAY_LABELS[day]}
            </div>
            <div style={{ padding: "8px", minHeight: "100px" }}>
              {grouped[day].length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 4px", color: "var(--pz-text-soft)", fontSize: "0.78rem" }}>
                  Sin horario
                </div>
              ) : (
                grouped[day].map((s, i) => (
                  <div key={i} className="pz-schedule-block">
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--pz-green)" }}>
                      {formatHour(s.startHour)}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--pz-text-mid)" }}>
                      hasta {formatHour(s.endHour)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--pz-text-soft)", marginTop: "3px" }}>
                      c/{s.interval} min
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
