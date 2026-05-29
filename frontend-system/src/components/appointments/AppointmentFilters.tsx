interface Props {
  date: string;
  setDate: (value: string) => void;
}

export default function AppointmentFilters({
  date,
  setDate,
}: Props) {

  return (

    <div className="flex gap-4">

      <input
        type="date"
        value={date.split("T")[0]}
        onChange={(e) =>
          setDate(
            new Date(
              e.target.value
            ).toISOString()
          )
        }
        className="border rounded p-2"
      />

    </div>

  );
}