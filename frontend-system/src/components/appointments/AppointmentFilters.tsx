interface Props {
  date: string;
  setDate: (value: string) => void;
}

export default function AppointmentFilters({ date, setDate }: Props) {
  const handleChange = (value: string) => {
    setDate(`${value}T00:00:00.000Z`);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      <div>
        <label className="pz-label" style={{ display: "block", marginBottom: "6px" }}>
          📅 Filtrar por fecha
        </label>
        <input
          type="date"
          value={date.split("T")[0]}
          onChange={(e) => handleChange(e.target.value)}
          className="pz-input"
          style={{ width: "200px" }}
        />
      </div>
    </div>
  );
}
