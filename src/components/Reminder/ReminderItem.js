// ReminderItem.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useReminders } from "../../contexts/ReminderContext";
import { format } from "date-fns";

const STATUS_COLORS = {
  scheduled: "#4CAF50",
  triggered: "#2196F3",
  cancelled: "#F44336",
};

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
    <View
      style={[
        styles.container,
        { borderLeftWidth: 4, borderLeftColor: STATUS_COLORS[reminder.status] },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{reminder.title}</Text>
        <Text style={styles.time}>
          {format(new Date(reminder.scheduledTime), "PPpp")}
        </Text>
        {reminder.description && (
          <Text style={styles.description}>{reminder.description}</Text>
        )}
        <View style={styles.statusContainer}>
          <Text
            style={[styles.status, { color: STATUS_COLORS[reminder.status] }]}
          >
            {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
          </Text>
        </View>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  time: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    lineHeight: 20,
  },
  statusContainer: {
    marginTop: 4,
  },
  status: {
    fontSize: 13,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
});

export default ReminderItem;
