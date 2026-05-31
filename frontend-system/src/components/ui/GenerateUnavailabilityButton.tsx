"use client";

import { useState } from "react";

import {
  createUnavailabilityRequest,
} from "../../services/schedule.service";

import { Button } from "../ui/button";
import { Card } from "../ui/card";


export default function GenerateUnavailabilityButton({
}) {

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [startDate, setStartDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [reason, setReason] =
    useState("");

  const handleSubmit = async () => {

  try {

    setLoading(true);

    const startUtc =
      `${startDate}T${startTime}:00.000Z`;

    const endUtc =
      `${endDate}T${endTime}:00.000Z`;

    console.log(
      "START UTC:",
      startUtc
    );

    console.log(
      "END UTC:",
      endUtc
    );

    await createUnavailabilityRequest(
      {
        startDate: startUtc,
        endDate: endUtc,
        reason,
      }
    );

    alert(
      "Incapacidad registrada"
    );

    setOpen(false);

    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setReason("");

  } catch (error) {

    console.error(error);

    alert(
      "Error registrando incapacidad"
    );

  } finally {

    setLoading(false);

  }
};

  return (

    <>

      <Button
        onClick={() =>
          setOpen(true)
        }
      >
        Generar incapacidad
      </Button>

      {open && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
          "
        >

          <Card
            className="
              w-full
              max-w-lg
              p-6
              space-y-4
            "
          >

            <h2
              className="
                text-xl
                font-bold
              "
            >
              Registrar incapacidad
            </h2>

            {/* FECHA INICIO */}

            <div>

              <label>
                Fecha inicio
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  rounded
                  p-2
                "
              />

            </div>

            {/* HORA INICIO */}

            <div>

              <label>
                Hora inicio
              </label>

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  rounded
                  p-2
                "
              />

            </div>

            {/* FECHA FIN */}

            <div>

              <label>
                Fecha fin
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  rounded
                  p-2
                "
              />

            </div>

            {/* HORA FIN */}

            <div>

              <label>
                Hora fin
              </label>

              <input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  rounded
                  p-2
                "
              />

            </div>

            {/* MOTIVO */}

            <div>

              <label>
                Motivo
              </label>

              <textarea
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value
                  )
                }
                className="
                  w-full
                  border
                  rounded
                  p-2
                "
                rows={4}
              />

            </div>

            <div
              className="
                flex
                justify-end
                gap-2
              "
            >

              <Button
                variant="outline"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancelar
              </Button>

              <Button
                disabled={loading}
                onClick={handleSubmit}
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

      )}

    </>

  );
}