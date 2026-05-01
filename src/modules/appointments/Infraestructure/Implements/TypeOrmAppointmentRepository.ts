import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { AppointmentOrmEntity } from "../Entities/AppointmentOrmEntity";
import { AppointmentRepository } from "../../domain/Repositories/AppointmentRepository";
import { AppointmentPersistenceMapper } from "../Mappers/AppointmentPersistenceMapper";
import { Appointment } from "../../domain/entities/Appointment.entity";
import { Status } from "../../domain/entities/Status";

@Injectable()
export class TypeOrmAppointmentRepository implements AppointmentRepository {
  constructor(
    @InjectRepository(AppointmentOrmEntity)
    private readonly repo: Repository<AppointmentOrmEntity>
  ) {}

  async findByDoctor(id: string): Promise<Appointment[]> {
    const results = await this.repo.find({
      where: { doctorId: id },
      order: { date: "ASC" },
    });
    return results.map(AppointmentPersistenceMapper.toDomain);
  }

  async findByDoctorAndStatus(
    id: string,
    status: Status
  ): Promise<Appointment[]> {
    const results = await this.repo.find({
      where: { doctorId: id, status: status as any },
      order: { date: "ASC" },
    });
    return results.map(AppointmentPersistenceMapper.toDomain);
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const orm = AppointmentPersistenceMapper.toOrm(appointment);
    const saved = await this.repo.save(orm);
    return AppointmentPersistenceMapper.toDomain(saved);
  }

  async findByDoctorStatusAndDateRange(
    doctorId: string,
    status: Status,
    start: Date,
    end: Date
  ): Promise<Appointment[]> {
    const results = await this.repo.find({
      where: {
        doctorId,
        status: status as any,
        date: Between(start, end),
      },
      order: { date: "ASC" },
    });

    return results.map(AppointmentPersistenceMapper.toDomain);
  }
}
