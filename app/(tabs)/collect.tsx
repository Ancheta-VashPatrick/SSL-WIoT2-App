import { StyleSheet, Image, Platform, TouchableOpacity, FlatList } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useState } from "react";
import DeviceModal from "@/components/DeviceConnectionModal";
import useBLE from "@/app/useBLE";

export default function CollectScreen() {
  const {
    allDevices,
    connectedDevice,
    connectToDevice,
    scanForPeripherals,
    color,
    tempVals,
    requestPermissions,
    toggleLED,
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

  const item = ({ item }) => (
    <ThemedView style={{ flexDirection: "row" }}>
      <ThemedView style={{ width: 200, backgroundColor: "lightyellow" }}>
        <ThemedText style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}>
          {JSON.stringify(item.timestamp)}
          {/* item ? {item.timestamp.getFullYear()}-{item.timestamp.getMonth()}-{item.timestamp.getDate()} {item.timestamp.getHours()}:{item.timestamp.getMinutes()} : "" */}
        </ThemedText>
      </ThemedView>
      <ThemedView style={{ width: 100, backgroundColor: "lightpink" }}>
        <ThemedText style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}>
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
            <ThemedText
              style={{ backgroundColor: color }}
            >
              Connected
            </ThemedText>
            <ThemedView
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FlatList
                data={tempVals}
                renderItem={item}
                scrollEnabled={false}
              />
            </ThemedView>
            {`\n${JSON.stringify(tempVals)}`}
          </>
        ) : (
          <ThemedText>
            Please connect the ESP32-WIOT2
          </ThemedText>
        )}

      <TouchableOpacity onPress={openModal} style={styles.ctaButton}>
        <ThemedText style={styles.ctaButtonText}>Connect</ThemedText>
      </TouchableOpacity>

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </ParallaxScrollView>
  );
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
});
