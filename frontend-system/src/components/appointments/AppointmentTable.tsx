"use client";
import { AppointmentsResponse } from "@/types/appointment";

interface Props {
  data: AppointmentsResponse | null;
  loading: boolean;
}

export default function AppointmentTable({ data, loading }: Props) {
  if (loading) {
    return <div className="pz-loading">Cargando citas...</div>;
  }

  if (!data || data.count === 0) {
    return (
      <div className="pz-card">
        <div className="pz-empty">
          <div className="pz-empty-icon">📋</div>
          <p style={{ fontWeight: 600, fontSize: "1rem" }}>No hay citas para esta fecha</p>
          <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>Seleccione otra fecha o cree una nueva cita.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>
          📅 Citas del{" "}
          {new Date(data.date).toLocaleDateString("es-CO", { timeZone: "UTC", weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </h3>
        <p style={{ margin: "4px 0 0", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
          Total: <strong>{data.count}</strong> citas programadas
        </p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="pz-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente (ID)</th>
              <th style={{ textAlign: "center" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.appointments.map((appointment) => (
              <tr key={appointment.appointmentId}>
                <td>
                  <span style={{
                    background: "var(--pz-green-light)",
                    color: "var(--pz-green)",
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    fontFamily: "monospace",
                  }}>
                    🕐 {new Date(appointment.date).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{appointment.patientId}</td>
                <td style={{ textAlign: "center" }}>
                  <span className="pz-badge pz-badge-green" style={{ fontSize: "0.8rem" }}>Programada</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
