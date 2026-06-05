"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { getAvailableSlots } from "@/services/schedule.service";
import { reScheduleAppointment } from "@/services/appointment.service";
import { getApiErrorMessage } from "@/lib/api-errors";

interface AvailableDate {
  date: string;
  slots: string[];
}

interface Props {
  appointmentId: string;
  fechaAnterior: string;
  doctorId?: string;       // opcional — agendador lo pasa, médico no
  onClose:    () => void;
  onConfirm?: () => void;  // sin argumentos — el modal maneja el reagendamiento internamente
}

export default function ReagendarModal({
  appointmentId,
  fechaAnterior,
  doctorId,
  onClose,
  onConfirm,
}: Props) {

  const [loadingSlots,   setLoadingSlots]   = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [slotsVisible,   setSlotsVisible]   = useState(false);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate,   setSelectedDate]   = useState("");
  const [selectedSlot,   setSelectedSlot]   = useState("");
  const [errorMsg,       setErrorMsg]       = useState("");

  // Parsear fecha de forma segura — nunca muestra "Invalid Date"
  const fechaLabel = (() => {
    const d = new Date(fechaAnterior);
    if (isNaN(d.getTime())) return fechaAnterior;
    return d.toLocaleString("es-CO", {
      timeZone: "UTC",
      weekday: "long",
      day:     "2-digit",
      month:   "long",
      year:    "numeric",
      hour:    "2-digit",
      minute:  "2-digit",
      hour12:  false,
    });
  })();

  useEffect(() => {
    if (!slotsVisible) {
      setAvailableDates([]);
      setSelectedDate("");
      setSelectedSlot("");
      setErrorMsg("");
    }
  }, [slotsVisible]);

  const loadAvailableDates = async () => {
    try {
      setLoadingSlots(true);
      setAvailableDates([]);
      setSelectedDate("");
      setSelectedSlot("");
      setErrorMsg("");

      const promises = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + i);
        // Si hay doctorId (agendador) lo pasa; si no (médico) el back usa el JWT
        return getAvailableSlots(date.toISOString(), doctorId);
      });

      const results   = await Promise.allSettled(promises);
      const available = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map(r => r.value)
        .filter(item => item?.slots?.length > 0);

      setAvailableDates(available);
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectNuevaFecha = () => {
    setSlotsVisible(true);
    loadAvailableDates();
  };

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setErrorMsg("");
    try {
      setLoadingConfirm(true);
      await reScheduleAppointment({
        appointmentId,
        newDate: new Date(selectedSlot).toISOString(),
        // Agendador pasa doctorId; médico lo omite (el back usa su JWT)
        ...(doctorId ? { doctorId } : {}),
      });
      onConfirm?.();   // solo notifica — sin argumentos
      onClose();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoadingConfirm(false);
    }
  };

  const currentSlots =
    availableDates.find(item => item.date === selectedDate)?.slots ?? [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl"
        style={{ padding: 0, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Cabecera fija */}
        <DialogHeader style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)", flexShrink: 0 }}>
          <DialogTitle>Reagendar cita</DialogTitle>
        </DialogHeader>

        {/* Cuerpo con scroll */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>

          {/* Fecha actual */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--pz-text-soft)", marginBottom: "6px" }}>
              Fecha actual de la cita
            </p>
            <div style={{
              borderRadius: "8px", border: "2px solid var(--pz-border)",
              background: "var(--pz-cream)", padding: "10px 16px",
              fontSize: "0.95rem", fontWeight: 600,
            }}>
              📅 {fechaLabel}
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="pz-error" style={{ marginBottom: "16px" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Botón para desplegar selector */}
          {!slotsVisible && (
            <Button variant="outline" onClick={handleSelectNuevaFecha}>
              Seleccionar nueva fecha
            </Button>
          )}

          {/* Slots */}
          {slotsVisible && (
            <>
              {loadingSlots && availableDates.length === 0 && (
                <div className="pz-loading">Cargando disponibilidad...</div>
              )}

              {!loadingSlots && availableDates.length === 0 && !errorMsg && (
                <div className="pz-empty">
                  <div className="pz-empty-icon">📅</div>
                  <p style={{ fontWeight: 600 }}>Sin horarios disponibles en los próximos 12 días</p>
                </div>
              )}

              {availableDates.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.9rem" }}>
                      Seleccione una nueva fecha:
                    </p>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                      gap: "8px",
                    }}>
                      {availableDates.map(item => (
                        <Button
                          key={item.date}
                          variant={selectedDate === item.date ? "default" : "outline"}
                          onClick={() => { setSelectedDate(item.date); setSelectedSlot(""); setErrorMsg(""); }}
                        >
                          {new Date(item.date).toLocaleDateString("es-CO", {
                            timeZone: "UTC", weekday: "short", day: "2-digit", month: "2-digit",
                          })}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.9rem" }}>
                        Seleccione la hora:
                      </p>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
                        gap: "8px",
                        maxHeight: "220px",
                        overflowY: "auto",
                        paddingRight: "4px",
                      }}>
                        {currentSlots.map(slot => (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            onClick={() => { setSelectedSlot(slot); setErrorMsg(""); }}
                          >
                            {new Date(slot).toLocaleTimeString("es-CO", {
                              timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false,
                            })}
                          </Button>
                        ))}
                      </div>
                      {currentSlots.length > 16 && (
                        <p style={{ fontSize: "0.78rem", color: "var(--pz-text-soft)", marginTop: "6px", textAlign: "center" }}>
                          ↕ Desliza para ver más horarios
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pie fijo */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid var(--pz-border)",
          display: "flex", justifyContent: "flex-end", gap: "10px",
          flexShrink: 0, background: "var(--pz-white)",
        }}>
          <Button variant="outline" onClick={onClose} disabled={loadingConfirm}>
            Cancelar
          </Button>
          <Button
            disabled={!selectedSlot || loadingConfirm}
            onClick={handleConfirm}
          >
            {loadingConfirm ? "Reagendando..." : "Confirmar reagendamiento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}