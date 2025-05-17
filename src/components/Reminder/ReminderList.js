// ReminderList.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import ReminderItem from "./ReminderItem";
import { useReminders } from "../../contexts/ReminderContext";

const ReminderList = ({ filter, refreshing, onRefresh }) => {
  const { reminders, isLoading, error } = useReminders();

  // Filter reminders based on active filter
  const filteredReminders = React.useMemo(() => {
    if (!reminders) return [];

    let filtered = [...reminders];

    // Sort by most recent first
    filtered.sort(
      (a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime)
    );

    // Apply status filter
    if (filter === "Scheduled") {
      return filtered.filter((r) => r.status === "scheduled");
    } else if (filter === "Triggered") {
      return filtered.filter((r) => r.status === "triggered");
    } else if (filter === "Cancelled") {
      return filtered.filter((r) => r.status === "cancelled");
    }
    return filtered;
  }, [reminders, filter]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredReminders}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <ReminderItem reminder={item} />}
      contentContainerStyle={styles.list}
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No {filter.toLowerCase()} reminders found
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
});

export default ReminderList;
