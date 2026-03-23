import { Module } from "@nestjs/common";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [AppointmentsModule, AuthModule],
})
export class AppModule {}
