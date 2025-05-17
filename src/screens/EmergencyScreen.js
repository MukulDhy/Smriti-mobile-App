import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Audio } from "expo-av";

export default function EmergencyScreen({ route }) {
  const { alertData } = route.params;
  const [sound, setSound] = React.useState();

  async function playAlarm() {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/siren.mp3"),
      { shouldPlay: true, isLooping: true }
    );
    setSound(sound);
  }

  useEffect(() => {
    playAlarm();
    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{alertData.title}</Text>
      <Text style={styles.message}>{alertData.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFEBEE", // Light red background
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "red",
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  details: {
    fontSize: 16,
    color: "gray",
  },
});
