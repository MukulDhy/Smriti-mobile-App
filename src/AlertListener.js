import React, { useEffect, useState } from "react";
import { Vibration, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import io from "socket.io-client";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import API_BASE_URL from "./config";

// Configure notifications (outside component)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function AlertListener({ children }) {
  const navigation = useNavigation();
  const [sound, setSound] = useState();

  async function playAlarm() {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/siren.mp3"),
      { shouldPlay: true, isLooping: true }
    );
    setSound(sound);
  }

  async function stopAlarm() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  }

  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      await Notifications.requestPermissionsAsync();
    };
    requestPermissions();

    // Setup socket connection
    const socket = io(API_BASE_URL);

    socket.on("emergency", async (data) => {
      // 1. Vibrate
      Vibration.vibrate([1000, 1000], true);

      // 2. Play alarm sound
      await playAlarm();

      // 3. Show system notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.message,
          sound: "default", // Uses system default
          data: { ...data },
        },
        trigger: null,
      });

      // 4. Show in-app alert
      Alert.alert(
        data.title,
        data.message,
        [
          {
            text: "Cancel",
            onPress: async () => {
              Vibration.cancel();
              await stopAlarm();
            },
            style: "cancel",
          },
          {
            text: "Got It",
            onPress: async () => {
              Vibration.cancel();
              await stopAlarm();
              navigation.navigate("EmergencyScreen", { alertData: data });
            },
          },
        ],
        { cancelable: false }
      );
    });

    return () => {
      socket.disconnect();
      Vibration.cancel();
      stopAlarm();
    };
  }, []);

  return <>{children}</>;
}
