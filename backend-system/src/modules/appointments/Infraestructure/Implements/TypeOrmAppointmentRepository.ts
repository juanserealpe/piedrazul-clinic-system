import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, MoreThanOrEqual, Repository } from "typeorm";
import { AppointmentOrmEntity } from "../Entities/AppointmentOrmEntity";
import { AppointmentRepository } from "../../domain/Repositories/AppointmentRepository";
import { AppointmentPersistenceMapper } from "../Mappers/AppointmentPersistenceMapper";
import { Appointment } from "../../domain/entities/Appointment.entity";
import { Status } from "../../domain/entities/Status";
import { AppointmentSchedule } from "../../domain/entities/AppointmentSchedule";
import { AppointmentScheduleOrmEntity } from "../Entities/AppointmentScheduleOrmEntity";
import { AppointmentSchedulePersistenceMapper } from "../Mappers/AppointmentSchedulePersistenceMapper";

@Injectable()
export class TypeOrmAppointmentRepository implements AppointmentRepository {
  constructor(
    @InjectRepository(AppointmentOrmEntity)
    private readonly repo: Repository<AppointmentOrmEntity>,
  ) {}

  async findById(appointmentId: string): Promise<Appointment | null> {
    const result = await this.repo.findOne({
      where: { id: appointmentId },
    });
    if (!result) return null;
    return AppointmentPersistenceMapper.toDomain(result);
  }

  async findByAppointmentIdAndDoctorId(
    pDoctorId: string,
    pAppointmentId: string,
  ): Promise<Appointment | null> {
    const vResult = await this.repo.findOne({
      where: {
        id: pAppointmentId,
        doctorId: pDoctorId,
      },
    });
    if (!vResult) return null;
    return AppointmentPersistenceMapper.toDomain(vResult);
  }

  async findByAppointmentIdDoctorAndStatus(
    pAppointmentId: string,
    pDoctorId: string,
    pStatus: Status[],
  ): Promise<Appointment | null> {
    const vStatusFilter = Array.isArray(pStatus) ? In(pStatus) : pStatus;
    const vResult = await this.repo.findOne({
      where: {
        id: pAppointmentId,
        doctorId: pDoctorId,
        status: vStatusFilter,
      },
    });
    if (!vResult) return null;
    return AppointmentPersistenceMapper.toDomain(vResult);
  }

  async save(appointment: Appointment): Promise<Appointment> {
    const orm = AppointmentPersistenceMapper.toOrm(appointment);
    const saved = await this.repo.save(orm);
    return AppointmentPersistenceMapper.toDomain(saved);
  }

  async findByDoctorStatusAndDateRange(
    doctorId: string,
    status: Status[],
    start: Date,
    end: Date,
  ): Promise<Appointment[]> {
    const vStatusFilter = Array.isArray(status) ? In(status) : status;
    const results = await this.repo.find({
      where: {
        doctorId,
        status: vStatusFilter,
        date: Between(start.toISOString(), end.toISOString()),
      },
      order: { date: "ASC" },
    });
    return results.map(AppointmentPersistenceMapper.toDomain);
  }

  async findByDoctorStatusAndDate(
    doctorId: string,
    status: Status[],
    date: Date,
  ): Promise<Appointment | null> {
    const vStatusFilter = Array.isArray(status) ? In(status) : status;
    const result = await this.repo.findOne({
      where: {
        doctorId,
        status: vStatusFilter,
        date: date.toISOString(),
      },
      order: { date: "ASC" },
    });
    if (!result) return null;
    return AppointmentPersistenceMapper.toDomain(result);
  }

  async update(
    pAppointment: Appointment,
    pNewSchedule: AppointmentSchedule,
  ): Promise<Appointment> {
    await this.repo.manager.transaction(async (pManager) => {
      await pManager.update(
        AppointmentOrmEntity,
        { id: pAppointment.id! },
        {
          date: pNewSchedule.scheduledDate.toISOString(),
          status: pAppointment.status,
        },
      );

      const vScheduleOrm = AppointmentSchedulePersistenceMapper.toOrm(pNewSchedule);
      vScheduleOrm.appointment = { id: pAppointment.id! } as AppointmentOrmEntity;
      await pManager.save(AppointmentScheduleOrmEntity, vScheduleOrm);
    });

    pAppointment.updateCurrentDate(pNewSchedule.scheduledDate);
    return pAppointment;
  }

  async updateStatusByDoctorIdAndDateRange(
    pDoctorId: string,
    pStartDate: Date,
    pEndDate: Date,
    pStatus: Status,
  ): Promise<number> {
    const vResult = await this.repo.update(
      {
        doctorId: pDoctorId,
        date: Between(pStartDate.toISOString(), pEndDate.toISOString()),
      },
      { status: pStatus },
    );
    return vResult.affected ?? 0;
  }

  async findUpcomingPendingsToRescheduleByDoctorId(
    pDoctorId: string,
    pCurrentDate: Date,
  ): Promise<Appointment[]> {
    const results = await this.repo.find({
      where: {
        doctorId: pDoctorId,
        status: Status.PENDING_RESCHEDULE,
        date: MoreThanOrEqual(pCurrentDate.toISOString()),
      },
      order: { date: "ASC" },
    });
    return results.map(AppointmentPersistenceMapper.toDomain);
  }

  async updateStatusByIds(pIds: string[], pStatus: Status): Promise<number> {
    const vResult = await this.repo.update(
      { id: In(pIds) },
      { status: pStatus },
    );
    return vResult.affected ?? 0;
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const results = await this.repo.find({
      where: { patientId },
      order: { date: "DESC" },
    });
    return results.map(AppointmentPersistenceMapper.toDomain);
  }
}