// reducers.js
import { persistCombineReducers } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { createSlice } from "@reduxjs/toolkit";
import { DataElement } from "@/services/data";
import { serverApi } from "@/services/server";

interface DataItem {
  title: string;
  portTypes: (string | null)[];
  readVals: DataElement[][];
}

interface DataState {
  items: DataItem[];
}

const initialState = {
  items: [],
} satisfies DataState as DataState;

const MAX_ITEMS = 60;

const sensorSlice = createSlice({
  name: "sensorData",
  initialState,
  reducers: {
    // Define your actions and reducers here
    // setType(state, action) {
    //   state.portTypes[action.payload.index] = action.payload.newType;
    // },
    updateNode(state, action) {
      const { nodeId, data } = action.payload;

      let isPresent = false;

      for (let i = 0; i < state.items.length; i++) {
        if (state.items[i].title == nodeId) {
          isPresent = true;

          let newPortTypes: string[] = [];
          let newReadVals: DataElement[][] = [];

          data.forEach((item, index) => {
            newPortTypes.push(item.type);
            if (item.type != (state.items[i].portTypes[index] ?? "")) {
              newReadVals.push(item.data);
            } else {
              let newReadValsItem = state.items[i].readVals[index];
              item.data.forEach((item) => {
                if (
                  newReadValsItem.filter(
                    (pastItem) => pastItem.date == item.date
                  ).length == 0
                ) {
                  if (newReadValsItem.length >= MAX_ITEMS) {
                    newReadValsItem.shift();
                  }
                  newReadValsItem.push(item);
                }
              });
              newReadVals.push(newReadValsItem);
            }
          });

          // console.log(
          //   newPortTypes,
          //   newReadVals.map((item) => item.length)
          // );

          state.items[i] = {
            title: nodeId,
            portTypes: newPortTypes,
            readVals: newReadVals,
          };
        }
      }

      if (!isPresent) {
        state.items.push({
          title: nodeId,
          portTypes: data.map((item) => item.type),
          readVals: data.map((item) => item.data.slice(-MAX_ITEMS)),
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      serverApi.endpoints.getDataByNodeId.matchFulfilled,
      (state, action) => {
        const { nodeId, data } = action.payload;

        sensorSlice.caseReducers.updateNode(state, action);

        // console.log(data);
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
        // console.log(JSON.stringify(state));
        // console.log(JSON.stringify(action));
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

export const { updateNode } = sensorSlice.actions;

export default rootReducer;
