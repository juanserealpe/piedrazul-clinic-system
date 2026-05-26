"use client";

import { Card } from "@/src/components/ui/card";
import { useAuthStore } from "@/src/store/auth.store";


export default function ProfilePage() {

  const user = useAuthStore(
    (state) => state.user
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Mi Perfil
        </h1>

        <p className="text-muted-foreground">
          Información del usuario autenticado
        </p>
      </div>

      <Card className="p-6 space-y-4">

        {/* ID */}

        <div>
          <p className="text-sm text-muted-foreground">
            Identificación
          </p>

          <h2 className="text-xl font-semibold">
            {user?.id}
          </h2>
        </div>

        {/* ROLES */}

        <div>

          <p className="text-sm text-muted-foreground mb-2">
            Roles asignados
          </p>

          <div className="flex flex-wrap gap-2">

            {user?.roles.map((role) => (

              <span
                key={role}
                className="
                  px-3 py-1
                  bg-slate-200
                  rounded-full
                  text-sm
                  font-medium
                "
              >
                {role}
              </span>

            ))}

          </div>

        </div>

      </Card>

    </div>
  );
}