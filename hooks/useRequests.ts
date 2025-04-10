import {
  addLog,
  removeRecord,
  resetLock,
  setLock,
  setUser,
} from "@/store/reducers";
import { store } from "@/store/store";

import { fetch } from "expo/fetch";

function useRequests() {
  const dispatch = store.dispatch;

  const url = "http://10.158.66.62:3000";
  async function createEntry(data, recordedAt) {
    // console.log(JSON.stringify(data));
    // console.log("start", JSON.stringify(data));
    try {
      const response = await fetch(url + "/sensor-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      // console.log("end");
      const newData = await response.json();
      // console.log(JSON.stringify(data));
      // console.log(newData);
      // console.log(response.status);
      if (
        response.status == 201 &&
        newData.message == "Sensor data record created successfully"
      ) {
        dispatch(
          removeRecord({
            nodeId: data.nodeId,
            portNumber: data.portNumber,
            recordedAt,
          })
        );
      } else if (
        response.status == 409 &&
        newData.message.startsWith("Duplicate entry ")
      ) {
        dispatch(
          removeRecord({
            nodeId: data.nodeId,
            portNumber: data.portNumber,
            recordedAt,
          })
        );
      }

      return { status: response.status, body: newData };
    } catch (error) {
      return { status: 503, body: { message: error } };
    }
  }

  function fromList(a) {
    return Array<number>(a.length)
      .fill(0)
      .map((_, index) => ({
        date: new Date(a[index].date),
        value: a[index].value,
      }));
  }

  // https://stackoverflow.com/questions/23483718/turn-array-into-comma-separated-grammatically-correct-sentence
  function arrayToSentence(arr: string[]) {
    var last = arr.pop();
    return arr.length ? arr.join(", ") + " and " + last : last;
  }
  const statusMap = {
    success: "successful upload",
    other: "failed upload",
    duplicate: "duplicate",
  };

  const uploadData = async () => {
    if (!store.getState().sensorData.dataLock) {
      let currentUploadData = store.getState().sensorData.uploadItems;
      if (currentUploadData.length) {
        dispatch(setLock(null));

        dispatch(
          addLog({
            message: "Attempting to upload data...",
          })
        );
        Promise.all(
          currentUploadData.map((item) => {
            const portTypes = item.portTypes;
            const readVals = item.readVals;

            return Promise.all(
              readVals.map(async (element, index) => {
                return Promise.all(
                  element.map(async (readVal) => {
                    let readDate = new Date(readVal.date);

                    return await createEntry(
                      {
                        nodeId: item.title,
                        portNumber: index,
                        sensorType: portTypes[index],
                        value: readVal.value,
                        recordedAt: `${readDate
                          .getFullYear()
                          .toString()
                          .padStart(4, "0")}-${(readDate.getMonth() + 1)
                          .toString()
                          .padStart(2, "0")}-${readDate
                          .getDate()
                          .toString()
                          .padStart(2, "0")} ${readDate
                          .getHours()
                          .toString()
                          .padStart(2, "0")}:${readDate
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`,
                      },
                      readVal.date
                    );
                  })
                );
              })
            ).then(
              (value) => {
                let reducedResponse = value
                  .map((item) => {
                    let success = item.filter(
                      (subItem) =>
                        subItem.status == 201 &&
                        subItem.body.message ==
                          "Sensor data record created successfully"
                    ).length;
                    let duplicate = item.filter(
                      (subItem) =>
                        subItem.status == 409 &&
                        subItem.body.message.startsWith("Duplicate entry ")
                    ).length;
                    let other = item.length - (success + duplicate);

                    return { success, duplicate, other };
                  })
                  .reduce((prev, current) => ({
                    success: prev.success + current.success,
                    duplicate: prev.duplicate + current.duplicate,
                    other: prev.other + current.other,
                  }));

                dispatch(
                  addLog({
                    message: `Attempted to upload data from ${
                      item.title
                    }. There were ${arrayToSentence(
                      Object.entries(reducedResponse).reduce(
                        (p, [k, v]) =>
                          v
                            ? [...p, `${v} ${statusMap[k]}${v - 1 ? "s" : ""}`]
                            : p,
                        new Array<string>()
                      )
                    )}.`,
                  })
                );
                // console.log(JSON.stringify(val));
              },
              (error) => {
                console.error(error);
              }
            );
          })
        ).then(() => {
          dispatch(resetLock(null));
        });
      }
    }
  };

  const loginUser = async (data) => {
    try {
      const response = await fetch(url + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      // console.log("end");
      const newData = await response.json();
      // console.log(JSON.stringify(data));
      // console.log(JSON.stringify(newData));
      // console.log(response.status);
      if (response.status == 200 && newData.message == "User record found") {
        dispatch(setUser({ username: data.username, ...newData }));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  return { uploadData, loginUser };
}

export default useRequests;
