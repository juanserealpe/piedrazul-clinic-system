"use client";

import { Button } from "@/src/components/ui/button";

export default function AppointmentToolbar() {

  return (

    <div className="flex gap-2">

      <Button>
        Crear Cita
      </Button>

      <Button variant="outline">
        Exportar CSV
      </Button>

    </div>
  );
}