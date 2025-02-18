import { Image, StyleSheet, Platform, TouchableOpacity } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { fromList, generateSinusGraphData } from "../data";
import { GraphPoint, LineGraph } from "react-native-graph";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useState } from "react";
import useBLE from "@/hooks/useBLE";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GraphView } from "@/components/GraphView";

export default function DashboardScreen() {
  const [graphTitles, setGraphTitles] = useState(["", "", "", ""]);
  const [graphPoints, setGraphPoints] = useState([
    generateSinusGraphData(10),
    generateSinusGraphData(20),
    generateSinusGraphData(30),
    generateSinusGraphData(40),
  ]);

  const typeMap: { [key: string]: any } = {
    flow: "Flow",
    temp: "Temperature",
    turb: "Turbidity",
    ph: "pH",
  };

  const refreshGraph = async function () {
    console.log("Test");
    // console.log(graphPoints);
    try {
      const value = await AsyncStorage.getItem("read-vals");
      if (value !== null) {
        // console.log(value);
        // console.log(JSON.parse(value));
        const pvalue: GraphPoint[][] = (JSON.parse(value)).map((item) => {
          // console.log(item);
          if (item.length) {
            return fromList(item);
          } 
          else {
            return generateSinusGraphData(10);
          }
        });
        // const pvalue: GraphPoint[] = new Array(JSON.parse(value));
        // console.log(pvalue);
        // console.log(pvalue.at(-1)?.date);
        // value previously stored
        setGraphPoints(pvalue);
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }
    try {
      const value = await AsyncStorage.getItem("port-types");
      if (value !== null) {
        // console.log(value);
        // console.log(JSON.parse(value));
        const pvalue: string[] = (JSON.parse(value)).map((item) => (typeMap[item]));
        // console.log(pvalue);
        // value previously stored
        setGraphTitles(pvalue);
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

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
        {graphTitles.map((prop, key) => (
          <GraphView key={key} title={prop} graphPoints={graphPoints[key]}></GraphView>
        ))}
      </ParallaxScrollView>
    </GestureHandlerRootView>
  );
}

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
