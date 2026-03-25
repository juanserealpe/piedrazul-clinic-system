// src/database/init-data.service.ts
import { DataSource } from 'typeorm';
import { DoctorOrmEntity } from '../auth/infrastructure/persistence/doctor.orm-entity';
import { UserOrmEntity } from '../auth/infrastructure/persistence/user.orm-entity';
import { ScheduleOrmEntity } from './Infraestructure/Entities/ScheduleOrmEntity';
import { AppointmentOrmEntity } from './Infraestructure/Entities/AppointmentOrmEntity';
import { Status } from './domain/entities/Status';
import { GenderEnum } from '../auth/domain/enums/gender.enum';
import { DayOfWeek } from './domain/entities/DaysOfWeek';

export class InitDataService {
  constructor(private dataSource: DataSource) {}

  async seedIfEmpty() {
    const doctorRepo = this.dataSource.getRepository(DoctorOrmEntity);
    const doctorCount = await doctorRepo.count();
    
    if (doctorCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Database is empty. Seeding initial data...');
    
    try {
      await this.seedDoctors();
      await this.seedPatients();
      await this.seedSchedules();
      await this.seedAppointments();
      
      console.log('Database seeding completed successfully.');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  private async seedDoctors() {
  const doctorRepo = this.dataSource.getRepository(DoctorOrmEntity);
  const doctors = [
    {
      id: 'doctor-001',
      email: 'juan.perez@clinic.com',
      phone_number: '123456789',
      born_date: new Date('1980-01-15'),
      names: 'Juan',
      lastnames: 'Pérez',
      gender: GenderEnum.MASCULINO,
      type: 'DOCTOR',
      averageAppointmentDuration: 20,
    },
    {
      id: 'doctor-002',
      email: 'maria.garcia@clinic.com',
      phone_number: '987654321',
      born_date: new Date('1985-05-20'),
      names: 'María',
      lastnames: 'García',
      gender: GenderEnum.FEMENINO,
      type: 'DOCTOR',
      averageAppointmentDuration: 20,
    },
    {
      id: 'doctor-003',
      email: 'carlos.rodriguez@clinic.com',
      phone_number: '555555555',
      born_date: new Date('1975-10-10'),
      names: 'Carlos',
      lastnames: 'Rodríguez',
      gender: GenderEnum.MASCULINO,
      type: 'DOCTOR',
      averageAppointmentDuration: 20,
    },
  ];

  await doctorRepo.save(doctors);
  console.log(`Created ${doctors.length} doctors`);
}
private async seedPatients() {
  const patientRepo = this.dataSource.getRepository(UserOrmEntity);
  const patients = [
    {
      id: 'patient-001',
      email: 'ana.lopez@email.com',
      phone_number: '111111111',
      born_date: new Date('1990-05-15'),
      names: 'Ana',
      lastnames: 'López',
      gender: 'FEMENINO',
      type: 'PATIENT',
    },
    {
      id: 'patient-002',
      email: 'luis.martinez@email.com',
      phone_number: '222222222',
      born_date: new Date('1985-08-22'),
      names: 'Luis',
      lastnames: 'Martínez',
      gender: 'MASCULINO',
      type: 'PATIENT',
    },
    {
      id: 'patient-003',
      email: 'carmen.sanchez@email.com',
      phone_number: '333333333',
      born_date: new Date('1995-12-10'),
      names: 'Carmen',
      lastnames: 'Sánchez',
      gender: 'FEMENINO',
      type: 'PATIENT',
    },
  ];

  await patientRepo.save(patients);
  console.log(`Created ${patients.length} patients`);
}
  private async seedSchedules() {
    const scheduleRepo = this.dataSource.getRepository(ScheduleOrmEntity);
    const schedules = [
      { id: 'schedule-001', doctorId: 'doctor-001', day: DayOfWeek.MONDAY,    startHour: 13, endHour: 22, interval: 60, isActive: true },
      { id: 'schedule-002', doctorId: 'doctor-001', day: DayOfWeek.TUESDAY,   startHour: 13, endHour: 25, interval: 30, isActive: true }, // 25 = 1am siguiente día
      { id: 'schedule-003', doctorId: 'doctor-001', day: DayOfWeek.WEDNESDAY, startHour: 13, endHour: 26, interval: 10, isActive: true },
      { id: 'schedule-004', doctorId: 'doctor-001', day: DayOfWeek.THURSDAY,  startHour: 13, endHour: 20, interval: 60, isActive: true },
      { id: 'schedule-005', doctorId: 'doctor-001', day: DayOfWeek.FRIDAY,    startHour: 13, endHour: 22, interval: 60, isActive: false },
      //
      { id: 'schedule-006', doctorId: 'doctor-002', day: DayOfWeek.MONDAY, startHour: 14, endHour: 23, interval: 60, isActive: true },
      { id: 'schedule-007', doctorId: 'doctor-002', day: DayOfWeek.TUESDAY, startHour: 14, endHour: 23, interval: 60, isActive: true },
      //
      { id: 'schedule-008', doctorId: 'doctor-003', day: DayOfWeek.MONDAY, startHour: 15, endHour: 19, interval: 60, isActive: true },
    ];

    await scheduleRepo.save(schedules);
    console.log(`Created ${schedules.length} schedules`);
  }


private async seedAppointments() {
  const appointmentRepo = this.dataSource.getRepository(AppointmentOrmEntity);
  const today = new Date();

  const createUTCDate = (daysOffset: number, utcHour: number): Date => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + daysOffset);
    date.setUTCHours(utcHour, 0, 0, 0);
    return date;
  };

  const tomorrow        = createUTCDate(1, 14);  // 9am Colombia  = 14 UTC
  const tomorrow10am    = createUTCDate(1, 15);  // 10am Colombia = 15 UTC
  const dayAfterTomorrow = createUTCDate(2, 16); // 11am Colombia = 16 UTC
  const yesterday       = createUTCDate(-1, 19); // 2pm Colombia  = 19 UTC

  const appointments = [
    {
      id: 'apt-001',
      patientId: 'patient-001',
      doctorId: 'doctor-001',
      date: tomorrow,
      observations: 'Primera consulta - Dolor en el pecho',
      status: Status.SCHEDULED,
    },
    {
      id: 'apt-002',
      patientId: 'patient-002',
      doctorId: 'doctor-001',
      date: tomorrow10am,
      observations: 'Control de rutina',
      status: Status.SCHEDULED,
    },
    {
      id: 'apt-003',
      patientId: 'patient-003',
      doctorId: 'doctor-002',
      date: dayAfterTomorrow,
      observations: 'Vacunación',
      status: Status.SCHEDULED,
    },
    {
      id: 'apt-004',
      patientId: 'patient-001',
      doctorId: 'doctor-003',
      date: yesterday,
      observations: 'Consulta cancelada',
      status: Status.CANCELLED,
    },
  ];

  await appointmentRepo.save(appointments);
  console.log(`Created ${appointments.length} appointments`);
}
}