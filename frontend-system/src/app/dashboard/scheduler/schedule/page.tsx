import DoctorsScheduleTable
from "@/src/components/schedules/DoctorsScheduleTable";

export default function SchedulePage() {

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">

          Gestión de Horarios de los Médicos

        </h1>

        <p className="text-muted-foreground">

          Administra horarios e incapacidades

        </p>

      </div>

      <DoctorsScheduleTable />

    </div>

  );
}