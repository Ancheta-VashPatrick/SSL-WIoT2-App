/* eslint-disable no-bitwise */
import { useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";
import { BleManager, Device } from "react-native-ble-plx";

import Aes from "react-native-aes-crypto";

import {
  MAX_UPLOAD_DATA_ITEMS,
  addDevice,
  addLog,
  markDevice,
  removeDevice,
  resetLock,
  setConnectedDevice,
  setLock,
  updateNode,
  updateUploadNode,
} from "@/store/reducers";
import { store } from "@/store/store";

const DATA_SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const CHARACTERISTIC_UUIDS = [
  "19b10001-e8f2-537e-4f6c-d104768a1217",
  "19b10001-e8f2-537e-4f6c-d104768a1218",
  "19b10001-e8f2-537e-4f6c-d104768a1219",
  "19b10001-e8f2-537e-4f6c-d104768a1220",
];

const bleManager = new BleManager();

function useBLE() {
  const dispatch = store.dispatch;

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const collectFromDevices = () => {
    if (!store.getState().sensorData.dataLock) {
      let currentDevicesData = store.getState().devicesData;
      if (currentDevicesData.items.length) {
        dispatch(setLock(null));
        Promise.all(
          currentDevicesData.items.map(async (deviceString) => {
            // console.log(deviceString);
            let deviceObject = JSON.parse(deviceString);
            let device = new Device(
              {
                id: deviceObject.id,
                name: deviceObject.name,
                rssi: deviceObject.rssi,
                mtu: deviceObject.mtu,
                manufacturerData: deviceObject.manufacturerData,
                rawScanRecord: deviceObject.rawScanRecord,
                serviceData: deviceObject.serviceData,
                serviceUUIDs: deviceObject.serviceUUID,
                localName: deviceObject.localName,
                txPowerLevel: deviceObject.txPowerLevel,
                solicitedServiceUUIDs: deviceObject.solicitedServiceUUIDs,
                isConnectable: deviceObject.isConnectable,
                overflowServiceUUIDs: deviceObject.overflowServiceUUIDs,
              },
              bleManager
            );
            return connectToDevice(device);
          })
        ).then(() => {
          dispatch(resetLock(null));
        });
      } else {
        dispatch(
          addLog({
            message: `Unable to detect nearby nodes.`,
          })
        );
      }
    }
  };

  const scanForPeripherals = () => {
    if (!store.getState().sensorData.dataLock) {
      dispatch(setLock(null));

      bleManager
        .startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.log(error);
          }

          const nodes = store.getState().userData.nodes ?? [];

          if (
            device &&
            (device.localName?.startsWith("ESP32-WIOT2-") ||
              device.name?.startsWith("ESP32-WIOT2-")) &&
            nodes.find(
              (node) =>
                node.nodeId == device.name || node.nodeId == device.localName
            )
          ) {
            dispatch(addDevice({ device: JSON.stringify(device) }));
            // console.log(store.getState().devicesData.items)
          }
        })
        .then(() => {
          dispatch(resetLock(null));
        });
    }
  };

  const connectToDevice = async (device: Device) => {
    let currentDevicesData = store.getState().devicesData;
    let newTimeout = new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject("Bluetooth connection timed out.");
      }, 15_000);
    });
    return Promise.race([
      new Promise(async (resolve, reject) => {
        try {
          const deviceConnection = await bleManager.connectToDevice(device.id);
          setConnectedDevice(JSON.stringify(deviceConnection));
          await deviceConnection.discoverAllServicesAndCharacteristics();
          bleManager.stopDeviceScan();
          resolve(deviceConnection);
        } catch (e) {
          reject("Failed to connect.");
          console.log("FAILED TO CONNECT", e);
        }
      }),
      newTimeout,
    ]).then(
      async (deviceConnection) => {
        // startStreamingData(deviceConnection);
        if (currentDevicesData.marks[device?.id]) {
          dispatch(
            addLog({
              message: `Detected ${device?.name}, but data has been collected recently.`,
            })
          );
          dispatch(
            markDevice({
              device: JSON.stringify(device),
            })
          );
        } else {
          // console.log("Collecting...");
          dispatch(
            addLog({
              message: `Detected ${device?.name}, attempting to collect...`,
            })
          );
          return startReadingPorts(deviceConnection);
        }
      },
      (error) => {
        // dispatch(
        //   addLog({
        //     message: `Failed to connect to ${device?.name}.`,
        //   })
        // );
        dispatch(removeDevice({ device: JSON.stringify(device) }));
      }
    );
  };

  const disconnectDevice = async () => {
    // console.log(connectedDevice);
    let deviceString = store.getState().devicesData.connectedDevice;
    if (deviceString) {
      let deviceObject = JSON.parse(deviceString);
      let connectedDevice = new Device(
        {
          id: deviceObject.id,
          name: deviceObject.name,
          rssi: deviceObject.rssi,
          mtu: deviceObject.mtu,
          manufacturerData: deviceObject.manufacturerData,
          rawScanRecord: deviceObject.rawScanRecord,
          serviceData: deviceObject.serviceData,
          serviceUUIDs: deviceObject.serviceUUID,
          localName: deviceObject.localName,
          txPowerLevel: deviceObject.txPowerLevel,
          solicitedServiceUUIDs: deviceObject.solicitedServiceUUIDs,
          isConnectable: deviceObject.isConnectable,
          overflowServiceUUIDs: deviceObject.overflowServiceUUIDs,
        },
        bleManager
      );
      await connectedDevice?.cancelConnection();
      setConnectedDevice(null);
    }
    // console.log(connectedDevice);
  };

  const getSuccess = () => {
    let result = store.getState().sensorData.uploadItems.reduce(
      (previous, current) => ({
        ...previous,
        [current.title]: current.readVals.reduce(
          (miniSum, miniOp) => miniSum + miniOp.length,
          0
        ),
      }),
      {} as Record<string, number>
    );
    // console.log(result);
    return result;
  };
  const startReadingPorts = async (device: Device | null) => {
    let newTimeout = new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject("Port reading timed out.");
      }, 15_000);
    });
    console.log(new Date().toISOString(), `Started reading ports from ${device?.name ?? device?.localName}`)
    let oldSuccess = getSuccess();
    return Promise.race([
      Promise.all(
        CHARACTERISTIC_UUIDS.map(
          async (item, index) => await readPort(device, index)
        )
      ),
      newTimeout,
    ])
      .then(
        (value) => {
          // console.log(JSON.stringify(value));
          let nodeId = device?.localName ?? device?.name ?? "DEFAULT";
          // .toLowerCase()
          // .slice(12);
          let data = value.filter((item) => item.type != "");
          dispatch(updateUploadNode({ nodeId, data }));
          dispatch(updateNode({ nodeId, data }));
          let newSuccess = getSuccess();
          let diffSuccess = newSuccess[nodeId] - (oldSuccess[nodeId] ?? 0);
          if (diffSuccess) {
            dispatch(
              addLog({
                message: `Successfully collected ${diffSuccess} values from ${device?.name}.`,
              })
            );
            dispatch(
              markDevice({
                device: JSON.stringify(device),
              })
            );
          } else {
            if (newSuccess[nodeId] == MAX_UPLOAD_DATA_ITEMS) {
              dispatch(
                addLog({
                  message: `Buffer for ${device?.name} full. Old values might have been deleted.`,
                })
              );
            } else {
              dispatch(
                addLog({
                  message: `No new values from ${device?.name}.`,
                })
              );
            }
          }
        },
        (error) => {
          dispatch(
            addLog({
              message: `Unable to collect values from ${device?.name}.`,
            })
          );
          console.log(error);
        }
      )
      .finally(() =>
        setTimeout(async function () {
          await disconnectDevice();
        }, 1_000)
      );
  };

  const readPort = async (
    device: Device | null,
    portNumber: number,
    numCalls: number = 0
  ) => {
    // console.log(numCalls)
    if (device) {
      const characteristic = await device.readCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUIDS[portNumber]
      );

      if (!characteristic?.value) {
        console.log("No Data was received");
        return { type: "", data: [] };
      }

      let rawVal = null;
      // Decrypt value
      try {
        const nodeDetails =
          (store.getState().userData.nodes ?? []).find(
            (node) => node.nodeId == device?.name
          ) ?? {};

        let decodeKeys = [];

        if (portNumber > 0) {
          if (!nodeDetails["wqmKey"]) {
            return { type: "", data: [] };
          } else {
            decodeKeys = nodeDetails["wqmKey"];
          }
        } else if (portNumber == 0) {
          if (!nodeDetails["flowKey"]) {
            return { type: "", data: [] };
          } else {
            decodeKeys = nodeDetails["flowKey"];
          }
        }

        rawVal = await Aes.decrypt(
          base64.decode(characteristic.value),
          decodeKeys[0],
          decodeKeys[1],
          "aes-128-cbc"
        );
      } catch (error) {
        console.log(error, numCalls);
        if (numCalls < 3) {
          return readPort(device, portNumber, numCalls + 1);
        } else {
          throw Error("Too many calls, aborting port read.");
        }
      }
      if (rawVal) {
        try {
          const readVal = rawVal.slice(5, -1);
          console.log(new Date().toISOString(), device?.name ?? device?.localName, rawVal);
          let rawPortType = rawVal.slice(0, 4);
          const portType =
            rawPortType === "phxx" ? rawPortType.slice(0, 2) : rawPortType;
          // console.log(portType);

          const TZ_OFFSET = 8;

          let readValsBuffer = new Array();

          let start = 8;
          let end = portType == "flow" ? 21 : 19;

          let currDate = new Date(
            `${readVal.substring(0, 4)}-${readVal.substring(
              4,
              6
            )}-${readVal.substring(6, 8)}`
          );
          while (end < readVal.length) {
            if (readVal.charAt(start - 1) === "|") {
              currDate = new Date(currDate.getTime() + 86400000);
            }
            // console.log(parseFloat(readVal.substring(start, end)));
            if (isNaN(parseFloat(readVal.substring(start, end)))) {
              throw Error("Bad BLE read value");
            }

            readValsBuffer.push({
              date: new Date(
                currDate.getTime() +
                  parseInt(readVal.substring(start, start + 2)) * 3600000 +
                  parseInt(readVal.substring(start + 2, start + 4)) * 60000 -
                  TZ_OFFSET * 3600000
              ).toISOString(),
              value: parseFloat(
                readVal.substring(start + (portType == "flow" ? 7 : 4), end)
              ),
            });
            if (portType == "flow") {
              // console.log(rawVal);
              // console.log(readValsBuffer);
              start += 15;
              end += 15;
            } else {
              start += 12;
              end += 12;
            }
          }

          // console.log(rawVal);
          return { type: portType, data: readValsBuffer };
        } catch (error) {
          console.log(error);
          if (numCalls < 3) {
            return readPort(device, portNumber, numCalls + 1);
          } else {
            throw Error("Too many calls, aborting port read.");
          }
        }
      }
    } else {
      console.log("No Device Connected");
    }
  };

  return {
    connectToDevice,
    disconnectDevice,
    collectFromDevices,
    scanForPeripherals,
    requestPermissions,
  };
}

// export default useBLE;
module.exports = { useBLE };
