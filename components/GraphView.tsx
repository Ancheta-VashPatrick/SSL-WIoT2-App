import { useState } from "react";
import { View, type ViewProps } from "react-native";

// import { LineGraph, GraphPoint } from "react-native-graph";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

export type GraphViewProps = ViewProps & {
  title: string;
  // graphPoints: GraphPoint[];
};

export function GraphView({
  style,
  title,
  // graphPoints,
  ...otherProps
}: GraphViewProps) {
  // const [graphLabel, setGraphLabel] = useState(graphPoints.at(-1).value);

  return (
    <ThemedView
      style={[
        {
          gap: 8,
          marginBottom: 8,
        },
        style,
      ]}
    >
      <ThemedText type="subtitle">
        {/* {title} ({graphLabel.toPrecision(2)}) */}
      </ThemedText>
      {/* <LineGraph
        style={[
          {
            alignSelf: "center",
            width: "100%",
            aspectRatio: 1.4,
            marginVertical: 20,
          },
          style,
        ]}
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
      /> */}
    </ThemedView>
  );
}
