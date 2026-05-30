export const sidebarItems = [

  {
    label: "Gestionar Citas",
    path: "/dashboard/doctor/appointments",

    roles: [
      "DOCTOR",
    ],
  },

  {
    label: "Gestionar Horarios",
    path: "/dashboard/doctor/schedule",

    roles: [
      "DOCTOR",
    ],
  },
  {
    label: "Gestionar Horarios",
    path: "/dashboard/scheduler/schedule",

    roles: [
      "SCHEDULER",
    ],
  },
  {
    label: "Gestionar Citas",
    path: "/dashboard/scheduler/appointments",

    roles: [
      "SCHEDULER",
    ],
  },

    {
    label: "Gestionar Citas",
    path: "/dashboard/patient/appointments",

    roles: [
      "PATIENT",
    ],
  },

  {
    label: "Gestionar Usuarios",
    path: "/dashboard/admin/users",

    roles: ["ADMIN"],
  },
  {
    label: "Auditoria",
    path: "/dashboard/admin/logs",

    roles: ["ADMIN"],
  },

  {
    label: "Mi Perfil",
    path: "/dashboard/profile",

    roles: [
      "ADMIN",
      "DOCTOR",
      "PATIENT",
      "SCHEDULER",
    ],
  },

];