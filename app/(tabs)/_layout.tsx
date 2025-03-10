import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import { Provider } from "react-redux";
import store from "@/store/store";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gauge" color={color} />
            ),
          }}
        />
        {Platform.OS == "android" || Platform.OS == "ios" ? (
          <Tabs.Screen
            name="collect"
            options={{
              title: "Collect",
              tabBarIcon: ({ color }) => (
                <IconSymbol
                  size={28}
                  name="tray.and.arrow.down.fill"
                  color={color}
                />
              ),
            }}
          />
        ) : (
          <Tabs.Screen
            name="collect"
            options={{
              tabBarButton: () => null,
            }}
          />
        )}
        <Tabs.Screen
          name="options"
          options={{
            title: "Options",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="wrench.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </Provider>
  );
}
