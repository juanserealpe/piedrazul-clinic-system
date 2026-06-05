"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import AppointmentNotifications from "../appointments/AppointmentNotifications";

export default function Navbar() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [nombre, setNombre] = useState("");

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    DOCTOR: "Médico",
    PATIENT: "Paciente",
    SCHEDULER: "Agendador",
  };
  const userRole = user?.roles?.[0] || "";

  useEffect(() => {
    if (!user?.id) return;
    api.get("/auth/all-users").then((res) => {
      const found = res.data.find((u: any) => u.id === user.id);
      if (found) setNombre(`${found.name} ${found.lastnames}`);
    }).catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="pz-navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px", height: "40px",
          background: "var(--pz-green-light)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.2rem",
        }}>
          {userRole === "DOCTOR" ? "👨‍⚕️" : userRole === "PATIENT" ? "🧑" : userRole === "ADMIN" ? "⚙️" : "📋"}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--pz-text)" }}>
            Bienvenido — {nombre || user?.id}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--pz-text-soft)" }}>
            {roleLabel[userRole] || userRole}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {(userRole === "DOCTOR" || userRole === "SCHEDULER") && (
          <AppointmentNotifications />
        )}
        <button
          onClick={handleLogout}
          style={{
            background: "var(--pz-red-light)",
            color: "var(--pz-red)",
            border: "2px solid #f5c6c1",
            borderRadius: "8px",
            padding: "8px 20px",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}