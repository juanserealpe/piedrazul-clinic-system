"use client";

import { useState } from "react";

import {
  createAppointment,
} from "@/src/services/appointment.service";

import {
  Button,
} from "@/src/components/ui/button";

import {
  Card,
} from "@/src/components/ui/card";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateAppointmentModal({
  open,
  onClose,
  onCreated,
}: Props) {

  const [loading, setLoading] =
    useState(false);

  const [doctorId, setDoctorId] =
    useState("");

  const [patientId, setPatientId] =
    useState("");

  const [date, setDate] =
    useState("");

  if (!open) return null;

  const handleSubmit = async () => {

    try {

      setLoading(true);

      const appointmentDate = new Date(date);

        await createAppointment({
        doctorId,
        patientId,
        date: appointmentDate.toISOString(),
        });
        

      alert(
        "Cita creada correctamente"
      );

      onCreated?.();

      onClose();

    } catch (error) {

      console.error(error);

      alert(
        "Error al crear la cita"
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div
      className="
      fixed inset-0
      bg-black/40
      flex items-center
      justify-center
      z-50
      "
    >

      <Card className="w-full max-w-lg p-6">

        <div className="flex justify-between mb-4">

          <h2 className="text-xl font-bold">

            Crear Cita

          </h2>

          <button
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className="space-y-4">
          <div>

            <label>
              ID Paciente
            </label>

            <input
              className="
              w-full border rounded p-2
              "
              value={patientId}
              onChange={(e) =>
                setPatientId(
                  e.target.value
                )
              }
            />

          </div>

          <div>

            <label>
              Fecha y Hora
            </label>

            <input
              type="datetime-local"
              className="
              w-full border rounded p-2
              "
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        <div
          className="
          flex justify-end gap-2
          mt-6
          "
        >

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {
              loading
                ? "Guardando..."
                : "Guardar"
            }
          </Button>

        </div>

      </Card>

    </div>
  );
}