import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("accounts")
export class AccountOrmEntity {
  @PrimaryColumn() id: string;
  @Column() password: string;
  @Column("simple-array") roles: string[];
}
