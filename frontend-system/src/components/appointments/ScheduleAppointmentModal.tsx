"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import { Button } from "../../components/ui/button";

import {
  createAppointment,
} from "@/src/services/appointment.service";

import {
  getAvailableSlots,
} from "@/src/services/schedule.service";

interface AvailableDate {
  date: string;
  slots: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  doctor: any;
}

export default function ScheduleAppointmentModal({
  open,
  onClose,
  doctor,
}: Props) {

  const [loading, setLoading] =
    useState(false);

  const [availableDates,
    setAvailableDates] =
      useState<AvailableDate[]>([]);

  const [selectedDate,
    setSelectedDate] =
      useState("");

  const [selectedSlot,
    setSelectedSlot] =
      useState("");

  // ===========================
  // CARGAR FECHAS DISPONIBLES
  // ===========================

  useEffect(() => {

    if (!open || !doctor)
      return;

    loadAvailableDates();

  }, [open, doctor]);

  const loadAvailableDates =
    async () => {

      try {

        setLoading(true);

        setAvailableDates([]);

        setSelectedDate("");

        setSelectedSlot("");

        const promises = [];

        for (
          let i = 0;
          i < 12;
          i++
        ) {

          const date =
            new Date();

          date.setDate(
            date.getDate() + i
          );

          promises.push(
            getAvailableSlots(
              date.toISOString(),
              doctor.id
            )
          );
        }

        const results =
          await Promise.allSettled(
            promises
          );

        const available =
          results
            .filter(
              (result) =>
                result.status ===
                "fulfilled"
            )
            .map(
              (result: any) =>
                result.value
            )
            .filter(
              (item) =>
                item?.slots &&
                item.slots.length > 0
            );

        setAvailableDates(
          available
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };

  // ===========================
  // SLOTS DEL DÍA SELECCIONADO
  // ===========================

  const currentSlots =
    availableDates.find(
      (item) =>
        item.date ===
        selectedDate
    )?.slots || [];

  // ===========================
  // CREAR CITA
  // ===========================

  const handleSchedule =
    async () => {

      try {

        if (!selectedSlot)
          return;

        setLoading(true);

        await createAppointment({
          doctorId: doctor.id,
          patientId: "",
          date: selectedSlot,
        });

        alert(
          "Cita creada correctamente"
        );

        onClose();

      } catch (error) {

        console.error(error);

        alert(
          "Error al crear cita"
        );

      } finally {

        setLoading(false);

      }
    };

  // ===========================
  // UI
  // ===========================

  return (

    <Dialog
      open={open}
      onOpenChange={onClose}
    >

      <DialogContent className="max-w-2xl">

        <DialogHeader>

          <DialogTitle>

            Agendar con
            {" "}
            {doctor?.name}
            {" "}
            {doctor?.lastnames}

          </DialogTitle>

        </DialogHeader>

        {loading &&
          availableDates.length === 0 && (

            <div className="py-6 text-center">

              Cargando disponibilidad...

            </div>

          )}

        {!loading &&
          availableDates.length === 0 && (

            <div className="py-6 text-center text-muted-foreground">

              No hay horarios disponibles
              para los próximos 12 días.

            </div>

          )}

        {availableDates.length > 0 && (

          <div className="space-y-6">

            {/* FECHAS */}

            <div>

              <h3 className="font-semibold mb-3">

                Seleccione una fecha

              </h3>

              <div
                className="
                  grid
                  grid-cols-2
                  md:grid-cols-3
                  gap-2
                "
              >

                {availableDates.map(
                  (item) => (

                    <Button
                      key={item.date}
                      variant={
                        selectedDate ===
                        item.date
                          ? "default"
                          : "outline"
                      }
                      onClick={() => {

                        setSelectedDate(
                          item.date
                        );

                        setSelectedSlot(
                          ""
                        );

                      }}
                    >

                      {
                        new Date(
                          item.date
                        ).toLocaleDateString(
                          "es-CO",
                          {
                            weekday:
                              "short",
                            day: "2-digit",
                            month:
                              "2-digit",
                          }
                        )
                      }

                    </Button>

                  )
                )}

              </div>

            </div>

            {/* HORARIOS */}

            {selectedDate && (

              <div>

                <h3 className="font-semibold mb-3">

                  Seleccione una hora

                </h3>

                <div
                  className="
                    grid
                    grid-cols-2
                    md:grid-cols-4
                    gap-2
                  "
                >

                  {currentSlots.map(
                    (slot) => (

                      <Button
                        key={slot}
                        variant={
                          selectedSlot ===
                          slot
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setSelectedSlot(
                            slot
                          )
                        }
                      >

                        {
                          new Date(
                            slot
                          ).toLocaleTimeString(
                            "es-CO",
                            {
                              hour:
                                "2-digit",
                              minute:
                                "2-digit",
                            }
                          )
                        }

                      </Button>

                    )
                  )}

                </div>

              </div>

            )}

            {/* FOOTER */}

            <div className="flex justify-end gap-2">

              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>

              <Button
                disabled={
                  !selectedSlot ||
                  loading
                }
                onClick={
                  handleSchedule
                }
              >
                Confirmar cita
              </Button>

            </div>

          </div>

        )}

      </DialogContent>

    </Dialog>

  );
}