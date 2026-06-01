"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createAppointment } from "@/services/appointment.service";
import { getAvailableSlots } from "@/services/schedule.service";

interface AvailableDate { date: string; slots: string[]; }
interface Doctor { id: string; name: string; lastnames: string; }
interface Patient { id: string; name: string; lastnames: string; }
interface Props {
  open: boolean; onClose: () => void; doctor: Doctor; patient: Patient;
}

export default function AppointmentSchedulerModal({ open, onClose, doctor, patient }: Props) {
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

  const currentSlots = availableDates.find((d) => d.date === selectedDate)?.slots || [];

  const handleSchedule = async () => {
    try {
      if (!selectedSlot || !doctor?.id || !patient?.id) return;
      setLoading(true);
      await createAppointment({ doctorId: doctor.id, patientId: patient.id, date: new Date(selectedSlot).toISOString() });
      alert("✅ Cita creada correctamente");
      onClose();
    } catch (error) { console.error(error); alert("Error al crear cita"); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={{ borderRadius: "16px", padding: "28px" }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: "1.1rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            📅 Agendar cita
          </DialogTitle>
        </DialogHeader>

        {/* Resumen */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "4px" }}>
          {[
            { icon: "🧑", label: "Paciente", value: `${patient.name} ${patient.lastnames}` },
            { icon: "👨‍⚕️", label: "Médico", value: `Dr. ${doctor.name} ${doctor.lastnames}` },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              background: "var(--pz-green-light)", borderRadius: "10px",
              padding: "12px 16px", border: "1px solid #a7d9c8",
            }}>
              <div style={{ fontSize: "0.78rem", color: "var(--pz-text-soft)", fontWeight: 600, marginBottom: "3px" }}>{icon} {label}</div>
              <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{value}</div>
            </div>
          ))}
        </div>

        {loading && availableDates.length === 0 && (
          <div className="pz-loading">Buscando horarios disponibles...</div>
        )}
        {!loading && availableDates.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--pz-text-soft)" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📅</div>
            <p style={{ fontWeight: 600 }}>No hay horarios disponibles para los próximos 12 días</p>
          </div>
        )}

        {availableDates.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginTop: "8px" }}>
            <div>
              <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem" }}>1. Seleccione una fecha:</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(115px, 1fr))", gap: "8px" }}>
                {availableDates.map((item) => (
                  <button key={item.date} className={`pz-date-btn${selectedDate === item.date ? " selected" : ""}`}
                    onClick={() => { setSelectedDate(item.date); setSelectedSlot(""); }}>
                    {new Date(item.date).toLocaleDateString("es-CO", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "short" })}
                  </button>
                ))}
              </div>
            </div>
            {selectedDate && (
              <div>
                <p style={{ fontWeight: 700, marginBottom: "10px", fontSize: "0.95rem" }}>2. Seleccione la hora:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: "8px" }}>
                  {currentSlots.map((slot) => (
                    <button key={slot} className={`pz-slot-btn${selectedSlot === slot ? " selected" : ""}`}
                      onClick={() => setSelectedSlot(slot)}>
                      {new Date(slot).toLocaleTimeString("es-CO", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false })}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px", borderTop: "1px solid var(--pz-border)" }}>
              <button onClick={onClose} className="pz-btn-outline">Cancelar</button>
              <button disabled={!selectedSlot || loading} onClick={handleSchedule} className="pz-btn-primary"
                style={{ opacity: (!selectedSlot || loading) ? 0.6 : 1 }}>
                {loading ? "⏳ Guardando..." : "✓ Confirmar cita"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
