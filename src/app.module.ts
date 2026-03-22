import { Module } from '@nestjs/common';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AuthModule } from './modules/auth/auth.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';

@Module({
  imports: [
    AppointmentsModule,
    PatientsModule,
    DoctorsModule,
    AuthModule,
    SchedulingModule,
  ],
})
export class AppModule {}
