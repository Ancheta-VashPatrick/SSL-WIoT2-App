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
import { GraphPoint } from "react-native-graph";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Aes from "react-native-aes-crypto";

const DATA_SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const COLOR_CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1217";
const LED_CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1220";
const CHARACTERISTIC_UUIDS = [
  "19b10001-e8f2-537e-4f6c-d104768a1217",
  "19b10001-e8f2-537e-4f6c-d104768a1218",
  "19b10001-e8f2-537e-4f6c-d104768a1219",
  "19b10001-e8f2-537e-4f6c-d104768a1220",
];
const TEMP_CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1218";

const bleManager = new BleManager();

function useBLE() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [color, setColor] = useState("white");
  const [tempVals, setTempVals] = useState<GraphPoint[]>([]);

  const [portTypes, setPortTypes] = useState(["flow", null, null, null]);
  const [readVals, setReadVals] = useState<GraphPoint[][]>([[], [], [], []]);

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

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }

      if (
        device &&
        (device.localName === "ESP32-WIOT2" || device.name === "ESP32-WIOT2")
      ) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  };

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();

      // startStreamingData(deviceConnection);
      startReadingPorts(deviceConnection);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const onDataUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return;
    } else if (!characteristic?.value) {
      console.log("No Data was received");
      return;
    }

    const colorCode = base64.decode(characteristic.value);

    let color = "white";
    if (colorCode === "B") {
      color = "blue";
    } else if (colorCode === "R") {
      color = "red";
    } else if (colorCode === "G") {
      color = "green";
    }

    setColor(color);
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        COLOR_CHARACTERISTIC_UUID,
        onDataUpdate
      );
    } else {
      console.log("No Device Connected");
    }
  };

  const toggleLED = async (device: Device) => {
    if (device) {
      const characteristic = await device.readCharacteristicForService(
        DATA_SERVICE_UUID,
        LED_CHARACTERISTIC_UUID
      );

      if (!characteristic?.value) {
        console.log("No Data was received");
        return;
      }

      const read_val = base64.decode(characteristic.value);
      console.log(read_val);
      device.writeCharacteristicWithResponseForService(
        DATA_SERVICE_UUID,
        LED_CHARACTERISTIC_UUID,
        base64.encode(read_val === "OFF" ? "ON" : "OFF")
      );
    } else {
      console.log("No Device Connected");
    }
  };

  const startReadingPorts = async (device: Device | null) => {
    const interval = setInterval(() => {
      for (let i = 0; i < CHARACTERISTIC_UUIDS.length; i++) {
        readPort(device, i);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const readPort = async (device: Device | null, portNumber: number) => {
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
        console.log(error);
      }
      if (rawVal) {
        const readVal = rawVal.slice(5, -1);
        // console.log(readVal);
        let rawPortType = rawVal.slice(0, 4);
        const portType =
          rawPortType === "phxx" ? rawPortType.slice(0, 2) : rawPortType;
        console.log(portType);

        const TZ_OFFSET = 8;

        let readValsBuffer = new Array();

        let start = 8;
        let end = (portType == "flow") ? 21 : 19;

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

          readValsBuffer.push({
            date: new Date(
              currDate.getTime() +
                parseInt(readVal.substring(start, start + 2)) * 3600000 +
                parseInt(readVal.substring(start + 2, start + 4)) * 60000 -
                TZ_OFFSET * 3600000
            ),
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
        
        let oldTypes = portTypes;
        oldTypes[portNumber] = portType;
        setPortTypes(oldTypes);
        let oldVals = readVals;
        oldVals[portNumber] = readValsBuffer;
        setReadVals(oldVals);
        // console.log(rawVal);
        
        try {
          await AsyncStorage.setItem(
            "port-types",
            JSON.stringify(portTypes)
          );
          await AsyncStorage.setItem(
            "read-vals",
            JSON.stringify(readVals)
          );
        } catch (e) {
          // saving error
        }
      }
    } else {
      console.log("No Device Connected");
    }
  };

  return {
    connectToDevice,
    allDevices,
    scanForPeripherals,
    connectedDevice,
    color,
    tempVals,
    requestPermissions,
    toggleLED,
    portTypes,
    readVals,
  };
}

export default useBLE;
