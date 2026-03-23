/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { UserOrmEntity } from "./user.orm-entity";
import { AvailabilitySlotOrmEntity } from "./availability-slot.orm-entity";

@Entity("doctors") // tabla separada (tabla-por-clase) o puedes usar herencia con @ChildEntity
export class DoctorOrmEntity extends UserOrmEntity {
  @Column({ default: 20 }) averageAppointmentDuration: number;

  @OneToMany(() => AvailabilitySlotOrmEntity, (slot) => slot.doctor, {
    cascade: true,
    eager: true,
  })
  slots: AvailabilitySlotOrmEntity[];
}
