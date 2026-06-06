"use client";

import { useEffect, useState } from "react";
import AppointmentToolbar from "@/components/appointments/AppointmentToolbar";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentTable from "@/components/appointments/AppointmentTable";
import AppointmentNotifications from "@/components/appointments/AppointmentNotifications";
import { getTodayUtc } from "@/lib/date";
import { getAppointments } from "@/services/appointment.service";
import { AppointmentsResponse } from "@/types/appointment";

export default function AppointmentsPage() {
  const [date, setDate] = useState(getTodayUtc());
  const [data, setData] = useState<AppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments(date);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAppointments(); }, [date]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* HEADER — responsive flex con campana */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            fontWeight: 700,
            margin: 0,
            color: "var(--pz-text)",
          }}>
            Gestión de Citas
          </h1>
          <p style={{ color: "var(--pz-text-soft)", margin: "4px 0 0" }}>
            Administra las citas médicas del día
          </p>
        </div>

        {/* Campana de notificaciones restaurada */}
        <AppointmentNotifications />
      </div>

      {/* BOTONES */}
      <AppointmentToolbar onCreated={loadAppointments} />

      {/* FILTRO FECHA */}
      <AppointmentFilters date={date} setDate={setDate} />

      {/* TABLA */}
      <AppointmentTable data={data} loading={loading} />
    </div>
  );
}