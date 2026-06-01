"use client";

import { useState, useEffect } from "react";

import PatientTable from "@/components/appointments/PattientTable";
import DoctorsSelectModal from "../../../../components/appointments/DoctorSelectModal";
import AppointmentSchedulerModal from "@/components/appointments/AppointmentSchedulerModal";

import { getAllDoctorsRequest } from "@/services/auth.service";

export default function AppointmentsPage() {

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

  // 👇 AQUÍ YA NO SOLO LOG, AHORA ABRE FLUJO
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
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">Gestión de Citas</h1>
        <p className="text-muted-foreground">
          Administra las citas médicas
        </p>
      </div>

      <PatientTable onCreateAppointment={handleCreateAppointment} />

      {/* 👇 MODAL DOCTORES */}
      <DoctorsSelectModal
        open={openDoctors}
        onClose={() => setOpenDoctors(false)}
        doctors={doctors}
        onSelect={handleSelectDoctor}
      />

      {/* 👇 MODAL AGENDA */}
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