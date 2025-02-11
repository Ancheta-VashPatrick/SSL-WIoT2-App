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
import useBLE from "@/hooks/useBLE";

import Aes from "react-native-aes-crypto";
import useRequests from "@/hooks/useRequests";

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

  const { uploadData } = useRequests();

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

  const [decryptedText, setDecryptedText] = useState("second");

  useEffect(() => {
    const decryptData = async () => {
      // const val = await Aes.decrypt("9ETXXL2ldN7YrJuUUgSIKg==", "5169702A48227366786F232B655A7337", "F%&bH[g9u26'CxE1", 'aes-128-cbc');
      const val = await Aes.decrypt(
        "9ETXXL2ldN7YrJuUUgSIKtB6wSjqrmFb8aIp6vkvI1s=",
        "5169702A48227366786F232B655A7337",
        "46252662485B67397532362743784531",
        "aes-128-cbc"
      );
      setDecryptedText(val);

      //   const generateKey = (password, salt, cost, length) => Aes.pbkdf2(password, salt, cost, length, 'sha256')

      //   const encryptData = (text, key, iv) => {
      //       return Aes.encrypt(text, key, iv, 'aes-128-cbc').then(cipher => ({
      //           cipher,
      //           iv,
      //       }))
      //   }

      //   const decryptData = (encryptedData, key) => Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-128-cbc')

      //   try {
      //           console.log('Key:', "5169702A48227366786F232B655A7337")
      //           encryptData('getInitialTime00', "5169702A48227366786F232B655A7337", "46252662485B67397532362743784531")
      //               .then(({ cipher, iv }) => {
      //                   console.log('Encrypted:', cipher)
      //                   console.log('IV:', iv)

      //                   decryptData({ cipher, iv }, "5169702A48227366786F232B655A7337")
      //                       .then(text => {
      //                           console.log('Decrypted:', text)
      //                       })
      //                       .catch(error => {
      //                           console.log(error)
      //                       })

      //                   Aes.hmac256(cipher, "5169702A48227366786F232B655A7337").then(hash => {
      //                       console.log('HMAC', hash)
      //                   })
      //               })
      //               .catch(error => {
      //                   console.log(error)
      //               })
      //   } catch (e) {
      //       console.error(e)
      //   }
    };

    decryptData().catch(console.error);
  }, []);

  const item = ({ item }) => (
    <ThemedView style={{ flexDirection: "row" }}>
      <ThemedView style={{ width: 200, backgroundColor: "lightyellow" }}>
        <ThemedText
          style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}
        >
          {/* {JSON.stringify(item.date)} */}
          {item
            ? `${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()} ${item.date.getHours()}:${item.date.getMinutes()}`
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
          <ThemedText style={{ backgroundColor: color }}>Connected</ThemedText>
          <ThemedView
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FlatList data={tempVals} renderItem={item} scrollEnabled={false} />
          </ThemedView>
          <ThemedText>{/* {`\n${tempVals[0].date}`} */}</ThemedText>
        </>
      ) : (
        <ThemedText>Please connect the ESP32-WIOT2</ThemedText>
      )}

      <TouchableOpacity onPress={openModal} style={styles.ctaButton}>
        <ThemedText style={styles.ctaButtonText}>Connect</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={uploadData} style={styles.ctaButton}>
        <ThemedText style={styles.ctaButtonText}>Upload</ThemedText>
      </TouchableOpacity>

      <ThemedText>{decryptedText}</ThemedText>

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
