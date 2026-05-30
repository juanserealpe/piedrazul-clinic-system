"use client";

import {
  useEffect,
  useState,
} from "react";

import DoctorsTable
  from "@/src/components/appointments/DoctorsTable";

import ScheduleAppointmentModal
  from "@/src/components/appointments/ScheduleAppointmentModal";

import {
  getAllDoctorsRequest,
} from "@/src/services/auth.service";

export default function AppointmentsPage() {

  const [doctors, setDoctors] =
    useState<any[]>([]);

  const [selectedDoctor,
    setSelectedDoctor] =
      useState<any>(null);

  const [open,
    setOpen] =
      useState(false);

  useEffect(() => {

    loadDoctors();

  }, []);

  const loadDoctors =
    async () => {

      try {

        const response =
          await getAllDoctorsRequest();

        setDoctors(response);

      } catch (error) {

        console.error(error);

      }
    };

  return (

    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Gestión de citas
      </h1>

      <DoctorsTable
        doctors={doctors}
        onSchedule={(doctor) => {

          setSelectedDoctor(
            doctor
          );

          setOpen(true);

        }}
      />

      {selectedDoctor && (

        <ScheduleAppointmentModal
          open={open}
          doctor={
            selectedDoctor
          }
          onClose={() =>
            setOpen(false)
          }
        />

      )}

    </div>

  );
}