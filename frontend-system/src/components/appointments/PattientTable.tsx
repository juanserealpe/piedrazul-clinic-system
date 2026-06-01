"use client";
import { useEffect, useState } from "react";
import { getAllPatientsRequest } from "@/services/auth.service";

interface Patient { id: string; name: string; lastnames: string; }
interface Props { onCreateAppointment: (patient: Patient) => void; }

export default function PatientTable({ onCreateAppointment }: Props) {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await getAllPatientsRequest();
      setPatients(response);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="pz-loading">Cargando pacientes...</div>;

  return (
    <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--pz-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--pz-green)" }}>🧑 Pacientes Registrados</h3>
          <p style={{ margin: "4px 0 0", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
            Total: <strong>{patients.length}</strong> pacientes
          </p>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="pz-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Documento</th>
              <th style={{ textAlign: "center" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", background: "var(--pz-sand)",
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", flexShrink: 0,
                    }}>🧑</div>
                    <div style={{ fontWeight: 700 }}>{patient.name} {patient.lastnames}</div>
                  </div>
                </td>
                <td style={{ fontFamily: "monospace", fontSize: "0.9rem", color: "var(--pz-text-mid)" }}>{patient.id}</td>
                <td style={{ textAlign: "center" }}>
                  <button
                    onClick={() => onCreateAppointment(patient)}
                    className="pz-btn-primary"
                    style={{ padding: "9px 18px", fontSize: "0.88rem" }}
                  >
                    Crear Cita
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
