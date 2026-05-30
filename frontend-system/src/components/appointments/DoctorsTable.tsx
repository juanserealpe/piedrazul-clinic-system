"use client";

import { Button } from "../../components/ui/button";

interface Props {
  doctors: any[];
  onSchedule: (
    doctor: any
  ) => void;
}

export default function DoctorsTable({
  doctors,
  onSchedule,
}: Props) {

  return (

    <div className="overflow-x-auto">

      <table className="w-full border">

        <thead>

          <tr>

            <th className="p-3 border">
              ID
            </th>

            <th className="p-3 border">
              Nombre
            </th>

            <th className="p-3 border">
              Apellidos
            </th>

            <th className="p-3 border">
              Acción
            </th>

          </tr>

        </thead>

        <tbody>

          {doctors.map(
            (doctor) => (

              <tr
                key={doctor.id}
              >

                <td className="p-3 border">
                  {doctor.id}
                </td>

                <td className="p-3 border">
                  {doctor.name}
                </td>

                <td className="p-3 border">
                  {doctor.lastnames}
                </td>

                <td className="p-3 border">

                  <Button
                    onClick={() =>
                      onSchedule(
                        doctor
                      )
                    }
                  >
                    Agendar
                  </Button>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  );
}