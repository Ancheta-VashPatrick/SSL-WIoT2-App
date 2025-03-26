import { useSelector } from "react-redux";
import { Redirect, Slot, Stack } from "expo-router";

export default function MainScreen() {
  const notExpired = useSelector((state) => {
    return new Date().getTime() < new Date(state.userData.exp).getTime();
  });

  if (!notExpired) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}
