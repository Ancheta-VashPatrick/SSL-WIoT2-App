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
  uploadItems: DataItem[];
  downloadItems: DataItem[];
  dataLock: boolean;
}

const initialDataState = {
  items: [],
  uploadItems: [],
  downloadItems: [],
  dataLock: false,
} satisfies DataState as DataState;

const MAX_DATA_ITEMS = 60;
export const MAX_UPLOAD_DATA_ITEMS = MAX_DATA_ITEMS;

const sensorSlice = createSlice({
  name: "sensorData",
  initialState: initialDataState,
  reducers: {
    updateNode(state, action) {
      const { nodeId, data } = action.payload;

      let isPresent = false;

      if (data.length) {
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
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
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
      }

      state.items.sort((a, b) => a.title.localeCompare(b.title));
    },
    updateUploadNode(state, action) {
      const { nodeId, data } = action.payload;

      let isPresent = false;
      let nodeIndex = -1;
      for (let i = 0; i < state.downloadItems.length; i++) {
        if (state.downloadItems[i].title == nodeId) {
          nodeIndex = i;
        }
      }

      if (data.length) {
        for (let i = 0; i < state.uploadItems.length; i++) {
          if (state.uploadItems[i].title == nodeId) {
            isPresent = true;

            let newPortTypes: string[] = [];
            let newReadVals: DataElement[][] = [];

            data.forEach((uploadItem, index) => {
              newPortTypes.push(uploadItem.type);
              let newReadValsItem: DataElement[] = [];
              if (
                uploadItem.type == (state.uploadItems[i].portTypes[index] ?? "")
              ) {
                newReadValsItem = state.uploadItems[i].readVals[index];
              }
              newReadValsItem.push(...uploadItem.data);
              newReadVals.push(
                removeDuplicates(
                  newReadValsItem,
                  MAX_UPLOAD_DATA_ITEMS,
                  nodeIndex > -1
                    ? state.downloadItems[nodeIndex].readVals[index]
                    : []
                )
              );
            });

            newReadVals.forEach((uploadItem) => {
              uploadItem.sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              );
            });

            state.uploadItems[i] = {
              title: nodeId,
              portTypes: newPortTypes,
              readVals: newReadVals,
            };
          }
        }

        if (!isPresent) {
          let unduplicated = data.map((uploadItem, portIndex) =>
            removeDuplicates(
              uploadItem.data,
              MAX_UPLOAD_DATA_ITEMS,
              nodeIndex > -1
                ? state.downloadItems[nodeIndex].readVals[portIndex]
                : []
            )
          );
          if (
            unduplicated.reduce(
              (prev: number, curr: DataElement[]) => prev + curr.length,
              0
            )
          ) {
            state.uploadItems.push({
              title: nodeId,
              portTypes: data.map((uploadItem) => uploadItem.type),
              readVals: unduplicated,
            });
          }
        }
      }
    },
    removeRecord(state, action) {
      const { nodeId, portNumber, recordedAt } = action.payload;

      for (let i = 0; i < state.uploadItems.length; i++) {
        if (state.uploadItems[i].title == nodeId) {
          for (
            let j = 0;
            j < state.uploadItems[i].readVals[portNumber].length;
            j++
          ) {
            if (
              state.uploadItems[i].readVals[portNumber][j].date == recordedAt
            ) {
              state.uploadItems[i].readVals[portNumber].splice(j, 1);
            }
          }
        }

        if (
          state.uploadItems[i].readVals.every(
            (uploadItem) => !uploadItem.length
          )
        ) {
          state.uploadItems.splice(i, 1);
        }
      }
    },
    updateDownloadNode(state, action) {
      const { nodeId, data } = action.payload;

      let isPresent = false;

      if (data.length) {
        for (let i = 0; i < state.downloadItems.length; i++) {
          if (state.downloadItems[i].title == nodeId) {
            isPresent = true;

            let newPortTypes: string[] = [];
            let newReadVals: DataElement[][] = [];

            data.forEach((item, index) => {
              newPortTypes.push(item.type);
              let newReadValsItem: DataElement[] = [];
              if (
                item.type == (state.downloadItems[i].portTypes[index] ?? "")
              ) {
                newReadValsItem = state.downloadItems[i].readVals[index];
              }
              newReadValsItem.push(...item.data);
              newReadVals.push(
                removeDuplicates(newReadValsItem, MAX_UPLOAD_DATA_ITEMS)
              );
            });

            newReadVals.forEach((item) => {
              item.sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              );
            });

            state.downloadItems[i] = {
              title: nodeId,
              portTypes: newPortTypes,
              readVals: newReadVals,
            };
          }
        }

        if (!isPresent) {
          state.downloadItems.push({
            title: nodeId,
            portTypes: data.map((item) => item.type),
            readVals: data.map((item) =>
              removeDuplicates(item.data, MAX_UPLOAD_DATA_ITEMS)
            ),
          });
        }
      }

      state.downloadItems.sort((a, b) => a.title.localeCompare(b.title));
    },
    setLock(state, action) {
      state.dataLock = true;
    },
    resetLock(state, action) {
      state.dataLock = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      serverApi.endpoints.getDataByNodeId.matchFulfilled,
      (state, action) => {
        sensorSlice.caseReducers.updateNode(state, action);
        sensorSlice.caseReducers.updateDownloadNode(state, action);

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
  connectedDevice: string | null;
  items: string[];
  marks: Record<string, boolean>;
}

const initialDevicesState = {
  connectedDevice: null,
  items: [],
  marks: {},
} satisfies DevicesState as DevicesState;

const MAX_DEVICE_ITEMS = 30;

const devicesSlice = createSlice({
  name: "devicesData",
  initialState: initialDevicesState,
  reducers: {
    setConnectedDevice(state, action) {
      const { device } = action.payload;

      state.connectedDevice = device;
    },
    addDevice(state, action) {
      const { device } = action.payload;

      if (
        state.items.filter(
          (item) => JSON.parse(item).id == JSON.parse(device).id
        ).length === 0
      ) {
        // console.log(device);
        state.items.unshift(device);
        state.marks[JSON.parse(device).id] = false;
        if (state.items.length >= MAX_DEVICE_ITEMS) {
          let oldItem = state.items.pop();
          if (oldItem) {
            delete state.marks[JSON.parse(oldItem).id];
          }
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
        delete state.marks[JSON.parse(device).id];
        state.items.splice(deviceIndex, 1);
      }
    },
    markDevice(state, action) {
      const { device } = action.payload;

      let deviceId = JSON.parse(device).id;
      if (deviceId in state.marks) {
        state.marks[deviceId] = !state.marks[deviceId];
      }
    },
  },
});

interface UserState {
  username: string | null;
  role: string | null;
  nodes: Record<string, string | string[]>[] | null;
  exp: Date | null;
}

const initialUserState = {
  username: null,
  role: null,
  nodes: null,
  exp: null,
} satisfies UserState as UserState;

const userSlice = createSlice({
  name: "userData",
  initialState: initialUserState,
  reducers: {
    setUser(state, action) {
      const { username, role, nodes, exp, ...others } = action.payload;
      state.username = username;
      state.role = role;
      state.nodes = nodes;
      state.exp = exp;
    },
  },
});

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = persistCombineReducers(persistConfig, {
  sensorData: sensorSlice.reducer,
  logData: logSlice.reducer,
  devicesData: devicesSlice.reducer,
  userData: userSlice.reducer,
  [serverApi.reducerPath]: serverApi.reducer,
});

export const {
  updateNode,
  updateUploadNode,
  removeRecord,
  setLock,
  resetLock,
} = sensorSlice.actions;

export const { addLog, clearLog } = logSlice.actions;

export const { setConnectedDevice, addDevice, removeDevice, markDevice } =
  devicesSlice.actions;

export const { setUser } = userSlice.actions;

export default rootReducer;
