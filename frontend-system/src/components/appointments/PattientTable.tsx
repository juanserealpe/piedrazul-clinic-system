import { useState, useEffect } from "react";
import { getAllPatientsRequest } from "@/src/services/auth.service";
import { Button } from "../../components/ui/button";

interface Patient {
  id: string;
  name: string;
  lastnames: string;
}

export default function PatientTable() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await getAllPatientsRequest();
      setPatients(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (patient: Patient) => {
    console.log("ver", patient);
  };

  const handleEdit = (patient: Patient) => {
    console.log("crear cita", patient);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500">
          Cargando pacientes...
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">

      <table className="min-w-full bg-white">

        {/* HEADER */}
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="py-3 px-4 border-b">
              ID
            </th>

            <th className="py-3 px-4 border-b">
              Nombre
            </th>

            <th className="py-3 px-4 border-b">
              Apellidos
            </th>

            <th className="py-3 px-4 border-b text-center">
              Acciones
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="hover:bg-gray-50"
            >
              {/* ID */}
              <td className="py-2 px-4 border-b text-sm text-gray-500">
                {patient.id}
              </td>

              {/* NAME */}
              <td className="py-2 px-4 border-b">
                {patient.name}
              </td>

              {/* LASTNAMES */}
              <td className="py-2 px-4 border-b">
                {patient.lastnames}
              </td>

              {/* ACTIONS */}
              <td className="py-2 px-4 border-b">
                <div className="flex justify-center gap-2">

                  <Button
                    variant="outline"
                    onClick={() => handleView(patient)}
                  >
                    Ver
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleEdit(patient)}
                  >
                    Crear Cita
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}