# Módulo de Citas — Setup rápido

## Dependencias a instalar

```bash
npm install @nestjs/typeorm typeorm better-sqlite3
npm install -D @types/better-sqlite3
```

> Se usa `better-sqlite3` en lugar del driver `sqlite3` porque TypeORM lo prefiere
> para NestJS. Si ya tienes `sqlite3` instalado, cambia el `type` en `database.config.ts`.

---

## Estructura del módulo

```
src/
├── app.module.ts                          ← registra TypeORM + AppointmentModule
│
└── appointments/
    ├── appointment.controller.ts          ← endpoints REST
    ├── appointment.module.ts              ← DI wiring
    │
    ├── domain/
    │   ├── entities/
    │   │   ├── Appointment.entity.ts      ← tu entidad de dominio (sin cambios)
    │   │   ├── Schedule.entity.ts         ← tu entidad de dominio (sin cambios)
    │   │   ├── Status.ts
    │   │   └── DaysOfWeek.ts
    │   └── repositories/
    │       ├── AppointmentRepository.ts   ← interfaz (puerto)
    │       └── ScheduleRepository.ts      ← interfaz (puerto)
    │
    ├── use-cases/
    │   ├── GetAppointmentsByDoctorAndDate.ts
    │   ├── CreateAppointmentByScheduler.ts
    │   └── GetAvailableSlots.ts
    │
    └── infrastructure/
        ├── database.config.ts             ← config SQLite
        └── persistence/
            ├── entities/
            │   ├── AppointmentOrmEntity.ts  ← tabla "appointments"
            │   └── ScheduleOrmEntity.ts     ← tabla "schedules"
            ├── mappers/
            │   ├── AppointmentMapper.ts
            │   └── ScheduleMapper.ts
            ├── TypeOrmAppointmentRepository.ts
            └── TypeOrmScheduleRepository.ts
```

---

## Para probar con Postman

1. Levantar el servidor: `npm run start:dev`
2. Con `synchronize: true` TypeORM crea las tablas automáticamente al iniciar.
3. Insertar datos de prueba directamente en SQLite:

```sql
-- Crear un schedule de prueba (médico atiende lunes=1, de 8 a 17, cada 30 min)
INSERT INTO schedules (id, doctor_id, day, start_hour, end_hour, interval, is_active)
VALUES ('sched-001', 'doctor-001', 1, 8, 17, 30, 1);

-- Crear una cita de prueba existente (para probar el 409)
INSERT INTO appointments (id, patient_id, doctor_id, date, observations, status)
VALUES ('appt-001', 'patient-001', 'doctor-001', '2026-03-30T08:00:00.000Z', 'Cita existente', 'SCHEDULED');
```

4. Importar `Piedrazul_Appointments.postman_collection.json` en Postman.
5. Cambiar las variables `doctor_id` → `doctor-001` y `patient_id` → `patient-001`.

---

## Cambiar a PostgreSQL en producción

Solo modificar `database.config.ts`:

```typescript
export const databaseConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [AppointmentOrmEntity, ScheduleOrmEntity],
  synchronize: false,   // usar migrations en producción
};
```

Las entidades ORM, repositorios y casos de uso **no cambian nada**.
