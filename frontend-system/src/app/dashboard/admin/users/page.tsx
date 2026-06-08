"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-errors";

const ETIQUETAS_ROL: Record<string, string> = {
  ADMIN: "Administrador",
  DOCTOR: "Medico",
  PATIENT: "Paciente",
  SCHEDULER: "Agendador",
};

const COLORES_ROL: Record<string, string> = {
  ADMIN: "pz-badge-red",
  DOCTOR: "pz-badge-green",
  PATIENT: "pz-badge-green",
  SCHEDULER: "pz-badge-amber",
};

interface Usuario {
  id: string;
  names: string;
  lastnames: string;
  roles: string[];
  email?: string;
  phone_number: string;
}

function TarjetaEstadistica({
  etiqueta,
  cantidad,
  color,
}: {
  etiqueta: string;
  cantidad: number;
  color: string;
}) {
  return (
    <div className="pz-card" style={{ padding: "16px 20px", textAlign: "center" }}>
      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 800,
          color,
          lineHeight: 1,
        }}
      >
        {cantidad}
      </div>
      <div
        style={{
          fontSize: "0.82rem",
          color: "var(--pz-text-soft)",
          marginTop: "6px",
          fontWeight: 600,
        }}
      >
        {etiqueta}
      </div>
    </div>
  );
}

export default function PaginaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("TODOS");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await api.get("/auth/all-users");
      setUsuarios(res.data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setCargando(false);
    }
  };

  const termino = busqueda.toLowerCase().trim();
  const filtrados = usuarios.filter((u) => {
    const coincideRol =
      filtroRol === "TODOS" || u.roles.includes(filtroRol);
    const nombreCompleto = `${u.names} ${u.lastnames}`.toLowerCase();
    const coincideBusqueda =
      !termino ||
      nombreCompleto.includes(termino) ||
      u.id.includes(termino) ||
      (u.email ?? "").toLowerCase().includes(termino);
    return coincideRol && coincideBusqueda;
  });

  const estadisticas = {
    total: usuarios.length,
    medicos: usuarios.filter((u) => u.roles.includes("DOCTOR")).length,
    pacientes: usuarios.filter((u) => u.roles.includes("PATIENT")).length,
    agendadores: usuarios.filter((u) => u.roles.includes("SCHEDULER")).length,
    administradores: usuarios.filter((u) => u.roles.includes("ADMIN")).length,
  };

  return (
    <div>
      <div className="pz-page-header">
        <h1>Gestion de Usuarios</h1>
        <p>Lista de todas las personas registradas en el sistema</p>
      </div>

      {/* Resumen por tipo de usuario */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <TarjetaEstadistica
          etiqueta="Total registrados"
          cantidad={estadisticas.total}
          color="var(--pz-green)"
        />
        <TarjetaEstadistica
          etiqueta="Medicos"
          cantidad={estadisticas.medicos}
          color="#0f4d7b"
        />
        <TarjetaEstadistica
          etiqueta="Pacientes"
          cantidad={estadisticas.pacientes}
          color="#1a3a6b"
        />
        <TarjetaEstadistica
          etiqueta="Agendadores"
          cantidad={estadisticas.agendadores}
          color="#d97706"
        />
        <TarjetaEstadistica
          etiqueta="Administradores"
          cantidad={estadisticas.administradores}
          color="#c0392b"
        />
      </div>

      {/* Filtros de busqueda */}
      <div
        className="pz-card"
        style={{ padding: "18px 22px", marginBottom: "20px" }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label className="pz-label">Buscar por nombre, cedula o correo</label>
            <input
              className="pz-input"
              type="text"
              placeholder="Escriba aqui para buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div>
            <label className="pz-label">Tipo de usuario</label>
            <select
              className="pz-input"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              style={{ minWidth: "180px", cursor: "pointer" }}
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="DOCTOR">Medico</option>
              <option value="PATIENT">Paciente</option>
              <option value="SCHEDULER">Agendador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <button
            onClick={cargarUsuarios}
            className="pz-btn-outline"
            style={{ marginBottom: "2px" }}
          >
            Actualizar lista
          </button>
        </div>
      </div>

      {error && (
        <div className="pz-error" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {cargando ? (
        <div className="pz-loading">Cargando usuarios registrados...</div>
      ) : filtrados.length === 0 ? (
        <div className="pz-card">
          <div className="pz-empty">
            <div
              className="pz-empty-icon"
              style={{ fontSize: "2rem", opacity: 0.4, marginBottom: "12px" }}
            >
              [Sin resultados]
            </div>
            <p style={{ fontWeight: 600 }}>
              {termino || filtroRol !== "TODOS"
                ? "No se encontraron usuarios con esos criterios de busqueda"
                : "No hay usuarios registrados en el sistema"}
            </p>
            {(termino || filtroRol !== "TODOS") && (
              <p
                style={{
                  fontSize: "0.9rem",
                  marginTop: "8px",
                  color: "var(--pz-text-soft)",
                }}
              >
                Intente con otro nombre, cedula o cambie el tipo de usuario.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--pz-border)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "var(--pz-text-soft)",
                fontSize: "0.88rem",
              }}
            >
              Mostrando{" "}
              <strong>{filtrados.length}</strong> de{" "}
              <strong>{usuarios.length}</strong> usuarios registrados
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="pz-table">
              <thead>
                <tr>
                  <th>Nombre completo</th>
                  <th>Numero de cedula</th>
                  <th>Telefono</th>
                  <th>Correo electronico</th>
                  <th style={{ textAlign: "center" }}>Tipo de usuario</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {usuario.names} {usuario.lastnames}
                      </div>
                    </td>
                    <td
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                        color: "var(--pz-text-mid)",
                      }}
                    >
                      {usuario.id}
                    </td>
                    <td
                      style={{
                        fontSize: "0.88rem",
                        color: "var(--pz-text-mid)",
                      }}
                    >
                      {usuario.phone_number || "No registrado"}
                    </td>
                    <td
                      style={{
                        fontSize: "0.88rem",
                        color: "var(--pz-text-mid)",
                      }}
                    >
                      {usuario.email || "No registrado"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {usuario.roles.map((rol) => (
                          <span
                            key={rol}
                            className={`pz-badge ${COLORES_ROL[rol] ?? "pz-badge-green"}`}
                            style={{ fontSize: "0.78rem" }}
                          >
                            {ETIQUETAS_ROL[rol] ?? rol}
                          </span>
                        ))}
                      </div>
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