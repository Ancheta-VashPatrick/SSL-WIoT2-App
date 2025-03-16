// reducers.js
import { persistCombineReducers } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { createSlice } from "@reduxjs/toolkit";
import { DataElement } from "@/services/data";
import { serverApi } from "@/services/server";

interface DataState {
  portTypes: (string | null)[];
  readVals: DataElement[][];
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
      state.portTypes[action.payload.index] = action.payload.newType;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      serverApi.endpoints.getDataByNodeId.matchFulfilled,
      (state, action) => {
        const { data } = action.payload;

        state.portTypes = data.map((item) => item.type);
        state.readVals = data.map((item) => item.data);

        console.log(data);
      }
    );
    builder.addMatcher(
      serverApi.endpoints.getDataByNodeId.matchRejected,
      (state, action) => {
        console.log(JSON.stringify(state));
        console.log(JSON.stringify(action));
      }
    );
    builder.addMatcher(
      serverApi.endpoints.getDataByNodeId.matchPending,
      (state, action) => {
        console.log(JSON.stringify(state));
        console.log(JSON.stringify(action));
      }
    );
  },
});


const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = persistCombineReducers(persistConfig, {
  sensorData: sensorSlice.reducer,
  [serverApi.reducerPath]: serverApi.reducer,
});

export const { setType } = sensorSlice.actions;

export default rootReducer;
