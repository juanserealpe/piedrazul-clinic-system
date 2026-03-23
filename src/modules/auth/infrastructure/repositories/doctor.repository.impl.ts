import { Injectable } from "@nestjs/common";
import type { UserRepository } from "../../domain/repositories/user.repository";
import { Doctor } from "../../domain/entities/doctor.entity";
import { User } from "../../domain/entities/user.entity";

export interface DoctorRepository {
  findById(id: string): Promise<Doctor | null>;
  findAll(): Promise<Doctor[]>;
  findAvailableDoctors(date: string): Promise<Doctor[]>;
  save(doctor: Doctor): Promise<Doctor>;
}

@Injectable()
export class DoctorRepositoryImpl implements DoctorRepository {
  constructor(private readonly userRepo: UserRepository) {}

  async findById(id: string): Promise<Doctor | null> {
    const user = await this.userRepo.findById(id);
    if (user && user instanceof Doctor) return user;
    return null;
  }

  async findAll(): Promise<Doctor[]> {
    const users: User[] = await this.userRepo.findAll();
    return users.filter((u) => u instanceof Doctor);
  }

  async findAvailableDoctors(date: string): Promise<Doctor[]> {
    const doctors = await this.findAll();
    return doctors.filter((d) =>
      d.getAvailableSlots().some((slot) => slot.date === date),
    );
  }

  async save(doctor: Doctor): Promise<Doctor> {
    return (await this.userRepo.save(doctor)) as Doctor;
  }
}
