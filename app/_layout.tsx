import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
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

let scanForDevices = () => console.log("Bluetooth Scan is not supported.");
let oppCollect = () => console.log("Bluetooth Collection is not supported");
if (Platform.OS == "android" || Platform.OS == "ios") {
  const useBLE = require("@/hooks/useBLE").useBLE;

  const dispatch = store.dispatch;

  const { scanForPeripherals, requestPermissions, collectFromDevices } =
    useBLE();

  scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  oppCollect = async () => {
    scanForDevices();
    // setIsModalVisible(true);
    dispatch(
      addLog({
        message: "Collection manually initiated.",
      })
    );
    setTimeout(() => {
      collectFromDevices();
    }, 1_000);
  };

  // useEffect(() => {
  //   scanForDevices();
  // }, []);
}
export { scanForDevices, oppCollect };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
