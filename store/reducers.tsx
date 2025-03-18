// reducers.js
import { persistCombineReducers } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { createSlice } from "@reduxjs/toolkit";
import { DataElement, removeDuplicates } from "@/services/data";
import { serverApi } from "@/services/server";

interface DataItem {
  title: string;
  portTypes: (string | null)[];
  readVals: DataElement[][];
}

interface DataState {
  items: DataItem[];
}

const initialDataState = {
  items: [],
} satisfies DataState as DataState;

const MAX_DATA_ITEMS = 60;

const sensorSlice = createSlice({
  name: "sensorData",
  initialState: initialDataState,
  reducers: {
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
            let newReadValsItem: DataElement[] = [];
            if (item.type == (state.items[i].portTypes[index] ?? "")) {
              newReadValsItem = state.items[i].readVals[index];
            }
            newReadValsItem.push(...item.data);
            newReadVals.push(
              removeDuplicates(newReadValsItem, MAX_UPLOAD_DATA_ITEMS)
            );
          });

          newReadVals.forEach((item) => {
            item.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
          });

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
          readVals: data.map((item) =>
            removeDuplicates(item.data, MAX_UPLOAD_DATA_ITEMS)
          ),
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      serverApi.endpoints.getDataByNodeId.matchFulfilled,
      (state, action) => {
        sensorSlice.caseReducers.updateNode(state, action);

        // console.log(data);
      }
    );
    builder.addMatcher(
      serverApi.endpoints.getDataByNodeId.matchRejected,
      (state, action) => {
        // console.log(JSON.stringify(state));
        // console.log(JSON.stringify(action));
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

interface UploadDataItem {
  title: string;
  portTypes: (string | null)[];
  readVals: DataElement[][];
}

interface UploadDataState {
  items: UploadDataItem[];
}

const initialUploadDataState = {
  items: [],
} satisfies UploadDataState as UploadDataState;

const MAX_UPLOAD_DATA_ITEMS = MAX_DATA_ITEMS;

const uploadSlice = createSlice({
  name: "uploadData",
  initialState: initialUploadDataState,
  reducers: {
    updateUploadNode(state, action) {
      const { nodeId, data } = action.payload;

      let isPresent = false;

      for (let i = 0; i < state.items.length; i++) {
        if (state.items[i].title == nodeId) {
          isPresent = true;

          let newPortTypes: string[] = [];
          let newReadVals: DataElement[][] = [];

          data.forEach((item, index) => {
            newPortTypes.push(item.type);
            let newReadValsItem: DataElement[] = [];
            if (item.type == (state.items[i].portTypes[index] ?? "")) {
              newReadValsItem = state.items[i].readVals[index];
            }
            newReadValsItem.push(...item.data);
            newReadVals.push(
              removeDuplicates(newReadValsItem, MAX_UPLOAD_DATA_ITEMS)
            );
          });

          newReadVals.forEach((item) => {
            item.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
          });

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
          readVals: data.map((item) =>
            removeDuplicates(item.data, MAX_UPLOAD_DATA_ITEMS)
          ),
        });
      }
    },
  },
});

interface LogItem {
  date: string;
  message: string;
}

interface LogState {
  items: LogItem[];
}

const initialLogState = {
  items: [],
} satisfies LogState as LogState;

const MAX_LOG_ITEMS = 30;

const logSlice = createSlice({
  name: "logData",
  initialState: initialLogState,
  reducers: {
    addLog(state, action) {
      const { date, message } = action.payload;

      state.items.unshift({ date: date ?? new Date().toISOString(), message });
      if (state.items.length >= MAX_LOG_ITEMS) {
        state.items.pop();
      }
    },
    clearLog(state, action) {
      state.items = [];
    },
  },
});

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = persistCombineReducers(persistConfig, {
  sensorData: sensorSlice.reducer,
  uploadData: uploadSlice.reducer,
  logData: logSlice.reducer,
  [serverApi.reducerPath]: serverApi.reducer,
});

export const { updateNode } = sensorSlice.actions;

export const { updateUploadNode } = uploadSlice.actions;

export const { addLog, clearLog } = logSlice.actions;

export default rootReducer;
