"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  getAllPendingsByDoctor,
  getPendingAppointmentsToReschedule,
} from "@/services/appointment.service";
import { getAllDoctorsRequest } from "@/services/auth.service";
import { AppointmentNotification } from "@/types/appointment-notification";
import ReagendarModal from "@/components/appointments/ReagendarModal";
import { useAuthStore } from "@/store/auth.store";

// Intervalo de actualizacion automatica: cada 60 segundos
const INTERVALO_ACTUALIZACION_MS = 60_000;

// Ventana de fechas para el agendador: hoy hasta 12 dias adelante
function obtenerVentanaFechas() {
  const inicio = new Date();
  inicio.setUTCHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setUTCDate(fin.getUTCDate() + 12);
  return {
    startDate: inicio.toISOString(),
    endDate: fin.toISOString(),
  };
}

// Convierte una fecha ISO a hora Colombia (UTC-5) en formato 12h
function formatearHora(isoStr: string): string {
  const date = new Date(isoStr);

  let hour = date.getUTCHours();
  const minute = date.getUTCMinutes().toString().padStart(2, "0");

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
}

// Convierte una fecha ISO a fecha legible en espanol
function formatearFecha(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ItemNotificacion extends AppointmentNotification {
  doctorId: string;
}

interface DatosReagendar {
  appointmentId: string;
  fecha: string;
  doctorId: string;
}

export default function NotificacionesCitas() {
  const user = useAuthStore((s) => s.user);
  const esAgendador = user?.roles?.includes("SCHEDULER") ?? false;
  const esMedico = user?.roles?.includes("DOCTOR") ?? false;

  const [panelAbierto, setPanelAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<ItemNotificacion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [datosReagendar, setDatosReagendar] = useState<DatosReagendar | null>(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const referenciaPanel = useRef<HTMLDivElement>(null);

  const cargarPendientes = useCallback(async () => {
    if (!user) return;

    try {
      setCargando(true);

      if (esMedico) {
        // El medico usa el endpoint simplificado que no requiere rango de fechas.
        // El backend filtra automaticamente desde hoy en adelante.
        const respuesta = await getAllPendingsByDoctor(user.id);
        setNotificaciones(
          (respuesta.appointments ?? []).map(
            (cita): ItemNotificacion => ({
              ...cita,
              doctorId: user.id,
            })
          )
        );
      } else if (esAgendador) {
        // El agendador necesita ver citas de todos los medicos
        // dentro de la ventana de los proximos 12 dias.
        const { startDate, endDate } = obtenerVentanaFechas();
        const medicos = await getAllDoctorsRequest();

        const resultados = await Promise.allSettled(
          medicos.map((medico: any) =>
            getPendingAppointmentsToReschedule(
              startDate,
              endDate,
              medico.id
            ).then((res) =>
              (res.appointments ?? []).map((cita) => ({
                ...cita,
                doctorId: medico.id,
              }))
            )
          )
        );

        const todas = resultados
          .filter(
            (r): r is PromiseFulfilledResult<ItemNotificacion[]> =>
              r.status === "fulfilled"
          )
          .flatMap((r) => r.value);

        // Eliminar duplicados por appointmentId
        const unicas = Array.from(
          new Map(todas.map((n) => [n.appointmentId, n])).values()
        );

        setNotificaciones(unicas);
      }
    } catch (error) {
      console.error("Error al cargar citas pendientes:", error);
    } finally {
      setCargando(false);
    }
  }, [esMedico, esAgendador, user]);

  // Carga inicial y actualizacion periodica
  useEffect(() => {
    if (!user) return;
    cargarPendientes();
    const intervalo = setInterval(cargarPendientes, INTERVALO_ACTUALIZACION_MS);
    return () => clearInterval(intervalo);
  }, [cargarPendientes, user]);

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const manejarClicExterno = (e: MouseEvent) => {
      if (
        referenciaPanel.current &&
        !referenciaPanel.current.contains(e.target as Node)
      ) {
        setPanelAbierto(false);
      }
    };
    if (panelAbierto) {
      document.addEventListener("mousedown", manejarClicExterno);
    }
    return () => document.removeEventListener("mousedown", manejarClicExterno);
  }, [panelAbierto]);

  const total = notificaciones.length;

  return (
    <>
      <div style={{ position: "relative", flexShrink: 0 }} ref={referenciaPanel}>

        {/* Boton de notificaciones */}
        <button
          onClick={() => setPanelAbierto((prev) => !prev)}
          title={
            total > 0
              ? `${total} citas requieren ser reagendadas`
              : "No hay citas pendientes por reagendar"
          }
          style={{
            position: "relative",
            background:
              total > 0 ? "var(--pz-amber-light)" : "var(--pz-green-light)",
            border: `2px solid ${total > 0 ? "#f6d87a" : "#a7d9c8"}`,
            borderRadius: "10px",
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {/* Icono de campana SVG sin emojis */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={total > 0 ? "var(--pz-amber)" : "var(--pz-green)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {/* Contador de pendientes */}
          {total > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: "var(--pz-red)",
                color: "#fff",
                borderRadius: "999px",
                minWidth: "20px",
                height: "20px",
                fontSize: "0.7rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 5px",
                border: "2px solid var(--pz-white)",
                lineHeight: 1,
              }}
            >
              {total > 99 ? "99+" : total}
            </span>
          )}
        </button>

        {/* Panel desplegable */}
        {panelAbierto && (
          <div
            style={{
              position: "absolute",
              top: "52px",
              right: 0,
              zIndex: 100,
              background: "var(--pz-white)",
              border: "1px solid var(--pz-border)",
              borderRadius: "var(--pz-radius)",
              boxShadow: "var(--pz-shadow-lg)",
              width: "380px",
              maxHeight: "480px",
              overflowY: "auto",
            }}
          >
            {/* Cabecera del panel */}
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid var(--pz-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "var(--pz-white)",
                zIndex: 1,
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "var(--pz-green)",
                  }}
                >
                  Citas por reagendar
                </span>
                {total > 0 && (
                  <span
                    style={{
                      marginLeft: "8px",
                      background: "var(--pz-red-light)",
                      color: "var(--pz-red)",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                    }}
                  >
                    {total}
                  </span>
                )}
              </div>
              <button
                onClick={cargarPendientes}
                disabled={cargando}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: cargando ? "default" : "pointer",
                  fontSize: "0.82rem",
                  color: "var(--pz-green)",
                  fontWeight: 600,
                  opacity: cargando ? 0.4 : 1,
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                Actualizar
              </button>
            </div>

            {/* Mensaje de exito tras reagendar */}
            {mensajeExito && (
              <div
                style={{
                  padding: "10px 16px",
                  background: "var(--pz-green-light)",
                  color: "var(--pz-green)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  borderBottom: "1px solid var(--pz-border)",
                }}
              >
                {mensajeExito}
              </div>
            )}

            {/* Contenido de la lista */}
            {cargando && notificaciones.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--pz-text-soft)",
                  fontSize: "0.88rem",
                }}
              >
                Cargando citas pendientes...
              </div>
            ) : notificaciones.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--pz-text-soft)",
                  fontSize: "0.88rem",
                }}
              >
                No hay citas pendientes por reagendar
              </div>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {notificaciones.map((notif) => (
                  <li
                    key={notif.appointmentId}
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid var(--pz-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            color: "var(--pz-text)",
                          }}
                        >
                          Paciente:{" "}
                          <span style={{ fontFamily: "monospace" }}>
                            {notif.patientId}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--pz-text-soft)",
                            marginTop: "3px",
                          }}
                        >
                          {formatearFecha(notif.date)} -{" "}
                          <strong>{formatearHora(notif.date)}</strong>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setMensajeExito("");
                          setDatosReagendar({
                            appointmentId: notif.appointmentId,
                            fecha: notif.date,
                            doctorId: notif.doctorId,
                          });
                          setPanelAbierto(false);
                        }}
                        style={{
                          background: "var(--pz-amber-light)",
                          color: "var(--pz-amber)",
                          border: "2px solid #f6d87a",
                          borderRadius: "8px",
                          padding: "8px 14px",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        Reagendar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {notificaciones.length > 0 && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid var(--pz-border)",
                  fontSize: "0.76rem",
                  color: "var(--pz-text-soft)",
                  textAlign: "center",
                }}
              >
                Se actualiza automaticamente cada 60 segundos
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de reagendamiento */}
      {datosReagendar && (
        <ReagendarModal
          appointmentId={datosReagendar.appointmentId}
          fechaAnterior={datosReagendar.fecha}
          doctorId={esAgendador ? datosReagendar.doctorId : undefined}
          onClose={() => setDatosReagendar(null)}
          onConfirm={() => {
            setDatosReagendar(null);
            setMensajeExito("La cita fue reagendada correctamente.");
            cargarPendientes();
          }}
        />
      )}
    </>
  );
}