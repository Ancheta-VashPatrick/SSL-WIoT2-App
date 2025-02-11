import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetch } from "expo/fetch";

function useRequests() {
  const url = "http://10.158.66.62:3000/sensor-data";
  async function createEntry(data) {
    console.log("start");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("end");
    const newData = await response.json();
    console.log(newData);
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
      var n = 0;

      const value = await AsyncStorage.getItem("temp-vals");
      if (value !== null) {
        console.log(value);
        const pvalue = fromList(JSON.parse(value));
        pvalue.forEach(async (element) => {
          console.log(element);
          const data = {
            nodeId: "coe199node",
            portNumber: 1,
            sensorType: "temp",
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

          console.log(data);
          const responseData = JSON.parse(await createEntry(data));
          if (
            responseData.message == "Sensor data record created successfully"
          ) {
            n += 1;
          }
          console.log(n);
        });
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  return { uploadData };
}

export default useRequests;
