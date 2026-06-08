"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-errors";

// Lee UTC directo (mismo criterio que el resto de la app)
function formatTime12h(isoStr: string): string {
  const d = new Date(isoStr);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function formatDateShort(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-CO", {
    timeZone: "UTC", day: "2-digit", month: "short", year: "numeric",
  });
}

interface AuditEntry {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  status: string;
  date: string; // fecha de la cita
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programada", RESCHEDULED: "Reagendada",
  PENDING_RESCHEDULE: "Por reagendar", COMPLETED: "Completada", CANCELLED: "Cancelada",
};
const STATUS_CLASS: Record<string, string> = {
  SCHEDULED: "pz-badge-green", RESCHEDULED: "pz-badge-green",
  PENDING_RESCHEDULE: "pz-badge-amber", COMPLETED: "pz-badge-green", CANCELLED: "pz-badge-red",
};

export default function LogsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.get("/auth/all-doctors").then(r => setDoctors(r.data)).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!filterDate) return;
    setError(""); setSearched(true); setLoading(true);
    try {
      const params: any = { date: `${filterDate}T00:00:00.000Z` };
      if (selectedDoctor) params.doctorId = selectedDoctor;
      // Reutilizamos el endpoint by-doctor para auditar citas del día
      const res = await api.get("/appointments/by-doctor", { params });
      setEntries(res.data.appointments ?? []);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setEntries([]);
    } finally { setLoading(false); }
  };

  const stats = {
    total: entries.length,
    scheduled: entries.filter(e => e.status === "SCHEDULED").length,
    rescheduled: entries.filter(e => e.status === "RESCHEDULED" || e.status === "PENDING_RESCHEDULE").length,
    cancelled: entries.filter(e => e.status === "CANCELLED").length,
  };

  const doctorName = (id: string) => {
    const d = doctors.find(d => d.id === id);
    return d ? `Dr. ${d.name} ${d.lastnames}` : id;
  };

  return (
    <div>
      <div className="pz-page-header">
        <h1>Auditoría del Sistema</h1>
        <p>Registro de actividades y eventos del sistema de citas</p>
      </div>

      {/* Filtros de búsqueda */}
      <div className="pz-card" style={{ padding: "20px 24px", marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>
          Consultar actividad
        </h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label className="pz-label">Médico (opcional)</label>
            <select className="pz-input" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}
              style={{ minWidth: "220px", cursor: "pointer" }}>
              <option value="">Todos los médicos</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.name} {d.lastnames}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="pz-label">Fecha</label>
            <input type="date" className="pz-input" value={filterDate}
              onChange={e => setFilterDate(e.target.value)} style={{ width: "180px" }} />
          </div>
          <button onClick={handleSearch} className="pz-btn-primary" style={{ marginBottom: "2px" }}>
            Consultar
          </button>
        </div>
      </div>

      {error && <div className="pz-error" style={{ marginBottom: "16px" }}>⚠️ {error}</div>}

      {/* Resumen estadístico */}
      {searched && !loading && entries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Total citas", count: stats.total, color: "var(--pz-green)" },
            { label: "Programadas", count: stats.scheduled, color: "#1a3a6b" },
            { label: "Reagendadas", count: stats.rescheduled, color: "#d97706" },
            { label: "Canceladas", count: stats.cancelled, color: "#c0392b" },
          ].map(s => (
            <div key={s.label} className="pz-card" style={{ padding: "14px 18px", textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--pz-text-soft)", marginTop: "3px", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <div className="pz-loading">Consultando registros...</div>}

      {!loading && searched && entries.length === 0 && !error && (
        <div className="pz-card">
          <div className="pz-empty">
            <div className="pz-empty-icon">📊</div>
            <p style={{ fontWeight: 600 }}>No hay registros para esta fecha</p>
            <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>Intente con otra fecha o médico.</p>
          </div>
        </div>
      )}

      {!loading && !searched && (
        <div className="pz-card">
          <div className="pz-empty">
            <div className="pz-empty-icon">🔍</div>
            <p style={{ fontWeight: 600 }}>Seleccione fecha y haga clic en Consultar</p>
            <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
              Se mostrarán todas las citas registradas para el día seleccionado.
            </p>
          </div>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--pz-border)" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>
              Registros del {new Date(`${filterDate}T12:00:00Z`).toLocaleDateString("es-CO", {
                timeZone: "UTC", weekday: "long", day: "2-digit", month: "long", year: "numeric",
              })}
              {selectedDoctor && ` — ${doctorName(selectedDoctor)}`}
            </h3>
            <p style={{ margin: "4px 0 0", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
              {entries.length} registro(s) encontrado(s)
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="pz-table">
              <thead>
                <tr>
                  <th>ID Cita</th>
                  <th>Médico</th>
                  <th>Paciente</th>
                  <th>Hora</th>
                  <th style={{ textAlign: "center" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e: any) => (
                  <tr key={e.appointmentId}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--pz-text-soft)" }}>
                      {e.appointmentId?.slice(0, 8)}...
                    </td>
                    <td style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      {doctorName(selectedDoctor || e.doctorId)}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.88rem" }}>
                      {e.patientId}
                    </td>
                    <td>
                      <span style={{
                        background: "var(--pz-green-light)", color: "var(--pz-green)",
                        fontWeight: 700, padding: "3px 12px", borderRadius: "999px",
                        fontSize: "0.88rem", fontFamily: "monospace",
                      }}>
                        {formatTime12h(e.date)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`pz-badge ${STATUS_CLASS[e.status] ?? "pz-badge-green"}`}
                        style={{ fontSize: "0.78rem" }}>
                        {STATUS_LABELS[e.status] ?? e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}