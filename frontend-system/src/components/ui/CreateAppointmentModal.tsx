"use client";
import { useEffect, useState } from "react";
import { getAvailableSlots } from "@/services/schedule.service";
import { createAppointment } from "@/services/appointment.service";
import { getApiErrorMessage } from "@/lib/api-errors";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface AvailableDate {
  date: string;
  slots: string[];
}

// ── Formateador hora Colombia (UTC-5) en 12h ──────────────────────────────────
function toCol12h(isoStr: string): string {
  const utc = new Date(isoStr);
  // Colombia = UTC-5
  const col = new Date(utc.getTime() - 5 * 60 * 60 * 1000);
  let h    = col.getUTCHours();
  const m  = col.getUTCMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h        = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function toColDate(isoStr: string): string {
  const utc = new Date(isoStr);
  return utc.toLocaleDateString("es-CO", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default function CreateAppointmentModal({ open, onClose, onCreated }: Props) {
  const [patientId,       setPatientId]       = useState("");
  const [loadingSlots,    setLoadingSlots]     = useState(false);
  const [loadingSave,     setLoadingSave]      = useState(false);
  const [availableDates,  setAvailableDates]   = useState<AvailableDate[]>([]);
  const [selectedDate,    setSelectedDate]     = useState("");
  const [selectedSlot,    setSelectedSlot]     = useState("");
  const [errorMsg,        setErrorMsg]         = useState("");
  const [successMsg,      setSuccessMsg]       = useState("");

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setPatientId(""); setAvailableDates([]); setSelectedDate("");
      setSelectedSlot(""); setErrorMsg(""); setSuccessMsg("");
    }
  }, [open]);

  // Cargar slots cuando hay patientId (o sin él — el back lo toma del JWT)
  const loadSlots = async () => {
    setLoadingSlots(true);
    setAvailableDates([]);
    setSelectedDate("");
    setSelectedSlot("");
    setErrorMsg("");
    try {
      const promises = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + i);
        return getAvailableSlots(d.toISOString());
      });
      const results = await Promise.allSettled(promises);
      const available = results
        .filter(r => r.status === "fulfilled")
        .map((r: any) => r.value)
        .filter((item: any) => item?.slots?.length > 0);
      setAvailableDates(available);
      if (available.length === 0) {
        setErrorMsg("No hay horarios disponibles para los próximos 12 días.");
      }
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSlot) return;
    setErrorMsg("");
    setSuccessMsg("");
    if (!patientId.trim()) {
      setErrorMsg("Ingresa el número de cédula del paciente.");
      return;
    }
    setLoadingSave(true);
    try {
      await createAppointment({
        patientId: patientId.trim(),
        doctorId: "",            // el back lo toma del JWT
        date: new Date(selectedSlot).toISOString(),
      });
      setSuccessMsg("¡Cita creada correctamente!");
      onCreated?.();
      setTimeout(onClose, 1500);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setLoadingSave(false);
    }
  };

  if (!open) return null;

  const currentSlots = availableDates.find(d => d.date === selectedDate)?.slots ?? [];

  return (
    <div className="pz-overlay">
      <div className="pz-modal" style={{ maxWidth: "540px" }}>
        {/* Encabezado */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--pz-green)" }}>
            Crear Nueva Cita
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "var(--pz-sand)", border: "none",
              borderRadius: "8px", padding: "6px 12px",
              cursor: "pointer", fontWeight: 700,
            }}
          >
            Cerrar
          </button>
        </div>

        {/* Mensajes */}
        {errorMsg   && <div className="pz-error"   style={{ marginBottom: "16px" }}>⚠️ {errorMsg}</div>}
        {successMsg && <div className="pz-success"  style={{ marginBottom: "16px" }}>{successMsg}</div>}

        {/* Cédula paciente */}
        <div style={{ marginBottom: "20px" }}>
          <label className="pz-label">Cédula del Paciente *</label>
          <input
            className="pz-input"
            placeholder="Número de cédula del paciente"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
          />
        </div>

        {/* Botón cargar slots */}
        {availableDates.length === 0 && !loadingSlots && (
          <button
            onClick={loadSlots}
            className="pz-btn-outline"
            style={{ width: "100%", justifyContent: "center", marginBottom: "16px" }}
          >
            Ver horarios disponibles
          </button>
        )}

        {loadingSlots && (
          <div className="pz-loading" style={{ padding: "24px 0" }}>
            Buscando horarios disponibles...
          </div>
        )}

        {/* Selector de fecha */}
        {availableDates.length > 0 && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem" }}>
                1. Seleccione una fecha:
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: "8px",
              }}>
                {availableDates.map(item => (
                  <button
                    key={item.date}
                    className={`pz-date-btn${selectedDate === item.date ? " selected" : ""}`}
                    onClick={() => { setSelectedDate(item.date); setSelectedSlot(""); }}
                  >
                    {toColDate(item.date)}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de hora */}
            {selectedDate && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem" }}>
                  2. Seleccione la hora (hora Colombia):
                </p>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "8px",
                }}>
                  {currentSlots.map(slot => (
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
            )}
          </>
        )}

        {/* Acciones */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "24px",
          paddingTop: "16px",
          borderTop: "1px solid var(--pz-border)",
        }}>
          <button onClick={onClose} className="pz-btn-outline">Cancelar</button>
          <button
            onClick={handleSave}
            disabled={!selectedSlot || loadingSave}
            className="pz-btn-primary"
            style={{ opacity: (!selectedSlot || loadingSave) ? 0.6 : 1 }}
          >
            {loadingSave ? "Guardando..." : "Guardar cita"}
          </button>
        </div>
      </div>
    </div>
  );
}