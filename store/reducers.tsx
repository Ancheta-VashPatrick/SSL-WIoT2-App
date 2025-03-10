// reducers.js
import { combineReducers } from "redux";
import { createSlice } from "@reduxjs/toolkit";
import { Element } from "@/components/ChartView";

import { serverApi } from '@/services/server';

interface DataState {
  portTypes: (string | null)[];
  readVals: Element[][];
}

const initialState = {
  // Define your initial state here
  portTypes: [],
  readVals: [],
} satisfies DataState as DataState;

const sensorSlice = createSlice({
  name: "sensorData",
  initialState,
  reducers: {
    // Define your actions and reducers here
    setType(state, action) {
      state.portTypes[action.payload.index] = action.payload.newType
    },
  },
  extraReducers: (builder) =>{
    builder.addMatcher(serverApi.endpoints.getDataByNodeId.matchFulfilled, (state, action) => {
      const { data } = action.payload;

      state.portTypes = data.map((item) => (item.type));
      state.readVals = data.map((item) => (item.data));

      console.log(data);
    })
    builder.addMatcher(serverApi.endpoints.getDataByNodeId.matchRejected, (state, action) => {
      console.log(JSON.stringify(state));
      console.log(JSON.stringify(action));
    })
    builder.addMatcher(serverApi.endpoints.getDataByNodeId.matchPending, (state, action) => {
      console.log(JSON.stringify(state));
      console.log(JSON.stringify(action));
    })
  }
});

const rootReducer = combineReducers({
  sensorData: sensorSlice.reducer,
  [serverApi.reducerPath]: serverApi.reducer,
});

export const { setType } = sensorSlice.actions;

export default rootReducer;
