"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  DOCTOR: "Médico",
  PATIENT: "Paciente",
  SCHEDULER: "Agendador",
};

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [nombre, setNombre] = useState("");
  const userRole = user?.roles?.[0] || "";

  useEffect(() => {
  if (!user?.id) return;
  api.get("/auth/all-users").then((res) => {
    const found = res.data.find((u: any) => u.id === user.id);
    if (found) setNombre(`${found.names} ${found.lastnames}`);
  }).catch(() => {});
}, [user]);

  return (
    <div>
      <div className="pz-page-header">
        <h1>Mi Perfil</h1>
        <p>Información del usuario autenticado en el sistema</p>
      </div>

      <div className="pz-card" style={{ maxWidth: "480px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid var(--pz-border)" }}>
          <div style={{
            width: "72px", height: "72px",
            background: "var(--pz-green-light)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", border: "2px solid #a7d9c8",
          }}>
            {userRole === "DOCTOR" ? "👨‍⚕️" : userRole === "PATIENT" ? "🧑" : "👤"}
          </div>
          <div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{nombre || "—"}</div>
            <div style={{ color: "var(--pz-text-soft)", fontSize: "0.9rem" }}>
              {ROLE_LABELS[userRole] || userRole}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p className="pz-label">Número de Identificación</p>
          <div style={{
            background: "var(--pz-green-light)", borderRadius: "8px",
            padding: "12px 16px", fontWeight: 700, fontSize: "1.1rem",
            color: "var(--pz-green)", fontFamily: "monospace",
          }}>
            {user?.id || "—"}
          </div>
        </div>

        <div>
          <p className="pz-label">Roles Asignados</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {user?.roles.map((role) => (
              <span key={role} className="pz-badge pz-badge-green" style={{ fontSize: "0.9rem", padding: "6px 16px" }}>
                {ROLE_LABELS[role] || role}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}