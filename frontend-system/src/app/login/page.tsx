"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { decodeToken } from "@/src/lib/jwt";
import { loginRequest } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/auth.store";
import { Input, Button } from "@base-ui/react";
import { extractAppRoles } from "../../lib/roles";



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

      console.log("DECODED TOKEN:", decoded);

      // OBTENER ROLES
      const rawRoles =
        decoded.realm_access?.roles ||
        decoded.roles ||
        [];

      const roles = extractAppRoles(rawRoles);

      // GUARDAR AUTH
      setAuth({
        user: {
            id: decoded.id || "",
            roles,
        },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        });

      router.push("/dashboard");

    } catch (err) {
      console.error(err);

      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            Piedrazul Medical
          </h1>

          <p className="text-sm text-muted-foreground">
            Inicia sesión para continuar
          </p>
        </div>

        <div className="space-y-3">

          <Input
            placeholder="Cédula / ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>

        </div>
        <button
          onClick={() => router.push("/register")}
          className="text-sm text-blue-500"
        >
          Crear cuenta
        </button>
      </Card>
    </main>
  );
}