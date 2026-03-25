import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { DayOfWeek } from "../../domain/entities/DaysOfWeek";

@Entity("schedules")
export class ScheduleOrmEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar", { name: "doctor_id" })
  doctorId: string;

  @Column({
    type: "int",
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

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
