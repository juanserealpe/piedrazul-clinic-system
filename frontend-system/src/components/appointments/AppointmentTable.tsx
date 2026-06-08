"use client";
import { AppointmentsResponse } from "@/types/appointment";

// ── Helpers de hora ───────────────────────────────────────────────────────────
// Los slots se almacenan en UTC como hora Colombia directa (ej. 8 AM Colombia = T08:00:00Z).
// NO se resta offset; se lee UTC directo igual que en los modales de selección.
function formatSlotTime12h(dateStr: string): string {
  const d = new Date(dateStr);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED:          "Programada",
  RESCHEDULED:        "Reagendada",
  PENDING_RESCHEDULE: "Por reagendar",
  COMPLETED:          "Completada",
  CANCELLED:          "Cancelada",
};

const STATUS_CLASS: Record<string, string> = {
  SCHEDULED:          "pz-badge-green",
  RESCHEDULED:        "pz-badge-green",
  PENDING_RESCHEDULE: "pz-badge-amber",
  COMPLETED:          "pz-badge-green",
  CANCELLED:          "pz-badge-red",
};

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
          <div className="pz-empty-icon"></div>
          <p style={{ fontWeight: 600, fontSize: "1rem" }}>No hay citas para esta fecha</p>
          <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
            Seleccione otra fecha o cree una nueva cita.
          </p>
        </div>
      </div>
    );
  }

  const headerDate = new Date(data.date).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>
          Citas del {headerDate}
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
            {data.appointments.map((appointment) => {
              const status = (appointment as any).status ?? "SCHEDULED";
              return (
                <tr key={appointment.appointmentId}>
                  <td>
                    <span style={{
                      background: "var(--pz-green-light)",
                      color: "var(--pz-green)",
                      fontWeight: 700,
                      padding: "4px 14px",
                      borderRadius: "999px",
                      fontSize: "0.95rem",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}>
                      {formatSlotTime12h(appointment.date)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{appointment.patientId}</td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`pz-badge ${STATUS_CLASS[status] ?? "pz-badge-green"}`}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {STATUS_LABELS[status] ?? status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}