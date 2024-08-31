import { IAppointmentState, IWeekday } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: IAppointmentState = {
  weekdays: null,
};

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    setWeekdays: (state, action: PayloadAction<IWeekday[]>) => {
      state.weekdays = action.payload;
    },

    clearState: (state) => {
      state.weekdays = null;
    },
  },
});

export const { setWeekdays, clearState } = appointmentSlice.actions;

export default appointmentSlice.reducer;
