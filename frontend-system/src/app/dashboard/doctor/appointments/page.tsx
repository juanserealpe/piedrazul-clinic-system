"use client";

import { useEffect, useState } from "react";

import AppointmentFilters from "@/src/components/appointments/AppointmentFilters";
import AppointmentTable from "@/src/components/appointments/AppointmentTable";
import AppointmentNotifications from "@/src/components/appointments/AppointmentNotifications";

import { getTodayUtc } from "@/src/lib/date";
import { getAppointments } from "@/src/services/appointment.service";

import { AppointmentsResponse } from "@/src/types/appointment";

import { getAllDoctorsRequest } from "@/src/services/auth.service";

import AppointmentSchedulerModal from "@/src/components/appointments/AppointmentSchedulerModal";
import DoctorsSelectModal from "@/src/components/appointments/DoctorSelectModal";
import PatientTable from "@/src/components/appointments/PattientTable";

export default function AppointmentsPage() {

  // =========================
  // 📊 LISTA DE CITAS
  // =========================
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

  useEffect(() => {
    loadAppointments();
  }, [date]);

  // =========================
  // 👨‍⚕️ FLUJO CREAR CITA
  // =========================
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  const [openDoctors, setOpenDoctors] = useState(false);
  const [openScheduler, setOpenScheduler] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await getAllDoctorsRequest();
      setDoctors(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateAppointment = (patient: any) => {
    setSelectedPatient(patient);
    setOpenDoctors(true);
  };

  const handleSelectDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    setOpenDoctors(false);
    setOpenScheduler(true);
  };

  return (
    <div className="space-y-10">

      {/* ========================= */}
      {/* 📊 SECCIÓN: CITAS DEL DÍA */}
      {/* ========================= */}
      <section className="space-y-4">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Agenda de Citas Médicas
            </h1>

            <p className="text-muted-foreground">
              Consulta y gestión de citas programadas por fecha
            </p>
          </div>

          <AppointmentNotifications />
        </div>

        <AppointmentFilters date={date} setDate={setDate} />

        <AppointmentTable data={data} loading={loading} />

      </section>

      {/* ========================= */}
      {/* 👤 SECCIÓN: CREAR CITA */}
      {/* ========================= */}
      <section className="space-y-4 border-t pt-8">

        <div>
          <h2 className="text-2xl font-semibold">
            Programación de nuevas citas
          </h2>

          <p className="text-muted-foreground">
            Selecciona un paciente, médico y horario disponible
          </p>
        </div>

        <PatientTable onCreateAppointment={handleCreateAppointment} />

      </section>

      {/* ========================= */}
      {/* MODALES */}
      {/* ========================= */}

      <DoctorsSelectModal
        open={openDoctors}
        onClose={() => setOpenDoctors(false)}
        doctors={doctors}
        onSelect={handleSelectDoctor}
      />

      {selectedDoctor && selectedPatient && (
        <AppointmentSchedulerModal
          open={openScheduler}
          onClose={() => setOpenScheduler(false)}
          doctor={selectedDoctor}
          patient={selectedPatient}
        />
      )}

    </div>
  );
}