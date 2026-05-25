import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Status } from "../../domain/entities/Status";
import { AppointmentScheduleOrmEntity } from "./AppointmentScheduleOrmEntity";

  @Entity("appointments")
  export class AppointmentOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
    @Column("varchar", { name: "patient_id" })
    patientId: string;

    @Column("varchar", { name: "doctor_id" })
    doctorId: string;

    @Column({ type: "text" })
    date: string;
    
    @Column("text", { default: "" })
    observations: string;

    @Column({
      type: "varchar",
      enum: Status,
      default: Status.SCHEDULED,
    })
    status: Status;

    @OneToMany(
      () => AppointmentScheduleOrmEntity,
      (vHistory) => vHistory.appointment,
      {
        cascade: true,
      },
    )
    history: AppointmentScheduleOrmEntity[];
  }
