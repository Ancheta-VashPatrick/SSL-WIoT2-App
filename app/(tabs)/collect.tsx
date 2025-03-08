import {
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  FlatList,
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

    const useBLE = require('../../hooks/useBLE').useBLE;

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

    const item = ({ item }) => (
      <ThemedView style={{ flexDirection: "row" }}>
        <ThemedView style={{ width: 200, backgroundColor: "lightyellow" }}>
          <ThemedText
            style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}
          >
            {/* {JSON.stringify(item.date)} */}
            {item
              ? `${item.date
                  .getFullYear()
                  .toString()
                  .padStart(4, "0")}-${item.date
                  .getMonth()
                  .toString()
                  .padStart(2, "0")}-${item.date
                  .getDate()
                  .toString()
                  .padStart(2, "0")} ${item.date
                  .getHours()
                  .toString()
                  .padStart(2, "0")}:${item.date
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`
              : ""}
          </ThemedText>
        </ThemedView>
        <ThemedView style={{ width: 100, backgroundColor: "lightpink" }}>
          <ThemedText
            style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}
          >
            {JSON.stringify(item.value)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );

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
          <ThemedText>Please connect the ESP32-WIOT2</ThemedText>
        )}

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
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  ctaText: {
    justifyContent: "center",
    alignItems: "center",
  },
});
