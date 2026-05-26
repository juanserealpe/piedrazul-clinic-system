import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AppointmentOrmEntity } from "./AppointmentOrmEntity";

  @Entity("appointment_schedules")
  export class AppointmentScheduleOrmEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("varchar", { name: "scheduled_by" })
    scheduledBy: string;

    @Column("datetime", { name: "scheduled_date" })
    scheduledDate: Date;

    @CreateDateColumn({
      name: "created_at",
      type: "datetime",
    })
  createdAt!: Date;
    @ManyToOne(
      () => AppointmentOrmEntity,
      (vAppointment) => vAppointment.history,
      {
        onDelete: "CASCADE",
      },
    )
    @JoinColumn({
      name: "appointment_id",
    })
    appointment: AppointmentOrmEntity;
  }