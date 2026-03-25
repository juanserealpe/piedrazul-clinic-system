import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Status } from "../../domain/entities/Status";

@Entity("appointments")
export class AppointmentOrmEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar", { name: "patient_id" })
  patientId: string;

  @Column("varchar", { name: "doctor_id" })
  doctorId: string;

  @Column("datetime")
  date: Date;

  @Column("text", { default: "" })
  observations: string;

  @Column({
    type: "varchar",
    enum: Status,
    default: Status.SCHEDULED,
  })
  status: Status;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
