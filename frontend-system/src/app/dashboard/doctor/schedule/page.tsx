import DoctorSchedulesList from "@/src/components/schedules/DoctorSchedulesList";
import WeeklyScheduleForm from "@/src/components/schedules/WeeklyScheduleForm";
import GenerateUnavailabilityButton from "@/src/components/ui/GenerateUnavailabilityButton";


export default function DoctorSchedulePage() {

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">

          Gestión de Horarios

        </h1>

        <p className="text-muted-foreground">

          Configura tus horarios semanales

        </p>
      <GenerateUnavailabilityButton/>

      </div>
      <WeeklyScheduleForm />
      <DoctorSchedulesList />
    </div>
  );
}