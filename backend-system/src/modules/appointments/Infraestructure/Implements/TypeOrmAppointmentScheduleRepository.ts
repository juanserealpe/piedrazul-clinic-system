import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppointmentSchedule } from "../../domain/entities/AppointmentSchedule";
import { AppointmentScheduleRepository } from "../../domain/Repositories/AppointmentScheduleRepository";
import { AppointmentScheduleOrmEntity } from "../Entities/AppointmentScheduleOrmEntity";
import { AppointmentSchedulePersistenceMapper } from "../Mappers/AppointmentSchedulePersistenceMapper";

// ── CORRECCIÓN Bug 8: autorreferencia circular ─────────────────────────────
// El archivo original inyectaba AppointmentScheduleRepository (la INTERFAZ)
// como su propia dependencia, creando un ciclo infinito en el contenedor DI.
// Solución: inyectar directamente el Repository<AppointmentScheduleOrmEntity>
// de TypeORM, igual que hacen todos los otros repositorios del proyecto.
@Injectable()
export class TypeOrmAppointmentScheduleRepository
  implements AppointmentScheduleRepository {

  constructor(
    @InjectRepository(AppointmentScheduleOrmEntity)
    private readonly repo: Repository<AppointmentScheduleOrmEntity>,
  ) {}

  async save(
    pNewAppointmentSchedule: AppointmentSchedule
  ): Promise<AppointmentSchedule> {
    const vOrm = AppointmentSchedulePersistenceMapper.toOrm(
      pNewAppointmentSchedule
    );
    const vSaved = await this.repo.save(vOrm);
    return AppointmentSchedulePersistenceMapper.toDomain(vSaved);
  }
}