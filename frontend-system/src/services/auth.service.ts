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