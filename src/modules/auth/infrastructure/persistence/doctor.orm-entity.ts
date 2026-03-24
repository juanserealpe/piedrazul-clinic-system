import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { UserOrmEntity } from "./user.orm-entity";

@Entity("doctors")
export class DoctorOrmEntity {
  @PrimaryColumn() user_id: string;

  @OneToOne(() => UserOrmEntity, { cascade: true, eager: true })
  @JoinColumn({ name: "user_id" })
  user: UserOrmEntity;

  @Column({ default: 20 }) averageAppointmentDuration: number;
}
