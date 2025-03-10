import {
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { fromList, generateSinusGraphData } from "../data";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Element } from "@/components/ChartView";

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

  const refreshGraph = async function () {
    // console.log("Test");
    // console.log(graphPoints);
    // try {
    //   const value = await AsyncStorage.getItem("read-vals");
    //   if (value !== null) {
    //     // console.log(value);
    //     // console.log(JSON.parse(value));
    //     const pvalue: Element[][] = JSON.parse(value).map((item) => {
    //       // console.log(item);
    //       if (item.length) {
    //         return fromList(item);
    //       } else {
    //         return generateSinusGraphData(10);
    //       }
    //     });
    //     // const pvalue: GraphPoint[] = new Array(JSON.parse(value));
    //     // console.log(pvalue);
    //     // console.log(pvalue.at(-1)?.date);
    //     // value previously stored
    //     setGraphPoints(pvalue);
    //   }
    // } catch (e) {
    //   // error reading value
    //   console.log(e);
    // }
    // try {
    //   const value = await AsyncStorage.getItem("port-types");
    //   if (value !== null) {
    //     // console.log(value);
    //     // console.log(JSON.parse(value));
    //     const pvalue: string[] = JSON.parse(value).map((item) => typeMap[item]);
    //     // console.log(pvalue);
    //     // value previously stored
    //     setGraphTitles(pvalue);
    //   }
    // } catch (e) {
    //   // error reading value
    //   console.log(e);
    // }
  };

  // const test = new Date("2025-02-27 13:07");

  // const data = [
  //   { date: new Date(test.getTime()), value: 15 },
  //   { date: new Date(test.getTime() + 60_000), value: 10 },
  //   { date: new Date(test.getTime() + 120_000), value: 12 },
  //   { date: new Date(test.getTime() + 180_000), value: 7 },
  //   { date: new Date(test.getTime() + 240_000), value: 6 },
  //   { date: new Date(test.getTime() + 300_000), value: 3 },
  //   { date: new Date(test.getTime() + 360_000), value: 5 },
  //   { date: new Date(test.getTime() + 420_000), value: 8 },
  //   { date: new Date(test.getTime() + 480_000), value: 12 },
  //   { date: new Date(test.getTime() + 540_000), value: 14 },
  //   { date: new Date(test.getTime() + 600_000), value: 12 },
  //   { date: new Date(test.getTime() + 660_000), value: 13.5 },
  //   { date: new Date(test.getTime() + 720_000), value: 18 },
  //   { date: new Date(test.getTime() + 780_000), value: 12 },
  //   { date: new Date(test.getTime() + 840_000), value: 14 },
  //   { date: new Date(test.getTime() + 900_000), value: 12 },
  //   { date: new Date(test.getTime() + 960_000), value: 13.5 },
  //   { date: new Date(test.getTime() + 1020_000), value: 69 },
  //   { date: new Date(test.getTime() + 1080_000), value: 18 },
  // ];

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
        <TouchableOpacity onPress={refreshGraph} style={styles.ctaButton}>
          <ThemedText style={styles.ctaButtonText}>Refresh</ThemedText>
        </TouchableOpacity>

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

const { width, height } = Dimensions.get("window");
// const screenDimensions = Dimensions.get('screen');

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
    maxWidth: Math.min(0.875 * width, 0.6 * height),
    padding: 20,
    flexGrow: 1,
    // maxWidth: 550,
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
