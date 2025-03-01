import { AgentPlatform, AgentTrigger, Information } from "@/db/schema";
import { createSlice } from "@reduxjs/toolkit";
export interface AgentForm {
  information: Information;
  agentPlatforms: AgentPlatform[];
  agentTriggers: AgentTrigger[];
  launch: {
    environment: string;
    version: string;
  };
}

const initialState: AgentForm = {
  information: {},
  agentPlatforms: [],
  agentTriggers: [],
  launch: {
    environment: "",
    version: "",
  },
};

export const authState = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // setAuthToken: (state, action) => {
    //   state.token = action.payload;
    // },
  },
});

export const {} = authState.actions;

export default authState.reducer;
