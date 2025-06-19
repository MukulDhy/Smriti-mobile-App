import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Accelerometer, Gyroscope, LightSensor } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";

const { width: screenWidth } = Dimensions.get("window");

const PatientMonitoringDashboard = () => {
  // Sensor states
  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  const [lightSensorData, setLightSensorData] = useState({ illuminance: 0 });

  // Dashboard states
  const [fallStatus, setFallStatus] = useState("safe");
  const [movementLevel, setMovementLevel] = useState("moderate");
  const [sleepData, setSleepData] = useState({ hours: 7.5, quality: "good" });
  const [moodStatus, setMoodStatus] = useState("neutral");
  const [reminders, setReminders] = useState([
    { id: 1, task: "Morning Medication", completed: true },
    { id: 2, task: "Breakfast", completed: true },
    { id: 3, task: "Afternoon Medication", completed: false },
    { id: 4, task: "Evening Walk", completed: false },
  ]);

  // Historical data for charts
  const [movementHistory, setMovementHistory] = useState([
    65, 59, 80, 81, 56, 55, 70,
  ]);
  const [sleepHistory, setSleepHistory] = useState([
    7.2, 6.8, 8.1, 7.5, 6.5, 7.8, 8.0,
  ]);
  const [touchInteractions, setTouchInteractions] = useState(0);

  // Data persistence keys
  const STORAGE_KEYS = {
    MOVEMENT_HISTORY: "movement_history",
    SLEEP_HISTORY: "sleep_history",
    REMINDERS: "reminders",
    MOOD_STATUS: "mood_status",
  };

  // Initialize sensors and load data
  useEffect(() => {
    initializeSensors();
    loadStoredData();

    return () => {
      // Clean up sensor subscriptions
      Accelerometer.removeAllListeners();
      Gyroscope.removeAllListeners();
      LightSensor.removeAllListeners();
    };
  }, []);

  const initializeSensors = () => {
    // Accelerometer for movement tracking
    Accelerometer.setUpdateInterval(1000);
    Accelerometer.addListener((accelerometerData) => {
      setAccelerometerData(accelerometerData);
      analyzeMovement(accelerometerData);
    });

    // Gyroscope for fall detection
    Gyroscope.setUpdateInterval(500);
    Gyroscope.addListener((gyroscopeData) => {
      setGyroscopeData(gyroscopeData);
      detectFall(gyroscopeData);
    });

    // Light sensor for sleep inference
    LightSensor.setUpdateInterval(5000);
    LightSensor.addListener((lightData) => {
      setLightSensorData(lightData);
      analyzeSleep(lightData);
    });
  };

  const loadStoredData = async () => {
    try {
      const storedMovement = await AsyncStorage.getItem(
        STORAGE_KEYS.MOVEMENT_HISTORY
      );
      const storedSleep = await AsyncStorage.getItem(
        STORAGE_KEYS.SLEEP_HISTORY
      );
      const storedReminders = await AsyncStorage.getItem(
        STORAGE_KEYS.REMINDERS
      );
      const storedMood = await AsyncStorage.getItem(STORAGE_KEYS.MOOD_STATUS);

      if (storedMovement) setMovementHistory(JSON.parse(storedMovement));
      if (storedSleep) setSleepHistory(JSON.parse(storedSleep));
      if (storedReminders) setReminders(JSON.parse(storedReminders));
      if (storedMood) setMoodStatus(storedMood);
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };

  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const analyzeMovement = (data) => {
    const magnitude = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );

    if (magnitude > 1.5) {
      setMovementLevel("active");
    } else if (magnitude > 1.0) {
      setMovementLevel("moderate");
    } else {
      setMovementLevel("low");
    }

    // Update movement history periodically
    const currentHour = new Date().getHours();
    if (currentHour % 3 === 0) {
      // Update every 3 hours
      const newHistory = [
        ...movementHistory.slice(1),
        Math.floor(magnitude * 50),
      ];
      setMovementHistory(newHistory);
      saveData(STORAGE_KEYS.MOVEMENT_HISTORY, newHistory);
    }
  };

  const detectFall = (data) => {
    const rotationMagnitude = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );

    // Simple fall detection logic - rapid rotation change
    if (rotationMagnitude > 2.5) {
      setFallStatus("fall_detected");
      Alert.alert("Fall Detected", "Sudden movement detected. Are you okay?");

      // Reset fall status after 30 seconds
      setTimeout(() => setFallStatus("safe"), 30000);
    } else {
      setFallStatus("safe");
    }
  };

  const analyzeSleep = (lightData) => {
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 22 || currentHour <= 6;
    const isDark = lightData.illuminance < 10;

    if (isNightTime && isDark) {
      // Simulate sleep quality based on movement + light
      const quality = Math.random() > 0.3 ? "good" : "interrupted";
      const hours = 6.5 + Math.random() * 2; // 6.5-8.5 hours

      setSleepData({ hours: parseFloat(hours.toFixed(1)), quality });

      // Update sleep history
      const newSleepHistory = [...sleepHistory.slice(1), hours];
      setSleepHistory(newSleepHistory);
      saveData(STORAGE_KEYS.SLEEP_HISTORY, newSleepHistory);
    }
  };

  const toggleReminder = (id) => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === id
        ? { ...reminder, completed: !reminder.completed }
        : reminder
    );
    setReminders(updatedReminders);
    saveData(STORAGE_KEYS.REMINDERS, updatedReminders);
    setTouchInteractions((prev) => prev + 1);
  };

  const updateMood = (mood) => {
    setMoodStatus(mood);
    saveData(STORAGE_KEYS.MOOD_STATUS, mood);
    setTouchInteractions((prev) => prev + 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "safe":
        return "#4CAF50";
      case "fall_detected":
        return "#F44336";
      case "active":
        return "#2196F3";
      case "moderate":
        return "#FF9800";
      case "low":
        return "#9E9E9E";
      case "good":
        return "#4CAF50";
      case "interrupted":
        return "#FF5722";
      case "happy":
        return "#4CAF50";
      case "neutral":
        return "#FF9800";
      case "sad":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Fall Detection Card */}
      <View
        style={[styles.card, { borderLeftColor: getStatusColor(fallStatus) }]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Fall Detection</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(fallStatus) },
            ]}
          >
            <Text style={styles.statusText}>
              {fallStatus === "safe" ? "✓ Safe" : "⚠ Fall Detected"}
            </Text>
          </View>
        </View>
        <Text style={styles.cardSubtext}>
          Gyroscope monitoring: {gyroscopeData.x.toFixed(2)},{" "}
          {gyroscopeData.y.toFixed(2)}, {gyroscopeData.z.toFixed(2)}
        </Text>
      </View>

      {/* Movement Summary */}
      <View
        style={[
          styles.card,
          { borderLeftColor: getStatusColor(movementLevel) },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Movement Activity</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(movementLevel) },
            ]}
          >
            <Text style={styles.statusText}>{movementLevel.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.cardSubtext}>
          Accelerometer: {accelerometerData.x.toFixed(2)},{" "}
          {accelerometerData.y.toFixed(2)}, {accelerometerData.z.toFixed(2)}
        </Text>
        <LineChart
          data={{
            labels: ["6h", "12h", "18h", "24h", "30h", "36h", "Now"],
            datasets: [{ data: movementHistory }],
          }}
          width={screenWidth - 60}
          height={120}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Sleep Tracker */}
      <View
        style={[
          styles.card,
          { borderLeftColor: getStatusColor(sleepData.quality) },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Sleep Tracking</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(sleepData.quality) },
            ]}
          >
            <Text style={styles.statusText}>{sleepData.hours}h</Text>
          </View>
        </View>
        <Text style={styles.cardSubtext}>
          Quality: {sleepData.quality} • Light:{" "}
          {lightSensorData.illuminance.toFixed(1)} lux
        </Text>
        <LineChart
          data={{
            labels: ["6d", "5d", "4d", "3d", "2d", "1d", "Today"],
            datasets: [{ data: sleepHistory }],
          }}
          width={screenWidth - 60}
          height={120}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Mood Tracker */}
      <View
        style={[styles.card, { borderLeftColor: getStatusColor(moodStatus) }]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Mood Check-in</Text>
          <Text style={styles.touchCounter}>
            Interactions: {touchInteractions}
          </Text>
        </View>
        <View style={styles.moodContainer}>
          {["happy", "neutral", "sad"].map((mood) => (
            <View
              key={mood}
              style={[
                styles.moodButton,
                {
                  backgroundColor:
                    moodStatus === mood ? getStatusColor(mood) : "#f0f0f0",
                },
              ]}
              onTouchEnd={() => updateMood(mood)}
            >
              <Text style={styles.moodEmoji}>
                {mood === "happy" ? "😊" : mood === "neutral" ? "😐" : "😢"}
              </Text>
              <Text
                style={[
                  styles.moodText,
                  { color: moodStatus === mood ? "white" : "#666" },
                ]}
              >
                {mood}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Reminder Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Reminders</Text>
        {reminders.map((reminder) => (
          <View
            key={reminder.id}
            style={styles.reminderItem}
            onTouchEnd={() => toggleReminder(reminder.id)}
          >
            <Text style={styles.reminderIcon}>
              {reminder.completed ? "✅" : "❌"}
            </Text>
            <Text
              style={[
                styles.reminderText,
                {
                  textDecorationLine: reminder.completed
                    ? "line-through"
                    : "none",
                },
              ]}
            >
              {reminder.task}
            </Text>
          </View>
        ))}
      </View>

      {/* AI Insights */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Behavior Insights</Text>
        <View style={styles.insightItem}>
          <View style={[styles.insightBadge, { backgroundColor: "#FF9800" }]}>
            <Text style={styles.insightBadgeText}>Sleep</Text>
          </View>
          <Text style={styles.insightText}>
            Sleep duration is 15% lower than your 7-day average
          </Text>
        </View>
        <View style={styles.insightItem}>
          <View style={[styles.insightBadge, { backgroundColor: "#2196F3" }]}>
            <Text style={styles.insightBadgeText}>Activity</Text>
          </View>
          <Text style={styles.insightText}>
            Movement has been consistent for the past 3 days
          </Text>
        </View>
        <View style={styles.insightItem}>
          <View style={[styles.insightBadge, { backgroundColor: "#4CAF50" }]}>
            <Text style={styles.insightBadgeText}>Routine</Text>
          </View>
          <Text style={styles.insightText}>
            Medication reminders completed on time this week
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardSubtext: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  touchCounter: {
    fontSize: 12,
    color: "#666",
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  moodButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    minWidth: 70,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  reminderIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  reminderText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  insightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 60,
    alignItems: "center",
  },
  insightBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  insightText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default PatientMonitoringDashboard;
