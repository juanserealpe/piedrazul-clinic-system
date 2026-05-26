"use client";

import { useRouter } from "next/navigation";

import { useAuthStore } from "../../store/auth.store";

import { Button } from "../..//components/ui/button";

export default function Navbar() {

  const router = useRouter();

  const logout = useAuthStore(
    (state) => state.logout
  );

  const user = useAuthStore(
    (state) => state.user
  );

  const handleLogout = () => {

    logout();

    router.push("/login");
  };

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">

      <div>
        <h1 className="font-semibold">
          Sistema Médico
        </h1>

        <p className="text-sm text-muted-foreground">
          {user?.id}
        </p>
      </div>

      <Button
        variant="destructive"
        onClick={handleLogout}
      >
        Cerrar Sesión
      </Button>

    </header>
  );
}