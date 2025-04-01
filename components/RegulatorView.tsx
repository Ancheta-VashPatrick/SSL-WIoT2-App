import { DashboardView } from "./DashboardView";
import { labelFunc, typeMap } from "./ConsumerView";

import { createSelector } from "@reduxjs/toolkit";
import { store } from "@/store/store";

export function RegulatorView() {
  const selectData = createSelector(
    [(state) => state.sensorData, (state) => state.userData],
    (sensorDataRaw, userData) => {
      let sensorData = sensorDataRaw.items.map((item) => ({
        title: item.title,
        items: item.portTypes.map((portType, portIndex) => ({
          title: typeMap[portType],
          items: item.readVals[portIndex],
        })),
      }));

      return [...new Set(userData.nodes.map((item) => item.location))]
        .sort()
        .map((location) => {
          return {
            title: location,
            items: Object.entries(
              userData.nodes
                .filter((item) => item.location == location)
                .flatMap((node) => {
                  let dataItem = sensorData.find(
                    (sensorDataItem) => sensorDataItem.title == node.nodeId
                  );

                  if (dataItem) {
                    return [dataItem];
                  } else {
                    return [];
                  }
                })
                .reduce((prev, curr) => {
                  prev.push(...curr.items);
                  return prev;
                }, [] as Record<string, any>[])
                .reduce((prev, curr) => {
                  if (!prev[curr.title]) {
                    prev[curr.title] = [...curr.items];
                  } else {
                    prev[curr.title].push(...curr.items);
                  }
                  return prev;
                }, {} as Record<string, any>)
            ).map(([portType, readVals]) => ({
              title: portType,
              items: Object.entries(
                readVals.reduce((prev, curr) => {
                  if (!prev[curr.date]) {
                    prev[curr.date] = [curr.value];
                  } else {
                    prev[curr.date].push(curr.value);
                  }
                  return prev;
                }, {} as Record<string, any>)
              )
                .map(([date, values]) => ({
                  date,
                  value: (
                    values.reduce((prev, curr) => prev + parseFloat(curr), 0) /
                    values.length
                  ).toString(),
                }))
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                ),
            })),
          };
        });
    }
  );

  return (
    <DashboardView data={selectData(store.getState())} labelUnits={labelFunc} />
  );
}
