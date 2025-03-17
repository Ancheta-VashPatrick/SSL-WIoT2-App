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
      blePortTypes,
      bleReadVals,
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

    const mockupLog = [
      {
        date: new Date("2025-03-17 13:34"),
        value: "Successfully uploaded 80 data points.",
      },
      {
        date: new Date("2025-03-17 13:33"),
        value: "[ERROR] Upload failed. Trying again in 60 seconds...",
      },
      {
        date: new Date("2025-03-17 13:32"),
        value: "[ERROR] Upload failed. Trying again in 30 seconds...",
      },
      {
        date: new Date("2025-03-17 13:32"),
        value: "[ERROR] Upload failed. Trying again in 10 seconds...",
      },
      {
        date: new Date("2025-03-17 13:31"),
        value: "Successfully collected 40 data points from 'sn1'.",
      },
      {
        date: new Date("2025-03-17 13:31"),
        value: "Collection manually initiated.",
      },
      {
        date: new Date("2025-03-17 13:30"),
        value: "Scanned the area, no nodes nearby.",
      },
      {
        date: new Date("2025-03-17 13:29"),
        value: "Successfully collected 40 data points from 'coe199node'.",
      },
      {
        date: new Date("2025-03-17 13:29"),
        value: "Scanned the area, found 'coe199node'.",
      },
    ];

    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const dimensionRatio = windowWidth / windowHeight;
    const widthDivisions = Math.floor(dimensionRatio / 1.4) + 1;
    const widthPortion = 93 / widthDivisions;

    const item = ({ item }) => (
      <ThemedView style={{ flexDirection: "row" }}>
        <ThemedView style={{ flex: 4 }}>
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
              ? `${item.date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}`
              : ""}
          </ThemedText>
        </ThemedView>
        <ThemedView style={{ flex: 10 }}>
          <ThemedText style={{ fontSize: 16, textAlign: "justify" }}>
            {item.value}
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

        {connectedDevice ? (
          <>
            {bleReadVals.map((prop, key) => (
              <ThemedView
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                key={key}
              >
                <ThemedText>
                  {blePortTypes[key] === null ? "" : typeMap[blePortTypes[key]]}
                </ThemedText>
                <FlatList
                  data={prop}
                  renderItem={item}
                  scrollEnabled={false}
                  extraData={bleReadVals}
                />
              </ThemedView>
            ))}
            {/* <ThemedText>{`\n${tempVals[0].date}`}</ThemedText> */}
          </>
        ) : (
          <ThemedText>There are nodes detected nearby.</ThemedText>
        )}

        <ThemedView style={styles.ctaButtonContainer}>
          <TouchableOpacity
            onPress={connectedDevice ? disconnectDevice : openModal}
            style={styles.ctaButton}
          >
            <ThemedText style={styles.ctaButtonText}>
              {connectedDevice ? "Disconnect" : "Connect"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={uploadData} style={styles.ctaButton}>
            <ThemedText style={styles.ctaButtonText}>Upload</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <FlatList
          style={styles.ctaLogText}
          data={mockupLog}
          renderItem={item}
          scrollEnabled={false}
        />

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
