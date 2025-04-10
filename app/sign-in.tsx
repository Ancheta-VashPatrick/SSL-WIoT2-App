import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import useRequests from "@/hooks/useRequests";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { logout } from "@/store/reducers";
import { isRegistered, unregisterBackgroundFetchAsync } from "./_layout";

export default function LoginScreen() {
  const dispatch = useDispatch();
  useEffect(() => {
    const unregisterIfNeeded = async () => {
      if (Platform.OS == "android" || Platform.OS == "ios") {
        if (await isRegistered()) {
          unregisterBackgroundFetchAsync().then(() =>
            console.log("Background fetch unregistered.")
          );
        }
      }
    };
    unregisterIfNeeded();
    dispatch(logout());
  }, []);

  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const loginBtn = () => {
    const { loginUser } = useRequests();
    loginUser({ username, password }).then((value) => {
      if (value) {
        setUsername("");
        setPassword("");

        router.push("/");
      } else {
        setIsInvalid(true);
      }
    });
  };

  const { width: windowWidth } = useWindowDimensions();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      gap: 10,
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
    },
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      backgroundColor: "white",
      width: Math.min(windowWidth * 0.3, 250),
    },
    ctaButton: {
      backgroundColor: "#FF6060",
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 5,
      marginBottom: 5,
      borderRadius: 8,
      padding: 10,
    },
    ctaButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
    },
  });

  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Please log in.</ThemedText>
        <TextInput
          style={styles.input}
          onChangeText={setUsername}
          placeholder="Username"
          value={username}
          onSubmitEditing={loginBtn}
        />
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          placeholder="Password"
          value={password}
          onSubmitEditing={loginBtn}
          secureTextEntry
        />
        <TouchableOpacity onPress={loginBtn} style={styles.ctaButton}>
          <ThemedText style={styles.ctaButtonText}>Log In</ThemedText>
        </TouchableOpacity>
        {isInvalid ? (
          <ThemedText type="subtitle">
            Invalid login, please try again.
          </ThemedText>
        ) : (
          <></>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
