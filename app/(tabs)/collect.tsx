import {
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  useColorScheme,
  ScrollView,
} from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useEffect, useState } from "react";
import DeviceModal from "@/components/DeviceConnectionModal";
// import useBLE from "@/hooks/useBLE";

import useRequests from "@/hooks/useRequests";

import { addLog, clearLog } from "@/store/reducers";
import { useDispatch, useSelector } from "react-redux";

export default function CollectScreen() {
  if (Platform.OS == "android" || Platform.OS == "ios") {
    const { successfulUploads, uploadData } = useRequests();

    const useBLE = require("../../hooks/useBLE").useBLE;

    const {
      allDevices,
      connectedDevice,
      connectToDevice,
      disconnectDevice,
      scanForPeripherals,
      requestPermissions,
    } = useBLE();

    const [isModalVisible, setIsModalVisible] = useState(false);

    const scanForDevices = async () => {
      const isPermissionsEnabled = await requestPermissions();
      if (isPermissionsEnabled) {
        scanForPeripherals();
      }
    };

    const hideModal = () => {
      setIsModalVisible(false);
    };

    const openModal = async () => {
      scanForDevices();
      setIsModalVisible(true);
    };

    const typeMap: { [key: string]: any } = {
      flow: "Flow",
      temp: "Temperature",
      turb: "Turbidity",
      ph: "pH",
    };

    const dispatch = useDispatch();

    const [mockupIndex, setMockupIndex] = useState(0);
    const logData = useSelector((state) => state.logData);
    const addToLog = () => {
      if (mockupIndex < mockupLog.length) {
        setMockupIndex(mockupIndex + 1);
        dispatch(addLog(mockupLog[mockupIndex]));
        // console.log(mockupLog[mockupIndex]);
        // console.log(logData)
      }
    };

    const clearTheLog = () => {
      setMockupIndex(0);
      dispatch(clearLog(null));
    };

    const mockupLog = [
      {
        message: "Scanned the area, found 'coe199node'.",
      },
      {
        message: "Successfully collected 40 data points from 'coe199node'.",
      },
      {
        message: "Scanned the area, no nodes nearby.",
      },
      {
        message: "Collection manually initiated.",
      },
      {
        message: "Successfully collected 40 data points from 'sn1'.",
      },
      {
        message: "[ERROR] Upload failed. Trying again in 10 seconds...",
      },
      {
        message: "[ERROR] Upload failed. Trying again in 30 seconds...",
      },
      {
        message: "[ERROR] Upload failed. Trying again in 60 seconds...",
      },
      {
        date: "2025-03-17 13:34",
        message: "Successfully uploaded 80 data points.",
      },
    ];

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const dimensionRatio = windowWidth / windowHeight;
    const widthDivisions = Math.floor(dimensionRatio / 1.4) + 1;
    const widthPortion = 93 / widthDivisions;

    const item = ({ item }) => (
      <ThemedView style={{ flexDirection: "row" }}>
        <ThemedView style={{ flex: 6 }}>
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
              marginRight: 10,
            }}
          >
            {/* {JSON.stringify(item.date)} */}
            {item
              ? `${new Date(item.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}`
              : ""}
          </ThemedText>
        </ThemedView>
        <ThemedView style={{ flex: 11 }}>
          <ThemedText style={{ fontSize: 16, textAlign: "justify" }}>
            {item.message}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );

    const theme = useColorScheme() ?? "light";

    const styles = StyleSheet.create({
      headerImage: {
        color: "#808080",
        bottom: -90,
        left: -35,
        position: "absolute",
      },
      titleContainer: {
        flexDirection: "row",
        gap: 8,
      },
      ctaButtonContainer: {
        flex: widthDivisions,
        flexDirection: "row",
        flexWrap: "wrap",
      },
      ctaButton: {
        width: `${widthPortion}%`,
        maxWidth: `${widthPortion}%`,
        backgroundColor: "#FF6060",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        marginHorizontal: 20,
        marginBottom: 5,
        borderRadius: 8,
        flexGrow: 1,
      },
      ctaButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
      },
      ctaLogText: {
        borderWidth: 1,
        borderColor:
          theme === "light" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)",
        borderRadius: 10,
        padding: 15,
      },
      ctaText: {
        justifyContent: "center",
        alignItems: "center",
      },
    });

    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={
          <IconSymbol
            size={300}
            color="#808080"
            name="tray.and.arrow.down.fill"
            style={styles.headerImage}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Collect</ThemedText>
        </ThemedView>

        <ThemedText>There are nodes detected nearby.</ThemedText>

        <ThemedView style={styles.ctaButtonContainer}>
          <TouchableOpacity
            onPress={connectedDevice ? disconnectDevice : openModal}
            style={styles.ctaButton}
          >
            <ThemedText style={styles.ctaButtonText}>
              Collect
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={disconnectDevice} style={styles.ctaButton}>
            <ThemedText style={styles.ctaButtonText}>Upload</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {logData.items.length ? (
          <FlatList
            style={styles.ctaLogText}
            data={logData.items}
            renderItem={item}
            scrollEnabled={false}
          />
        ) : (
          <></>
        )}

        {<ThemedText style={styles.ctaText}>{successfulUploads}</ThemedText>}

        <DeviceModal
          closeModal={hideModal}
          visible={isModalVisible}
          connectToPeripheral={connectToDevice}
          devices={allDevices}
        />
      </ParallaxScrollView>
    );
  } else {
    return <></>;
  }
}
