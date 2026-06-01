"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { loginRequest } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { extractAppRoles } from "@/lib/roles";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await loginRequest(id, password);
      const decoded = decodeToken(data.accessToken);
      const rawRoles = decoded.realm_access?.roles || decoded.roles || [];
      const roles = extractAppRoles(rawRoles);
      setAuth({ user: { id: decoded.id || "", roles }, accessToken: data.accessToken, refreshToken: data.refreshToken });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas. Verifique su cédula y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2d4d 0%, #1a3a6b 50%, #2a5a8a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: "fixed", top: "-80px", right: "-80px",
        width: "320px", height: "320px",
        borderRadius: "50%", background: "rgba(255,255,255,0.05)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-60px", left: "-60px",
        width: "240px", height: "240px",
        borderRadius: "50%", background: "rgba(255,255,255,0.05)",
        pointerEvents: "none",
      }} />

      <div style={{
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        width: "100%",
        maxWidth: "440px",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1a3a6b, #2a5a8a)",
          padding: "24px",
          textAlign: "center",
        }}>
          {/* Logo / ícono */}
          <div style={{
            width: "64px", height: "64px",
            background: "rgba(255,255,255,0.18)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            fontSize: "2rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}>
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            Clínica Piedrazul
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: "0.85rem" }}>
            Sistema Médico
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2d4d", marginBottom: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            Iniciar Sesión
          </h2>

          <div style={{ marginBottom: "18px" }}>
            <label className="pz-label">Número de Cédula</label>
            <input
              className="pz-input"
              placeholder="Ej: 12345678"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              style={{ fontSize: "1.05rem" }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label className="pz-label">Contraseña</label>
            <input
              className="pz-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
              style={{ fontSize: "1.05rem" }}
            />
          </div>

          {error && (
            <div className="pz-error" style={{ marginBottom: "16px", marginTop: "4px" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="pz-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "20px", fontSize: "1.05rem", padding: "15px" }}
          >
            {loading ? "Ingresando..." : "Ingresar al Sistema"}
          </button>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <span style={{ color: "#717171", fontSize: "0.9rem" }}>¿No tiene cuenta?{" "}</span>
            <button
              onClick={() => router.push("/register")}
              style={{
                background: "none", border: "none",
                color: "#1a3a6b", fontWeight: 700,
                fontSize: "0.9rem", cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Regístrese aquí
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
