"use client";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { getPendingAppointmentsToReschedule } from "@/services/appointment.service";
import ReagendarModal from "./ReagendarModal";

interface ModalData {
  id: string;
  fecha: string;
}

export default function AppointmentNotifications() {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 12);

      const response = await getPendingAppointmentsToReschedule(
        start.toISOString(),
        end.toISOString()
      );

      setAppointments(response?.appointments || []);
    } catch (error) { console.error(error); setAppointments([]); }
  };

  const formatDate = (dateStr: string) => {
    const hour = parseInt(dateStr.slice(11, 13));
    const minutes = dateStr.slice(14, 16);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${dateStr.slice(0, 10)} ${hour12}:${minutes} ${period}`;
  };

  const handleReagendar = (appointment: any) => {
    setModalData({
      id: appointment.appointmentId,
      fecha: appointment.date,
    });
    setOpen(false);
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            position: "relative",
            background: appointments.length > 0 ? "var(--pz-amber-light)" : "var(--pz-green-light)",
            border: `2px solid ${appointments.length > 0 ? "#f6d87a" : "#a7d9c8"}`,
            borderRadius: "10px",
            padding: "9px 14px",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
            fontWeight: 600,
            color: appointments.length > 0 ? "var(--pz-amber)" : "var(--pz-green)",
            fontSize: "0.9rem",
          }}
        >
          <Bell size={18} />
          {appointments.length > 0 ? (
            <>
              <span>{appointments.length} alerta{appointments.length > 1 ? "s" : ""}</span>
              <span style={{
                background: "var(--pz-amber)",
                color: "white", borderRadius: "999px",
                width: "20px", height: "20px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.72rem", fontWeight: 700,
              }}>{appointments.length}</span>
            </>
          ) : (
            <span>Sin alertas</span>
          )}
        </button>

        {open && (
          <div className="pz-notif-panel" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 50 }}>
            <div style={{ padding: "14px 16px", borderBottom: "2px solid var(--pz-border)", background: "var(--pz-green-light)" }}>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--pz-green)" }}>
                🔔 Citas por reagendar
              </h3>
            </div>
            <div className="max-h-96 overflow-auto">
              {appointments.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  No hay notificaciones
                </p>
              ) : (
                appointments.map((appointment) => (
                  <div
                    key={appointment.appointmentId}
                    className="p-3 border-b hover:bg-gray-50"
                  >
                    <div className="font-medium">
                      Paciente: {appointment.patientId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(appointment.date)}
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => handleReagendar(appointment)}
                        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                      >
                        Reagendar
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--pz-text-soft)", marginBottom: "8px" }}>
                    📅 {formatDate(appointment.date)}
                  </div>
                  <button
                    onClick={() => handleReagendar(appointment.appointmentId, appointment.date)}
                    className="pz-btn-primary"
                    style={{ padding: "7px 14px", fontSize: "0.82rem" }}
                  >
                    🔄 Reagendar
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {modalData && (
        <ReagendarModal
          appointmentId={modalData.id}
          fechaAnterior={modalData.fecha}
          onClose={() => setModalData(null)}
          onConfirm={() => {
            setModalData(null);
            loadNotifications();
          }}
        />
      )}
    </>
  );
}