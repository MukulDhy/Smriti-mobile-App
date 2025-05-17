// RemindersScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import ReminderList from "../../components/Reminder/ReminderList";
import { useReminders } from "../../contexts/ReminderContext";

const FILTERS = {
  ALL: "All",
  SCHEDULED: "Scheduled",
  TRIGGERED: "Triggered",
  CANCELLED: "Cancelled",
};

const RemindersScreen = ({ navigation }) => {
  const { fetchReminders, isLoading } = useReminders();
  const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
  const [refreshing, setRefreshing] = useState(false);

  // Load reminders when screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      handleRefresh();
    });

    // Initial load
    handleRefresh();

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReminders();
    } catch (error) {
      console.error("Failed to refresh reminders:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchReminders]);

  return (
    <View style={styles.container}>
      {/* Filter Header - Separate ScrollView for horizontal scrolling */}
      <View style={styles.filterHeader}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {Object.values(FILTERS).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content - ReminderList */}
      <ReminderList
        filter={activeFilter}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  filterHeader: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  activeFilterButton: {
    backgroundColor: "#6200ee",
  },
  filterText: {
    color: "#333",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "white",
  },
});

export default RemindersScreen;
