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
import { formatSlotTime12h, formatDateShort, formatDateLong } from "@/lib/date";

interface AvailableDate {
  date: string;
  slots: string[];
}

interface Props {
  appointmentId: string;
  fechaAnterior: string;
  doctorId?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function ReagendarModal({
  appointmentId,
  fechaAnterior,
  doctorId,
  onClose,
  onConfirm,
}: Props) {
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [slotsVisible, setSlotsVisible] = useState(false);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
        return getAvailableSlots(date.toISOString(), doctorId);
      });

      const results = await Promise.allSettled(promises);
      const available = results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((item) => item?.slots?.length > 0);

      setAvailableDates(available);

      if (available.length === 0) {
        setErrorMsg("No hay horarios disponibles en los proximos 12 dias.");
      }
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
        ...(doctorId ? { doctorId } : {}),
      });
      onConfirm?.();
      onClose();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoadingConfirm(false);
    }
  };

  const currentSlots =
    availableDates.find((item) => item.date === selectedDate)?.slots ?? [];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl"
        style={{
          padding: 0,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <DialogHeader
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--pz-border)",
            flexShrink: 0,
          }}
        >
          <DialogTitle>Reagendar cita</DialogTitle>
        </DialogHeader>

        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "20px 24px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Fecha actual de la cita */}
          <div style={{ marginBottom: "20px" }}>
            <p
              style={{
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "var(--pz-text-soft)",
                marginBottom: "6px",
              }}
            >
              Fecha actual de la cita
            </p>
            <div
              style={{
                borderRadius: "8px",
                border: "2px solid var(--pz-border)",
                background: "var(--pz-cream)",
                padding: "10px 16px",
                fontSize: "0.95rem",
                fontWeight: 600,
              }}
            >
              {/* Usamos formatDateLong que lee UTC directamente */}
              {formatDateLong(fechaAnterior)} - {formatSlotTime12h(fechaAnterior)}
            </div>
          </div>

          {errorMsg && (
            <div className="pz-error" style={{ marginBottom: "16px" }}>
              {errorMsg}
            </div>
          )}

          {!slotsVisible && (
            <Button variant="outline" onClick={handleSelectNuevaFecha}>
              Seleccionar nueva fecha
            </Button>
          )}

          {slotsVisible && (
            <>
              {loadingSlots && availableDates.length === 0 && (
                <div className="pz-loading">
                  Buscando horarios disponibles...
                </div>
              )}

              {!loadingSlots && availableDates.length === 0 && !errorMsg && (
                <div className="pz-empty">
                  <p style={{ fontWeight: 600 }}>
                    Sin horarios disponibles en los proximos 12 dias
                  </p>
                </div>
              )}

              {availableDates.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Paso 1: fecha */}
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.9rem" }}>
                      Paso 1 de 2: Seleccione una nueva fecha
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {availableDates.map((item) => (
                        <Button
                          key={item.date}
                          variant={selectedDate === item.date ? "default" : "outline"}
                          onClick={() => {
                            setSelectedDate(item.date);
                            setSelectedSlot("");
                            setErrorMsg("");
                          }}
                        >
                          {formatDateShort(item.date)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Paso 2: hora */}
                  {selectedDate && (
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.9rem" }}>
                        Paso 2 de 2: Seleccione la hora
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "var(--pz-text-soft)", marginBottom: "8px" }}>
                        {currentSlots.length} horarios disponibles
                      </p>
                      <div
                        style={{
                          maxHeight: "220px",
                          overflowY: "auto",
                          WebkitOverflowScrolling: "touch",
                          border: "1px solid var(--pz-border)",
                          borderRadius: "10px",
                          background: "var(--pz-cream)",
                          padding: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                            gap: "8px",
                          }}
                        >
                          {currentSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedSlot === slot ? "default" : "outline"}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setErrorMsg("");
                              }}
                            >
                              {/* formatSlotTime12h lee UTC directo, sin restar 5 horas */}
                              {formatSlotTime12h(slot)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

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
          <Button variant="outline" onClick={onClose} disabled={loadingConfirm}>
            Cancelar
          </Button>
          <Button disabled={!selectedSlot || loadingConfirm} onClick={handleConfirm}>
            {loadingConfirm ? "Reagendando..." : "Confirmar reagendamiento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}