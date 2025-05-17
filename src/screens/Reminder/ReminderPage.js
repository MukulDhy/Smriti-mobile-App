import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useReminders } from "../../contexts/ReminderContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import ConnectionStatus from "../../components/Reminder/ConnectionStatus";

const ReminderPage = () => {
  const { reminders } = useReminders();
  const { isConnected } = useWebSocket();

  console.log(reminders);

  const upcomingReminders = reminders
    .filter((r) => new Date(r.scheduledTime) > new Date())
    .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <ConnectionStatus isConnected={isConnected} />

      <Text style={styles.title}>Upcoming Reminders</Text>

      {upcomingReminders.length > 0 ? (
        upcomingReminders.map((reminder) => (
          <View key={reminder._id} style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <Text>{new Date(reminder.scheduledTime).toLocaleString()}</Text>
          </View>
        ))
      ) : (
        <Text>No upcoming reminders</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  reminderCard: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reminderTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});

export default ReminderPage;
