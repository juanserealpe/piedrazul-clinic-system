"use client";

import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";



import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card } from "@/src/components/ui/card";
import { registerRequest, isUserExistsRequest } from "@/src/services/auth.service";
import { RegisterFormData, registerSchema } from "@/src/types/register.schema";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function RegisterPage() {

  const router = useRouter();

  const {

    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,

    formState: {
      errors,
      isSubmitting,
      isValid,
    },

  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    reValidateMode: "onChange",

    defaultValues: {
      roles: ["PATIENT"],
      gender: "M",
    },
  });

  const roleValue = watch("roles");
  const genderValue = watch("gender");

  const onSubmit = async (
    data: RegisterFormData
  ) => {

    try {

      console.log("REGISTER DATA:", data);

      await registerRequest(data);

      router.push("/login");

    } catch (err: any) {

      console.error(err);

      alert(
        err?.response?.data?.message ||
        "Error registrando usuario"
      );
    }
  };

  // Real-time cedula validation (debounced) against backend
  const idValue = watch("id");
  const idCheckTimer = useRef<number | null>(null);
  const [checkingId, setCheckingId] = useState(false);

  useEffect(() => {
    // clear pending timer
    if (idCheckTimer.current) {
      window.clearTimeout(idCheckTimer.current);
      idCheckTimer.current = null;
    }

    if (!idValue || typeof idValue !== "string") {
      // nothing to check
      clearErrors("id");
      setCheckingId(false);
      return;
    }

    // basic client-side conditions before calling API
    const digitsOnly = /^[0-9]+$/.test(idValue);
    if (idValue.length < 6 || idValue.length > 11 || !digitsOnly) {
      // let zod handle the message, just clear remote-check state
      clearErrors("id");
      setCheckingId(false);
      return;
    }

    setCheckingId(true);

    idCheckTimer.current = window.setTimeout(async () => {
      try {
        const exists = await isUserExistsRequest(idValue);

        if (exists) {
          setError("id", {
            type: "manual",
            message: "La cédula ya está registrada",
          });
        } else {
          // clear only remote/manual errors for id
          clearErrors("id");
        }
      } catch (err) {
        // network or server error: set a generic message
        setError("id", {
          type: "manual",
          message: "Error verificando cédula",
        });
      } finally {
        setCheckingId(false);
      }
    }, 600);

    return () => {
      if (idCheckTimer.current) {
        window.clearTimeout(idCheckTimer.current);
        idCheckTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idValue]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">

      <Card className="w-full max-w-xl p-6 space-y-4">

        <div>
          <h1 className="text-2xl font-bold">
            Registro de Usuario
          </h1>

          <p className="text-sm text-muted-foreground">
            Completa los datos requeridos
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >

          {/* CÉDULA */}

          <div>
            <Input
              placeholder="Cédula"
              {...register("id")}
            />

            {errors.id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.id.message}
              </p>
            )}
          </div>

          {/* EMAIL */}

          <div>
            <Input
              placeholder="Correo"
              {...register("email")}
            />

            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}

          <div>
            <Input
              type="password"
              placeholder="Contraseña"
              {...register("password")}
            />

            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* ROL */}

          <div>

            <Select
              value={roleValue?.[0]}
              onValueChange={(value) =>
                setValue("roles", [value as any])
              }
            >

              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="PATIENT">
                  Paciente
                </SelectItem>

                <SelectItem value="DOCTOR">
                  Doctor
                </SelectItem>

                <SelectItem value="SCHEDULER">
                  Agendador
                </SelectItem>

                <SelectItem value="ADMIN">
                  Administrador
                </SelectItem>

              </SelectContent>

            </Select>

            {errors.roles && (
              <p className="text-sm text-red-500 mt-1">
                {errors.roles.message}
              </p>
            )}

          </div>

          {/* NOMBRES */}

          <div>
            <Input
              placeholder="Nombres"
              {...register("names")}
            />

            {errors.names && (
              <p className="text-sm text-red-500 mt-1">
                {errors.names.message}
              </p>
            )}
          </div>

          {/* APELLIDOS */}

          <div>
            <Input
              placeholder="Apellidos"
              {...register("lastnames")}
            />

            {errors.lastnames && (
              <p className="text-sm text-red-500 mt-1">
                {errors.lastnames.message}
              </p>
            )}
          </div>

          {/* GÉNERO */}

          <div>

            <Select
              value={genderValue}
              onValueChange={(value) =>
                setValue("gender", value as any)
              }
            >

              <SelectTrigger>
                <SelectValue placeholder="Género" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="M">
                  Masculino
                </SelectItem>

                <SelectItem value="F">
                  Femenino
                </SelectItem>

                <SelectItem value="OTHER">
                  Otro
                </SelectItem>

              </SelectContent>

            </Select>

            {errors.gender && (
              <p className="text-sm text-red-500 mt-1">
                {errors.gender.message}
              </p>
            )}

          </div>

          {/* TELÉFONO */}

          <div>
            <Input
              placeholder="Teléfono"
              {...register("phone_number")}
            />

            {errors.phone_number && (
              <p className="text-sm text-red-500 mt-1">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          {/* FECHA NACIMIENTO */}

          <div>
            <label
              htmlFor="born_date"
              className="block text-sm font-medium mb-1"
            >
              Fecha de nacimiento
            </label>

            <Input
              id="born_date"
              type="date"
              {...register("born_date")}
            />

            {errors.born_date && (
              <p className="text-sm text-red-500 mt-1">
                {errors.born_date.message}
              </p>
            )}
          </div>

          {/* BOTONES */}

          <div className="flex flex-col gap-2">

            <Button
  type="submit"
  variant="default"
  disabled={!isValid || isSubmitting || checkingId}
>
  {isSubmitting
    ? "Registrando..."
    : "Crear cuenta"}
</Button>

            <Button
  type="button"
  variant="outline"
  onClick={() => router.push("/login")}
>
  Volver al login
</Button>

          </div>

        </form>

      </Card>

    </main>
  );
}