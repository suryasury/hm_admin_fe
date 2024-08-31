import { IloginForm } from "@/types";
import { api } from "./api";
import { API_END_POINTS } from "./constants";

export const login = async (payload: IloginForm) => {
  return api.post(API_END_POINTS.LOGIN, payload);
};

export const getProfileDetails = async () => {
  return api.get(API_END_POINTS.PROFILE_DETAILS);
};

export const sendResetPasswordEmail = async (email: string) => {
  return api.post(API_END_POINTS.RESET_PASSWORD_EMAIL, { email });
};

export const restPassword = async (password: string, token: string) => {
  return api.patch(
    API_END_POINTS.RESET_PASSWORD,
    { password },
    {
      headers: {
        token: token,
      },
    }
  );
};
export const changePassword = async (
  payload: Record<string, string>,
  token: string
) => {
  return api.patch(API_END_POINTS.CHANGE_PASSWORD, payload, {
    headers: {
      token: token,
    },
  });
};
