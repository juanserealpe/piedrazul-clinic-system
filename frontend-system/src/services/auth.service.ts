import api from "../lib/axios";

export const loginRequest = async (
  id: string,
  password: string
) => {

  console.log("LOGIN DATA:", {
    id,
    password,
  });

  const response = await api.post("/auth/login", {
    id,
    password,
  });

  return response.data;
};

export const registerRequest = async (
  payload: any
) => {

  const response = await api.post(
    "/auth/register",
    payload
  );

  return response.data;
};

export const isUserExistsRequest = async (
  id: string
): Promise<boolean> => {

  const response = await api.get(
    `/auth/user-exists/${id}`
  );

  return response.data.exists;
};

export const getAllDoctorsRequest = async () : Promise<{ id: string; name: string, lastnames: string }[]> => {
  const response = await api.get(
    "/auth/all-doctors"
  );

  return response.data;
};

export const getAllPatientsRequest = async () : Promise<{ id: string; name: string, lastnames: string }[]> => {
  const response = await api.get(
    "/auth/all-patients"
  );

  return response.data;
}