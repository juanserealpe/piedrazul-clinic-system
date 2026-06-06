"use client";
import { useState } from "react";
import { createUnavailabilityRequest } from "@/services/schedule.service";
import { getApiErrorMessage } from "@/lib/api-errors";

// Colombia es UTC-5. El usuario ingresa hora local → la convertimos a UTC
function localToUtcIso(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return "";
  // El usuario ingresa hora Colombia (UTC-5), sumamos 5h para ir a UTC
  const [year, month, day]   = dateStr.split("-").map(Number);
  const [hour, minute]       = timeStr.split(":").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour + 5, minute, 0, 0);
  return new Date(utcMs).toISOString();
}

export default function GenerateUnavailabilityButton() {
  const [open,      setOpen]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [endTime,   setEndTime]   = useState("");
  const [reason,    setReason]    = useState("");
  const [errorMsg,  setErrorMsg]  = useState("");
  const [successMsg,setSuccessMsg]= useState("");

  const handleClose = () => {
    setOpen(false);
    setStartDate(""); setStartTime(""); setEndDate(""); setEndTime("");
    setReason(""); setErrorMsg(""); setSuccessMsg("");
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    // Validaciones locales
    if (!startDate || !startTime) { setErrorMsg("Ingrese la fecha y hora de inicio."); return; }
    if (!endDate   || !endTime)   { setErrorMsg("Ingrese la fecha y hora de fin."); return; }
    if (!reason.trim())            { setErrorMsg("Ingrese el motivo de la incapacidad."); return; }

    const startUtc = localToUtcIso(startDate, startTime);
    const endUtc   = localToUtcIso(endDate,   endTime);

    if (new Date(endUtc) <= new Date(startUtc)) {
      setErrorMsg("La fecha/hora de fin debe ser posterior a la de inicio.");
      return;
    }

    try {
      setLoading(true);
      await createUnavailabilityRequest({
        startDate: startUtc,
        endDate:   endUtc,
        reason:    reason.trim(),
      });
      setSuccessMsg("Incapacidad registrada correctamente.");
      setTimeout(handleClose, 1800);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Fecha mínima: hoy
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <button onClick={() => setOpen(true)} className="pz-btn-outline" style={{ marginTop: "8px" }}>
        Registrar incapacidad
      </button>

      {open && (
        <div className="pz-overlay">
          <div className="pz-modal" style={{ maxWidth: "480px" }}>
            {/* Encabezado */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
              <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--pz-green)" }}>
                Registrar Incapacidad
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: "var(--pz-sand)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Cerrar
              </button>
            </div>

            {/* Mensajes */}
            {errorMsg   && <div className="pz-error"   style={{ marginBottom: "14px" }}>⚠️ {errorMsg}</div>}
            {successMsg && <div className="pz-success"  style={{ marginBottom: "14px" }}>{successMsg}</div>}

            <p style={{
              fontSize: "0.82rem",
              color: "var(--pz-text-soft)",
              marginBottom: "16px",
              background: "var(--pz-green-light)",
              borderRadius: "8px",
              padding: "8px 12px",
            }}>
              ℹIngrese las horas en <strong>hora Colombia (hora local)</strong>. El sistema las convertirá automáticamente.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label className="pz-label">Fecha inicio</label>
                <input
                  className="pz-input"
                  type="date"
                  min={todayStr}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="pz-label">Hora inicio (Colombia)</label>
                <input
                  className="pz-input"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="pz-label">Fecha fin</label>
                <input
                  className="pz-input"
                  type="date"
                  min={startDate || todayStr}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="pz-label">Hora fin (Colombia)</label>
                <input
                  className="pz-input"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="pz-label">Motivo *</label>
                <textarea
                  className="pz-input"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  placeholder="Describa el motivo de la incapacidad..."
                  style={{ height: "auto", resize: "vertical" }}
                />
              </div>
            </div>

            {/* Acciones */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "20px",
            }}>
              <button onClick={handleClose} className="pz-btn-outline">Cancelar</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="pz-btn-primary"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}