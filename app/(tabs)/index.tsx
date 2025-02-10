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

export default function DashboardScreen() {
  const [graphPoints, setGraphPoints] = useState(generateSinusGraphData(10));
  const [graphLabel, setGraphLabel] = useState(graphPoints.at(-1).value);

  const refreshGraph = async function () {
    console.log("Test");
    console.log(graphPoints);
    try {
      const value = await AsyncStorage.getItem("temp-vals");
      if (value !== null) {
        // console.log(value);
        // console.log(JSON.parse(value));
        const pvalue: GraphPoint[] = fromList(JSON.parse(value));
        // const pvalue: GraphPoint[] = new Array(JSON.parse(value));
        console.log(pvalue);
        console.log(pvalue.at(-1)?.date);
        // value previously stored
        setGraphPoints(pvalue);
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
          <ThemedText type="title">Welcome!</ThemedText>
          {/* <HelloWave /> */}
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">
            Step 1: Try it! {graphLabel.toPrecision(2)}
          </ThemedText>
          <LineGraph
            style={styles.graph}
            animated={true}
            enablePanGesture={true}
            enableIndicator={true}
            onPointSelected={(p) => setGraphLabel(p.value)}
            onGestureEnd={() => setGraphLabel(graphPoints.at(-1).value)}
            horizontalPadding={true ? 15 : 0}
            enableFadeInMask={true}
            color={"#A1CEDC"}
            points={graphPoints}
            // BottomAxisLabel={() => <ThemedText>WAH</ThemedText>}
          />
          <TouchableOpacity onPress={refreshGraph} style={styles.ctaButton}>
            <ThemedText style={styles.ctaButtonText}>Refresh</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          <ThemedText>
            Tap the Explore tab to learn more about what's included in this
            starter app.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
          <ThemedText>
            When you're ready, run{" "}
            <ThemedText type="defaultSemiBold">
              npm run reset-project
            </ThemedText>{" "}
            to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
            directory. This will move the current{" "}
            <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
            <ThemedText type="defaultSemiBold">app-example</ThemedText>.
          </ThemedText>
        </ThemedView>
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
