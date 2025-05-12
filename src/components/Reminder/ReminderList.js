import React from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import ReminderItem from "./ReminderItem";
import { useReminders } from "../../contexts/ReminderContext";

const ReminderList = () => {
  const { reminders, isLoading, error } = useReminders();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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
      data={reminders}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <ReminderItem reminder={item} />}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text>No reminders scheduled</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
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
});

export default ReminderList;
