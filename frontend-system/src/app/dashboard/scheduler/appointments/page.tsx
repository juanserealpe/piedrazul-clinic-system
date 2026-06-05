"use client";
import { useState, useEffect } from "react";
import { getAllDoctorsRequest } from "@/services/auth.service";
import { getAppointments, exportAppointmentsCsv } from "@/services/appointment.service";
import PatientTable from "@/components/appointments/PattientTable";
import DoctorsSelectModal from "@/components/appointments/DoctorSelectModal";
import AppointmentSchedulerModal from "@/components/appointments/AppointmentSchedulerModal";
import ReagendarModal from "@/components/appointments/ReagendarModal";
import AppointmentNotifications from "@/components/appointments/AppointmentNotifications";
import { getApiErrorMessage } from "@/lib/api-errors";

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED:          "Programada",
  PENDING_RESCHEDULE: "Por reagendar",
  RESCHEDULED:        "Reagendada",
  COMPLETED:          "Completada",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:          "pz-badge-green",
  PENDING_RESCHEDULE: "pz-badge-amber",
  RESCHEDULED:        "pz-badge-green",
  COMPLETED:          "pz-badge-green",
};

export default function SchedulerAppointmentsPage() {
  const [tab,              setTab]              = useState<"ver" | "crear">("ver");
  const [doctors,          setDoctors]          = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [filterDate,       setFilterDate]       = useState(new Date().toISOString().split("T")[0]);
  const [appointments,     setAppointments]     = useState<any[]>([]);
  const [loadingCitas,     setLoadingCitas]     = useState(false);
  const [count,            setCount]            = useState(0);
  const [selectedPatient,  setSelectedPatient]  = useState<any>(null);
  const [selectedDoctor,   setSelectedDoctor]   = useState<any>(null);
  const [openDoctors,      setOpenDoctors]      = useState(false);
  const [openScheduler,    setOpenScheduler]    = useState(false);
  const [exporting,        setExporting]        = useState(false);
  const [errorMsg,         setErrorMsg]         = useState("");

  // ISO string — no string formateado (evita Invalid Date en el modal)
  const [reagendarData, setReagendarData] = useState<{
    id:      string;
    fechaIso: string;
  } | null>(null);

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try {
      const res = await getAllDoctorsRequest();
      setDoctors(res);
      if (res.length > 0) setSelectedDoctorId(res[0].id);
    } catch (e) { setErrorMsg(getApiErrorMessage(e)); }
  };

  const loadCitas = async () => {
    if (!selectedDoctorId || !filterDate) return;
    setErrorMsg("");
    try {
      setLoadingCitas(true);
      const res = await getAppointments(`${filterDate}T00:00:00.000Z`, selectedDoctorId);
      setAppointments(res.appointments || []);
      setCount(res.count || 0);
    } catch (e) { setErrorMsg(getApiErrorMessage(e)); setAppointments([]); }
    finally { setLoadingCitas(false); }
  };

  const handleExport = async () => {
    setErrorMsg("");
    try {
      setExporting(true);
      const blob = await exportAppointmentsCsv(`${filterDate}T00:00:00.000Z`, selectedDoctorId);
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `citas-${filterDate}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { setErrorMsg(getApiErrorMessage(e)); }
    finally { setExporting(false); }
  };

  // Sin async y sin parámetros — coincide con onConfirm?: () => void
  const handleConfirmReagendar = () => {
    setReagendarData(null);
    loadCitas();
  };

  const doctorName = (id: string) => {
    const d = doctors.find(d => d.id === id);
    return d ? `Dr. ${d.name} ${d.lastnames}` : id;
  };

  return (
    <div>
      {/* Header con campana */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "28px", paddingBottom: "20px", borderBottom: "2px solid var(--pz-border)" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", color: "var(--pz-green)", margin: "0 0 4px" }}>Gestión de Citas</h1>
          <p style={{ color: "var(--pz-text-soft)", margin: 0 }}>Administre y agende citas médicas</p>
        </div>
        <AppointmentNotifications />
      </div>

      {errorMsg && <div className="pz-error" style={{ marginBottom: "16px" }}>⚠️ {errorMsg}</div>}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[{ key: "ver", label: "Ver Citas" }, { key: "crear", label: "+ Crear Cita" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: "10px 22px", borderRadius: "8px",
            border:     tab === t.key ? "2px solid var(--pz-green)" : "2px solid var(--pz-border)",
            background: tab === t.key ? "var(--pz-green)" : "var(--pz-white)",
            color:      tab === t.key ? "#fff" : "var(--pz-text-mid)",
            fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab: Ver citas */}
      {tab === "ver" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="pz-card" style={{ padding: "20px 24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>Filtrar Citas</h3>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label className="pz-label">Médico</label>
                <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}
                  className="pz-input" style={{ minWidth: "220px", cursor: "pointer" }}>
                  <option value="">-- Seleccionar médico --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} {d.lastnames}</option>)}
                </select>
              </div>
              <div>
                <label className="pz-label">Fecha</label>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                  className="pz-input" style={{ width: "180px" }} />
              </div>
              <button onClick={loadCitas} className="pz-btn-primary" style={{ marginBottom: "2px" }}>Buscar</button>
              {appointments.length > 0 && (
                <button onClick={handleExport} disabled={exporting} className="pz-btn-outline"
                  style={{ marginBottom: "2px", opacity: exporting ? 0.6 : 1 }}>
                  {exporting ? "Exportando..." : "⬇ Exportar CSV"}
                </button>
              )}
            </div>
          </div>

          {loadingCitas && <div className="pz-loading">Buscando citas...</div>}

          {!loadingCitas && appointments.length === 0 && selectedDoctorId && (
            <div className="pz-card">
              <div className="pz-empty">
                <div className="pz-empty-icon">📋</div>
                <p style={{ fontWeight: 600 }}>No hay citas para esta fecha y médico</p>
                <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>Seleccione otro médico o fecha y haga clic en Buscar.</p>
              </div>
            </div>
          )}

          {!loadingCitas && appointments.length > 0 && (
            <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)" }}>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>
                  Citas del {new Date(filterDate + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                </h3>
                <p style={{ margin: "4px 0 0", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
                  {doctorName(selectedDoctorId)} — Total: <strong>{count}</strong> citas
                </p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="pz-table">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th style={{ textAlign: "center" }}>Estado</th>
                      <th style={{ textAlign: "center" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt.appointmentId}>
                        <td>
                          <span style={{ background: "var(--pz-green-light)", color: "var(--pz-green)", fontWeight: 700, padding: "4px 12px", borderRadius: "999px", fontSize: "0.9rem", fontFamily: "monospace" }}>
                            🕐 {new Date(apt.date).toLocaleTimeString("es-CO", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false })}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{apt.patientId}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`pz-badge ${STATUS_COLORS[apt.status] ?? "pz-badge-green"}`}>
                            {STATUS_LABELS[apt.status] ?? apt.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => setReagendarData({
                              id:       apt.appointmentId,
                              fechaIso: apt.date,           // ISO string, no formateado
                            })}
                            style={{ background: "var(--pz-amber-light)", color: "var(--pz-amber)", border: "2px solid #f6d87a", borderRadius: "8px", padding: "7px 14px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
                          >
                            Reagendar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Crear cita */}
      {tab === "crear" && (
        <div>
          <PatientTable onCreateAppointment={patient => { setSelectedPatient(patient); setOpenDoctors(true); }} />
          <DoctorsSelectModal open={openDoctors} onClose={() => setOpenDoctors(false)} doctors={doctors}
            onSelect={doctor => { setSelectedDoctor(doctor); setOpenDoctors(false); setOpenScheduler(true); }} />
          {selectedDoctor && selectedPatient && (
            <AppointmentSchedulerModal open={openScheduler} onClose={() => setOpenScheduler(false)}
              doctor={selectedDoctor} patient={selectedPatient} />
          )}
        </div>
      )}

      {/* Modal reagendar */}
      {reagendarData && (
        <ReagendarModal
          appointmentId={reagendarData.id}
          fechaAnterior={reagendarData.fechaIso}   // ISO string → modal lo formatea
          onClose={() => setReagendarData(null)}
          onConfirm={handleConfirmReagendar}        // () => void — sin async, sin parámetros
        />
      )}
    </div>
  );
}