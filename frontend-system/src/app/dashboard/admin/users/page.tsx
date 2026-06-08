"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-errors";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador", DOCTOR: "Médico", PATIENT: "Paciente", SCHEDULER: "Agendador",
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "pz-badge-red", DOCTOR: "pz-badge-green", PATIENT: "pz-badge-green", SCHEDULER: "pz-badge-amber",
};
const ROLE_ICONS: Record<string, string> = {
  ADMIN: "⚙️", DOCTOR: "👨‍⚕️", PATIENT: "🧑", SCHEDULER: "📋",
};

interface User {
  id: string;
  names: string;
  lastnames: string;
  roles: string[];
  email?: string;
  phone_number: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/auth/all-users");
      setUsers(res.data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const term = search.toLowerCase().trim();
  const filtered = users.filter((u) => {
    const matchRole = filterRole === "ALL" || u.roles.includes(filterRole);
    const fullName = `${u.names} ${u.lastnames}`.toLowerCase();
    const matchSearch = !term || fullName.includes(term) || u.id.includes(term) ||
      (u.email ?? "").toLowerCase().includes(term);
    return matchRole && matchSearch;
  });

  const stats = {
    total: users.length,
    doctors: users.filter(u => u.roles.includes("DOCTOR")).length,
    patients: users.filter(u => u.roles.includes("PATIENT")).length,
    schedulers: users.filter(u => u.roles.includes("SCHEDULER")).length,
    admins: users.filter(u => u.roles.includes("ADMIN")).length,
  };

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
        <h1>Gestión de Usuarios</h1>
        <p>Usuarios registrados en el sistema</p>
      </div>

      {/* Tarjetas de resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total", count: stats.total, icon: "👥", color: "var(--pz-green)" },
          { label: "Médicos", count: stats.doctors, icon: "👨‍⚕️", color: "#0f4d7b" },
          { label: "Pacientes", count: stats.patients, icon: "🧑", color: "#1a3a6b" },
          { label: "Agendadores", count: stats.schedulers, icon: "📋", color: "#d97706" },
          { label: "Admins", count: stats.admins, icon: "⚙️", color: "#c0392b" },
        ].map((s) => (
          <div key={s.label} className="pz-card" style={{ padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", marginBottom: "6px" }}>{s.icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--pz-text-soft)", marginTop: "4px", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="pz-card" style={{ padding: "18px 22px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label className="pz-label">Buscar</label>
            <input className="pz-input" type="text"
              placeholder="Nombre, cédula o correo..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="pz-label">Filtrar por rol</label>
            <select className="pz-input" value={filterRole} onChange={e => setFilterRole(e.target.value)}
              style={{ minWidth: "160px", cursor: "pointer" }}>
              <option value="ALL">Todos los roles</option>
              <option value="DOCTOR">Médico</option>
              <option value="PATIENT">Paciente</option>
              <option value="SCHEDULER">Agendador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <button onClick={loadUsers} className="pz-btn-outline" style={{ marginBottom: "2px" }}>
            Actualizar
          </button>
        </div>
      </div>

      {error && <div className="pz-error" style={{ marginBottom: "16px" }}>⚠️ {error}</div>}

      {loading ? (
        <div className="pz-loading">Cargando usuarios...</div>
      ) : filtered.length === 0 ? (
        <div className="pz-card">
          <div className="pz-empty">
            <div className="pz-empty-icon">👥</div>
            <p style={{ fontWeight: 600 }}>
              {term || filterRole !== "ALL"
                ? "No se encontraron usuarios con esos filtros"
                : "No hay usuarios registrados"}
            </p>
          </div>
        </div>
      ) : (
        <div className="pz-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--pz-border)" }}>
            <p style={{ margin: 0, color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
              Mostrando <strong>{filtered.length}</strong> de <strong>{users.length}</strong> usuarios
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="pz-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Cédula</th>
                  <th>Contacto</th>
                  <th style={{ textAlign: "center" }}>Roles</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const primaryRole = user.roles[0] ?? "PATIENT";
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "38px", height: "38px",
                            background: "var(--pz-green-light)", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.1rem", flexShrink: 0,
                          }}>
                            {ROLE_ICONS[primaryRole] ?? "👤"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                              {user.names} {user.lastnames}
                            </div>
                            {user.email && (
                              <div style={{ fontSize: "0.78rem", color: "var(--pz-text-soft)" }}>
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.9rem", color: "var(--pz-text-mid)" }}>
                        {user.id}
                      </td>
                      <td style={{ fontSize: "0.88rem", color: "var(--pz-text-mid)" }}>
                        {user.phone_number || "—"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                          {user.roles.map(role => (
                            <span key={role}
                              className={`pz-badge ${ROLE_COLORS[role] ?? "pz-badge-green"}`}
                              style={{ fontSize: "0.75rem" }}>
                              {ROLE_LABELS[role] ?? role}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}