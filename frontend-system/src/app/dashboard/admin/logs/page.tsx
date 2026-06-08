"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-errors";

// Lee UTC directo. Los slots se almacenan con hora Colombia como UTC.
function formatearHora12h(isoStr: string): string {
  const d = new Date(isoStr);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  const indicador = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${indicador}`;
}

function formatearFechaLarga(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("es-CO", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface RegistroCita {
  appointmentId: string;
  patientId: string;
  doctorId?: string;
  status: string;
  date: string;
}

const ETIQUETAS_ESTADO: Record<string, string> = {
  SCHEDULED: "Programada",
  RESCHEDULED: "Reagendada",
  PENDING_RESCHEDULE: "Pendiente por reagendar",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const CLASES_ESTADO: Record<string, string> = {
  SCHEDULED: "pz-badge-green",
  RESCHEDULED: "pz-badge-green",
  PENDING_RESCHEDULE: "pz-badge-amber",
  COMPLETED: "pz-badge-green",
  CANCELLED: "pz-badge-red",
};

function TarjetaResumen({
  etiqueta,
  cantidad,
  color,
}: {
  etiqueta: string;
  cantidad: number;
  color: string;
}) {
  return (
    <div className="pz-card" style={{ padding: "14px 18px", textAlign: "center" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>
        {cantidad}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--pz-text-soft)",
          marginTop: "3px",
          fontWeight: 600,
        }}
      >
        {etiqueta}
      </div>
    </div>
  );
}

export default function PaginaAuditoria() {
  const [medicos, setMedicos] = useState<any[]>([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [registros, setRegistros] = useState<RegistroCita[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Cargar lista de medicos al iniciar
  useEffect(() => {
    api
      .get("/auth/all-doctors")
      .then((r) => setMedicos(r.data))
      .catch(() => {});
  }, []);

  const buscarRegistros = async () => {
    if (!fechaFiltro) return;
    setError("");
    setBusquedaRealizada(true);
    setCargando(true);
    try {
      const parametros: any = { date: `${fechaFiltro}T00:00:00.000Z` };
      if (medicoSeleccionado) {
        parametros.doctorId = medicoSeleccionado;
      }
      const res = await api.get("/appointments/by-doctor", {
        params: parametros,
      });
      setRegistros(res.data.appointments ?? []);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  };

  const resumen = {
    total: registros.length,
    programadas: registros.filter((r) => r.status === "SCHEDULED").length,
    reagendadas: registros.filter(
      (r) =>
        r.status === "RESCHEDULED" || r.status === "PENDING_RESCHEDULE"
    ).length,
    canceladas: registros.filter((r) => r.status === "CANCELLED").length,
  };

  const nombreMedico = (id: string) => {
    const medico = medicos.find((m) => m.id === id);
    return medico ? `Dr. ${medico.name} ${medico.lastnames}` : id;
  };

  return (
    <div>
      <div className="pz-page-header">
        <h1>Auditoria del Sistema</h1>
        <p>
          Consulte el historial de citas medicas registradas por fecha y medico
        </p>
      </div>

      {/* Formulario de busqueda */}
      <div
        className="pz-card"
        style={{ padding: "20px 24px", marginBottom: "20px" }}
      >
        <h3
          style={{
            margin: "0 0 16px",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--pz-green)",
          }}
        >
          Buscar registros de citas
        </h3>
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <label className="pz-label">Medico (opcional)</label>
            <select
              className="pz-input"
              value={medicoSeleccionado}
              onChange={(e) => setMedicoSeleccionado(e.target.value)}
              style={{ minWidth: "240px", cursor: "pointer" }}
            >
              <option value="">Todos los medicos</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  Dr. {m.name} {m.lastnames}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="pz-label">Fecha a consultar</label>
            <input
              type="date"
              className="pz-input"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              style={{ width: "180px" }}
            />
          </div>
          <button
            onClick={buscarRegistros}
            className="pz-btn-primary"
            style={{ marginBottom: "2px" }}
          >
            Buscar registros
          </button>
        </div>
      </div>

      {error && (
        <div className="pz-error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Tarjetas de resumen - solo cuando hay resultados */}
      {busquedaRealizada && !cargando && registros.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <TarjetaResumen
            etiqueta="Total de citas"
            cantidad={resumen.total}
            color="var(--pz-green)"
          />
          <TarjetaResumen
            etiqueta="Programadas"
            cantidad={resumen.programadas}
            color="#1a3a6b"
          />
          <TarjetaResumen
            etiqueta="Reagendadas"
            cantidad={resumen.reagendadas}
            color="#d97706"
          />
          <TarjetaResumen
            etiqueta="Canceladas"
            cantidad={resumen.canceladas}
            color="#c0392b"
          />
        </div>
      )}

      {cargando && (
        <div className="pz-loading">Buscando registros de citas...</div>
      )}

      {/* Estado: sin resultados despues de buscar */}
      {!cargando && busquedaRealizada && registros.length === 0 && !error && (
        <div className="pz-card">
          <div className="pz-empty">
            <p style={{ fontWeight: 600 }}>
              No se encontraron citas para la fecha seleccionada
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                marginTop: "6px",
                color: "var(--pz-text-soft)",
              }}
            >
              Intente con otra fecha o seleccione un medico diferente.
            </p>
          </div>
        </div>
      )}

      {/* Estado: aun no se ha buscado */}
      {!cargando && !busquedaRealizada && (
        <div className="pz-card">
          <div className="pz-empty">
            <p style={{ fontWeight: 600 }}>
              Seleccione una fecha y haga clic en "Buscar registros"
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                marginTop: "6px",
                color: "var(--pz-text-soft)",
              }}
            >
              Puede filtrar por medico o ver todos los medicos para la fecha
              seleccionada.
            </p>
          </div>
        </div>
      )}

      {/* Tabla de resultados */}
      {!cargando && registros.length > 0 && (
        <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--pz-border)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--pz-green)",
              }}
            >
              Citas del{" "}
              {formatearFechaLarga(`${fechaFiltro}T12:00:00Z`)}
              {medicoSeleccionado
                ? ` - ${nombreMedico(medicoSeleccionado)}`
                : " - Todos los medicos"}
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                color: "var(--pz-text-soft)",
                fontSize: "0.88rem",
              }}
            >
              {registros.length}{" "}
              {registros.length === 1
                ? "cita encontrada"
                : "citas encontradas"}
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="pz-table">
              <thead>
                <tr>
                  <th>Codigo de cita</th>
                  <th>Medico</th>
                  <th>Cedula del paciente</th>
                  <th>Hora de la cita</th>
                  <th style={{ textAlign: "center" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro: any) => (
                  <tr key={registro.appointmentId}>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                        color: "var(--pz-text-soft)",
                      }}
                    >
                      {registro.appointmentId?.slice(0, 8)}...
                    </td>
                    <td
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                      }}
                    >
                      {nombreMedico(
                        medicoSeleccionado || registro.doctorId || ""
                      )}
                    </td>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.88rem",
                      }}
                    >
                      {registro.patientId}
                    </td>
                    <td>
                      <span
                        style={{
                          background: "var(--pz-green-light)",
                          color: "var(--pz-green)",
                          fontWeight: 700,
                          padding: "3px 12px",
                          borderRadius: "999px",
                          fontSize: "0.88rem",
                          fontFamily: "monospace",
                        }}
                      >
                        {formatearHora12h(registro.date)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`pz-badge ${
                          CLASES_ESTADO[registro.status] ?? "pz-badge-green"
                        }`}
                        style={{ fontSize: "0.78rem" }}
                      >
                        {ETIQUETAS_ESTADO[registro.status] ?? registro.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}