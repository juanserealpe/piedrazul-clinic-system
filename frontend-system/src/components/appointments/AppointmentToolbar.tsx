"use client";
import { useState } from "react";
import CreateAppointmentModal from "../ui/CreateAppointmentModal";
import ExportAppointmentsModal from "../ui/ExportAppointmentsModal";

interface Props { onCreated?: () => void; }

export default function AppointmentToolbar({ onCreated }: Props) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openExport, setOpenExport] = useState(false);

  return (
    <>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button onClick={() => setOpenCreate(true)} className="pz-btn-primary">
          ＋ Crear nueva cita
        </button>
        <button onClick={() => setOpenExport(true)} className="pz-btn-outline">
          ⬇ Exportar a CSV
        </button>
      </div>
      <CreateAppointmentModal open={openCreate} onClose={() => setOpenCreate(false)} onCreated={onCreated} />
      <ExportAppointmentsModal open={openExport} onClose={() => setOpenExport(false)} />
    </>
  );
}
