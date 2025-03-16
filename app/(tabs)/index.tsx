import {
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ChartView } from "@/components/ChartView";

import { useDispatch, useSelector } from "react-redux";

import { useGetDataByNodeIdQuery } from "@/services/server";
import { setType } from "@/store/reducers";

export default function DashboardScreen() {
  const { data, error, isLoading } = useGetDataByNodeIdQuery("coe199node", {
    pollingInterval: 3000,
    skipPollingIfUnfocused: true,
  });

  console.log(JSON.stringify({ data, error, isLoading }));

  const sensorData = useSelector((state) => state.sensorData);

  const typeMap: { [key: string]: any } = {
    flow: "Flow",
    temp: "Temperature",
    turb: "Turbidity",
    ph: "pH",
  };

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const dimensionRatio = windowWidth / windowHeight;

  const styles = StyleSheet.create({
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    stepContainer: {
      gap: 8,
      marginBottom: 8,
    },
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: "absolute",
    },
    graph: {
      alignSelf: "center",
      width: "100%",
      aspectRatio: 1.4,
      marginVertical: 20,
    },
    graphContainer: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
    },
    graphItem: {
      width: (dimensionRatio > 1.25) ? "50%" : "100%",
      padding: 20,
      flexGrow: 1,
    },
    ctaButton: {
      backgroundColor: "#FF6060",
      justifyContent: "center",
      alignItems: "center",
      height: 50,
      marginHorizontal: 20,
      marginBottom: 5,
      borderRadius: 8,
    },
    ctaButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
    },
  });

  return (
    <GestureHandlerRootView>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Dashboard</ThemedText>
          {/* <HelloWave /> */}
        </ThemedView>

        {/* {error ? <ThemedText>{JSON.stringify(error)}</ThemedText> : isLoading ? <ThemedText>Loading</ThemedText> : <ThemedText>{JSON.stringify(data)}</ThemedText>} */}
        <ThemedView style={styles.graphContainer}>
          {sensorData.portTypes.length ? (
            sensorData.portTypes.map((prop, key) => {
              let recentData = sensorData.readVals[key];
              if (recentData.length) {
                const lastDate = recentData.at(-1).date;
                recentData = recentData
                  .filter(
                    (readVal) =>
                      new Date(lastDate).getTime() -
                        new Date(readVal.date).getTime() <=
                      720_000
                  )
                  .slice(-Math.min(recentData.length, 20));
              }
              const minmax = function (
                values: number[],
                portion: number,
                ratio: number = 1
              ) {
                let portionMax =
                  (Math.max(...values) - Math.min(...values)) * portion;
                return {
                  min: Math.min(...values) - portionMax * ratio,
                  max: Math.max(...values) + portionMax,
                };
              };
              return (
                <ThemedView style={styles.graphItem}>
                  <ChartView
                    key={key}
                    title={typeMap[prop]}
                    data={recentData.map((readVal) => ({
                      date: new Date(readVal.date),
                      value: parseFloat(readVal.value),
                    }))}
                    xDomain={minmax(
                      recentData.map(
                        (item) => new Date(item.date).getTime() / 60_000
                      ),
                      0.14,
                      0.8
                    )}
                    yDomain={minmax(
                      recentData.map((item) => item.value),
                      0.3
                    )}
                  />
                </ThemedView>
              );
            })
          ) : (
            <ThemedText type="subtitle">No Data Available</ThemedText>
          )}
        </ThemedView>
        {/* <ThemedText>
          {error ? (
            <>{JSON.stringify(error)}</>
          ) : isLoading ? (
            <>Loading...</>
          ) : data ? (
            <>{JSON.stringify(data)}</>
          ) : null}
        </ThemedText> */}
      </ParallaxScrollView>
    </GestureHandlerRootView>
  );
}
