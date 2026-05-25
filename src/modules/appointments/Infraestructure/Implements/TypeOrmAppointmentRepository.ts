import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
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
    private readonly repo:
      Repository<AppointmentOrmEntity>,
  ){}

async findByAppointmentIdAndDoctorId(pDoctorId: string,pAppointmentId: string,)
      : Promise<Appointment | null> {

  const vResult = await this.repo.findOne({
    where: {
      id: pAppointmentId,
      doctorId: pDoctorId,
    },
  });

  if (!vResult) {
    return null;
  }

  return AppointmentPersistenceMapper.toDomain(
    vResult,
  );
}
  
  async findByDoctor(id: string): Promise<Appointment[]> {
    const results = await this.repo.find({
      where: { doctorId: id },
      order: { date: "ASC" },
    });
    return results.map(AppointmentPersistenceMapper.toDomain);
  }

  async findByDoctorAndStatus(
    doctorId: string,
    status: Status
  ): Promise<Appointment[]> {
    const results = await this.repo.find({
      where: { doctorId: doctorId, status: status as any },
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
    start: string,
    end: string
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

 async update(pAppointment: Appointment, pNewSchedule: AppointmentSchedule,
  ): Promise<Appointment> {

    await this.repo.manager.transaction(
      async (pManager) => {

        await pManager.update(
          AppointmentOrmEntity,
          {
            id: pAppointment.id!,
          },
          {
            date:
              pNewSchedule.scheduledDate.toISOString(),
            status:
              pAppointment.status,
          },
        );

        const vScheduleOrm =
          AppointmentSchedulePersistenceMapper.toOrm(pNewSchedule);

        vScheduleOrm.appointment = {id: pAppointment.id!,} as AppointmentOrmEntity;

        await pManager.save(AppointmentScheduleOrmEntity, vScheduleOrm,);
      },
    );
  
    pAppointment.updateCurrentDate(pNewSchedule.scheduledDate);
    return pAppointment;
  }

  async existsByDoctorAndDate(
    pDoctorId: string,
    pDate: Date,
  ): Promise<boolean> {

    const vAppointments =
      await this.repo.findOne({
        where: {
          doctorId: pDoctorId,
          date: pDate.toISOString()
        }
      }
      );

    return vAppointments != null;
  }
}
