import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { AccountOrmEntity } from "./account.orm-entity";

@Entity("users")
export class UserOrmEntity {
  @PrimaryColumn() id: string;
  @Column({ unique: true }) email: string;
  @Column() phone_number: string;
  @Column() born_date: Date;
  @Column() names: string;
  @Column() lastnames: string;
  @Column() gender: string;

  @OneToOne(() => AccountOrmEntity, { cascade: true, eager: true })
  @JoinColumn()
  account: AccountOrmEntity;
}
