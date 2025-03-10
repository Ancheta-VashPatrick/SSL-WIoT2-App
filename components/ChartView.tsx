import { useState } from "react";
import { useColorScheme, type ViewProps } from "react-native";

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

export interface Element {
  date: Date;
  value: number;
}

interface Domain {
  min: number;
  max: number;
}

export type ChartViewProps = ViewProps & {
  title: string;
  data: Element[];
  xDomain: Domain;
  yDomain: Domain;
};

export function ChartView({
  style,
  title,
  data,
  xDomain,
  yDomain,
  ...otherProps
}: ChartViewProps) {
  const procData = data.map((item) => ({
    x: item.date.getTime() / 60_000,
    y: item.value,
  }));

  const textColor = Colors[useColorScheme() ?? "light"]["text"];

  return (
    <ThemedView>
      <ThemedText type="subtitle">{title}</ThemedText>
      {data && procData.length > 1 ? (
        procData.every((val) => val.y === procData[0].y) ? (
          <ThemedText type="subtitle">
            Constant Value: {procData[0].y} (
            {new Date(procData.at(-1).x * 60_000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            )
          </ThemedText>
        ) : (
          <Chart
            style={{ height: 200, width: 400 }}
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
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });
                  },
                },
              }}
            />
            <Area
              theme={{
                gradient: {
                  from: { color: "#44bd32" },
                  to: { color: "#44bd32", opacity: 0.2 },
                },
              }}
            />
            <Line
              tooltipComponent={
                <Tooltip
                  theme={{
                    formatter: (v) => {
                      // return `${date.getMonth().toLocaleString()} ${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                      return v.y.toFixed(2);
                    },
                  }}
                />
              }
              theme={{
                stroke: { color: "#44bd32", width: 5 },
                scatter: {
                  default: { width: 8, height: 8, rx: 4, color: "#44ad32" },
                  selected: { color: "red" },
                },
              }}
              hideTooltipAfter={1000}
            />
          </Chart>
        )
      ) : (
        <ThemedText type="subtitle">
          Single Value: {procData[0].y} (
          {new Date(procData.at(-1).x * 60_000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
          )
        </ThemedText>
      )}
    </ThemedView>
  );
}
