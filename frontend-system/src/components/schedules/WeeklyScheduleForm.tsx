"use client";

import { createSchedulesRequest } from "@/src/services/schedule.service";
import { useAuthStore } from "@/src/store/auth.store";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import { Card } from "../ui/card";



const DAYS = [

  {
    label: "Lunes",
    value: "MONDAY",
  },

  {
    label: "Martes",
    value: "TUESDAY",
  },

  {
    label: "Miércoles",
    value: "WEDNESDAY",
  },

  {
    label: "Jueves",
    value: "THURSDAY",
  },

  {
    label: "Viernes",
    value: "FRIDAY",
  },

  {
    label: "Sábado",
    value: "SATURDAY",
  },

  {
    label: "Domingo",
    value: "SUNDAY",
  },

];

export default function WeeklyScheduleForm() {

  const user = useAuthStore(
    (state) => state.user
  );

  const [loading, setLoading] =
    useState(false);

  const [schedules, setSchedules] =
    useState<any[]>([]);

  const addSchedule = () => {

    setSchedules([
      ...schedules,

      {
        day: "MONDAY",

        startHour: 8,

        endHour: 12,

        interval: 30,
      },
    ]);
  };

  const updateSchedule = (
    index: number,
    field: string,
    value: any
  ) => {

    const copy = [...schedules];

    copy[index][field] = value;

    setSchedules(copy);
  };

  const removeSchedule = (
    index: number
  ) => {

    const copy = schedules.filter(
      (_, i) => i !== index
    );

    setSchedules(copy);
  };

  const handleSubmit = async () => {

    try {

      setLoading(true);

      const payload = {

        schedules: schedules.map(
          (schedule) => ({

            doctorId: user?.id,

            ...schedule,

          })
        ),
      };

      console.log(payload);

      await createSchedulesRequest(
        payload
      );

      alert("Horarios guardados");

    } catch (err) {

      console.error(err);

      alert(
        "Error guardando horarios"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center">
  <h2 className="text-lg font-bold">
    Horarios
  </h2>

  <Button onClick={addSchedule}>
    + Agregar bloque de horario
  </Button>
</div>

      {schedules.map(
        (schedule, index) => (

          <Card
            key={index}
            className="p-4 space-y-3"
          >

            {/* DÍA */}

            <div>

              <label className="text-sm">
                Día
              </label>

              <select
                value={schedule.day}

                onChange={(e) =>
                  updateSchedule(
                    index,
                    "day",
                    e.target.value
                  )
                }

                className="
                  w-full
                  border
                  rounded-md
                  p-2
                "
              >

                {DAYS.map((day) => (

                  <option
                    key={day.value}
                    value={day.value}
                  >
                    {day.label}
                  </option>

                ))}

              </select>

            </div>

            {/* HORA INICIO */}

            <div>

              <label className="text-sm">
                Hora inicio
              </label>

              <Input
                type="number"

                min={0}
                max={23}

                value={schedule.startHour}

                onChange={(e) =>
                  updateSchedule(
                    index,
                    "startHour",
                    Number(e.target.value)
                  )
                }
              />

            </div>

            {/* HORA FIN */}

            <div>

              <label className="text-sm">
                Hora fin
              </label>

              <Input
                type="number"

                min={1}
                max={24}

                value={schedule.endHour}

                onChange={(e) =>
                  updateSchedule(
                    index,
                    "endHour",
                    Number(e.target.value)
                  )
                }
              />

            </div>

            {/* INTERVALO */}

            <div>

              <label className="text-sm">
                Intervalo (min)
              </label>

              <Input
                type="number"

                min={1}

                value={schedule.interval}

                onChange={(e) =>
                  updateSchedule(
                    index,
                    "interval",
                    Number(e.target.value)
                  )
                }
              />

            </div>

            <Button
              onClick={() =>
                removeSchedule(index)
              }
            >
              Eliminar
            </Button>

          </Card>

        )
      )}

      {
        schedules.length > 0 && (

          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {
              loading
                ? "Guardando..."
                : "Guardar horarios"
            }
          </Button>

        )
      }

    </div>
  );
}