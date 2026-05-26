import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { DayOfWeek } from "../../domain/entities/DaysOfWeek";
import { AppointmentScheduleOrmEntity } from "./AppointmentScheduleOrmEntity";

@Entity("schedules")
export class ScheduleOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { name: "doctor_id" })
  doctorId: string;

  @Column({
    type: "enum",
    enum: DayOfWeek,
  })
  @Column({
    type: "text",
    enum: DayOfWeek,
  })
  day: DayOfWeek;

  @Column("int", { name: "start_hour" })
  startHour: number;

  @Column("int", { name: "end_hour" })
  endHour: number;

  @Column("int")
  interval: number;

  @Column("boolean", { name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

    @OneToMany(
    () => AppointmentScheduleOrmEntity,
    (vSchedule) => vSchedule.appointment,
    {
      cascade: true,
    },
  )
  schedules: AppointmentScheduleOrmEntity[];

}
