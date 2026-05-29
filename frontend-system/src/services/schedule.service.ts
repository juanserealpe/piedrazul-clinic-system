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