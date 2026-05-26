# Piedrazul Clinic System

Sistema de gestión de citas médicas desarrollado con arquitectura separada de backend y frontend.

---

# Estructura del proyecto

```txt
piedrazul-clinic-system/
├── backend-system/
└── frontend-system/
```

---

# Backend

## Tecnologías principales

- NestJS
- TypeScript
- TypeORM
- SQLite
- JWT Authentication
- Role Based Access Control (RBAC)

---

## Roles soportados

- ADMIN
- DOCTOR
- PATIENT
- SCHEDULER

---

## Funcionalidades principales

- Autenticación JWT
- Registro de usuarios
- Gestión de horarios médicos
- Gestión de citas médicas
- Control de acceso por roles
- Disponibilidad de horarios
- Exportación de datos

---

## Ejecutar backend

```bash
cd backend-system
npm install
npm run start:dev
```

Servidor por defecto:

```txt
http://localhost:3000
```

---

# Frontend

## Tecnologías principales

- Next.js
- TypeScript
- TailwindCSS
- shadcn/ui
- Zustand
- Axios
- React Hook Form
- Zod

---

## Funcionalidades principales

- Login y registro
- Gestión de sesiones JWT
- Sidebar dinámico por roles
- Paneles separados por permisos
- Gestión de horarios médicos
- Visualización de perfiles
- Formularios validados en tiempo real

---

## Ejecutar frontend

```bash
cd frontend-system
npm install
npm run dev
```

Servidor por defecto:

```txt
http://localhost:4000
```

---

# Variables importantes

El frontend utiliza:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

# Instalación rápida

## 1. Clonar repositorio

```bash
git clone <repo-url>
```

---

## 2. Instalar dependencias

### Backend

```bash
cd backend-system
npm install
```

### Frontend

```bash
cd frontend-system
npm install
```

---

## 3. Ejecutar ambos proyectos

### Backend

```bash
npm run start:dev
```

### Frontend

```bash
npm run dev
```

---

# Estado del proyecto

Actualmente en desarrollo.
