"use client";
interface Props {
  doctors: any[];
  onSchedule: (doctor: any) => void;
}

export default function DoctorsTable({ doctors, onSchedule }: Props) {
  if (doctors.length === 0) {
    return (
      <div className="pz-card">
        <div className="pz-empty">
          <div className="pz-empty-icon">👨‍⚕️</div>
          <p style={{ fontWeight: 600 }}>No hay médicos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>
          👨‍⚕️ Médicos Disponibles
        </h3>
        <p style={{ margin: "4px 0 0", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
          Seleccione un médico para agendar su cita
        </p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="pz-table">
          <thead>
            <tr>
              <th>Médico</th>
              <th>Identificación</th>
              <th style={{ textAlign: "center" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px",
                      background: "var(--pz-green-light)",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", flexShrink: 0,
                    }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>Dr. {doctor.name} {doctor.lastnames}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{doctor.id}</td>
                <td style={{ textAlign: "center" }}>
                  <button
                    onClick={() => onSchedule(doctor)}
                    className="pz-btn-primary"
                    style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                  >
                    Agendar cita
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
