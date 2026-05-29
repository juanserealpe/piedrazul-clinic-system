import api from "../lib/axios";


export const createAppointment = async (
  payload: {
    patientId: string;
    doctorId: string;
    scheduleId: string;
    appointmentDate: string;
    reason?: string;
  }
) => {

  const response = await api.post(
    "/appointments",
    payload
  );

  return response.data;
};

export const getAppointments = async (
  date: string,
  doctorId?: string
) => {

  const response = await api.get(
    "/appointments/by-doctor",
    {
      params: {
        date,
        doctorId,
      },
    }
  );

  return response.data;
};

export const exportAppointmentsCsv = async (
  date: string,
  doctorId?: string
) => {

  const response = await api.get(
    "/appointments/export/csv",
    {
      params: {
        date,
        doctorId,
      },
      responseType: "blob",
    }
  );

  return response.data;
};

export const rescheduleAppointment = async (
  appointmentId: string,
  payload: {
    scheduleId: string;
    appointmentDate: string;
  }
) => {

  const response = await api.patch(
    `/appointments/reschedule/${appointmentId}`,
    payload
  );

  return response.data;
};