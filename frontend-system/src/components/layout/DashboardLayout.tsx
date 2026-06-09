"use client";

import Image from "next/image";
import iconImage from "../../imgs/icon.png";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { sidebarItems } from "@/config/sidebar-items";
import api from "@/lib/axios";
import {
  HeartPulse,
  CalendarDays,
  Clock3,
  Users,
  UserRound,
  ClipboardList,
  ClipboardPenLine,
  ShieldCheck,
  Activity,
  Settings,
  LogOut,
  Stethoscope,
  ChevronRight,
} from "lucide-react";

// ── Íconos de texto por ruta ──────────────────────────────────────────────────
const ROUTE_ICONS: Record<string, React.ReactNode> = {
  "/dashboard/doctor/appointments": <CalendarDays size={15} />,
  "/dashboard/doctor/schedule": <Clock3 size={15} />,
  "/dashboard/scheduler/appointments": <ClipboardList size={15} />,
  "/dashboard/patient/appointments": <Activity size={15} />,
  "/dashboard/admin/users": <Users size={15} />,
  "/dashboard/admin/logs": <Settings size={15} />,
  "/dashboard/profile": <UserRound size={15} />,
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN:     "Administrador",
  DOCTOR:    "Médico",
  PATIENT:   "Paciente",
  SCHEDULER: "Agendador",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  DOCTOR:    <Stethoscope size={16} />,
  PATIENT:   <UserRound size={16} />,
  ADMIN:     <ShieldCheck size={16} />,
  SCHEDULER: <ClipboardPenLine size={16} />,
};

// ── Componente de navegación lateral ─────────────────────────────────────────
function NavContent({
  onNavigate,
  nombre,
}: {
  onNavigate?: () => void;
  nombre: string;
}) {
  const pathname = usePathname();
  const user     = useAuthStore(s => s.user);
  const userRole = user?.roles?.[0] ?? "";

  const visibleItems = sidebarItems.filter(item =>
    item.roles.some(role => user?.roles.includes(role))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* ── Logo ── */}
      <div style={{
        padding: "20px 18px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Contenedor del ícono — fondo blanco sólido para que resalte */}
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            border: "1.5px solid rgba(126,205,176,0.25)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}>
            <Image
              src={iconImage}
              alt="Piedrazul"
              width={32}
              height={32}
              priority
            />
          </div>

          <div>
            <div style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.95rem",
              lineHeight: 1.2,
              letterSpacing: "0.01em",
            }}>
              Piedrazul
            </div>
            <div style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: "0.68rem",
              marginTop: "2px",
              letterSpacing: "0.04em",
            }}>
              Sistema Médico
            </div>
          </div>
        </div>
      </div>

      {/* ── Badge usuario ── */}
      {user && (
        <div style={{
          padding: "11px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Avatar con ícono de rol */}
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "rgba(90,143,187,0.18)",
              border: "1.5px solid rgba(126,205,176,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7ecdb0",
              flexShrink: 0,
            }}>
              {ROLE_ICONS[userRole] ?? <UserRound size={16} />}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.84rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {nombre || user.id}
              </div>
              <span style={{
                display: "inline-block",
                marginTop: "3px",
                background: "rgba(90,143,187,0.2)",
                color: "#7ab8e8",
                borderRadius: "999px",
                padding: "2px 9px",
                fontSize: "0.68rem",
                fontWeight: 600,
                border: "1px solid rgba(122,184,232,0.22)",
                letterSpacing: "0.03em",
              }}>
                {ROLE_LABELS[userRole] ?? userRole}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        <div style={{
          fontSize: "0.65rem",
          color: "rgba(255,255,255,0.3)",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "0 8px",
          marginBottom: "5px",
          marginTop: "2px",
        }}>
          Menú Principal
        </div>

        {visibleItems.map(item => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 13px",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: active ? 700 : 500,
                color: active ? "#fff" : "rgba(255,255,255,0.72)",
                textDecoration: "none",
                background: active ? "rgba(255,255,255,0.11)" : "transparent",
                borderLeft: active ? "3px solid #5a8fbb" : "3px solid transparent",
                marginBottom: "1px",
                transition: "all 0.15s ease",
              }}
            >
              {/* Mini contenedor del ícono */}
              <span style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: active
                  ? "rgba(90,143,187,0.28)"
                  : "rgba(255,255,255,0.06)",
                transition: "background 0.15s ease",
              }}>
                {ROUTE_ICONS[item.path] ?? "•"}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{
        padding: "12px 18px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <div style={{
          color: "rgba(255,255,255,0.2)",
          fontSize: "0.67rem",
          textAlign: "center",
          letterSpacing: "0.03em",
        }}>
          Clínica Piedrazul © 2025
        </div>
      </div>
    </div>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router             = useRouter();
  const logout             = useAuthStore(s => s.logout);
  const setAuth            = useAuthStore(s => s.setAuth);
  const hydrateFromStorage = useAuthStore(s => s.hydrateFromStorage);
  const user               = useAuthStore(s => s.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nombre,     setNombre]     = useState("");

  const userRole = user?.roles?.[0] ?? "";

  // ── Hidratación ───────────────────────────────────────────────────────────
  useEffect(() => {
    hydrateFromStorage();
  }, []);

  // ── Fetch nombre ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    api.get("/auth/all-users")
      .then(res => {
        const found = res.data.find((u: any) => u.id === user.id);
        if (found) setNombre(`${found.names} ${found.lastnames}`);
      })
      .catch(() => {});
  }, [user]);

  const handleNavigate = () => setDrawerOpen(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Sidebar desktop (≥ 768 px) ───────────────────────────────────── */}
      <aside
        className="pz-sidebar-desktop"
        style={{
          width: "240px",
          minHeight: "100vh",
          background: "linear-gradient(175deg, #0d1f35 0%, #0f2d4a 55%, #112a44 100%)",
          boxShadow: "4px 0 20px rgba(0,0,0,0.2)",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          display: "none",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <NavContent nombre={nombre} />
      </aside>

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: "var(--pz-cream)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: 0,
      }}>

        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <header style={{
          background: "var(--pz-white)",
          borderBottom: "1.5px solid var(--pz-border)",
          padding: "0 16px",
          height: "58px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}>
          {/* Lado izquierdo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            {/* Hamburguesa — solo mobile */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
              className="pz-hamburger"
              style={{
                background: "#eaf5f0",
                border: "1.5px solid #b8ddd0",
                borderRadius: "8px",
                width: "38px",
                height: "38px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                cursor: "pointer",
                flexShrink: 0,
                padding: "0",
              }}
            >
              <span style={{ width: "16px", height: "2px", background: "#2d8a67", borderRadius: "2px", display: "block" }} />
              <span style={{ width: "16px", height: "2px", background: "#2d8a67", borderRadius: "2px", display: "block" }} />
              <span style={{ width: "16px", height: "2px", background: "#2d8a67", borderRadius: "2px", display: "block" }} />
            </button>

            {/* Nombre usuario */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: "0.88rem",
                color: "var(--pz-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "180px",
              }}>
                {nombre || user?.id || "—"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--pz-text-soft)", marginTop: "1px" }}>
                {ROLE_LABELS[userRole] ?? userRole}
              </div>
            </div>
          </div>

          {/* Botón cerrar sesión */}
          <button
            onClick={handleLogout}
            style={{
              background: "#fef1ef",
              color: "#d64235",
              border: "1.5px solid #f5c6c1",
              borderRadius: "8px",
              padding: "6px 13px",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Salir
          </button>
        </header>

        {/* ── Contenido de la página ──────────────────────────────────────── */}
        <main style={{ flex: 1, padding: "16px" }} className="dashboard-main">
          {children}
        </main>
      </div>

      {/* ── Drawer móvil ─────────────────────────────────────────────────── */}
      {/* Overlay */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 60,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Panel deslizante */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "272px",
        background: "linear-gradient(175deg, #0d1f35 0%, #0f2d4a 55%, #112a44 100%)",
        zIndex: 70,
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: drawerOpen ? "6px 0 28px rgba(0,0,0,0.4)" : "none",
        overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Botón cerrar */}
        <button
          onClick={() => setDrawerOpen(false)}
          aria-label="Cerrar menú"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: "8px",
            width: "34px",
            height: "34px",
            color: "rgba(255,255,255,0.8)",
            fontSize: "1.1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          ✕
        </button>

        <NavContent nombre={nombre} onNavigate={handleNavigate} />
      </div>

      {/* ── CSS responsive ───────────────────────────────────────────────── */}
      <style>{`
        @media (min-width: 768px) {
          .pz-sidebar-desktop { display: block !important; }
          .pz-hamburger        { display: none   !important; }
          .dashboard-main      { padding: 28px 32px !important; }
        }
      `}</style>
    </div>
  );
}