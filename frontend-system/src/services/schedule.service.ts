import api from "../lib/axios";

export const createSchedulesRequest =
  async (payload: any) => {

    const response = await api.post(
      "/schedules/batch/doctor",
      payload
    );

    return response.data;
  };


export const getDoctorSchedules = async () => {

  const response = await api.get(
    "/schedules/predefined/doctor"
  );

  return response.data;
}

export const createUnavailabilityRequest =
  async (
    payload: {
      startDate: string;
      endDate: string;
      reason: string;
    }
  ) => {

    const response = await api.post(
      `/schedules/unavailable`,
      payload
    );

    return response.data;
  };


export const getAvailableSlots = async (
  date: string,
  doctorId?: string
) => {

  const response = await api.get(
    "/schedules/available-slots",
    {
      params: {
        date,
        doctorId,
      },
    }
  );

  return response.data;
};
