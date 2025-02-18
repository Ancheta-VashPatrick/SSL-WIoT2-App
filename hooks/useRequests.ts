import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetch } from "expo/fetch";
import { useState } from "react";

function useRequests() {
  const [successfulUploads, setSuccessfulUploads] = useState(0);

  const url = "http://10.158.66.62:3000/sensor-data";
  async function createEntry(data) {
    // console.log("start");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    // console.log("end");
    const newData = await response.json();
    console.log(newData);

    if (newData.message == "Sensor data record created successfully") {
      // console.log("WOOP");
      setSuccessfulUploads(successfulUploads + 1);
    }

    return newData;
  }

  function fromList(a) {
    return Array<number>(a.length)
      .fill(0)
      .map((_, index) => ({
        date: new Date(a[index].date),
        value: a[index].value,
      }));
  }

  const uploadData = async () => {
    try {
      setSuccessfulUploads(0);

      const rawPortTypes = await AsyncStorage.getItem("port-types");
      const rawReadVals = await AsyncStorage.getItem("read-vals");

      if (rawReadVals !== null && rawPortTypes !== null) {
        const readVals = JSON.parse(rawReadVals);
        const portTypes = JSON.parse(rawPortTypes);
        for (let i = 0; i < readVals.length; i++) {
          const value = fromList(readVals[i]);
          value.forEach(async (element) => {
            console.log(element);
            const data = {
              nodeId: "coe199node",
              portNumber: i,
              sensorType: portTypes[i],
              value: element.value,
              recordedAt: `${element.date
                .getFullYear()
                .toString()
                .padStart(4, "0")}-${element.date
                .getMonth()
                .toString()
                .padStart(2, "0")}-${element.date
                .getDate()
                .toString()
                .padStart(2, "0")} ${element.date
                .getHours()
                .toString()
                .padStart(2, "0")}:${element.date
                .getMinutes()
                .toString()
                .padStart(2, "0")}`,
            };

            // console.log(data);
            await createEntry(data);
          });
        }
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  return { successfulUploads, uploadData };
}

export default useRequests;
