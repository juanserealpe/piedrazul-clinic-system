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
import { getApiErrorMessage } from "@/lib/api-errors";

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label className="pz-label">
        {label}
        {optional && (
          <span style={{
            marginLeft: "6px",
            fontSize: "0.78rem",
            fontWeight: 400,
            color: "var(--pz-text-soft)",
            background: "var(--pz-sand)",
            borderRadius: "999px",
            padding: "1px 8px",
          }}>
            Opcional
          </span>
        )}
      </label>
      {children}
      {error && (
        <p style={{
          color: "var(--pz-red)",
          fontSize: "0.85rem",
          marginTop: "4px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// Calcula la fecha máxima para fecha de nacimiento (hoy) y mínima (1900-01-01)
const TODAY_STR = new Date().toISOString().split("T")[0];
const MIN_DATE_STR = "1900-01-01";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: { roles: ["PATIENT"], gender: "M", email: "" },
  });

  const roleValue    = watch("roles");
  const genderValue  = watch("gender");
  const idValue      = watch("id");
  const idCheckTimer = useRef<number | null>(null);
  const [checkingId,  setCheckingId]  = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitOk,    setSubmitOk]    = useState(false);

  // ── Verificación de cédula duplicada ──────────────────────────────────
  useEffect(() => {
    if (idCheckTimer.current) { window.clearTimeout(idCheckTimer.current); idCheckTimer.current = null; }
    if (!idValue || typeof idValue !== "string") { clearErrors("id"); setCheckingId(false); return; }
    const digitsOnly = /^[0-9]+$/.test(idValue);
    if (idValue.length < 6 || idValue.length > 11 || !digitsOnly) { clearErrors("id"); setCheckingId(false); return; }
    setCheckingId(true);
    idCheckTimer.current = window.setTimeout(async () => {
      try {
        const exists = await isUserExistsRequest(idValue);
        if (exists) setError("id", { type: "manual", message: "Esta cédula ya está registrada en el sistema" });
        else clearErrors("id");
      } catch {
        setError("id", { type: "manual", message: "Error verificando cédula, intente nuevamente" });
      } finally {
        setCheckingId(false);
      }
    }, 600);
    return () => { if (idCheckTimer.current) { window.clearTimeout(idCheckTimer.current); idCheckTimer.current = null; } };
  }, [idValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError("");
    setSubmitOk(false);
    try {
      // Si email está vacío, no lo enviamos
      const payload = { ...data };
      if (!payload.email) delete (payload as any).email;
      await registerRequest(payload);
      setSubmitOk(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    }
  };

  const canSubmit = isValid && !isSubmitting && !checkingId;

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a2d4d 0%, #1a3a6b 100%)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "32px 16px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        width: "100%",
        maxWidth: "560px",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1a3a6b, #2a5a8a)", padding: "24px" }}>
          <button
            onClick={() => router.push("/login")}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              marginBottom: "12px",
              fontSize: "0.85rem",
            }}
          >
            ← Volver al inicio de sesión
          </button>
          <h1 style={{
            color: "#fff",
            fontSize: "1.3rem",
            fontWeight: 700,
            margin: 0,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}>
            Crear cuenta
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: "0.85rem" }}>
            Complete los campos para registrarse
          </p>
        </div>

        {/* Success message */}
        {submitOk && (
          <div style={{
            margin: "16px 24px 0",
            background: "var(--pz-green-light)",
            border: "1px solid #a7d9c8",
            borderRadius: "10px",
            padding: "14px 16px",
            color: "var(--pz-green)",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}>
            ✅ ¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...
          </div>
        )}

        {/* Global error */}
        {submitError && (
          <div className="pz-error" style={{ margin: "16px 24px 0" }}>
            ⚠️ {submitError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "28px 24px 36px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 16px" }}>

            {/* Cédula — full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Número de Cédula *" error={errors.id?.message}>
                <div style={{ position: "relative" }}>
                  <input
                    className="pz-input"
                    placeholder="Ej: 12345678"
                    {...register("id")}
                    style={{ paddingRight: checkingId ? "110px" : undefined }}
                  />
                  {checkingId && (
                    <span style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.78rem",
                      color: "var(--pz-text-soft)",
                      pointerEvents: "none",
                    }}>
                      Verificando...
                    </span>
                  )}
                </div>
              </Field>
            </div>

            {/* Nombres */}
            <Field label="Nombres *" error={errors.names?.message}>
              <input className="pz-input" placeholder="Ej: María" {...register("names")} />
            </Field>

            {/* Apellidos */}
            <Field label="Apellidos *" error={errors.lastnames?.message}>
              <input className="pz-input" placeholder="Ej: García López" {...register("lastnames")} />
            </Field>

            {/* Correo — OPCIONAL — full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Correo electrónico" error={errors.email?.message} optional>
                <input
                  className="pz-input"
                  type="email"
                  placeholder="correo@ejemplo.com (opcional)"
                  {...register("email")}
                />
              </Field>
            </div>

            {/* Contraseña — full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Contraseña *" error={errors.password?.message}>
                <input
                  className="pz-input"
                  type="password"
                  placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                  {...register("password")}
                />
              </Field>
            </div>

            {/* Rol */}
            <Field label="Rol en el sistema *" error={errors.roles?.message}>
              <Select
                value={roleValue?.[0]}
                onValueChange={(v) => setValue("roles", [v as any], { shouldValidate: true })}
              >
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

            {/* Género */}
            <Field label="Género *" error={errors.gender?.message}>
              <Select
                value={genderValue}
                onValueChange={(v) => setValue("gender", v as any, { shouldValidate: true })}
              >
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

            {/* Teléfono */}
            <Field label="Teléfono *" error={errors.phone_number?.message}>
              <input
                className="pz-input"
                placeholder="Ej: 3001234567"
                {...register("phone_number")}
              />
            </Field>

            {/* Fecha de nacimiento — MEJORADA */}
            <Field label="Fecha de nacimiento *" error={errors.born_date?.message}>
              <input
                className="pz-input"
                type="date"
                max={TODAY_STR}
                min={MIN_DATE_STR}
                {...register("born_date")}
              />
              <span style={{
                fontSize: "0.78rem",
                color: "var(--pz-text-soft)",
                marginTop: "3px",
                display: "block",
              }}>
                Formato: día/mes/año
              </span>
            </Field>

          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="pz-btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "8px",
              fontSize: "1.05rem",
              padding: "15px",
              opacity: !canSubmit ? 0.6 : 1,
            }}
          >
            {isSubmitting
              ? "Creando cuenta..."
              : checkingId
              ? "Verificando cédula..."
              : "Crear mi cuenta"}
          </button>

          <p style={{ textAlign: "center", marginTop: "16px", color: "var(--pz-text-soft)", fontSize: "0.88rem" }}>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{
                background: "none",
                border: "none",
                color: "var(--pz-green)",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Inicia sesión aquí
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}