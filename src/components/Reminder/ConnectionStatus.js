import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ConnectionStatus = ({ isConnected }) => {
  return (
    <View
      style={[
        styles.container,
        isConnected ? styles.connected : styles.disconnected,
      ]}
    >
      <Text style={styles.text}>
        {isConnected ? "Connected" : "Disconnected"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  connected: {
    backgroundColor: "#4CAF50",
  },
  disconnected: {
    backgroundColor: "#F44336",
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ConnectionStatus;
