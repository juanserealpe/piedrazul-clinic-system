"use client";

import { getDoctorSchedules } from "../../services/schedule.service";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";



const DAYS_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: any = {

  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",

};

export default function DoctorSchedulesList() {

  const [loading, setLoading] =
    useState(true);

  const [schedules, setSchedules] =
    useState<any[]>([]);

  useEffect(() => {

    loadSchedules();

  }, []);

  const loadSchedules = async () => {

    try {

      setLoading(true);

      const data =
        await getDoctorSchedules();

      setSchedules(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  // AGRUPAR POR DÍA

  const groupedSchedules =
    DAYS_ORDER.reduce((acc, day) => {

      acc[day] = schedules.filter(
        (schedule) =>
          schedule.day === day
      );

      return acc;

    }, {} as Record<string, any[]>);

  if (loading) {

    return (
      <p>Cargando horarios...</p>
    );
  }

  // NO TIENE HORARIOS

  if (schedules.length === 0) {

    return (

      <Card className="p-4 border-red-500">

        <p className="text-red-500 font-medium">

          Usted no tiene horarios registrados

        </p>

      </Card>
    );
  }

  return (

    <div className="grid gap-4">

      {DAYS_ORDER.map((day) => {

        const daySchedules =
          groupedSchedules[day];

        return (

          <Card
            key={day}
            className="p-4 space-y-3"
          >

            <h2 className="text-xl font-bold">

              {DAY_LABELS[day]}

            </h2>

            {daySchedules.length === 0 ? (

              <p className="text-muted-foreground">

                Sin horarios

              </p>

            ) : (

              <div className="space-y-2">

                {daySchedules.map(
                  (schedule, index) => (

                    <div
                      key={index}

                      className="
                        flex
                        items-center
                        justify-between
                        border
                        rounded-md
                        p-3
                      "
                    >

                      <div>

                        <p className="font-medium">

                          {schedule.startHour}:00
                          {" - "}
                          {schedule.endHour}:00

                        </p>

                        <p
                          className="
                            text-sm
                            text-muted-foreground
                          "
                        >

                          Intervalo:
                          {" "}
                          {schedule.interval}
                          {" "}
                          min

                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </Card>
        );
      })}

    </div>
  );
}