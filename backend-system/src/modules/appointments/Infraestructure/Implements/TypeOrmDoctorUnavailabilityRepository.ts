import { Injectable } from "@nestjs/common";
import { DoctorUnavailabilityRepository } from "../../domain/Repositories/DoctorUnavailabilityRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { DoctorUnavailabilityOrmEntity } from "../Entities/DoctorUnavailabilityOrmEntity";
import { LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import { DoctorUnavailability } from "../../domain/entities/DoctorUnavailability";
import { DoctorUnavailabilityPersistenceMapper } from "../Mappers/DoctorUnavailabilityPersistenceMapper";

@Injectable()
export class TypeOrmDoctorUnavailabilityRepository implements DoctorUnavailabilityRepository{
    constructor(
        @InjectRepository(DoctorUnavailabilityOrmEntity)
        private readonly repo: Repository<DoctorUnavailabilityOrmEntity>
    ){}

    async findActiveByDoctorIdAndDate(pDoctorId: string, pDate: Date)
    : Promise<DoctorUnavailability | null>{
          const vDate = pDate.toISOString();

        const result = await this.repo.findOne({
            where: {
            doctorId: pDoctorId,
            isActive: true,
            startDate: LessThanOrEqual(vDate),
            endDate: MoreThan(vDate),
            },
        });
        if(!result) return null;
        return DoctorUnavailabilityPersistenceMapper.toDomain(result);

  }
    async findActiveByDoctorIdAndDateRange(
        pDoctorId: string,
        pStartDate: Date,
        pEndDate: Date
    ): Promise<DoctorUnavailability[]> {

        const results = await this.repo.find({
            where: {
                doctorId: pDoctorId,
                isActive: true,
                startDate: LessThanOrEqual(
                    pEndDate.toISOString()
                ),
                endDate: MoreThan(
                    pStartDate.toISOString()
                ),
            },
        });

        return results.map(
            DoctorUnavailabilityPersistenceMapper.toDomain
        );
    }

    async save(pNewDoctorUnavailability: DoctorUnavailability)
    : Promise<DoctorUnavailability>{

    const orm =
      DoctorUnavailabilityPersistenceMapper.toOrm(
        pNewDoctorUnavailability
      );

    const saved = await this.repo.save(orm);

    return DoctorUnavailabilityPersistenceMapper.toDomain(saved);
    }
    
    async findActiveUpcomingByDoctorId(pDoctorId: string, pDate: Date)
    : Promise<DoctorUnavailability[]>{
         const vDate = pDate.toISOString();

        const results = await this.repo.find({
            where: {
            doctorId: pDoctorId,
            isActive: true,
            endDate: MoreThanOrEqual(vDate),
            },
            order: {
            startDate: "ASC",
            },
        });

        return results.map(
            DoctorUnavailabilityPersistenceMapper.toDomain
        );
    }
}