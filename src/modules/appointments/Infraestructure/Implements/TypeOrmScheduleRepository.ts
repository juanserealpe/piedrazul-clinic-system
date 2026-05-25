import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ScheduleRepository } from "../../domain/Repositories/ScheduleRepository";
import { Schedule } from "../../domain/entities/Schedule.entity";
import { SchedulePersistenceMapper } from "../Mappers/SchedulePersistenceMapper";
import { DayOfWeek } from "../../domain/entities/DaysOfWeek";
import { ScheduleOrmEntity } from "../Entities/ScheduleOrmEntity";


@Injectable()
export class TypeOrmScheduleRepository implements ScheduleRepository {
  constructor(
      @InjectRepository(ScheduleOrmEntity)
      private readonly repo: Repository<ScheduleOrmEntity>
  ) {}

  async findByDoctor(doctorId: string): Promise<Schedule[]> {
    const results = await this.repo.find({
      where: { doctorId },
      order: { day: "ASC", startHour: "ASC" },
    });

    return results.map(SchedulePersistenceMapper.toDomain);
  }

  async findByDoctorAndDay(
    doctorId: string,
    day: DayOfWeek
  ): Promise<Schedule[]> {

    const results = await this.repo.find({
      where: {
        doctorId,
        day: day,
      },
      order: { startHour: "ASC" },
    });

    return results.map(SchedulePersistenceMapper.toDomain);
  }

  async save(schedule: Schedule): Promise<Schedule> {
    const orm = SchedulePersistenceMapper.toOrm(schedule);

    const saved = await this.repo.save(orm);

    return SchedulePersistenceMapper.toDomain(saved);
  }
}
