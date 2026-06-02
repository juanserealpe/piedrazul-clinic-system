"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { registerRequest, isUserExistsRequest } from "@/services/auth.service";
import { RegisterFormData, registerSchema } from "@/types/register.schema";
import { ROLE_LABELS, GENDER_LABELS } from "@/lib/translations";
import { showError } from "@/lib/notifications";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label className="pz-label">{label}</label>
      {children}
      {error && <p style={{ color: "var(--pz-red)", fontSize: "0.85rem", marginTop: "4px", fontWeight: 500 }}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const {
    register, handleSubmit, setValue, watch, setError, clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: { roles: ["PATIENT"], gender: "M" },
  });

  const roleValue = watch("roles");
  const genderValue = watch("gender");
  const idValue = watch("id");
  const idCheckTimer = useRef<number | null>(null);
  const [checkingId, setCheckingId] = useState(false);

  useEffect(() => {
    if (idCheckTimer.current) { window.clearTimeout(idCheckTimer.current); idCheckTimer.current = null; }
    if (!idValue || typeof idValue !== "string") { clearErrors("id"); setCheckingId(false); return; }
    const digitsOnly = /^[0-9]+$/.test(idValue);
    if (idValue.length < 6 || idValue.length > 11 || !digitsOnly) { clearErrors("id"); setCheckingId(false); return; }
    setCheckingId(true);
    idCheckTimer.current = window.setTimeout(async () => {
      try {
        const exists = await isUserExistsRequest(idValue);
        if (exists) setError("id", { type: "manual", message: "La cédula ya está registrada" });
        else clearErrors("id");
      } catch { setError("id", { type: "manual", message: "Error verificando cédula" }); }
      finally { setCheckingId(false); }
    }, 600);
    return () => { if (idCheckTimer.current) { window.clearTimeout(idCheckTimer.current); idCheckTimer.current = null; } };
  }, [idValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerRequest(data);
      router.push("/login");
    } catch (err: any) {
      showError(err?.response?.data?.message || "Error registrando usuario");
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a2d4d 0%, #1a3a6b 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "32px 16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        width: "100%", maxWidth: "520px", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1a3a6b, #2a5a8a)", padding: "24px" }}>
          <button
            onClick={() => router.push("/login")}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", marginBottom: "12px", fontSize: "0.85rem" }}
          >
            ← Volver
          </button>
          <h1 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            Registro
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: "0.85rem" }}>
            Complete los campos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "28px 24px 36px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Número de Cédula *" error={errors.id?.message}>
                <div style={{ position: "relative" }}>
                  <input className="pz-input" placeholder="Ej: 12345678" {...register("id")} />
                  {checkingId && (
                    <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", color: "var(--pz-text-soft)" }}>
                      Verificando...
                    </span>
                  )}
                </div>
              </Field>
            </div>

            <Field label="Nombres *" error={errors.names?.message}>
              <input className="pz-input" placeholder="Ej: María" {...register("names")} />
            </Field>

            <Field label="Apellidos *" error={errors.lastnames?.message}>
              <input className="pz-input" placeholder="Ej: García" {...register("lastnames")} />
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Correo Electrónico *" error={errors.email?.message}>
                <input className="pz-input" type="email" placeholder="correo@ejemplo.com" {...register("email")} />
              </Field>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Contraseña *" error={errors.password?.message}>
                <input className="pz-input" type="password" placeholder="Mínimo 6 caracteres" {...register("password")} />
              </Field>
            </div>

            <Field label="Rol en el sistema *" error={errors.roles?.message}>
              <Select value={roleValue?.[0]} onValueChange={(v) => setValue("roles", [v as any])}>
                <SelectTrigger className="pz-input" style={{ height: "48px" }}>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Género *" error={errors.gender?.message}>
              <Select value={genderValue} onValueChange={(v) => setValue("gender", v as any)}>
                <SelectTrigger className="pz-input" style={{ height: "48px" }}>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GENDER_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Teléfono *" error={errors.phone_number?.message}>
              <input className="pz-input" placeholder="Ej: 3001234567" {...register("phone_number")} />
            </Field>

            <Field label="Fecha de nacimiento *" error={errors.born_date?.message}>
              <input className="pz-input" type="date" {...register("born_date")} />
            </Field>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting || checkingId}
            className="pz-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "8px", fontSize: "1.05rem", padding: "15px",
              opacity: (!isValid || isSubmitting || checkingId) ? 0.6 : 1 }}
          >
            {isSubmitting ? "Registrando..." : "Crear mi cuenta"}
          </button>
        </form>
      </div>
    </main>
  );
}
