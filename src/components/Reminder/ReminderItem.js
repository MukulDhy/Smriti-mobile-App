import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useReminders } from "../../contexts/ReminderContext";
import { format } from "date-fns";

const ReminderItem = ({ reminder }) => {
  const { cancelReminder } = useReminders();

  const handleCancel = async () => {
    try {
      await cancelReminder(reminder._id);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{reminder.title}</Text>
        <Text style={styles.time}>
          {format(new Date(reminder.scheduledTime), "PPpp")}
        </Text>
        {reminder.description && (
          <Text style={styles.description}>{reminder.description}</Text>
        )}
        <Text style={styles.status}>Status: {reminder.status}</Text>
      </View>

      {reminder.status === "scheduled" && (
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: "#888",
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ReminderItem;
