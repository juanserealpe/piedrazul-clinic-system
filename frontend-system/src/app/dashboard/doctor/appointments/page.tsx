"use client";

import { useEffect, useState } from "react";

import AppointmentToolbar
from "@/components/appointments/AppointmentToolbar";

import AppointmentFilters
from "@/components/appointments/AppointmentFilters";

import AppointmentTable
from "@/components/appointments/AppointmentTable";

import AppointmentNotifications
from "@/components/appointments/AppointmentNotifications";
import {
  getTodayUtc,
} from "@/lib/date";
import {
  getAppointments,
} from "@/services/appointment.service";

import {
  AppointmentsResponse,
} from "@/types/appointment";

export default function AppointmentsPage() {

  const [date, setDate] =
  useState(
    getTodayUtc()
  );

  const [data, setData] =
    useState<AppointmentsResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const loadAppointments =
    async () => {

      try {

        setLoading(true);

        const response =
          await getAppointments(date);

        setData(response);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };

  useEffect(() => {

    loadAppointments();

  }, [date]);

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div
        className="
        flex
        items-start
        justify-between
        gap-4
        "
      >

        <div>

          <h1 className="text-3xl font-bold">
            Gestión de Citas
          </h1>

          <p className="text-muted-foreground">
            Administra las citas médicas
          </p>

        </div>

        <AppointmentNotifications />

      </div>

      {/* BOTONES */}

      <AppointmentToolbar
        onCreated={loadAppointments}
      />

      {/* FILTRO FECHA */}

      <AppointmentFilters
        date={date}
        setDate={setDate}
      />

      {/* TABLA */}

      <AppointmentTable
        data={data}
        loading={loading}
      />

    </div>
  );
}