"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createAppointment } from "@/services/appointment.service";
import { getAvailableSlots } from "@/services/schedule.service";

interface AvailableDate { date: string; slots: string[]; }
interface Props {
  open: boolean; onClose: () => void; doctor: any;
}

export default function ScheduleAppointmentModal({ open, onClose, doctor }: Props) {
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  useEffect(() => {
    if (!open || !doctor) return;
    loadAvailableDates();
  }, [open, doctor]);

  const loadAvailableDates = async () => {
    try {
      setLoading(true); setAvailableDates([]); setSelectedDate(""); setSelectedSlot("");
      const promises = [];
      for (let i = 0; i < 12; i++) {
        const date = new Date(); date.setUTCDate(date.getUTCDate() + i);
        promises.push(getAvailableSlots(date.toISOString(), doctor.id));
      }
      const results = await Promise.allSettled(promises);
      const available = results
        .filter((r) => r.status === "fulfilled")
        .map((r: any) => r.value)
        .filter((item) => item?.slots?.length > 0);
      setAvailableDates(available);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const currentSlots = availableDates.find((item) => item.date === selectedDate)?.slots || [];

  const handleSchedule = async () => {
    try {
      if (!selectedSlot || !doctor?.id) return;
      setLoading(true);
      await createAppointment({ doctorId: doctor.id, patientId: "", date: new Date(selectedSlot).toISOString() });
      alert("✅ Cita creada correctamente");
      onClose();
    } catch (error) { console.error(error); alert("Error al crear cita"); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={{ borderRadius: "16px", padding: "28px" }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: "1.2rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            Agendar cita con Dr. {doctor?.name} {doctor?.lastnames}
          </DialogTitle>
        </DialogHeader>

        {loading && availableDates.length === 0 && (
          <div className="pz-loading">Buscando horarios disponibles...</div>
        )}

        {!loading && availableDates.length === 0 && (
          <div className="pz-card" style={{ textAlign: "center", padding: "32px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}></div>
            <p style={{ fontWeight: 600, color: "var(--pz-text-mid)" }}>No hay horarios disponibles para los próximos 12 días</p>
          </div>
        )}

        {availableDates.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
            <div>
              <p style={{ fontWeight: 700, marginBottom: "12px", color: "var(--pz-text-mid)" }}>
                1. Seleccione una fecha disponible:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px" }}>
                {availableDates.map((item) => (
                  <button
                    key={item.date}
                    className={`pz-date-btn${selectedDate === item.date ? " selected" : ""}`}
                    onClick={() => { setSelectedDate(item.date); setSelectedSlot(""); }}
                  >
                    {new Date(item.date).toLocaleDateString("es-CO", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short" })}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div>
                <p style={{ fontWeight: 700, marginBottom: "12px", color: "var(--pz-text-mid)" }}>
                  2. Seleccione la hora:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "8px" }}>
                  {currentSlots.map((slot) => (
                    <button
                      key={slot}
                      className={`pz-slot-btn${selectedSlot === slot ? " selected" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {new Date(slot).toLocaleTimeString("es-CO", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false })}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px", borderTop: "1px solid var(--pz-border)" }}>
              <button onClick={onClose} className="pz-btn-outline">Cancelar</button>
              <button
                disabled={!selectedSlot || loading}
                onClick={handleSchedule}
                className="pz-btn-primary"
                style={{ opacity: (!selectedSlot || loading) ? 0.6 : 1 }}
              >
                {loading ? "⏳ Guardando..." : "✓ Confirmar cita"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
