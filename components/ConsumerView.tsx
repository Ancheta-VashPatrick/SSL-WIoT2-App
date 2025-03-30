import { useSelector } from "react-redux";

import { DashboardView } from "./DashboardView";

export function ConsumerView() {
  const typeMap: { [key: string]: any } = {
    flow: "Flow",
    temp: "Temperature",
    turb: "Turbidity",
    ph: "pH",
  };

  const sensorData = useSelector((state) =>
    state.sensorData.items.map((item) => {
      return {
        title: item.title,
        items: item.portTypes.map((portType, portIndex) => ({
          title: typeMap[portType],
          items: item.readVals[portIndex],
        })),
      };
    })
  );

  return <DashboardView data={sensorData} />;
}
