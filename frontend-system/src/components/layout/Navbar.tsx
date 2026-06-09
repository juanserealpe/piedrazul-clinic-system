"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import AppointmentNotifications from "../appointments/AppointmentNotifications";

import Image from "next/image";
import iconImage from "../../imgs/icon.png";

import {
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserRound,
  ClipboardPenLine,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [nombre, setNombre] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    DOCTOR: "Médico",
    PATIENT: "Paciente",
    SCHEDULER: "Agendador",
  };

  const userRole = user?.roles?.[0] || "";

  const roleIcon = {
    ADMIN: <ShieldCheck size={18} />,
    DOCTOR: <Stethoscope size={18} />,
    PATIENT: <UserRound size={18} />,
    SCHEDULER: <ClipboardPenLine size={18} />,
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    api
      .get("/auth/all-users")
      .then((res) => {
        const found = res.data.find((u: any) => u.id === user.id);

        if (found) {
          setNombre(`${found.names} ${found.lastnames}`);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      style={{
        height: "72px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 10px rgba(0,0,0,.04)",
      }}
    >
      {/* IZQUIERDA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}
        >
          <Image
            src={iconImage}
            alt="Piedrazul"
            width={42}
            height={42}
            priority
          />
        </div>

        {/* TITULO */}
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1rem",
              color: "#1e293b",
              lineHeight: 1.1,
            }}
          >
            Piedrazul
          </div>

          <div
            style={{
              fontSize: "0.8rem",
              color: "#64748b",
            }}
          >
            Sistema Clínico
          </div>
        </div>

        {/* DIVISOR */}
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "#e2e8f0",
            marginLeft: "8px",
          }}
        />

        {/* USUARIO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#7ecdb020,#5a8fbb30)",
              border: "1px solid rgba(126,205,176,.25)",
              color: "#5a8fbb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {roleIcon[userRole as keyof typeof roleIcon] ?? (
              <UserRound size={18} />
            )}
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: ".92rem",
                color: "#1e293b",
              }}
            >
              {nombre || user?.id}
            </div>

            <div
              style={{
                fontSize: ".78rem",
                color: "#64748b",
              }}
            >
              {roleLabel[userRole] || userRole}
            </div>
          </div>
        </div>
      </div>

      {/* DERECHA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {hydrated &&
          (userRole === "DOCTOR" ||
            userRole === "SCHEDULER") && (
            <AppointmentNotifications />
          )}

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid #fecaca",
            background:
              "linear-gradient(135deg,#fef2f2,#fee2e2)",
            color: "#b91c1c",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all .25s ease",
          }}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}