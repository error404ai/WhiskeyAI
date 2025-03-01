import { AgentPlatform, AgentTrigger, Information } from "@/db/schema";
import { createSlice } from "@reduxjs/toolkit";
export interface AgentForm {
  information: Information;
  agentPlatform: AgentPlatform;
  agentTrigger: AgentTrigger;
  launch: {
    environment: string;
    version: string;
  };
}

const initialState: AgentForm = {};

export const authState = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthToken: (state, action) => {
      state.token = action.payload;
    },
    removeAuthToken: (state) => {
      state.token = undefined;
    },
  },
});

export const { setAuthToken, removeAuthToken } = authState.actions;

export default authState.reducer;
