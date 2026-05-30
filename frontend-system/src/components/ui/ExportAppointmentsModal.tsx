"use client";

import { useState } from "react";

import {
  exportAppointmentsCsv,
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
}

export default function ExportAppointmentsModal({
  open,
  onClose,
}: Props) {

  const [loading, setLoading] =
    useState(false);

  const [date, setDate] =
    useState("");

  if (!open) return null;

  const handleExport = async () => {

    try {

      setLoading(true);

      const file =
        await exportAppointmentsCsv(
          new Date(date).toISOString()
        );

      const url =
        window.URL.createObjectURL(file);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `citas-${date}.csv`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      onClose();

    } catch (error) {

      console.error(error);

      alert(
        "Error exportando citas"
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

      <Card className="w-full max-w-md p-6">

        <div className="flex justify-between mb-4">

          <h2 className="text-xl font-bold">

            Exportar Citas

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
              Seleccione fecha
            </label>

            <input
              type="date"
              className="
              w-full
              border
              rounded
              p-2
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
            onClick={handleExport}
            disabled={
              loading ||
              !date
            }
          >
            {
              loading
                ? "Exportando..."
                : "Confirmar"
            }
          </Button>

        </div>

      </Card>

    </div>
  );
}