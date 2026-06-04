"use client";

import { useEffect, useState } from "react";

import { getAllPatientsRequest, getPatientByIdRequest } from "@/src/services/auth.service";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

interface Patient {
  id: string;
  name: string;
  lastnames: string;
}

interface Props {
  onCreateAppointment: (patient: Patient) => void;
}

export default function PatientTable({ onCreateAppointment }: Props) {

  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<Patient | null>(null);
  const [searching, setSearching] = useState(false);

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

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Cargando pacientes...</p>
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Pacientes Registrados</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total pacientes: {patients.length}
        </p>
      </CardHeader>

      <div className="mb-4 flex gap-2">
  <input
    className="border px-3 py-2 rounded w-full"
    placeholder="Buscar paciente por ID..."
    value={searchId}
    onChange={(e) => setSearchId(e.target.value)}
  />

  <Button onClick={handleSearch}>
    Buscar
  </Button>

  <Button variant="outline" onClick={clearSearch}>
    Limpiar
  </Button>
</div>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Documento</th>
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Apellidos</th>
                <th className="text-center py-3 px-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {patient.id}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-medium">{patient.name}</td>
                  <td className="px-4 py-3">{patient.lastnames}</td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>

                      <Button
                      size="sm"
                      onClick={() => {
                        console.log("CLICK BOTON");
                        onCreateAppointment(patient);
                      }}
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
      </CardContent>
    </Card>
  );
}