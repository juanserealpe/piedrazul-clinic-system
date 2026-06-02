"use client";
import { useState } from "react";
import { exportAppointmentsCsv } from "@/services/appointment.service";
import { showError } from "@/lib/notifications";

interface Props { open: boolean; onClose: () => void; }

export default function ExportAppointmentsModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");

  if (!open) return null;

  const handleExport = async () => {
    try {
      setLoading(true);
      const file = await exportAppointmentsCsv(new Date(date).toISOString());
      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url; link.download = `citas-${date}.csv`;
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (error) { console.error(error); showError("Error exportando citas"); }
    finally { setLoading(false); }
  };

  return (
    <div className="pz-overlay">
      <div className="pz-modal" style={{ maxWidth: "420px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--pz-green)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            Exportar Citas a CSV
          </h2>
          <button onClick={onClose} style={{ background: "var(--pz-sand)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }}>Cerrar</button>
        </div>

        <div>
          <label className="pz-label">Seleccione la fecha a exportar</label>
          <input className="pz-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
          <button onClick={onClose} className="pz-btn-outline">Cancelar</button>
          <button onClick={handleExport} disabled={loading || !date} className="pz-btn-primary" style={{ opacity: (loading || !date) ? 0.6 : 1 }}>
            {loading ? "Exportando..." : "Descargar CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
