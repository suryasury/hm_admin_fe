import { User, UserState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state = initialState;
      return state;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
