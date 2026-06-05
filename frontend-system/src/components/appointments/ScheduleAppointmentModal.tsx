"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createAppointment } from "@/services/appointment.service";
import { getAvailableSlots } from "@/services/schedule.service";
import { getApiErrorMessage } from "@/lib/api-errors";

interface AvailableDate { date: string; slots: string[]; }

interface Props {
  open: boolean;
  onClose: () => void;
  doctor: any;
  /** Si se pasa, al confirmar NO redirige — útil cuando lo abre el agendador */
  noRedirect?: boolean;
  /** Paciente explícito (flujo agendador) */
  patient?: { id: string; name: string; lastnames: string };
}

export default function ScheduleAppointmentModal({
  open, onClose, doctor, noRedirect = false, patient,
}: Props) {
  const router = useRouter();

  const [loading,        setLoading]        = useState(false);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate,   setSelectedDate]   = useState("");
  const [selectedSlot,   setSelectedSlot]   = useState("");
  const [errorMsg,       setErrorMsg]       = useState("");
  const [successMsg,     setSuccessMsg]     = useState("");

  const slotsRef = useRef<HTMLDivElement>(null);

  // ── Reset al abrir ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !doctor) return;
    setSelectedDate("");
    setSelectedSlot("");
    setErrorMsg("");
    setSuccessMsg("");
    loadAvailableDates();
  }, [open, doctor]);

  // Scroll automático a la sección de horas cuando se elige fecha
  useEffect(() => {
    if (selectedDate && slotsRef.current) {
      setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }
  }, [selectedDate]);

  // ── Cargar slots disponibles ─────────────────────────────────────────────
  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      setAvailableDates([]);

      const promises = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() + i);
        return getAvailableSlots(date.toISOString(), doctor.id);
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
      setLoading(false);
    }
  };

  // ── Confirmar cita ───────────────────────────────────────────────────────
  const handleSchedule = async () => {
    if (!selectedSlot || !doctor?.id) return;
    setErrorMsg("");

    try {
      setLoading(true);
      await createAppointment({
        doctorId:  doctor.id,
        patientId: patient?.id ?? "",
        date:      new Date(selectedSlot).toISOString(),
      });

      setSuccessMsg("¡Cita creada correctamente!");

      // Cierra y redirige tras 1.2 s para que el usuario vea el mensaje
      setTimeout(() => {
        onClose();
        if (!noRedirect) router.push("/dashboard");
      }, 1200);

    } catch (error) {
      setErrorMsg(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const currentSlots = availableDates.find(d => d.date === selectedDate)?.slots ?? [];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl"
        style={{
          borderRadius: "16px",
          padding:      "0",
          overflow:     "hidden",
          maxHeight:    "90vh",
          display:      "flex",
          flexDirection:"column",
        }}
      >
        {/* Cabecera fija */}
        <DialogHeader style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)", flexShrink: 0 }}>
          <DialogTitle style={{ fontSize: "1.1rem", color: "var(--pz-green)" }}>
            Agendar con Dr. {doctor?.name} {doctor?.lastnames}
          </DialogTitle>
          {patient && (
            <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--pz-text-soft)" }}>
              Paciente: <strong>{patient.name} {patient.lastnames}</strong>
            </p>
          )}
        </DialogHeader>

        {/* Cuerpo con scroll */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>

          {/* Mensaje de éxito */}
          {successMsg && (
            <div className="pz-success" style={{ marginBottom: "16px", textAlign: "center", fontSize: "1rem" }}>
              {successMsg}
            </div>
          )}

          {/* Mensaje de error */}
          {errorMsg && (
            <div className="pz-error" style={{ marginBottom: "16px" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Cargando */}
          {loading && availableDates.length === 0 && (
            <div className="pz-loading">Buscando horarios disponibles...</div>
          )}

          {/* Sin slots */}
          {!loading && availableDates.length === 0 && !errorMsg && (
            <div className="pz-empty">
              <div className="pz-empty-icon"></div>
              <p style={{ fontWeight: 600 }}>Sin horarios disponibles en los próximos 12 días</p>
              <p style={{ fontSize: "0.88rem", marginTop: "4px" }}>El médico puede no tener horario configurado o todos los slots están ocupados.</p>
            </div>
          )}

          {/* Selector de fecha */}
          {availableDates.length > 0 && (
            <>
              <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem", color: "var(--pz-text-mid)" }}>
                1. Seleccione una fecha disponible:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "8px", marginBottom: "24px" }}>
                {availableDates.map(item => (
                  <button
                    key={item.date}
                    className={`pz-date-btn${selectedDate === item.date ? " selected" : ""}`}
                    onClick={() => { setSelectedDate(item.date); setSelectedSlot(""); setErrorMsg(""); }}
                  >
                    {new Date(item.date).toLocaleDateString("es-CO", {
                      timeZone: "UTC", weekday: "short", day: "2-digit", month: "short",
                    })}
                  </button>
                ))}
              </div>

              {/* Selector de hora — con scroll propio si hay muchos slots */}
              {selectedDate && (
                <div ref={slotsRef}>
                  <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem", color: "var(--pz-text-mid)" }}>
                    2. Seleccione la hora:
                  </p>
                  <div style={{
                    display:       "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
                    gap:           "8px",
                    maxHeight:     "220px",
                    overflowY:     "auto",
                    paddingRight:  "4px",
                    // borde sutil para indicar scroll
                    borderTop:     currentSlots.length > 16 ? "1px solid var(--pz-border)" : "none",
                    paddingTop:    currentSlots.length > 16 ? "8px" : "0",
                  }}>
                    {currentSlots.map(slot => (
                      <button
                        key={slot}
                        className={`pz-slot-btn${selectedSlot === slot ? " selected" : ""}`}
                        onClick={() => { setSelectedSlot(slot); setErrorMsg(""); }}
                      >
                        {new Date(slot).toLocaleTimeString("es-CO", {
                          timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false,
                        })}
                      </button>
                    ))}
                  </div>
                  {currentSlots.length > 16 && (
                    <p style={{ fontSize: "0.78rem", color: "var(--pz-text-soft)", marginTop: "6px", textAlign: "center" }}>
                      ↕ Desliza para ver más horarios ({currentSlots.length} disponibles)
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pie fijo con acciones */}
        <div style={{
          padding:      "14px 24px",
          borderTop:    "1px solid var(--pz-border)",
          display:      "flex",
          justifyContent: "flex-end",
          gap:          "12px",
          flexShrink:   0,
          background:   "var(--pz-white)",
        }}>
          <button onClick={onClose} className="pz-btn-outline" disabled={loading}>
            Cancelar
          </button>
          <button
            disabled={!selectedSlot || loading}
            onClick={handleSchedule}
            className="pz-btn-primary"
            style={{ opacity: (!selectedSlot || loading) ? 0.6 : 1, minWidth: "160px" }}
          >
            {loading ? "Guardando..." : "✓ Confirmar cita"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}