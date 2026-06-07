"use client";
import { useEffect, useState } from "react";
import DoctorsTable from "@/components/appointments/DoctorsTable";
import ScheduleAppointmentModal from "@/components/appointments/ScheduleAppointmentModal";
import { getAllDoctorsRequest } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-errors";
import api from "@/lib/axios";

// Convierte fecha UTC a hora Colombia UTC-5 en formato 12 horas
function toCol12h(isoStr: string): string {
  const utc = new Date(isoStr);
  const col = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
  let h = col.getUTCHours();
  const m = col.getUTCMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function toColDateLong(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programada",
  PENDING_RESCHEDULE: "Por reagendar",
  RESCHEDULED: "Reagendada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "pz-badge-green",
  PENDING_RESCHEDULE: "pz-badge-amber",
  RESCHEDULED: "pz-badge-green",
  COMPLETED: "pz-badge-green",
  CANCELLED: "pz-badge-red",
};

// Modal de confirmacion para cancelar una cita
function ConfirmCancelModal({
  onConfirm,
  onClose,
  loading,
}: {
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="pz-overlay">
      <div className="pz-modal" style={{ maxWidth: "420px" }}>
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: "1.1rem",
            color: "var(--pz-red)",
          }}
        >
          Cancelar cita
        </h2>
        <p style={{ color: "var(--pz-text-mid)", marginBottom: "24px" }}>
          Esta seguro de que desea cancelar esta cita? Esta accion no se puede
          deshacer. Si necesita una nueva cita, debera agendarla nuevamente.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="pz-btn-outline"
          >
            No, volver
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="pz-btn-danger"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Cancelando..." : "Si, cancelar cita"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientAppointmentsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [tab, setTab] = useState<"citas" | "agendar">("citas");

  // Estado para el modal de cancelacion
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
    loadMyAppointments();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await getAllDoctorsRequest();
      setDoctors(res);
    } catch (e) {
      console.error(e);
    }
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

  const handleCancelAppointment = async () => {
    if (!cancelAppointmentId) return;
    setCancelLoading(true);
    try {
      // Llama al endpoint de cancelacion
      await api.patch(`/appointments/cancel`, {
        appointmentId: cancelAppointmentId,
      });
      setSuccessMsg("Su cita fue cancelada correctamente.");
      setCancelAppointmentId(null);
      loadMyAppointments();
    } catch (e) {
      setErrorMsg(getApiErrorMessage(e));
      setCancelAppointmentId(null);
    } finally {
      setCancelLoading(false);
    }
  };

  // Determina si una cita puede cancelarse (solo las programadas o reagendadas)
  const canCancel = (status: string) =>
    status === "SCHEDULED" || status === "RESCHEDULED";

  return (
    <div>
      <div className="pz-page-header">
        <h1>Mis Citas Medicas</h1>
        <p>Consulte y agende sus citas</p>
      </div>

      {/* Pestanas de navegacion */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "citas", label: "Mis Citas" },
          { key: "agendar", label: "Agendar Nueva Cita" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border:
                tab === t.key
                  ? "2px solid var(--pz-green)"
                  : "2px solid var(--pz-border)",
              background:
                tab === t.key ? "var(--pz-green)" : "var(--pz-white)",
              color: tab === t.key ? "#fff" : "var(--pz-text-mid)",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mensajes de exito o error */}
      {errorMsg && (
        <div className="pz-error" style={{ marginBottom: "16px" }}>
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="pz-success" style={{ marginBottom: "16px" }}>
          {successMsg}
        </div>
      )}

      {/* Pestana: Mis citas */}
      {tab === "citas" && (
        <>
          {loading ? (
            <div className="pz-loading">Cargando sus citas...</div>
          ) : appointments.length === 0 ? (
            <div className="pz-card">
              <div className="pz-empty">
                <p style={{ fontWeight: 600 }}>
                  No tiene citas programadas
                </p>
                <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
                  Use la opcion "Agendar Nueva Cita" para crear una.
                </p>
              </div>
            </div>
          ) : (
            <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "20px 24px 16px",
                  borderBottom: "1px solid var(--pz-border)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--pz-green)",
                  }}
                >
                  Sus Citas Medicas
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "var(--pz-text-soft)",
                    fontSize: "0.88rem",
                  }}
                >
                  Total: <strong>{appointments.length}</strong> citas
                </p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="pz-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora (Colombia)</th>
                      <th>Medico</th>
                      <th style={{ textAlign: "center" }}>Estado</th>
                      <th style={{ textAlign: "center" }}>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.appointmentId}>
                        <td
                          style={{
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {toColDateLong(apt.date)}
                        </td>
                        <td>
                          <span
                            style={{
                              background: "var(--pz-green-light)",
                              color: "var(--pz-green)",
                              fontWeight: 700,
                              padding: "4px 12px",
                              borderRadius: "999px",
                              fontSize: "0.9rem",
                              fontFamily: "monospace",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {toCol12h(apt.date)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {doctors.find((d) => d.id === apt.doctorId)
                            ? `Dr. ${doctors.find((d) => d.id === apt.doctorId)!.name} ${doctors.find((d) => d.id === apt.doctorId)!.lastnames}`
                            : apt.doctorId}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            className={`pz-badge ${STATUS_COLORS[apt.status] ?? "pz-badge-green"}`}
                          >
                            {STATUS_LABELS[apt.status] ?? apt.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {/* Solo mostrar boton de cancelar para citas que se pueden cancelar */}
                          {canCancel(apt.status) && apt.appointmentId && (
                            <button
                              onClick={() =>
                                setCancelAppointmentId(apt.appointmentId)
                              }
                              style={{
                                background: "var(--pz-red-light)",
                                color: "var(--pz-red)",
                                border: "2px solid #f5c6c1",
                                borderRadius: "8px",
                                padding: "7px 14px",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Cancelar cita
                            </button>
                          )}
                          {!canCancel(apt.status) && (
                            <span
                              style={{
                                color: "var(--pz-text-soft)",
                                fontSize: "0.85rem",
                              }}
                            >
                              -
                            </span>
                          )}
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

      {/* Pestana: Agendar nueva cita */}
      {tab === "agendar" && (
        <DoctorsTable
          doctors={doctors}
          onSchedule={(doctor) => {
            setSelectedDoc(doctor);
            setOpenModal(true);
          }}
        />
      )}

      {/* Modal para agendar cita con medico seleccionado */}
      {selectedDoc && (
        <ScheduleAppointmentModal
          open={openModal}
          doctor={selectedDoc}
          onClose={() => {
            setOpenModal(false);
            loadMyAppointments();
          }}
        />
      )}

      {/* Modal de confirmacion de cancelacion */}
      {cancelAppointmentId && (
        <ConfirmCancelModal
          onConfirm={handleCancelAppointment}
          onClose={() => setCancelAppointmentId(null)}
          loading={cancelLoading}
        />
      )}
    </div>
  );
}