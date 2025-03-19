/* eslint-disable no-bitwise */
import { useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

import Aes from "react-native-aes-crypto";

import {
  addDevice,
  addLog,
  markDevice,
  removeDevice,
  updateNode,
  updateUploadNode,
} from "@/store/reducers";
import { useDispatch } from "react-redux";
import store from "@/store/store";

const DATA_SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const CHARACTERISTIC_UUIDS = [
  "19b10001-e8f2-537e-4f6c-d104768a1217",
  "19b10001-e8f2-537e-4f6c-d104768a1218",
  "19b10001-e8f2-537e-4f6c-d104768a1219",
  "19b10001-e8f2-537e-4f6c-d104768a1220",
];

const bleManager = new BleManager();

function useBLE() {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const dispatch = useDispatch();

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
    let currentDevicesData = store.store.getState().devicesData;
    if (currentDevicesData.items.length) {
      currentDevicesData.items.forEach((deviceString, deviceIndex) => {
        console.log(deviceString);
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
        if (currentDevicesData.marks[deviceIndex]) {
          dispatch(
            addLog({
              message: `${device?.name} listed, but data has been collected recently.`,
            })
          );
        } else {
          // console.log("Collecting...");
          dispatch(
            addLog({
              message: `Detected ${device?.name}, attempting to collect...`,
            })
          );
          connectToDevice(device);
        }
        dispatch(
          markDevice({
            deviceIndex,
          })
        );
      });
    } else {
      dispatch(
        addLog({
          message: `Unable to detect nearby nodes.`,
        })
      );
    }
  };

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }

      if (
        device &&
        (device.localName?.startsWith("ESP32-WIOT2-") ||
          device.name?.startsWith("ESP32-WIOT2-"))
      ) {
        dispatch(addDevice({ device: JSON.stringify(device) }));
        // console.log(store.store.getState().devicesData.items)
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    let newTimeout = new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject("Bluetooth connection timed out.");
      }, 15_000);
    });
    Promise.race([
      new Promise(async (resolve, reject) => {
        try {
          const deviceConnection = await bleManager.connectToDevice(device.id);
          setConnectedDevice(deviceConnection);
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
      (deviceConnection) => {
        // startStreamingData(deviceConnection);
        startReadingPorts(deviceConnection);
        dispatch(
          addLog({
            message: `Successfully connected to ${device?.name}.`,
          })
        );
      },
      (error) => {
        dispatch(
          addLog({
            message: `Failed to connect to ${device?.name}.`,
          })
        );
        dispatch(removeDevice({ device: JSON.stringify(device) }));
      }
    );
  };

  const disconnectDevice = async () => {
    // console.log(connectedDevice);
    await connectedDevice?.cancelConnection();
    setConnectedDevice(null);
    // console.log(connectedDevice);
  };

  const getSuccess = () => {
    return store.store
      .getState()
      .uploadData.items.reduce(
        (sum, op) =>
          sum +
          op.readVals.reduce((miniSum, miniOp) => miniSum + miniOp.length, 0),
        0
      );
  };
  const startReadingPorts = async (device: Device | null) => {
    let newTimeout = new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject("Port reading timed out.");
      }, 15_000);
    });
    let oldSuccess = getSuccess();
    Promise.race([
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
          let nodeId = (device?.localName ?? device?.name ?? "")
            .toLowerCase()
            .slice(12);
          dispatch(updateNode({ nodeId, data: value }));
          dispatch(updateUploadNode({ nodeId, data: value }));
          let newSuccess = getSuccess();
          let diffSuccess = newSuccess - oldSuccess;
          if (diffSuccess) {
            dispatch(
              addLog({
                message: `Successfully collected ${
                  newSuccess - oldSuccess
                } values from ${device?.name}.`,
              })
            );
          } else {
            dispatch(
              addLog({
                message: `No new values from ${device?.name}.`,
              })
            );
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
        return;
      }

      let rawVal = null;
      // Decrypt value
      try {
        rawVal = await Aes.decrypt(
          base64.decode(characteristic.value),
          "5169702A48227366786F232B655A7337",
          "46252662485B67397532362743784531",
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
          console.log(rawVal);
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
            console.log(parseFloat(readVal.substring(start, end)));
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
    connectedDevice,
    requestPermissions,
  };
}

// export default useBLE;
module.exports = { useBLE };
