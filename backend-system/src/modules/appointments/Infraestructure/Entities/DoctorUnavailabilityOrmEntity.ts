import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("doctor_unavailabilities")
export class DoctorUnavailabilityOrmEntity{
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    name: "doctor_id",
    type: "varchar",
  })
  doctorId: string;

  @Column({
    name: "start_date",
    type: "text",
  })
  startDate: string;

  @Column({
    name: "end_date",
    type: "text",
  })
  endDate: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  reason: string;

  @Column({
    type: "text",
    name: "created_at",
  })
  createdAt: string;
  
  @Column({
    name: "is_active",
    type: "boolean",
    default: true,
  })
  isActive: boolean;
}