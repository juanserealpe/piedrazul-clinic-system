"use client";

import { useEffect, useRef, useState } from "react";
import { getPendingAppointmentsToReschedule } from "@/services/appointment.service";
import { AppointmentNotification } from "@/types/appointment-notification";

const POLL_INTERVAL_MS = 60_000; // refresca cada 60 s

function getDateWindow() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 12);

  return {
    startDate: start.toISOString(),
    endDate:   end.toISOString(),
  };
}

export default function AppointmentNotifications() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [loading,       setLoading]       = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Cargar pendientes ──────────────────────────────────────
  const loadPendings = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateWindow();
      const response = await getPendingAppointmentsToReschedule(startDate, endDate);
      setNotifications(response.appointments ?? []);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial + polling
  useEffect(() => {
    loadPendings();
    const interval = setInterval(loadPendings, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Cerrar al hacer clic fuera del panel
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

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ position: "relative" }} ref={panelRef}>

      {/* ── Botón campana ── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label={`Notificaciones${count > 0 ? ` — ${count} citas por reagendar` : ""}`}
        style={{
          position:        "relative",
          background:      count > 0 ? "var(--pz-amber-light)" : "var(--pz-green-light)",
          border:          `2px solid ${count > 0 ? "#f6d87a" : "#a7d9c8"}`,
          borderRadius:    "10px",
          width:           "44px",
          height:          "44px",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          cursor:          "pointer",
          fontSize:        "1.3rem",
          transition:      "transform 0.15s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        🔔
        {/* Badge con conteo */}
        {count > 0 && (
          <span style={{
            position:        "absolute",
            top:             "-6px",
            right:           "-6px",
            background:      "var(--pz-red)",
            color:           "#fff",
            borderRadius:    "999px",
            minWidth:        "20px",
            height:          "20px",
            fontSize:        "0.72rem",
            fontWeight:      700,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            padding:         "0 5px",
            border:          "2px solid var(--pz-white)",
            lineHeight:      1,
          }}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* ── Panel desplegable ── */}
      {open && (
        <div
          className="pz-notif-panel"
          style={{
            position:  "absolute",
            top:       "52px",
            right:     0,
            zIndex:    100,
            minWidth:  "340px",
          }}
        >
          {/* Cabecera */}
          <div style={{
            padding:      "14px 16px 10px",
            borderBottom: "1px solid var(--pz-border)",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "space-between",
          }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--pz-green)" }}>
                🔔 Citas por reagendar
              </span>
              {count > 0 && (
                <span style={{
                  marginLeft:     "8px",
                  background:     "var(--pz-red-light)",
                  color:          "var(--pz-red)",
                  borderRadius:   "999px",
                  padding:        "2px 8px",
                  fontSize:       "0.78rem",
                  fontWeight:     700,
                }}>
                  {count}
                </span>
              )}
            </div>
            <button
              onClick={loadPendings}
              disabled={loading}
              aria-label="Actualizar notificaciones"
              style={{
                background:   "transparent",
                border:       "none",
                cursor:       loading ? "default" : "pointer",
                fontSize:     "1rem",
                opacity:      loading ? 0.4 : 1,
                padding:      "4px",
                borderRadius: "6px",
              }}
            >
              🔄
            </button>
          </div>

          {/* Contenido */}
          {loading && notifications.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
              Cargando...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
              Sin citas pendientes por reagendar
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none", maxHeight: "340px", overflowY: "auto" }}>
              {notifications.map((notif) => (
                <li key={notif.appointmentId} className="pz-notif-item">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--pz-text)" }}>
                        Paciente: <span style={{ fontFamily: "monospace" }}>{notif.patientId}</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--pz-text-soft)", marginTop: "2px" }}>
                        {new Date(notif.date).toLocaleDateString("es-CO", {
                          timeZone: "UTC",
                          weekday:  "short",
                          day:      "2-digit",
                          month:    "short",
                          year:     "numeric",
                        })}{" "}
                        {new Date(notif.date).toLocaleTimeString("es-CO", {
                          timeZone: "UTC",
                          hour:     "2-digit",
                          minute:   "2-digit",
                          hour12:   false,
                        })}
                      </div>
                    </div>
                    <span style={{
                      background:   "var(--pz-amber-light)",
                      color:        "var(--pz-amber)",
                      border:       "1px solid #f6d87a",
                      borderRadius: "999px",
                      padding:      "3px 10px",
                      fontSize:     "0.75rem",
                      fontWeight:   700,
                      flexShrink:   0,
                    }}>
                      Por reagendar
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pie */}
          {notifications.length > 0 && (
            <div style={{
              padding:    "10px 16px",
              borderTop:  "1px solid var(--pz-border)",
              fontSize:   "0.78rem",
              color:      "var(--pz-text-soft)",
              textAlign:  "center",
            }}>
              Próximos 12 días · Actualización automática cada 60 s
            </div>
          )}
        </div>
      )}
    </div>
  );
}