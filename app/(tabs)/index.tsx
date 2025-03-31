import { Image, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useSelector } from "react-redux";

import { useGetDataByNodeIdQuery } from "@/services/server";

import { ConsumerView } from "@/components/ConsumerView";
import { ConcessionaireView } from "@/components/ConcessionaireView";
import { RegulatorView } from "@/components/RegulatorView";
// import { setType } from "@/store/reducers";

export default function DashboardScreen() {
  const headings = useSelector((state) =>
    (state.userData.nodes ?? []).map((node) => node.nodeId)
  );

  const role = useSelector((state) => state.userData.role);

  headings.forEach((item) => {
    const { data, error, isLoading } = useGetDataByNodeIdQuery(item, {
      pollingInterval: 5000,
      skipPollingIfUnfocused: true,
    });

    // console.log(JSON.stringify({ data, error, isLoading }));
    // console.log(item);
  });

  return (
    <GestureHandlerRootView>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/pexels-pixabay-371717.jpg")}
            style={styles.headerImage}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Dashboard</ThemedText>
        </ThemedView>

        {role == "concessionaire" ? (
          <ConcessionaireView />
        ) : role == "regulator" ? (
          <RegulatorView />
        ) : (
          <ConsumerView />
        )}
        {/* <ThemedText>
          {error ? (
            <>{JSON.stringify(error)}</>
          ) : isLoading ? (
            <>Loading...</>
          ) : data ? (
            <>{JSON.stringify(data)}</>
          ) : null}
        </ThemedText> */}
      </ParallaxScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerImage: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  graph: {
    alignSelf: "center",
    width: "100%",
    aspectRatio: 1.4,
    marginVertical: 20,
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
