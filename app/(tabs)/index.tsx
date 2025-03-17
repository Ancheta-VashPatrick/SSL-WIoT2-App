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
import { Collapsible } from "@/components/Collapsible";
// import { setType } from "@/store/reducers";

export default function DashboardScreen() {
  const headings = ["coe199node", "sn1"];

  headings.forEach((item) => {
    const { data, error, isLoading } = useGetDataByNodeIdQuery(item, {
      pollingInterval: 3000,
      skipPollingIfUnfocused: true,
    });

    // console.log(JSON.stringify({ data, error, isLoading }));
    // console.log(item);
  });

  const sensorData = useSelector((state) => state.sensorData);

  const typeMap: { [key: string]: any } = {
    flow: "Flow",
    temp: "Temperature",
    turb: "Turbidity",
    ph: "pH",
  };

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const dimensionRatio = windowWidth / windowHeight;
  const widthDivisions = Math.floor(dimensionRatio / 1.4) + 1;
  const widthPortion = 100 / widthDivisions;

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
      flex: widthDivisions,
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
    },
    graphItem: {
      width: `${widthPortion}%`,
      maxWidth: `${widthPortion}%`,
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

  let i = 0;

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
        </ThemedView>

        {sensorData.items.length ? (
          sensorData.items.map((dataItem, dataKey) => (
            <Collapsible title={dataItem.title} key={dataKey}>
              <ThemedView style={styles.graphContainer} key={dataKey}>
                {dataItem.portTypes.length ? (
                  dataItem.portTypes.map((prop, key) => {
                    let recentData = dataItem.readVals[key];
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
                      <ThemedView style={styles.graphItem} key={key}>
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
            </Collapsible>
          ))
        ) : (
          <ThemedText type="subtitle">No Data Available</ThemedText>
        )}
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
