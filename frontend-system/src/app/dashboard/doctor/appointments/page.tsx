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

interface AppointmentWithStatus {
  appointmentId: string | null;
  date: string;
  patientId: string;
  status?: string;
}

// Convierte fecha UTC a hora Colombia en formato 12 horas
function formatColombiaTime12h(dateStr: string): string {
  const utc = new Date(dateStr);
  const col = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
  let hours = col.getUTCHours();
  const mins = col.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${mins} ${ampm}`;
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

export default function AppointmentsPage() {
  const user = useAuthStore((s) => s.user);
  const [date, setDate] = useState(getTodayUtc());
  const [data, setData] = useState<AppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [reagendarData, setReagendarData] = useState<ReagendarData | null>(null);

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

  useEffect(() => {
    loadAppointments();
  }, [date]);

  const appointments = (data?.appointments ?? []) as AppointmentWithStatus[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Cabecera con campana de notificaciones */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 700,
              margin: 0,
              color: "var(--pz-text)",
            }}
          >
            Gestion de Citas
          </h1>
          <p style={{ color: "var(--pz-text-soft)", margin: "4px 0 0" }}>
            Administra las citas medicas del dia
          </p>
        </div>
        <AppointmentNotifications />
      </div>

      {successMsg && (
        <div className="pz-success">{successMsg}</div>
      )}

      {/* Botones de herramientas */}
      <AppointmentToolbar onCreated={loadAppointments} />

      {/* Filtro por fecha */}
      <AppointmentFilters date={date} setDate={setDate} />

      {/* Tabla de citas */}
      {loading ? (
        <div className="pz-loading">Cargando citas...</div>
      ) : !data || (data.count === 0) ? (
        <div className="pz-card">
          <div className="pz-empty">
            <p style={{ fontWeight: 600, fontSize: "1rem" }}>
              No hay citas para esta fecha
            </p>
            <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
              Seleccione otra fecha o cree una nueva cita.
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
              Citas del{" "}
              {new Date(data.date).toLocaleDateString("es-CO", {
                timeZone: "UTC",
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                color: "var(--pz-text-soft)",
                fontSize: "0.88rem",
              }}
            >
              Total: <strong>{data.count}</strong> citas programadas
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="pz-table">
              <thead>
                <tr>
                  <th>Hora (Colombia)</th>
                  <th>Paciente</th>
                  <th style={{ textAlign: "center" }}>Estado</th>
                  <th style={{ textAlign: "center" }}>Accion</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const status = appointment.status ?? "SCHEDULED";
                  return (
                    <tr key={appointment.appointmentId}>
                      <td>
                        <span
                          style={{
                            background: "var(--pz-green-light)",
                            color: "var(--pz-green)",
                            fontWeight: 700,
                            padding: "4px 14px",
                            borderRadius: "999px",
                            fontSize: "0.95rem",
                            fontFamily: "monospace",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatColombiaTime12h(appointment.date)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {appointment.patientId}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`pz-badge ${STATUS_CLASS[status] ?? "pz-badge-green"}`}
                          style={{ fontSize: "0.8rem" }}
                        >
                          {STATUS_LABELS[status] ?? status}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {/* Solo el medico puede reagendar citas marcadas como pendientes */}
                        {status === "PENDING_RESCHEDULE" &&
                          appointment.appointmentId && (
                            <button
                              onClick={() =>
                                setReagendarData({
                                  id: appointment.appointmentId!,
                                  fecha: appointment.date,
                                })
                              }
                              style={{
                                background: "var(--pz-amber-light)",
                                color: "var(--pz-amber)",
                                border: "2px solid #f6d87a",
                                borderRadius: "8px",
                                padding: "7px 14px",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Reagendar
                            </button>
                          )}
                        {status !== "PENDING_RESCHEDULE" && (
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de reagendamiento para el medico (sin doctorId, el back lo toma del JWT) */}
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
    </div>
  );
}