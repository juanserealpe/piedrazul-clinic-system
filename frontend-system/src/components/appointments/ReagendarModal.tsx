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

interface AvailableDate {
  date: string;
  slots: string[];
}

interface Props {
  appointmentId: string;
  /** Fecha actual de la cita (ISO string). Se muestra como label no editable. */
  fechaAnterior: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function ReagendarModal({
  appointmentId,
  fechaAnterior,
  onClose,
  onConfirm,
}: Props) {

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const [slotsVisible, setSlotsVisible] = useState(false);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    if (!open) {
      setSlotsVisible(false);
      setAvailableDates([]);
      setSelectedDate("");
      setSelectedSlot("");
    }
  }, [open]);

  // ─── Cargar slots disponibles ────────────────────────────────────────────────

  const loadAvailableDates = async () => {
    try {
      setLoadingSlots(true);
      setAvailableDates([]);
      setSelectedDate("");
      setSelectedSlot("");

      const promises = [];

      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + i);
        // No se envía doctorId — el back lo toma del JWT
        promises.push(getAvailableSlots(date.toISOString(), undefined));
      }

      const results = await Promise.allSettled(promises);

      const available = results
        .filter((r) => r.status === "fulfilled")
        .map((r: any) => r.value)
        .filter((item) => item?.slots && item.slots.length > 0);

      setAvailableDates(available);
    } catch (error) {
      console.error("ERROR CARGANDO DISPONIBILIDAD:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectNuevaFecha = () => {
    setSlotsVisible(true);
    loadAvailableDates();
  };

  // ─── Confirmar reagendamiento ────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (!selectedSlot) return;

    try {
      setLoadingConfirm(true);

      // No se envía doctorId — el back lo toma del JWT
      await reScheduleAppointment({
        appointmentId,
        newDate: new Date(selectedSlot).toISOString(),
      });

      onConfirm?.();
      onClose();
    } catch (error) {
      console.error("ERROR AL REAGENDAR:", error);
      alert("Error al reagendar la cita. Intenta nuevamente.");
    } finally {
      setLoadingConfirm(false);
    }
  };

  // ─── Slots de la fecha seleccionada ─────────────────────────────────────────

  const currentSlots =
    availableDates.find((item) => item.date === selectedDate)?.slots ?? [];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reagendar cita</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* ── Fecha actual (solo lectura) ── */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Fecha actual de la cita
            </p>
            <div className="rounded-md border bg-muted px-4 py-2 text-sm font-medium">
              {new Date(fechaAnterior).toLocaleString("es-CO", {
                timeZone: "UTC",
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
          </div>

          {/* ── Botón para desplegar selector de nueva fecha ── */}
          {!slotsVisible && (
            <Button variant="outline" onClick={handleSelectNuevaFecha}>
              Seleccionar nueva fecha
            </Button>
          )}

          {/* ── Selector de fecha y hora ── */}
          {slotsVisible && (
            <>
              {loadingSlots && availableDates.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Cargando disponibilidad...
                </div>
              )}

              {!loadingSlots && availableDates.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No hay horarios disponibles para los próximos 12 días.
                </div>
              )}

              {availableDates.length > 0 && (
                <div className="space-y-5">

                  <div>
                    <h3 className="font-semibold mb-3 text-sm">
                      Seleccione una nueva fecha
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableDates.map((item) => (
                        <Button
                          key={item.date}
                          variant={selectedDate === item.date ? "default" : "outline"}
                          onClick={() => {
                            setSelectedDate(item.date);
                            setSelectedSlot("");
                          }}
                        >
                          {new Date(item.date).toLocaleDateString("es-CO", {
                            timeZone: "UTC",
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <h3 className="font-semibold mb-3 text-sm">
                        Seleccione una hora
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {currentSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            {new Date(slot).toLocaleTimeString("es-CO", {
                              timeZone: "UTC",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          )}

          {/* ── Acciones ── */}
          <div className="flex justify-end gap-2 pt-2">
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

        </div>
      </DialogContent>
    </Dialog>
  );
}