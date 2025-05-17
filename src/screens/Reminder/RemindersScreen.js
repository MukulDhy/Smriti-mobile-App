// RemindersScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import ReminderList from "../../components/Reminder/ReminderList";
import { useWebSocket } from "../../contexts/WebSocketContext";
import ConnectionStatus from "../../components/Reminder/ConnectionStatus";

const FILTERS = {
  ALL: "All",
  SCHEDULED: "Scheduled",
  TRIGGERED: "Triggered",
  CANCELLED: "Cancelled",
};

const RemindersScreen = ({ navigation }) => {
  const { isConnected } = useWebSocket();
  const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);

  return (
    <View style={styles.container}>
      {/* <ConnectionStatus isConnected={isConnected} /> */}

      {/* Filter Header */}
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

      {/* Main Content - ReminderList */}
      <View style={styles.listContainer}>
        <ReminderList filter={activeFilter} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
  listContainer: {
    flex: 1,
  },
});

export default RemindersScreen;
