"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { sidebarItems } from "@/config/sidebar-items";
import api from "@/lib/axios";

// ── Íconos de texto por ruta ──────────────────────────────────────────────────
const ROUTE_ICONS: Record<string, string> = {
  "/dashboard/doctor/appointments":    "",
  "/dashboard/doctor/schedule":        "",
  "/dashboard/scheduler/appointments": "",
  "/dashboard/patient/appointments":   "",
  "/dashboard/admin/users":            "👥",
  "/dashboard/admin/logs":             "",
  "/dashboard/profile":                "👤",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN:     "Administrador",
  DOCTOR:    "Médico",
  PATIENT:   "Paciente",
  SCHEDULER: "Agendador",
};

const ROLE_ICONS: Record<string, string> = {
  DOCTOR:    "👨‍⚕️",
  PATIENT:   "🧑",
  ADMIN:     "⚙️",
  SCHEDULER: "📋",
};

// ── Componente de navegación lateral (shared entre desktop y drawer) ──────────
function NavContent({
  onNavigate,
  nombre,
}: {
  onNavigate?: () => void;
  nombre: string;
}) {
  const pathname  = usePathname();
  const user      = useAuthStore(s => s.user);
  const userRole  = user?.roles?.[0] ?? "";

  const visibleItems = sidebarItems.filter(item =>
    item.roles.some(role => user?.roles.includes(role))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px", height: "42px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem", flexShrink: 0,
          }}></div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>
              Piedrazul
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>
              Sistema Médico
            </div>
          </div>
        </div>
      </div>

      {/* Badge usuario */}
      {user && (
        <div style={{
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", flexShrink: 0,
            }}>
              {ROLE_ICONS[userRole] ?? "👤"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: "#fff", fontWeight: 600, fontSize: "0.85rem",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {nombre || user.id}
              </div>
              <span style={{
                display: "inline-block", marginTop: "3px",
                background: "rgba(90,143,187,0.25)", color: "#5a8fbb",
                borderRadius: "999px", padding: "2px 10px",
                fontSize: "0.72rem", fontWeight: 600,
                border: "1px solid rgba(126,205,176,0.35)",
              }}>
                {ROLE_LABELS[userRole] ?? userRole}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
        <div style={{
          fontSize: "0.7rem", color: "rgba(255,255,255,0.4)",
          fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "0 8px", marginBottom: "6px",
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
                gap: "12px",
                padding: "13px 16px",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: active ? 700 : 500,
                color: active ? "#fff" : "rgba(255,255,255,0.82)",
                textDecoration: "none",
                background: active ? "rgba(255,255,255,0.18)" : "transparent",
                borderLeft: active ? "4px solid #5a8fbb" : "4px solid transparent",
                marginBottom: "2px",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>
                {ROUTE_ICONS[item.path] ?? "•"}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "14px 20px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", textAlign: "center" }}>
          Clínica Piedrazul © 2025
        </div>
      </div>
    </div>
  );
}

// ── Layout principal ──────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router            = useRouter();
  const logout            = useAuthStore(s => s.logout);
  const setAuth           = useAuthStore(s => s.setAuth);
  const hydrateFromStorage = useAuthStore(s => s.hydrateFromStorage);
  const user              = useAuthStore(s => s.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nombre,     setNombre]     = useState("");

  const userRole = user?.roles?.[0] ?? "";

  // ── Hidratación: solo corre en cliente, después del primer render ─────────
  useEffect(() => {
    hydrateFromStorage();
  }, []);

  // ── Fetch nombre ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    api.get("/auth/all-users")
      .then(res => {
        const found = res.data.find((u: any) => u.id === user.id);
        if (found) setNombre(`${found.name} ${found.lastnames}`);
      })
      .catch(() => {});
  }, [user]);

  // Cierra drawer al cambiar de ruta
  const handleNavigate = () => setDrawerOpen(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Sidebar desktop (≥ 768 px) ─────────────────────────────────── */}
      <aside style={{
        width: "240px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a2d4d 0%, #1a3a6b 100%)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.18)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        display: "none",          // oculto por defecto
      }}
        className="pz-sidebar-desktop"
      >
        <NavContent nombre={nombre} />
      </aside>

      {/* ── Contenido principal ────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: "var(--pz-cream)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: 0,
      }}>

        {/* ── Navbar (mobile + desktop) ─────────────────────────────── */}
        <header style={{
          background: "var(--pz-white)",
          borderBottom: "2px solid var(--pz-border)",
          padding: "0 16px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}>
          {/* Lado izquierdo: hamburguesa (solo mobile) + nombre */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            {/* Botón hamburguesa — visible solo en mobile */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
              className="pz-hamburger"
              style={{
                background: "var(--pz-green-light)",
                border: "2px solid #a7d9c8",
                borderRadius: "8px",
                width: "40px", height: "40px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "5px", cursor: "pointer", flexShrink: 0,
                padding: "0",
              }}
            >
              <span style={{ width: "18px", height: "2px", background: "var(--pz-green)", borderRadius: "2px", display: "block" }} />
              <span style={{ width: "18px", height: "2px", background: "var(--pz-green)", borderRadius: "2px", display: "block" }} />
              <span style={{ width: "18px", height: "2px", background: "var(--pz-green)", borderRadius: "2px", display: "block" }} />
            </button>

            {/* Nombre usuario */}
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 700, fontSize: "0.9rem",
                color: "var(--pz-text)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: "180px",
              }}>
                {nombre || user?.id || "—"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--pz-text-soft)" }}>
                {ROLE_LABELS[userRole] ?? userRole}
              </div>
            </div>
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            style={{
              background: "var(--pz-red-light)",
              color: "var(--pz-red)",
              border: "2px solid #f5c6c1",
              borderRadius: "8px",
              padding: "6px 14px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Salir
          </button>
        </header>

        {/* ── Contenido de la página ─────────────────────────────────── */}
        <main style={{ flex: 1, padding: "16px" }} className="dashboard-main">
          {children}
        </main>
      </div>

      {/* ── Drawer móvil ───────────────────────────────────────────────── */}
      {/* Overlay oscuro */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: "fixed", inset: 0,
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
        top: 0, left: 0, bottom: 0,
        width: "280px",
        background: "linear-gradient(180deg, #1a2d4d 0%, #1a3a6b 100%)",
        zIndex: 70,
        transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: drawerOpen ? "6px 0 24px rgba(0,0,0,0.35)" : "none",
        overflowY: "auto",
      }}>
        {/* Botón cerrar */}
        <button
          onClick={() => setDrawerOpen(false)}
          aria-label="Cerrar menú"
          style={{
            position: "absolute", top: "12px", right: "12px",
            background: "rgba(255,255,255,0.15)",
            border: "none", borderRadius: "8px",
            width: "36px", height: "36px",
            color: "#fff", fontSize: "1.2rem",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            zIndex: 1,
          }}
        >
          ✕
        </button>

        <NavContent nombre={nombre} onNavigate={handleNavigate} />
      </div>

      {/* ── CSS: mostrar sidebar en desktop, ocultar hamburguesa ───────── */}
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