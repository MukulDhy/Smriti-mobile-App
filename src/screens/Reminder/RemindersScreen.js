import React from "react";
import { View, StyleSheet } from "react-native";
import ReminderList from "../../components/Reminder/ReminderList";
import { useWebSocket } from "../../contexts/WebSocketContext";
import ConnectionStatus from "../../components/Reminder/ConnectionStatus";

const RemindersScreen = ({ navigation }) => {
  const { isConnected } = useWebSocket();
  console.log(isConnected)
  return (
    <View style={styles.container}>
      <ConnectionStatus isConnected={isConnected} />
      <ReminderList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RemindersScreen;
