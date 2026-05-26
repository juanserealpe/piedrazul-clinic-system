import { AppointmentSchedule } from "./AppointmentSchedule";
import { Status } from "./Status";

export class Appointment {
  constructor(
    public id: string | null,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly observations: string,
    private history: AppointmentSchedule[],
    public date: Date,
    public status: Status,

  ) {}

  updateCurrentDate(pDate: Date){
    this.date = pDate;
  }
  getCurrentDate(): Date {
    return this.date;
  }

  isOnSameDay(pDate: Date): boolean {
    return (
      this.date.getFullYear() === pDate.getFullYear() &&
      this.date.getMonth() === pDate.getMonth() &&
      this.date.getDate() === pDate.getDate()
    );
  }

  overlaps(pDate: Date): boolean {
    return this.date.getTime() === pDate.getTime();
  }

  isScheduled(): boolean {
    return this.status === Status.SCHEDULED;
  }

  isReScheduled(): boolean{
    return this.status === Status.RESCHEDULED 
      && this.history.length > 1;//Adicional
  }

  reschedule(pNewScheduler: AppointmentSchedule){
    this.history.push(pNewScheduler);
    if(this.status === Status.RESCHEDULED) return; //Para no reasiganar siempre
    else this.status = Status.RESCHEDULED;
  }
  getHistory(): AppointmentSchedule[]{
    return this.history;
  }
}
