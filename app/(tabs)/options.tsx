import { StyleSheet, TouchableOpacity } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";

import { ExternalLink } from "@/components/ExternalLink";

export default function OptionsScreen() {
  const router = useRouter();

  const logoutBtn = async () => {
    router.push("/sign-in");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Options</ThemedText>
      </ThemedView>
      <TouchableOpacity onPress={logoutBtn} style={styles.ctaButton}>
        <ThemedText style={styles.ctaButtonText}>Log Out</ThemedText>
      </TouchableOpacity>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Credits</ThemedText>
      </ThemedView>
      <ThemedView>
        <ThemedText type="subtitle">
          Dashboard Photo by{" "}
          <ExternalLink href="https://www.pexels.com/photo/water-ripple-371717/">
            Pixabay from Pexels
          </ExternalLink>
        </ThemedText>
      </ThemedView>
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
    width: "100%",
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
});
