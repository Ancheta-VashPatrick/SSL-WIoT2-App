import {
  StyleSheet,
  useColorScheme,
  type ViewProps,
} from "react-native";

import { Image } from "expo-image";

import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import {
  Area,
  Chart,
  ChartDataPoint,
  HorizontalAxis,
  Line,
  // Tooltip,
  VerticalAxis,
} from "react-native-responsive-linechart";
import { Tooltip } from "@/components/ChartViewTooltip";
import { Colors } from "@/constants/Colors";
import React from "react";

import { DataElement } from "@/services/data";

interface Domain {
  min: number;
  max: number;
}

export type ChartViewProps = ViewProps & {
  title: string;
  data: DataElement[];
  xDomain: Domain;
  yDomain: Domain;
  labelUnits: (arg0: string) => string;
};

const dateStyle = {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

export function ChartView({
  style,
  title,
  data,
  xDomain,
  yDomain,
  labelUnits = (value) => value,
  ...otherProps
}: ChartViewProps) {
  // Hooks must always be called unconditionally
  const colorScheme = useColorScheme();
  const getColor = (type: string) => Colors[colorScheme ?? "light"][type];

  const portIcons =
    colorScheme === "light"
      ? {
          L: require("@/assets/images/flow.svg"),
          NTU: require("@/assets/images/turb.svg"),
          "°C": require("@/assets/images/temp.svg"),
          pH: require("@/assets/images/ph.svg"),
        }
      : {
          L: require("@/assets/images/flow-dark.svg"),
          NTU: require("@/assets/images/turb-dark.svg"),
          "°C": require("@/assets/images/temp-dark.svg"),
          pH: require("@/assets/images/ph-dark.svg"),
        };

  const textColor = getColor("text");

  const procData = data.map((item) => ({
    x: item.date.getTime() / 60_000,
    y: item.value,
  }));

  const titleUnits = labelUnits("").trim();

  const styles = StyleSheet.create({
    ctaText: {
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    },
    titleContainer: {
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    titleImage: procData.length
      ? {
          height: 36,
          width: 36,
          marginLeft: -36,
          marginRight: 5,
          marginVertical: 7.5,
        }
      : { height: 36, width: 36, marginLeft: -36 },
  });

  // Conditional rendering logic
  let content;
  if (data && procData.length > 1) {
    if (procData.every((val) => val.y === procData[0].y)) {
      content = (
        <>
          <ThemedText style={styles.ctaText} type="subtitle">
            Constant Value: {labelUnits(procData[0].y.toString())}
          </ThemedText>
          <ThemedText style={styles.ctaText} type="subtitle">
            (
            {new Date(procData.at(0).x * 60_000).toLocaleDateString(
              "en-US",
              dateStyle
            )}{" "}
            -{" "}
            {new Date(procData.at(-1).x * 60_000).toLocaleDateString(
              "en-US",
              dateStyle
            )}
            )
          </ThemedText>
        </>
      );
    } else {
      content = (
        <Chart
          style={{ height: 200, width: "100%" }}
          data={procData}
          padding={{ left: 40, bottom: 20, right: 20, top: 20 }}
          xDomain={{ min: xDomain.min, max: xDomain.max }}
          yDomain={{ min: yDomain.min, max: yDomain.max }}
            // viewport={{ size: { width: 5 } }}
        >
          <VerticalAxis
            tickCount={10}
            theme={{
              ticks: { stroke: { color: textColor } },
              labels: {
                label: { color: textColor },
                formatter: (v) => v.toFixed(2),
              },
            }}
          />
          <HorizontalAxis
            tickValues={
              procData.length > 10
                ? [
                    procData.at(Math.floor(data.length / 6))?.x,
                    procData.at(Math.floor(data.length / 2))?.x,
                    procData.at(Math.floor((5 * data.length) / 6))?.x,
                  ]
                : procData.length > 6
                ? [procData.at(2)?.x, procData.at(-3)?.x]
                : procData.length > 3
                ? [
                    procData.at(0)?.x,
                    procData.at(Math.floor(data.length / 2))?.x,
                    procData.at(-1)?.x,
                  ]
                : procData.length > 2
                ? [procData.at(Math.floor(data.length / 2))?.x]
                : [procData.at(0)?.x, procData.at(-1)?.x]
            }
            theme={{
              ticks: {
                stroke: {
                  color: textColor,
                },
              },
              grid: {
                visible: false,
              },
              labels: {
                label: {
                  color: textColor,
                },
                formatter: (v) => {
                  const date = new Date(v * 60_000);
                    // return `${date.getMonth().toLocaleString()} ${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                  return date.toLocaleDateString("en-US", dateStyle);
                },
              },
            }}
          />
          <Area
            theme={{
              gradient: {
                from: { color: getColor("chartFillA"), opacity: 0.9 },
                to: { color: getColor("chartFillB"), opacity: 0.3 },
              },
            }}
          />
          <Line
            tooltipComponent={
              <Tooltip
                theme={{
                    formatter: (v) => {
                      // return `${date.getMonth().toLocaleString()} ${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                      return labelUnits(v.y.toFixed(2));
                    },
                }}
              />
            }
            theme={{
              stroke: { color: getColor("chartStroke"), width: 5 },
              scatter: {
                default: {
                  width: 8,
                  height: 8,
                  rx: 4,
                  color: getColor("chartScatter"),
                },
                selected: { color: getColor("chartScatterSelected") },
              },
            }}
            hideTooltipAfter={1000}
          />
        </Chart>
      );
    }
  } else if (procData.length) {
    content = (
      <>
        <ThemedText style={styles.ctaText} type="subtitle">
          Single Value: {labelUnits(procData[0].y.toString())}
        </ThemedText>
        <ThemedText style={styles.ctaText} type="subtitle">
          (
          {new Date(procData.at(-1).x * 60_000).toLocaleDateString(
            "en-US",
            dateStyle
          )}
          )
        </ThemedText>
      </>
    );
  } else {
    content = (
      <ThemedText style={styles.ctaText} type="subtitle">
        No Data
      </ThemedText>
    );
  }

  return (
    <ThemedView>
      <ThemedView style={styles.titleContainer}>
        <Image source={portIcons[titleUnits]} style={styles.titleImage} />
        <ThemedText style={styles.ctaText} type="subtitle">
          {title}
          {data &&
          titleUnits != "pH" &&
          procData.length > 1 &&
          !procData.every((val) => val.y === procData[0].y)
            ? ` (${titleUnits})`
            : ""}
        </ThemedText>
      </ThemedView>
      {content}
    </ThemedView>
  );
}