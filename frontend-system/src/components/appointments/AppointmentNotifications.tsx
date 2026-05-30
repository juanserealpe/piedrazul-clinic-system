"use client";

import { Bell } from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getPendingAppointmentsToReschedule,
} from "@/src/services/appointment.service";

export default function AppointmentNotifications() {

  const [open, setOpen] =
    useState(false);

  const [appointments, setAppointments] =
    useState<any[]>([]);

  useEffect(() => {

    loadNotifications();

  }, []);

  const loadNotifications =
    async () => {

      try {

        const start =
          new Date();

        const end =
          new Date();

        end.setDate(
          end.getDate() + 12
        );

        const response =
          await getPendingAppointmentsToReschedule(
            start.toISOString(),
            end.toISOString()
          );

        console.log(
          "Notifications response:",
          response
        );

        setAppointments(
          response?.appointments || []
        );

      } catch (error) {

        console.error(error);

        setAppointments([]);

      }
    };

  return (

    <div className="relative">

      <button
        onClick={() =>
          setOpen(!open)
        }
        className="relative"
      >

        <Bell size={22} />

        {appointments.length > 0 && (

          <span
            className="
            absolute
            -top-2
            -right-2
            bg-red-500
            text-white
            text-xs
            rounded-full
            w-5
            h-5
            flex
            items-center
            justify-center
            "
          >
            {appointments.length}
          </span>

        )}

      </button>

      {open && (

        <div
          className="
          absolute
          right-0
          mt-2
          w-96
          bg-white
          border
          rounded-lg
          shadow-lg
          z-50
          "
        >

          <div className="p-3 border-b">

            <h3 className="font-semibold">

              Citas próximas a reprogramar

            </h3>

          </div>

          <div className="max-h-96 overflow-auto">

            {appointments.length === 0 ? (

              <p className="p-3 text-sm text-muted-foreground">

                No hay notificaciones

              </p>

            ) : (

              appointments.map(
                (appointment) => (

                  <div
                    key={
                      appointment.appointmentId
                    }
                    className="
                    p-3
                    border-b
                    hover:bg-gray-50
                    "
                  >

                    <div className="font-medium">

                      Paciente:
                      {" "}
                      {appointment.patientId}

                    </div>

                    <div
                      className="
                      text-sm
                      text-gray-500
                      "
                    >

                      {
                        new Date(
                          appointment.date
                        ).toLocaleString(
                          "es-CO",
                          {
                            timeZone:
                              "America/Bogota",
                          }
                        )
                      }

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      )}

    </div>

  );
}