"use client";
import { useEffect, useState } from "react";
import DoctorsTable from "@/components/appointments/DoctorsTable";
import ScheduleAppointmentModal from "@/components/appointments/ScheduleAppointmentModal";
import { getAllDoctorsRequest } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-errors";
import api from "@/lib/axios";

// ── Hora Colombia UTC-5, 12 h ─────────────────────────────────────────────────
function toCol12h(isoStr: string): string {
  const utc = new Date(isoStr);
  const col = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
  let h     = col.getUTCHours();
  const m   = col.getUTCMinutes().toString().padStart(2, "0");
  const ap  = h >= 12 ? "PM" : "AM";
  h         = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function toColDateLong(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED:          "Programada",
  PENDING_RESCHEDULE: "Por reagendar",
  RESCHEDULED:        "Reagendada",
  CANCELLED:          "Cancelada",
  COMPLETED:          "Completada",
};
const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:          "pz-badge-green",
  PENDING_RESCHEDULE: "pz-badge-amber",
  RESCHEDULED:        "pz-badge-green",
  COMPLETED:          "pz-badge-green",
  CANCELLED:          "pz-badge-red",
};

export default function PatientAppointmentsPage() {
  const [doctors,      setDoctors]      = useState<any[]>([]);
  const [selectedDoc,  setSelectedDoc]  = useState<any>(null);
  const [openModal,    setOpenModal]    = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [errorMsg,     setErrorMsg]     = useState("");
  const [tab,          setTab]          = useState<"citas" | "agendar">("citas");

  useEffect(() => {
    loadDoctors();
    loadMyAppointments();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await getAllDoctorsRequest();
      setDoctors(res);
    } catch (e) { console.error(e); }
  };

  const loadMyAppointments = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await api.get("/appointments/by-patient");
      setAppointments(res.data.appointments ?? []);
    } catch (e) {
      setErrorMsg(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="pz-page-header">
        <h1>Mis Citas Médicas</h1>
        <p>Consulte y agende sus citas</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { key: "citas",   label: "📋 Mis Citas"          },
          { key: "agendar", label: "+ Agendar Nueva Cita"  },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: tab === t.key ? "2px solid var(--pz-green)" : "2px solid var(--pz-border)",
              background: tab === t.key ? "var(--pz-green)" : "var(--pz-white)",
              color: tab === t.key ? "#fff" : "var(--pz-text-mid)",
              fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Mis Citas ── */}
      {tab === "citas" && (
        <>
          {errorMsg && <div className="pz-error" style={{ marginBottom: "16px" }}>⚠️ {errorMsg}</div>}

          {loading ? (
            <div className="pz-loading">Cargando sus citas...</div>
          ) : appointments.length === 0 ? (
            <div className="pz-card">
              <div className="pz-empty">
                <div className="pz-empty-icon">📋</div>
                <p style={{ fontWeight: 600 }}>No tiene citas programadas</p>
                <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
                  Use la pestaña "Agendar Nueva Cita" para crear una.
                </p>
              </div>
            </div>
          ) : (
            <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>
                  Sus Citas Médicas
                </h3>
                <p style={{ margin: "4px 0 0", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
                  Total: <strong>{appointments.length}</strong> citas
                </p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="pz-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora (Colombia)</th>
                      <th>Médico</th>
                      <th style={{ textAlign: "center" }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.appointmentId}>
                        <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                          {toColDateLong(apt.date)}
                        </td>
                        <td>
                          <span style={{
                            background: "var(--pz-green-light)",
                            color: "var(--pz-green)",
                            fontWeight: 700,
                            padding: "4px 12px",
                            borderRadius: "999px",
                            fontSize: "0.9rem",
                            fontFamily: "monospace",
                            whiteSpace: "nowrap",
                          }}>
                            🕐 {toCol12h(apt.date)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {doctors.find(d => d.id === apt.doctorId)
                            ? `Dr. ${doctors.find(d => d.id === apt.doctorId)!.name} ${doctors.find(d => d.id === apt.doctorId)!.lastnames}`
                            : apt.doctorId}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`pz-badge ${STATUS_COLORS[apt.status] ?? "pz-badge-green"}`}>
                            {STATUS_LABELS[apt.status] ?? apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Tab: Agendar ── */}
      {tab === "agendar" && (
        <DoctorsTable
          doctors={doctors}
          onSchedule={doctor => { setSelectedDoc(doctor); setOpenModal(true); }}
        />
      )}

      {selectedDoc && (
        <ScheduleAppointmentModal
          open={openModal}
          doctor={selectedDoc}
          onClose={() => { setOpenModal(false); loadMyAppointments(); }}
        />
      )}
    </div>
  );
}