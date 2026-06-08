"use client";

import { useEffect, useState } from "react";
import AppointmentToolbar from "@/components/appointments/AppointmentToolbar";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentNotifications from "@/components/appointments/AppointmentNotifications";
import { getTodayUtc } from "@/lib/date";
import { getAppointments } from "@/services/appointment.service";
import { AppointmentsResponse } from "@/types/appointment";
import ReagendarModal from "@/components/appointments/ReagendarModal";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-errors";

interface AppointmentWithStatus {
  appointmentId: string | null;
  date: string;
  patientId: string;
  status?: string;
}

// Lee UTC directo — los slots están almacenados con hora Colombia como UTC
function formatTime12h(dateStr: string): string {
  const d = new Date(dateStr);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Programada",
  RESCHEDULED: "Reagendada",
  PENDING_RESCHEDULE: "Por reagendar",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const STATUS_CLASS: Record<string, string> = {
  SCHEDULED: "pz-badge-green",
  RESCHEDULED: "pz-badge-green",
  PENDING_RESCHEDULE: "pz-badge-amber",
  COMPLETED: "pz-badge-green",
  CANCELLED: "pz-badge-red",
};

interface ReagendarData {
  id: string;
  fecha: string;
}

function ConfirmCancelModal({ onConfirm, onClose, loading }: {
  onConfirm: () => void; onClose: () => void; loading: boolean;
}) {
  return (
    <div className="pz-overlay">
      <div className="pz-modal" style={{ maxWidth: "420px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: "1.1rem", color: "var(--pz-red)" }}>
          Cancelar cita
        </h2>
        <p style={{ color: "var(--pz-text-mid)", marginBottom: "24px" }}>
          ¿Está seguro de que desea cancelar esta cita? Esta acción no se puede deshacer.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} disabled={loading} className="pz-btn-outline">No, volver</button>
          <button onClick={onConfirm} disabled={loading} className="pz-btn-danger"
            style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "Cancelando..." : "Sí, cancelar cita"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const user = useAuthStore((s) => s.user);
  const [date, setDate] = useState(getTodayUtc());
  const [data, setData] = useState<AppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [reagendarData, setReagendarData] = useState<ReagendarData | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments(date);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, [date]);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelLoading(true);
    try {
      await api.patch("/appointments/cancel-by-staff", { appointmentId: cancelId });
      setSuccessMsg("Cita cancelada correctamente.");
      setCancelId(null);
      loadAppointments();
    } catch (e) {
      setErrorMsg(getApiErrorMessage(e));
      setCancelId(null);
    } finally {
      setCancelLoading(false);
    }
  };

  const appointments = (data?.appointments ?? []) as AppointmentWithStatus[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 700, margin: 0 }}>
            Gestion de Citas
          </h1>
          <p style={{ color: "var(--pz-text-soft)", margin: "4px 0 0" }}>
            Administra las citas medicas del dia
          </p>
        </div>
        <AppointmentNotifications />
      </div>

      {successMsg && <div className="pz-success">{successMsg}</div>}
      {errorMsg   && <div className="pz-error">{errorMsg}</div>}

      <AppointmentToolbar onCreated={loadAppointments} />
      <AppointmentFilters date={date} setDate={setDate} />

      {loading ? (
        <div className="pz-loading">Cargando citas...</div>
      ) : !data || data.count === 0 ? (
        <div className="pz-card">
          <div className="pz-empty">
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>No hay citas para esta fecha</p>
            <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>Seleccione otra fecha o cree una nueva cita.</p>
          </div>
        </div>
      ) : (
        <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>
              Citas del{" "}
              {new Date(data.date).toLocaleDateString("es-CO", {
                timeZone: "UTC", weekday: "long", day: "2-digit", month: "long", year: "numeric",
              })}
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
                  <th>Paciente</th>
                  <th style={{ textAlign: "center" }}>Estado</th>
                  <th style={{ textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => {
                  const status = apt.status ?? "SCHEDULED";
                  const canCancel = status === "SCHEDULED" || status === "RESCHEDULED";
                  return (
                    <tr key={apt.appointmentId}>
                      <td>
                        <span style={{
                          background: "var(--pz-green-light)", color: "var(--pz-green)",
                          fontWeight: 700, padding: "4px 14px", borderRadius: "999px",
                          fontSize: "0.95rem", fontFamily: "monospace", whiteSpace: "nowrap",
                        }}>
                          {formatTime12h(apt.date)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{apt.patientId}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`pz-badge ${STATUS_CLASS[status] ?? "pz-badge-green"}`}
                          style={{ fontSize: "0.8rem" }}>
                          {STATUS_LABELS[status] ?? status}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                          {status === "PENDING_RESCHEDULE" && apt.appointmentId && (
                            <button onClick={() => setReagendarData({ id: apt.appointmentId!, fecha: apt.date })}
                              style={{
                                background: "var(--pz-amber-light)", color: "var(--pz-amber)",
                                border: "2px solid #f6d87a", borderRadius: "8px",
                                padding: "7px 14px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                              }}>
                              Reagendar
                            </button>
                          )}
                          {canCancel && apt.appointmentId && (
                            <button onClick={() => { setErrorMsg(""); setCancelId(apt.appointmentId!); }}
                              style={{
                                background: "var(--pz-red-light)", color: "var(--pz-red)",
                                border: "2px solid #f5c6c1", borderRadius: "8px",
                                padding: "7px 14px", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                              }}>
                              Cancelar
                            </button>
                          )}
                          {!canCancel && status !== "PENDING_RESCHEDULE" && (
                            <span style={{ color: "var(--pz-text-soft)", fontSize: "0.85rem" }}>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reagendarData && (
        <ReagendarModal
          appointmentId={reagendarData.id}
          fechaAnterior={reagendarData.fecha}
          onClose={() => setReagendarData(null)}
          onConfirm={() => {
            setSuccessMsg("La cita fue reagendada correctamente.");
            setReagendarData(null);
            loadAppointments();
          }}
        />
      )}

      {cancelId && (
        <ConfirmCancelModal
          onConfirm={handleCancel}
          onClose={() => setCancelId(null)}
          loading={cancelLoading}
        />
      )}
    </div>
  );
}