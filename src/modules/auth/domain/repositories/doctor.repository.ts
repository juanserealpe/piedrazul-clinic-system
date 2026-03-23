import { Doctor } from "../entities/doctor.entity.js";

export interface DoctorRepository {
  findByEmail(email: string): Promise<Doctor | null>;
  findById(id: string): Promise<Doctor | null>;
  save(user: Doctor): Promise<Doctor>;
  findAvailableDoctors(date: string): Promise<Doctor[]>;
}
