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

interface DevicesState {
  items: string[];
  marks: boolean[];
}

const initialDevicesState = {
  items: [],
  marks: [],
} satisfies DevicesState as DevicesState;

const MAX_DEVICE_ITEMS = 30;

const devicesSlice = createSlice({
  name: "devicesData",
  initialState: initialDevicesState,
  reducers: {
    addDevice(state, action) {
      const { device } = action.payload;

      if (
        state.items.filter(
          (item) => JSON.parse(item).id == JSON.parse(device).id
        ).length === 0
      ) {
        // console.log(device);
        state.items.unshift(device);
        state.marks.unshift(false);
        if (state.items.length >= MAX_LOG_ITEMS) {
          state.items.pop();
          state.marks.pop();
        }
      } else {
        let deviceIndex = 0;

        while (
          JSON.parse(state.items[deviceIndex]).id !== JSON.parse(device).id
        ) {
          deviceIndex++;
        }

        state.items.splice(deviceIndex, 1, device);
        // console.log(state.items, state.marks);
      }
    },
    removeDevice(state, action) {
      const { device } = action.payload;

      let deviceIndex = 0;
      // console.log(deviceIndex);
      // console.log(JSON.parse(state.items[deviceIndex]).id);
      // console.log(JSON.parse(device).id);
      while (
        deviceIndex < state.items.length &&
        JSON.parse(state.items[deviceIndex]).id !== JSON.parse(device).id
      ) {
        deviceIndex++;
      }

      if (deviceIndex < state.items.length) {
        state.items.splice(deviceIndex, 1);
        state.marks.splice(deviceIndex, 1);
      }
    },
    markDevice(state, action) {
      const { deviceIndex } = action.payload;

      if (deviceIndex > -1) {
        state.marks[deviceIndex] = !state.marks[deviceIndex];
      }
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
  devicesData: devicesSlice.reducer,
  [serverApi.reducerPath]: serverApi.reducer,
});

export const { updateNode } = sensorSlice.actions;

export const { updateUploadNode } = uploadSlice.actions;

export const { addLog, clearLog } = logSlice.actions;

export const { addDevice, removeDevice, markDevice } = devicesSlice.actions;

export default rootReducer;
