import { DashboardView } from "./DashboardView";

import { createSelector } from "@reduxjs/toolkit";
import { store } from "@/store/store";

export const labelFunc = (title: string) => {
  if (title == "pH") {
    return (value) => `pH ${value}`;
  }

  const meMap = {
    Flow: "L",
    Temperature: "°C",
    Turbidity: "NTU",
  };

  return (value) => `${value} ${meMap[title]}`;
};

export function ConsumerView() {
  const typeMap: { [key: string]: string } = {
    flow: "Flow",
    temp: "Temperature",
    turb: "Turbidity",
    ph: "pH",
  };

  const selectData = createSelector(
    (state) => state.sensorData,
    (sensorData) =>
      sensorData.items.map((item) => ({
        title: item.title,
        items: item.portTypes.map((portType, portIndex) => ({
          title: typeMap[portType],
          items: item.readVals[portIndex],
        })),
      }))
  );

  return (
    <DashboardView data={selectData(store.getState())} labelUnits={labelFunc} />
  );
}
