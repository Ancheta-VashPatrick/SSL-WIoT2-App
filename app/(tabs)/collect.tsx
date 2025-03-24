import {
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  FlatList,
  useColorScheme,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useEffect, useState } from "react";
// import useBLE from "@/hooks/useBLE";

import useRequests from "@/hooks/useRequests";

import { addLog, clearLog } from "@/store/reducers";
import { useDispatch, useSelector } from "react-redux";
import { store } from "@/store/store";

import { oppCollect, scanForDevices } from "@/app/_layout";

export default function CollectScreen() {
  if (Platform.OS == "android" || Platform.OS == "ios") {
    const { uploadData } = useRequests();

    useEffect(() => {
      scanForDevices();
    }, []);

    const devicesData = store.getState().devicesData;

    const uploadDataBtn = async () => {
      let currentUploadData = store.getState().uploadData;
      if (currentUploadData.items.length) {
        uploadData();
      } else {
        dispatch(
          addLog({
            message: `No data to upload.`,
          })
        );
      }
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

    const widthDivisions = logData.items.length ? 3 : 2;
    const widthPortion = (logData.items.length ? 95 : 97) / widthDivisions;

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
        <ThemedView style={{ flex: 13 }}>
          <ThemedText style={{ fontSize: 16, textAlign: "left" }}>
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
        marginHorizontal: 5,
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

        <ThemedText>
          {devicesData.items.length
            ? "There are nodes detected nearby."
            : "No nodes are nearby."}
        </ThemedText>

        <ThemedView style={styles.ctaButtonContainer}>
          <TouchableOpacity onPress={oppCollect} style={styles.ctaButton}>
            <ThemedText style={styles.ctaButtonText}>Collect</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={uploadDataBtn} style={styles.ctaButton}>
            <ThemedText style={styles.ctaButtonText}>Upload</ThemedText>
          </TouchableOpacity>

          {logData.items.length ? (
            <TouchableOpacity onPress={clearTheLog} style={styles.ctaButton}>
              <ThemedText style={styles.ctaButtonText}>Clear Log</ThemedText>
            </TouchableOpacity>
          ) : (
            <></>
          )}
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
      </ParallaxScrollView>
    );
  } else {
    return <></>;
  }
}
