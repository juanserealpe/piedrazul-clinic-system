"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { useAuthStore } from "../../store/auth.store";

import { sidebarItems } from "../../config/sidebar-items";

export default function Sidebar() {

  const pathname = usePathname();

  const user = useAuthStore(
    (state) => state.user
  );

  const visibleItems = sidebarItems.filter(
    (item) =>
      item.roles.some(
        (role) =>
          user?.roles.includes(role)
      )
  );

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-4">

      <h2 className="text-2xl font-bold mb-8">
        Piedrazul
      </h2>

      <nav className="flex flex-col gap-2">

        {visibleItems.map((item) => {

          const active =
            pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                p-3 rounded-lg transition
                ${
                  active
                    ? "bg-slate-700"
                    : "hover:bg-slate-800"
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}

      </nav>

    </aside>
  );
}