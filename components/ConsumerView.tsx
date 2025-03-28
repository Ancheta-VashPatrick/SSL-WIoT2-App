
import { StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";

import { Collapsible } from "./Collapsible";

import { useSelector } from "react-redux";

import { ChartView } from "./ChartView";
import { useWindowDimensions } from "react-native";

export function ConsumerView() {
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
                          1800_000
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
    </>
  );
}
