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
  information: {
    description: "",
    goal: "",
  },
  agentPlatforms: [],
  agentTriggers: [],
  launch: {
    environment: "",
    version: "",
  },
};

export const authState = createSlice({
  name: "agentForm",
  initialState,
  reducers: {
    setAgentInformation: (state, action) => {
      state.information = {
        ...state.information,
        ...action.payload,
      };
    },
  },
});

export const { setAgentInformation } = authState.actions;

export default authState.reducer;
