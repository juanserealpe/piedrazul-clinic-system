import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { AppointmentOrmEntity } from "./Entities/AppointmentOrmEntity";
import { AppointmentRepository } from "../domain/Repositories/AppointmentRepository";
import { AppointmentMapper } from "./Mappers/AppointmentMapper";
import { Appointment } from "../domain/entities/Appointment.entity";
import { Status } from "../domain/entities/Status";

@Injectable()
export class TypeOrmAppointmentRepository implements AppointmentRepository {
  constructor(
    @InjectRepository(AppointmentOrmEntity)
    private readonly repo: Repository<AppointmentOrmEntity>
  ) {}

  async findByDoctor(id: string): Promise<Appointment[] | null> {
    const results = await this.repo.find({
      where: { doctorId: id },
      order: { date: "ASC" },
    });
    return results.map(AppointmentMapper.toDomain);
  }

  async findByDoctorAndStatus(
    id: string,
    status: Status
  ): Promise<Appointment[] | null> {
    const results = await this.repo.find({
      where: { doctorId: id, status: status as any },
      order: { date: "ASC" },
    });
    return results.map(AppointmentMapper.toDomain);
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const orm = AppointmentMapper.toOrm(appointment);
    const saved = await this.repo.save(orm);
    return AppointmentMapper.toDomain(saved);
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

    return results.map(AppointmentMapper.toDomain);
  }
}
