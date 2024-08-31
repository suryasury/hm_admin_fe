import { store } from "@/state/store";
import { clearUser } from "@/state/userReducer";
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(clearUser());
    }
    return Promise.reject(error);
  }
);
