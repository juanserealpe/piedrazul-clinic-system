"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { getPendingAppointmentsToReschedule } from "@/src/services/appointment.service";
import ReagendarModal from "./ReagendarModal";

export default function AppointmentNotifications() {
  const [open, setOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [modalData, setModalData] = useState<{ id: string; fecha: string } | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 12);

      const response = await getPendingAppointmentsToReschedule(
        start.toISOString(),
        end.toISOString()
      );

      console.log("Notifications response:", response);
      setAppointments(response?.appointments || []);
    } catch (error) {
      console.error(error);
      setAppointments([]);
    }
  };

  const formatDate = (dateStr: string) => {
    const hour = parseInt(dateStr.slice(11, 13));
    const minutes = dateStr.slice(14, 16);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${dateStr.slice(0, 10)} ${hour12}:${minutes} ${period}`;
  };

  const handleReagendar = (appointmentId: string, date: string) => {
    setModalData({ id: appointmentId, fecha: formatDate(date) });
    setOpen(false);
  };

  const handleConfirm = (appointmentId: string, newDate: string) => {
    // TODO: llamar a tu servicio de reagendamiento aquí
    console.log("Reagendando:", appointmentId, "→", newDate);
    setModalData(null);
  };

  return (
    <>
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="relative">
          <Bell size={22} />
          {appointments.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {appointments.length}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50">
            <div className="p-3 border-b">
              <h3 className="font-semibold">Citas próximas a reprogramar</h3>
            </div>
            <div className="max-h-96 overflow-auto">
              {appointments.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">No hay notificaciones</p>
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
                        onClick={() => handleReagendar(appointment.appointmentId, appointment.date)}
                        className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                      >
                        Reagendar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {modalData && (
        <ReagendarModal
          appointmentId={modalData.id}
          fechaAnterior={modalData.fecha}
          onClose={() => setModalData(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
