import { DashboardView } from "./DashboardView";

import { createSelector } from "@reduxjs/toolkit";
import { store } from "@/store/store";

export function ConcessionaireView() {
  const typeMap: { [key: string]: string } = {
    flow: "Flow",
    temp: "Temperature",
    turb: "Turbidity",
    ph: "pH",
  };

  const selectData = createSelector(
    [(state) => state.sensorData, (state) => state.userData],
    (sensorDataRaw, userData) => {
      console.log(sensorDataRaw);
      let sensorData = sensorDataRaw.items.map((item) => ({
        title: item.title,
        items: item.portTypes.map((portType, portIndex) => ({
          title: typeMap[portType],
          items: item.readVals[portIndex],
        })),
      }));

      return [...new Set(userData.nodes.map((item) => item.jurisdiction))]
        .sort()
        .map((jurisdiction) => ({
          title: jurisdiction,
          items: userData.nodes
            .filter((item) => item.jurisdiction == jurisdiction)
            .map((node) => ({
              title: node.nodeId,
              items: (
                (
                  sensorData.find(
                    (sensorDataItem) => sensorDataItem.title == node.nodeId
                  ) ?? { items: [] }
                ).items[0] ?? { items: [] }
              ).items,
            })),
        }));
    }
  );

  return <DashboardView data={selectData(store.getState())} />;
}
