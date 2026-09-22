import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/types";

const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("metrix_token");
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: getInitialToken(),
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("metrix_token", action.payload.token);
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem("metrix_token");
      }
    },
    markInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, setUser, logout, markInitialized } =
  authSlice.actions;
export default authSlice.reducer;
