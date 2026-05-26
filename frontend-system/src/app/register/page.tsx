"use client";

import { useRouter } from "next/navigation";

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
import { registerRequest } from "@/src/services/auth.service";
import { RegisterFormData, registerSchema } from "@/src/types/register.schema";
import { Input, Button } from "@base-ui/react";

export default function RegisterPage() {

  const router = useRouter();

  const {

    register,
    handleSubmit,
    setValue,
    watch,

    formState: {
      errors,
      isSubmitting,
    },

  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),

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
            <Input
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
              disabled={isSubmitting}
            >
              {
                isSubmitting
                  ? "Registrando..."
                  : "Crear cuenta"
              }
            </Button>

            <Button
              type="button"
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