"use client";
import { useEffect, useState } from "react";
import DoctorsTable from "@/components/appointments/DoctorsTable";
import ScheduleAppointmentModal from "@/components/appointments/ScheduleAppointmentModal";
import { getAllDoctorsRequest } from "@/services/auth.service";
import api from "@/lib/axios";

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programada",
  PENDING_RESCHEDULE: "Por reagendar",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "pz-badge-green",
  PENDING_RESCHEDULE: "pz-badge-amber",
  CANCELLED: "pz-badge-red",
  COMPLETED: "pz-badge-green",
};

export default function PatientAppointmentsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [tab, setTab] = useState<"citas" | "agendar">("citas");

  useEffect(() => {
    loadDoctors();
    loadMyAppointments();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await getAllDoctorsRequest();
      setDoctors(response);
    } catch (error) { console.error(error); }
  };

  const loadMyAppointments = async () => {
    try {
      setLoadingCitas(true);
      const res = await api.get("/appointments/by-patient");
      setAppointments(res.data.appointments || []);
    } catch (error) { console.error(error); }
    finally { setLoadingCitas(false); }
  };

  return (
    <div>
      <div className="pz-page-header">
        <h1>Gestión de Citas</h1>
        <p>Administre sus citas médicas</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { key: "citas", label: "Mis Citas" },
          { key: "agendar", label: "+ Agendar Nueva Cita" },
        ].map((t) => (
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

      {/* Mis Citas */}
      {tab === "citas" && (
        <div>
          {loadingCitas ? (
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
                      <th>Fecha y Hora</th>
                      <th>Médico</th>
                      <th style={{ textAlign: "center" }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.appointmentId}>
                        <td>
                          <span style={{
                            background: "var(--pz-green-light)", color: "var(--pz-green)",
                            fontWeight: 700, padding: "4px 12px", borderRadius: "999px",
                            fontSize: "0.9rem", fontFamily: "monospace",
                          }}>
                            {new Date(apt.date).toLocaleDateString("es-CO", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" })}
                            {" "}{new Date(apt.date).toLocaleTimeString("es-CO", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          Dr. {doctors.find(d => d.id === apt.doctorId)?.name || apt.doctorId}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`pz-badge ${STATUS_COLORS[apt.status] || "pz-badge-green"}`}>
                            {STATUS_LABELS[apt.status] || apt.status}
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
      )}

      {/* Agendar */}
      {tab === "agendar" && (
        <DoctorsTable
          doctors={doctors}
          onSchedule={(doctor) => { setSelectedDoctor(doctor); setOpen(true); }}
        />
      )}

      {selectedDoctor && (
        <ScheduleAppointmentModal
          open={open}
          doctor={selectedDoctor}
          onClose={() => { setOpen(false); loadMyAppointments(); }}
        />
      )}
    </div>
  );
}