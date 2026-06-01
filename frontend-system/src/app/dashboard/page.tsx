"use client";
import { useAuthStore } from "@/store/auth.store";

const ROLE_INFO: Record<string, { label: string; icon: string; desc: string }> = {
  DOCTOR: { label: "Médico", icon: "👨‍⚕️", desc: "Gestione sus citas y configure sus horarios de atención." },
  PATIENT: { label: "Paciente", icon: "🧑", desc: "Consulte los médicos disponibles y agende su cita." },
  SCHEDULER: { label: "Agendador", icon: "📋", desc: "Administre las citas de los pacientes registrados." },
  ADMIN: { label: "Administrador", icon: "⚙️", desc: "Gestione usuarios y revise el registro de auditoría." },
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const role = user?.roles?.[0] || "";
  const info = ROLE_INFO[role] || { label: "Usuario", icon: "👤", desc: "Bienvenido al sistema." };

  return (
    <div>
      <div className="pz-page-header">
        <h1>Panel Principal</h1>
        <p>Sistema de Gestión Médica — Clínica Piedrazul</p>
      </div>

      <div style={{
        background: "linear-gradient(135deg, #1a3a6b, #2a5a8a)",
        borderRadius: "16px",
        padding: "32px",
        color: "#fff",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}>
        <div style={{ fontSize: "3rem" }}>{info.icon}</div>
        <div>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "1.4rem", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            Bienvenido, {info.label}
          </h2>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.82)", fontSize: "1rem" }}>
            {info.desc}
          </p>
        </div>
      </div>

      <div style={{
        background: "var(--pz-white)",
        borderRadius: "14px",
        border: "1px solid var(--pz-border)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <span style={{ fontSize: "1.5rem" }}>💡</span>
        <p style={{ margin: 0, color: "var(--pz-text-mid)", fontSize: "0.95rem" }}>
          Use el menú de la izquierda para navegar entre las secciones del sistema.
          Si necesita ayuda, contacte al administrador.
        </p>
      </div>
    </div>
  );
}
