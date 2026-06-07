"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getPendingAppointmentsToReschedule } from "@/services/appointment.service";
import { getAllDoctorsRequest } from "@/services/auth.service";
import { AppointmentNotification } from "@/types/appointment-notification";
import ReagendarModal from "@/components/appointments/ReagendarModal";
import { useAuthStore } from "@/store/auth.store";

const POLL_INTERVAL_MS = 60_000;

function getDateWindow() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 12);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

function toCol12h(isoStr: string): string {
  const utc = new Date(isoStr);
  const col = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
  let h = col.getUTCHours();
  const m = col.getUTCMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function toColDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface NotificationItem extends AppointmentNotification {
  doctorId: string;
}

interface ReagendarData {
  appointmentId: string;
  fecha: string;
  doctorId: string;
}

export default function AppointmentNotifications() {
  const user        = useAuthStore((s) => s.user);
  const isScheduler = user?.roles?.includes("SCHEDULER") ?? false;
  const isDoctor    = user?.roles?.includes("DOCTOR")    ?? false;

  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [reagendarData, setReagendarData] = useState<ReagendarData | null>(null);
  const [successMsg,    setSuccessMsg]    = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const loadPendings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { startDate, endDate } = getDateWindow();

      if (isScheduler) {
        // ✅ Itera sobre todos los médicos y pasa su doctorId correctamente
        const doctors = await getAllDoctorsRequest();

        const results = await Promise.allSettled(
          doctors.map((doc: any) =>
            getPendingAppointmentsToReschedule(startDate, endDate, doc.id).then(
              (res) =>
                (res.appointments ?? []).map((a) => ({
                  ...a,
                  doctorId: doc.id,
                }))
            )
          )
        );

        const all = results
          .filter(
            (r): r is PromiseFulfilledResult<NotificationItem[]> =>
              r.status === "fulfilled"
          )
          .flatMap((r) => r.value);

        const unique = Array.from(
          new Map(all.map((n) => [n.appointmentId, n])).values()
        );

        setNotifications(unique);
      } else if (isDoctor) {
        // ✅ El médico no pasa doctorId — el backend lo toma del JWT
        const response = await getPendingAppointmentsToReschedule(startDate, endDate);
        setNotifications(
          (response.appointments ?? []).map((a): NotificationItem => ({
            ...a,
            doctorId: user?.id ?? "",
          }))
        );
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  }, [isScheduler, isDoctor, user]);

  useEffect(() => {
    if (!user) return;
    loadPendings();
    const interval = setInterval(loadPendings, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadPendings, user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const count = notifications.length;

  return (
    <>
      <div style={{ position: "relative", flexShrink: 0 }} ref={panelRef}>

        {/* Botón campana */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          title={count > 0 ? `${count} citas pendientes por reagendar` : "Sin citas pendientes"}
          style={{
            position: "relative",
            background: count > 0 ? "var(--pz-amber-light)" : "var(--pz-green-light)",
            border: `2px solid ${count > 0 ? "#f6d87a" : "#a7d9c8"}`,
            borderRadius: "10px",
            width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={count > 0 ? "var(--pz-amber)" : "var(--pz-green)"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {count > 0 && (
            <span style={{
              position: "absolute", top: "-6px", right: "-6px",
              background: "var(--pz-red)", color: "#fff",
              borderRadius: "999px", minWidth: "20px", height: "20px",
              fontSize: "0.7rem", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 5px", border: "2px solid var(--pz-white)", lineHeight: 1,
            }}>
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>

        {/* Panel desplegable */}
        {open && (
          <div style={{
            position: "absolute", top: "52px", right: 0, zIndex: 100,
            background: "var(--pz-white)", border: "1px solid var(--pz-border)",
            borderRadius: "var(--pz-radius)", boxShadow: "var(--pz-shadow-lg)",
            width: "380px", maxHeight: "480px", overflowY: "auto",
          }}>
            {/* Cabecera */}
            <div style={{
              padding: "14px 16px 10px", borderBottom: "1px solid var(--pz-border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, background: "var(--pz-white)", zIndex: 1,
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--pz-green)" }}>
                  Citas por reagendar
                </span>
                {count > 0 && (
                  <span style={{
                    marginLeft: "8px", background: "var(--pz-red-light)", color: "var(--pz-red)",
                    borderRadius: "999px", padding: "2px 8px", fontSize: "0.78rem", fontWeight: 700,
                  }}>
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={loadPendings}
                disabled={loading}
                style={{
                  background: "transparent", border: "none",
                  cursor: loading ? "default" : "pointer",
                  fontSize: "0.82rem", color: "var(--pz-green)", fontWeight: 600,
                  opacity: loading ? 0.4 : 1, padding: "4px 8px", borderRadius: "6px",
                }}
              >
                Actualizar
              </button>
            </div>

            {/* Mensaje éxito */}
            {successMsg && (
              <div style={{
                padding: "10px 16px", background: "var(--pz-green-light)",
                color: "var(--pz-green)", fontSize: "0.88rem", fontWeight: 600,
                borderBottom: "1px solid var(--pz-border)",
              }}>
                {successMsg}
              </div>
            )}

            {/* Lista */}
            {loading && notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
                Cargando...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
                No hay citas pendientes por reagendar
              </div>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {notifications.map((notif) => (
                  <li key={notif.appointmentId} style={{ padding: "14px 16px", borderBottom: "1px solid var(--pz-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--pz-text)" }}>
                          Paciente: <span style={{ fontFamily: "monospace" }}>{notif.patientId}</span>
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--pz-text-soft)", marginTop: "3px" }}>
                          {toColDate(notif.date)} - <strong>{toCol12h(notif.date)}</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSuccessMsg("");
                          setReagendarData({
                            appointmentId: notif.appointmentId,
                            fecha:         notif.date,
                            doctorId:      notif.doctorId,
                          });
                          setOpen(false);
                        }}
                        style={{
                          background: "var(--pz-amber-light)", color: "var(--pz-amber)",
                          border: "2px solid #f6d87a", borderRadius: "8px",
                          padding: "8px 14px", fontWeight: 700, fontSize: "0.82rem",
                          cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                        }}
                      >
                        Reagendar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {notifications.length > 0 && (
              <div style={{
                padding: "10px 16px", borderTop: "1px solid var(--pz-border)",
                fontSize: "0.76rem", color: "var(--pz-text-soft)", textAlign: "center",
              }}>
                Próximos 12 días — Actualización automática cada 60 s
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal reagendamiento */}
      {reagendarData && (
        <ReagendarModal
          appointmentId={reagendarData.appointmentId}
          fechaAnterior={reagendarData.fecha}
          doctorId={isScheduler ? reagendarData.doctorId : undefined}
          onClose={() => setReagendarData(null)}
          onConfirm={() => {
            setReagendarData(null);
            setSuccessMsg("Cita reagendada correctamente.");
            loadPendings();
          }}
        />
      )}
    </>
  );
}