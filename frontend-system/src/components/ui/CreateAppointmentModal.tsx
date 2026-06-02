"use client";
import { useState } from "react";
import { createAppointment } from "@/services/appointment.service";
import { showSuccess, showError } from "@/lib/notifications";

interface Props { open: boolean; onClose: () => void; onCreated?: () => void; }

export default function CreateAppointmentModal({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createAppointment({ doctorId, patientId, date: new Date(date).toISOString() });
      showSuccess("Cita creada correctamente");
      onCreated?.();
      onClose();
    } catch (error) { console.error(error); showError("Error al crear la cita"); }
    finally { setLoading(false); }
  };

  return (
    <div className="pz-overlay">
      <div className="pz-modal" style={{ maxWidth: "480px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            Crear Nueva Cita
          </h2>
          <button onClick={onClose} style={{ background: "var(--pz-sand)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }}>Cerrar</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label className="pz-label">ID del Paciente</label>
            <input className="pz-input" placeholder="Número de cédula del paciente" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
          </div>
          <div>
            <label className="pz-label">Fecha y Hora de la Cita</label>
            <input className="pz-input" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
          <button onClick={onClose} className="pz-btn-outline">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="pz-btn-primary" style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? "Guardando..." : "Guardar cita"}
          </button>
        </div>
      </div>
    </div>
  );
}
