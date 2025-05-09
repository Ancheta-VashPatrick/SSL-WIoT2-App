import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

import { Provider } from "react-redux";
import { store, persistor } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { addLog } from "@/store/reducers";

import { Platform } from "react-native";

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import useRequests from "@/hooks/useRequests";

const BACKGROUND_FETCH_TASK = "background-fetch";

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  const now = Date.now();

  console.log(
    `Got background fetch call at date: ${new Date(now).toISOString()}`
  );

  if (!store.getState().sensorData.dataLock) {
    const dispatch = store.dispatch;
    dispatch(
      addLog({
        message: "Collection automatically initiated.",
      })
    );

    oppCollect();
  }

  setTimeout(() => {
    const { uploadData } = useRequests();
    let currentUploadData = store.getState().sensorData.uploadItems;
    if (currentUploadData.length) {
      uploadData();
    }
  }, 10_000);

  // Be sure to return the successful result type!
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 45, // 45 seconds
    stopOnTerminate: false, // android only,
    startOnBoot: true, // android only
  });
}

export async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

export function isRegistered() {
  return TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
}

let scanForDevices = () => console.log("Bluetooth Scan is not supported.");
let oppCollect = () => console.log("Bluetooth Collection is not supported");
if (Platform.OS == "android" || Platform.OS == "ios") {
  const useBLE = require("@/hooks/useBLE").useBLE;

  const { scanForPeripherals, requestPermissions, collectFromDevices } =
    useBLE();

  scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  oppCollect = async () => {
    if (!store.getState().sensorData.dataLock) {
      scanForDevices();
      // setIsModalVisible(true);

      setTimeout(() => {
        collectFromDevices();
      }, 1_000);
    }
  };
}
export { scanForDevices, oppCollect };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Slot />
          <StatusBar style="auto" translucent={false} />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
