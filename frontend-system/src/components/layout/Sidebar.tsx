"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useAuthStore } from "@/store/auth.store";
import { sidebarItems } from "@/config/sidebar-items";

import iconImage from "../../imgs/icon.png";

import {
  CalendarDays,
  Clock3,
  Users,
  Settings,
  UserRound,
  ClipboardList,
  Stethoscope,
  ShieldCheck,
  ClipboardPenLine,
  Activity,
  ChevronRight,
  HeartPulse,
} from "lucide-react";

const ROUTE_ICONS: Record<string, React.ReactNode> = {
  "/dashboard/doctor/appointments": (
    <CalendarDays size={18} />
  ),

  "/dashboard/doctor/schedule": (
    <Clock3 size={18} />
  ),

  "/dashboard/scheduler/appointments": (
    <ClipboardList size={18} />
  ),

  "/dashboard/patient/appointments": (
    <Activity size={18} />
  ),

  "/dashboard/admin/users": (
    <Users size={18} />
  ),

  "/dashboard/admin/logs": (
    <Settings size={18} />
  ),

  "/dashboard/profile": (
    <UserRound size={18} />
  ),
};

export default function Sidebar() {
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);

  const visibleItems = sidebarItems.filter((item) =>
    item.roles.some((role) => user?.roles.includes(role))
  );

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

  return (
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,

        background:
          "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)",

        borderRight: "1px solid rgba(255,255,255,.06)",

        boxShadow:
          "4px 0 20px rgba(0,0,0,.18)",
      }}
    >
      {/* LOGO */}
      <div
        style={{
          padding: "24px 20px",
          borderBottom:
            "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",

              background:
                "linear-gradient(135deg,#ffffff,#f8fafc)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              overflow: "hidden",

              boxShadow:
                "0 10px 25px rgba(0,0,0,.25)",

              flexShrink: 0,
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

          <div>
            <div
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.05rem",
                lineHeight: 1.1,
              }}
            >
              Piedrazul
            </div>

            <div
              style={{
                color:
                  "rgba(255,255,255,.55)",
                fontSize: ".78rem",
              }}
            >
              Sistema Clínico
            </div>
          </div>
        </div>
      </div>

      {/* USUARIO */}
      {user && (
        <div
          style={{
            padding: "16px",
            margin: "14px",
            borderRadius: "16px",

            background:
              "rgba(255,255,255,.04)",

            border:
              "1px solid rgba(255,255,255,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",

                background:
                  "linear-gradient(135deg,#7ecdb022,#5a8fbb33)",

                border:
                  "1px solid rgba(126,205,176,.25)",

                color: "#7ecdb0",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                flexShrink: 0,
              }}
            >
              {roleIcon[
                userRole as keyof typeof roleIcon
              ] ?? <UserRound size={18} />}
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: ".88rem",

                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.id}
              </div>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "4px",

                  background:
                    "rgba(126,205,176,.12)",

                  color: "#7ecdb0",

                  border:
                    "1px solid rgba(126,205,176,.18)",

                  borderRadius: "999px",

                  padding: "3px 10px",

                  fontSize: ".72rem",
                  fontWeight: 600,
                }}
              >
                {roleLabel[userRole] || userRole}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MENU */}
      <nav
        style={{
          flex: 1,
          padding: "0 12px",
        }}
      >
        <div
          style={{
            fontSize: ".72rem",
            color: "rgba(255,255,255,.35)",
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            padding: "0 12px",
            marginBottom: "10px",
          }}
        >
          Menú Principal
        </div>

        {visibleItems.map((item) => {
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",

                padding: "14px",

                marginBottom: "6px",

                borderRadius: "14px",

                textDecoration: "none",

                transition: "all .25s ease",

                background: active
                  ? "linear-gradient(90deg,rgba(126,205,176,.16),rgba(90,143,187,.16))"
                  : "transparent",

                border: active
                  ? "1px solid rgba(126,205,176,.18)"
                  : "1px solid transparent",

                color: active
                  ? "#fff"
                  : "rgba(255,255,255,.8)",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",

                  borderRadius: "10px",

                  background: active
                    ? "rgba(255,255,255,.10)"
                    : "rgba(255,255,255,.04)",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  color: active
                    ? "#7ecdb0"
                    : "rgba(255,255,255,.6)",

                  flexShrink: 0,
                }}
              >
                {ROUTE_ICONS[item.path] ?? (
                  <HeartPulse size={18} />
                )}
              </div>

              <span
                style={{
                  flex: 1,
                  fontSize: ".94rem",
                  fontWeight: active
                    ? 700
                    : 500,
                }}
              >
                {item.label}
              </span>

              {active && (
                <ChevronRight
                  size={16}
                  color="#7ecdb0"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div
        style={{
          padding: "18px",
          borderTop:
            "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color:
              "rgba(255,255,255,.35)",
            fontSize: ".72rem",
          }}
        >
          Clínica Piedrazul © 2026
        </div>
      </div>
    </aside>
  );
}