/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { GenderEnum } from "../enums/gender.enum";
import { Schedule, AvailabilitySlot } from "./availabilitySlot.entity";
import { Account } from "./account.entity";

@Injectable()
export class Doctor extends User {
  constructor(
    id: string,
    email: string,
    phone_number: string,
    born_date: Date,
    names: string,
    lastnames: string,
    gender: GenderEnum,
    public readonly account: Account,
    public readonly schedule: Schedule = new Schedule(),
    public readonly averageAppointmentDuration: number,
  ) {
    super(
      id,
      email,
      phone_number,
      born_date,
      names,
      lastnames,
      gender,
      account,
    );
  }
  addAvailability(slot: AvailabilitySlot) {
    this.schedule.addSlot(slot);
  }

  blockAvailability(date: string, startTime: string, endTime: string) {
    this.schedule.blockSlot(date, startTime, endTime);
  }

  getAvailableSlots() {
    return this.schedule.getAvailableSlots();
  }
}
