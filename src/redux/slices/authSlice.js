import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authData : JSON.parse(localStorage.getItem("authData")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
    state.authData = action.payload.authData;
    localStorage.setItem("authData", JSON.stringify(action.payload.authData));
    },
    logout: (state) => {
      state.authData = null;
      localStorage.removeItem("authData");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;



