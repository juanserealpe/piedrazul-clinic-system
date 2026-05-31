"use client";

import { useEffect, useState } from "react";

import { getAllPatientsRequest } from "@/src/services/auth.service";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes Registrados</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total pacientes: {patients.length}
        </p>
      </CardHeader>

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