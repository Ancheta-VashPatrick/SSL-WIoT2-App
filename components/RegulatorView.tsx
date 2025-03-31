import { DashboardView } from "./DashboardView";

import { createSelector } from "@reduxjs/toolkit";
import { store } from "@/store/store";

export function RegulatorView() {
  const typeMap: { [key: string]: string } = {
    flow: "Flow",
    temp: "Temperature",
    turb: "Turbidity",
    ph: "pH",
  };

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
            items: userData.nodes
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
                if (prev.filter((item) => item.title == curr.title).length) {
                  let i = 0;
                  while (prev[i].title != curr.title) {
                    i++;
                  }
                  prev[i].items.push(...curr.items);
                } else {
                  prev.push({ title: curr.title, items: [...curr.items] });
                }
                return prev;
              }, [])
              .map((item) => ({
                title: item.title,
                items: [
                  ...Object.entries(
                    item.items.reduce((prev, curr) => {
                      if (!prev[curr.date]) {
                        prev[curr.date] = [curr.value];
                      } else {
                        prev[curr.date].push(curr.value);
                      }
                      return prev;
                    }, {})
                  )
                    .entries()
                    .map(([index, [date, values]]) => ({
                      date,
                      value: (
                        values.reduce(
                          (prev, curr) => prev + parseFloat(curr),
                          0
                        ) / values.length
                      ).toString(),
                    })),
                ].sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                ),
              })),
          };
        });
    }
  );

  return <DashboardView data={selectData(store.getState())} />;
}
