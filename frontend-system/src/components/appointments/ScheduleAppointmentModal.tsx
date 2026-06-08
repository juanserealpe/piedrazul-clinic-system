"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createAppointment } from "@/services/appointment.service";
import { getAvailableSlots } from "@/services/schedule.service";
import { getApiErrorMessage } from "@/lib/api-errors";
import { formatSlotTime12h, formatDateShort } from "@/lib/date";

interface AvailableDate {
  date: string;
  slots: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  doctor: any;
}

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

interface Props {
  open: boolean;
  onClose: () => void;
  doctor: Doctor;
}

export default function ScheduleAppointmentModal({
  open,
  onClose,
  doctor,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!open || !doctor) return;
    loadAvailableDates();
  }, [open, doctor]);

  const loadAvailableDates = async () => {
    setLoading(true);
    setAvailableDates([]);
    setSelectedDate("");
    setSelectedSlot("");
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const promises = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + i);
        return getAvailableSlots(date.toISOString(), doctor.id);
      });
      const results = await Promise.allSettled(promises);
      const available = results
        .filter((r) => r.status === "fulfilled")
        .map((r: any) => r.value)
        .filter((item: any) => item?.slots?.length > 0);
      setAvailableDates(available);
      if (available.length === 0) {
        setErrorMsg(
          "No hay horarios disponibles para este medico en los proximos 12 dias."
        );
      }
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const currentSlots =
    availableDates.find((item) => item.date === selectedDate)?.slots ?? [];

  const handleSchedule = async () => {
    if (!selectedSlot || !doctor?.id) return;
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await createAppointment({
        doctorId: doctor.id,
        patientId: "",
        date: new Date(selectedSlot).toISOString(),
      });
      setSuccessMsg("Cita agendada correctamente. Puede cerrar esta ventana.");
      setTimeout(onClose, 1800);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl"
        style={{
          borderRadius: "16px",
          padding: 0,
          // Altura maxima con scroll interno para que no se corte en telefono
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Cabecera fija */}
        <DialogHeader
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--pz-border)",
            flexShrink: 0,
          }}
        >
          <DialogTitle style={{ fontSize: "1.1rem", color: "var(--pz-green)" }}>
            Agendar cita con Dr. {doctor?.name} {doctor?.lastnames}
          </DialogTitle>
        </DialogHeader>

        {/* Cuerpo con scroll */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "20px 24px",
            WebkitOverflowScrolling: "touch", // scroll suave en iOS
          }}
        >
          {/* Mensajes */}
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

          {loading && availableDates.length === 0 && (
            <div className="pz-loading" style={{ padding: "32px 0" }}>
              Buscando horarios disponibles, por favor espere...
            </div>
          )}

          {!loading && availableDates.length === 0 && !errorMsg && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontWeight: 600, color: "var(--pz-text-mid)" }}>
                No hay horarios disponibles para los proximos 12 dias
              </p>
            </div>
          )}

          {availableDates.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* Paso 1: Seleccionar fecha */}
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    marginBottom: "12px",
                    color: "var(--pz-text-mid)",
                    fontSize: "0.95rem",
                  }}
                >
                  Paso 1 de 2: Seleccione una fecha disponible
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(110px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {availableDates.map((item) => (
                    <button
                      key={item.date}
                      className={`pz-date-btn${selectedDate === item.date ? " selected" : ""}`}
                      onClick={() => {
                        setSelectedDate(item.date);
                        setSelectedSlot("");
                      }}
                    >
                      {toColDateShort(item.date)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paso 2: Seleccionar hora - con scroll si hay muchas opciones */}
              {selectedDate && (
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      marginBottom: "12px",
                      color: "var(--pz-text-mid)",
                      fontSize: "0.95rem",
                    }}
                  >
                    Paso 2 de 2: Seleccione la hora (hora Colombia)
                  </p>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--pz-text-soft)",
                      marginBottom: "10px",
                    }}
                  >
                    {currentSlots.length} horarios disponibles. Deslice hacia
                    abajo para ver todos.
                  </p>
                  {/* Contenedor con altura maxima y scroll para que siempre sea visible */}
                  <div
                    style={{
                      maxHeight: "240px",
                      overflowY: "auto",
                      WebkitOverflowScrolling: "touch",
                      padding: "4px",
                      border: "1px solid var(--pz-border)",
                      borderRadius: "10px",
                      background: "var(--pz-cream)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(96px, 1fr))",
                        gap: "8px",
                        padding: "4px",
                      }}
                    >
                      {currentSlots.map((slot) => (
                        <button
                          key={slot}
                          className={`pz-slot-btn${selectedSlot === slot ? " selected" : ""}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {toCol12h(slot)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {currentSlots.length > 9 && (
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--pz-text-soft)",
                        marginTop: "6px",
                        textAlign: "center",
                      }}
                    >
                      Deslice dentro del recuadro para ver mas horarios
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie fijo con botones de accion */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--pz-border)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            flexShrink: 0,
            background: "var(--pz-white)",
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="pz-btn-outline"
          >
            Cancelar
          </button>
          <button
            disabled={!selectedSlot || loading}
            onClick={handleSchedule}
            className="pz-btn-primary"
            style={{ opacity: !selectedSlot || loading ? 0.6 : 1 }}
          >
            {loading ? "Guardando..." : "Confirmar cita"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}