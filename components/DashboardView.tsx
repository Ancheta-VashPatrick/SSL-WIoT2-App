import { StyleSheet, useWindowDimensions, type ViewProps } from "react-native";

import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

import { Collapsible } from "./Collapsible";
import { ChartView } from "./ChartView";

import { DataElement } from "@/services/data";

interface DataSubcategory {
  title: string;
  items: DataElement[];
}

interface DataCategory {
  title: string;
  items: DataSubcategory[];
}

export type DashboardViewProps = ViewProps & {
  data: DataCategory[];
};

export function DashboardView({
  style,
  data,
  ...otherProps
}: DashboardViewProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const dimensionRatio = windowWidth / windowHeight;
  const widthDivisions = Math.floor(dimensionRatio / 1.4) + 1;
  const widthPortion = 100 / widthDivisions;

  const styles = StyleSheet.create({
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
  });

  return (
    <>
      {data.length ? (
        data.map((dataItem, dataKey) => (
          <Collapsible title={dataItem.title} key={dataKey}>
            <ThemedView style={styles.graphContainer} key={dataKey}>
              {dataItem.items.length ? (
                dataItem.items.map((prop, key) => {
                  let recentData = prop;
                  if (recentData.items.length) {
                    const lastDate = recentData.items.at(-1)?.date;
                    recentData.items = recentData.items
                      .filter(
                        (readVal) =>
                          new Date(lastDate ?? new Date()).getTime() -
                            new Date(readVal.date).getTime() <=
                          1800_000
                      )
                      .slice(-Math.min(recentData.items.length, 20));
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
                        title={recentData.title}
                        data={recentData.items.map((readVal) => ({
                          date: new Date(readVal.date),
                          value: readVal.value,
                        }))}
                        xDomain={minmax(
                          recentData.items.map(
                            (item) => new Date(item.date).getTime() / 60_000
                          ),
                          0.14,
                          0.8
                        )}
                        yDomain={minmax(
                          recentData.items.map((item) => item.value),
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
    </>
  );
}
