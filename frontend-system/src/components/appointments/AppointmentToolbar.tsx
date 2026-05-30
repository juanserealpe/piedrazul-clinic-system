"use client";

import { useState } from "react";

import {
  Button,
} from "@/src/components/ui/button";

import CreateAppointmentModal
from "../ui/CreateAppointmentModal";

import ExportAppointmentsModal
from "../ui/ExportAppointmentsModal";

interface Props {
  onCreated?: () => void;
}

export default function AppointmentToolbar({
  onCreated,
}: Props) {

  const [openCreate, setOpenCreate] =
    useState(false);

  const [openExport, setOpenExport] =
    useState(false);

  return (

    <>

      <div className="flex gap-2">

        <Button
          onClick={() =>
            setOpenCreate(true)
          }
        >
          Crear Cita
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            setOpenExport(true)
          }
        >
          Exportar CSV
        </Button>

      </div>

      <CreateAppointmentModal
        open={openCreate}
        onClose={() =>
          setOpenCreate(false)
        }
        onCreated={onCreated}
      />

      <ExportAppointmentsModal
        open={openExport}
        onClose={() =>
          setOpenExport(false)
        }
      />

    </>

  );
}