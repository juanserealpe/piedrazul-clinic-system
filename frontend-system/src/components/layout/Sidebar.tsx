"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { sidebarItems } from "@/config/sidebar-items";

const ICONS: Record<string, string> = {
  "/dashboard/doctor/appointments": "",
  "/dashboard/doctor/schedule": "",
  "/dashboard/scheduler/appointments": "",
  "/dashboard/patient/appointments": "",
  "/dashboard/admin/users": "",
  "/dashboard/admin/logs": "",
  "/dashboard/profile": "",
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

  return (
    <aside className="pz-sidebar" style={{ width: "240px", minHeight: "100vh", display: "flex", flexDirection: "column", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <div style={{
            width: "42px", height: "42px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem", flexShrink: 0,
          }}>🏥</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", lineHeight: 1.2 }}>
              Piedrazul
            </div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>
              Sistema Médico
            </div>
          </div>
        </div>
      </div>

      {/* User badge */}
      {user && (
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.12)" }}>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem", marginBottom: "2px" }}>
            Sesión activa
          </div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem", wordBreak: "break-all" }}>
            {user.id}
          </div>
          <span style={{
            display: "inline-block", marginTop: "5px",
            background: "rgba(90,143,187,0.25)", color: "#5a8fbb",
            borderRadius: "999px", padding: "2px 10px",
            fontSize: "0.75rem", fontWeight: 600, border: "1px solid rgba(126,205,176,0.35)",
          }}>
            {roleLabel[userRole] || userRole}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>
          Menú Principal
        </div>
        {visibleItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`pz-sidebar-link${active ? " active" : ""}`}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{ICONS[item.path] || "•"}</span>
              <span style={{ fontSize: "0.95rem" }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.72rem", textAlign: "center" }}>
          Clínica Piedrazul © 2025
        </div>
      </div>
    </aside>
  );
}
