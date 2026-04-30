import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("users")
export class UserOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone_number: string;

  @Column({ type: 'date' })
  born_date: Date;

  @Column()
  names: string;

  @Column()
  lastnames: string;

  @Column()
  gender: string;
}