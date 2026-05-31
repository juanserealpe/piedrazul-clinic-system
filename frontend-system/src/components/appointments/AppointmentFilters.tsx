interface Props {
  date: string;
  setDate: (value: string) => void;
}

export default function AppointmentFilters({
  date,
  setDate,
}: Props) {

  const handleChange = (
    value: string
  ) => {

    const utcDate =
      `${value}T00:00:00.000Z`;

    setDate(utcDate);
  };

  return (

    <div className="flex gap-4">

      <input
        type="date"
        value={date.split("T")[0]}
        onChange={(e) =>
          handleChange(
            e.target.value
          )
        }
        className="
          border
          rounded
          p-2
        "
      />

    </div>

  );
}