"use client";

import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { getDoctorSchedules } from "../../services/schedule.service";

const DAYS_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export default function DoctorSchedulesList() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);

      const data = await getDoctorSchedules();

      setSchedules(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const groupedSchedules = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = schedules.filter(
        (schedule) => schedule.day === day
      );

      return acc;
    },
    {} as Record<string, any[]>
  );

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour =
      hour % 12 === 0 ? 12 : hour % 12;

    return `${formattedHour}:00 ${period}`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p>Cargando horarios...</p>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="p-6 border-red-500">
        <p className="font-medium text-red-500">
          Usted no tiene horarios registrados
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="overflow-x-auto">
        <div
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    xl:grid-cols-7
    gap-4
  "
>
          {DAYS_ORDER.map((day) => (
            <div
              key={day}
              className="
                rounded-lg
                border
                bg-background
                overflow-hidden
              "
            >
              {/* Encabezado */}
              <div
                className="
                  bg-primary
                  text-primary-foreground
                  text-center
                  font-semibold
                  py-3
                "
              >
                {DAY_LABELS[day]}
              </div>

              {/* Contenido */}
              <div className="p-3 space-y-3 min-h-[250px]">
                {groupedSchedules[day].length === 0 ? (
                  <div
                    className="
                      text-sm
                      text-muted-foreground
                      text-center
                      py-6
                    "
                  >
                    Sin horarios
                  </div>
                ) : (
                  groupedSchedules[day].map(
                    (schedule, index) => (
                      <div
                        key={index}
                        className="
                          rounded-lg
                          border
                          bg-muted/40
                          p-3
                          shadow-sm
                        "
                      >
                        <div className="font-semibold">
                          Bloque
                        </div>

                        <div className="text-sm mt-1">
                          {formatHour(
                            schedule.startHour
                          )}
                          {" - "}
                          {formatHour(
                            schedule.endHour
                          )}
                        </div>

                        <div
                          className="
                            text-xs
                            text-muted-foreground
                            mt-2
                          "
                        >
                          Intervalo:{" "}
                          {schedule.interval} min
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}