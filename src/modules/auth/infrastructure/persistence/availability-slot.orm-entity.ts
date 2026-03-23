/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { DoctorOrmEntity } from "./doctor.orm-entity";

@Entity("availability_slots")
export class AvailabilitySlotOrmEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() date: string;
  @Column() startTime: string;
  @Column() endTime: string;
  @Column({ default: "available" }) status: string;

  @ManyToOne(() => DoctorOrmEntity, (doctor) => doctor.slots)
  doctor: DoctorOrmEntity;
}
