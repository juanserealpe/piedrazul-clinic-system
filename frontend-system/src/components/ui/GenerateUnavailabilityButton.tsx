"use client";
import { useState } from "react";
import { createUnavailabilityRequest } from "@/services/schedule.service";
import { showSuccess, showError } from "@/lib/notifications";

export default function GenerateUnavailabilityButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createUnavailabilityRequest({
        startDate: `${startDate}T${startTime}:00.000Z`,
        endDate: `${endDate}T${endTime}:00.000Z`,
        reason,
      });
      showSuccess("Incapacidad registrada correctamente");
      setOpen(false);
      setStartDate(""); setStartTime(""); setEndDate(""); setEndTime(""); setReason("");
    } catch (error) { console.error(error); showError("Error registrando incapacidad"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="pz-btn-outline" style={{ marginTop: "8px" }}>
        Registrar incapacidad
      </button>

      {open && (
        <div className="pz-overlay">
          <div className="pz-modal" style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                Registrar Incapacidad
              </h2>
              <button onClick={() => setOpen(false)} style={{ background: "var(--pz-sand)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }}>Cerrar</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label className="pz-label">Fecha inicio</label>
                <input className="pz-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="pz-label">Hora inicio</label>
                <input className="pz-input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="pz-label">Fecha fin</label>
                <input className="pz-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="pz-label">Hora fin</label>
                <input className="pz-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="pz-label">Motivo de la incapacidad</label>
                <textarea
                  className="pz-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Describa el motivo..."
                  style={{ height: "auto", resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button onClick={() => setOpen(false)} className="pz-btn-outline">Cancelar</button>
              <button onClick={handleSubmit} disabled={loading} className="pz-btn-primary" style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
