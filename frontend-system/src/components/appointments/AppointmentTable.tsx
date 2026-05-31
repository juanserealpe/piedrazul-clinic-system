"use client";

import { Card }
from "@/src/components/ui/card";

import {
  AppointmentsResponse,
} from "@/src/types/appointment";

interface Props {
  data: AppointmentsResponse | null;
  loading: boolean;
}

export default function AppointmentTable({
  data,
  loading,
}: Props) {

  if (loading) {

    return (

      <Card className="p-4">

        Cargando citas...

      </Card>

    );
  }

  if (
    !data ||
    data.count === 0
  ) {

    return (

      <Card className="p-4">

        <p className="text-red-500 font-medium">

          No hay citas para esta fecha

        </p>

      </Card>

    );
  }

  return (

    <Card className="p-4">

      <div className="mb-4">

        <h2 className="font-semibold">
          Citas para{" "}
          {new Date(data.date).toLocaleDateString(
            "es-CO",
            {
              timeZone: "UTC",
            }
          )}
        </h2>

        <p className="text-sm text-muted-foreground">

          Total citas:
          {" "}
          {data.count}

        </p>

      </div>

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="p-2 text-left">
              Hora
            </th>

            <th className="p-2 text-left">
              Paciente
            </th>

            <th className="p-2 text-left">
              Acción
            </th>

          </tr>

        </thead>

        <tbody>

          {data.appointments.map(
            (appointment) => (

              <tr
                key={
                  appointment.appointmentId
                }
                className="border-b"
              >

                <td className="p-2">
                {new Date(appointment.date)
                .toLocaleTimeString(
                  "es-CO",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  }
                )}
              </td>

                <td className="p-2">

                  {appointment.patientId}

                </td>

                <td className="p-2">

                  <button
                    className="
                    text-blue-600
                    hover:underline
                    "
                  >
                    Ver
                  </button>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </Card>

  );
}