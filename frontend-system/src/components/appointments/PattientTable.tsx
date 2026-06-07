"use client";
import { useEffect, useState } from "react";
import { getAllPatientsRequest } from "@/services/auth.service";

interface Patient {
  id: string;
  name: string;
  lastnames: string;
}

interface Props {
  onCreateAppointment: (patient: Patient) => void;
  // Prop opcional para filtrar desde el padre por nombre o documento
  searchQuery?: string;
}

export default function PatientTable({ onCreateAppointment, searchQuery = "" }: Props) {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllPatientsRequest();
      setPatients(response);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de pacientes. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por nombre completo o por numero de documento segun lo que escriba el usuario
  const term = searchQuery.toLowerCase().trim();
  const filtered = term
    ? patients.filter(
        (p) =>
          p.id.toLowerCase().includes(term) ||
          `${p.name} ${p.lastnames}`.toLowerCase().includes(term)
      )
    : patients;

  if (loading) {
    return <div className="pz-loading">Cargando pacientes...</div>;
  }

  if (error) {
    return (
      <div className="pz-card">
        <div className="pz-error">{error}</div>
        <button
          onClick={loadPatients}
          className="pz-btn-outline"
          style={{ marginTop: "12px" }}
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const handleSearch = async () => {
  try {
    if (!searchId.trim()) return;

    setSearching(true);
    setSearchResult(null);

    const result = await getPatientByIdRequest(searchId);

    setSearchResult(result);
  } catch (error) {
    console.error(error);
    setSearchResult(null);
  } finally {
    setSearching(false);
  }
};

const clearSearch = () => {
  setSearchId("");
  setSearchResult(null);
};

  return (
    <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--pz-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--pz-green)",
            }}
          >
            Pacientes Registrados
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--pz-text-soft)",
              fontSize: "0.88rem",
            }}
          >
            {term
              ? `Se encontraron ${filtered.length} resultado(s) para "${searchQuery}"`
              : `Total: ${patients.length} pacientes`}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="pz-empty" style={{ padding: "32px 16px" }}>
          <p style={{ fontWeight: 600 }}>
            {term
              ? `No se encontro ningun paciente con "${searchQuery}"`
              : "No hay pacientes registrados"}
          </p>
          {term && (
            <p style={{ fontSize: "0.88rem", marginTop: "6px", color: "var(--pz-text-soft)" }}>
              Verifique el nombre o numero de cedula e intente nuevamente.
            </p>
          )}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="pz-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Numero de documento</th>
                <th style={{ textAlign: "center" }}>Accion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          background: "var(--pz-sand)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--pz-green)",
                          flexShrink: 0,
                        }}
                      >
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        {patient.name} {patient.lastnames}
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                      color: "var(--pz-text-mid)",
                    }}
                  >
                    {patient.id}
                  </td>
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
      )}
    </div>
  );
}