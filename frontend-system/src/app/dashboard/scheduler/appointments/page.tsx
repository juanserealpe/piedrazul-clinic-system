"use client";

import PatientTable
from "@/src/components/appointments/PattientTable";

export default function AppointmentsPage() {

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Gestión de Citas
        </h1>

        <p className="text-muted-foreground">
          Administra las citas médicas
        </p>

      </div>

      <PatientTable />

    </div>

  );
}