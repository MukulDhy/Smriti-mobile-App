import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const API_BASE_URL = "https://mindapp-simulation.onrender.com";

const SensorScreen = () => {
  const { t } = useTranslation();

  const [sensorData, setSensorData] = useState({
    heartRate: "--",
    spO2: "--",
    gyroscope: { x: "--", y: "--", z: "--" },
    accelerometer: { x: "--", y: "--", z: "--" },
    temperature: "--",
    bloodPressure: { systolic: "--", diastolic: "--" },
    steps: "--",
    respirationRate: "--",
    posture: "--",
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const endpoints = {
        heartRate: "/health/heart",
        gyroscope: "/sensor/gyroscope",
        accelerometer: "/sensor/accelerometer",
        temperature: "/health/temperature",
        bloodPressure: "/health/blood_pressure",
        steps: "/activity/steps",
        respirationRate: "/health/respiration",
        posture: "/sensor/posture",
      };

      const fetchPromises = Object.entries(endpoints).map(
        async ([key, endpoint]) => {
          const response = await fetch(`${API_BASE_URL}${endpoint}`);
          const data = await response.json();
          return { key, data };
        }
      );

      const results = await Promise.all(fetchPromises);

      setSensorData((prevData) =>
        results.reduce(
          (acc, item) => ({
            ...acc,
            [item.key]: item.data,
          }),
          prevData
        )
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleStartRefresh = () => {
    if (!isRefreshing) {
      setIsRefreshing(true);
      fetchData();
      const interval = setInterval(fetchData, 2000);
      setTimeout(() => {
        clearInterval(interval);
        setIsRefreshing(false);
      }, 20000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("sensorTitle")}</Text>

      <TouchableOpacity
        style={[styles.button, isRefreshing && styles.buttonDisabled]}
        onPress={handleStartRefresh}
        disabled={isRefreshing}
      >
        <Text style={styles.buttonText}>
          {" "}
          {isRefreshing ? t("sensorRefresh") : t("sensorStartLive")}
        </Text>
        {isRefreshing && (
          <ActivityIndicator size="small" color="#FFF" style={styles.loader} />
        )}
      </TouchableOpacity>

      <ScrollView
        style={styles.dataContainer}
        showsVerticalScrollIndicator={false}
      >
        <DataItem
          icon="heart-pulse"
          color="#FF6B6B"
          title={t("heartRate")}
          value={`${sensorData.heartRate?.heart_rate || "--"} BPM`}
        />
        <DataItem
          icon="oxygen-tank"
          color="#60A5FA"
          title={t("spO2")}
          value={`${sensorData.heartRate?.sp_o2 || "--"}%`}
        />
        <DataItem
          icon="axis-arrow"
          color="#34D399"
          title={t("gyroscope")}
          value={`X: ${sensorData.gyroscope.x}, Y: ${sensorData.gyroscope.y}, Z: ${sensorData.gyroscope.z}`}
        />
        <DataItem
          icon="axis-arrow"
          color="#FBBF24"
          title={t("accelerometer")}
          value={`X: ${sensorData.accelerometer.x}, Y: ${sensorData.accelerometer.y}, Z: ${sensorData.accelerometer.z}`}
        />
        <DataItem
          icon="thermometer"
          color="#FB923C"
          title={t("temperature")}
          value={`${sensorData.temperature?.temperature || "--"}°C`}
        />
        <DataItem
          icon="blood-bag"
          color="#EF4444"
          title={t("bloodPressure")}
          value={`${sensorData.bloodPressure.systolic}/${sensorData.bloodPressure.diastolic} mmHg`}
        />
        <DataItem
          icon="lungs"
          color="#10B981"
          title={t("respirationRate")}
          value={`${
            sensorData.respirationRate?.respiration_rate || "--"
          } breaths/min`}
        />
      </ScrollView>
    </View>
  );
};

// Enhanced Card Component
const DataItem = ({ title, value, icon, color }) => (
  <View style={[styles.dataCard, { borderLeftColor: color }]}>
    <View style={styles.dataHeader}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
      <Text style={styles.dataTitle}>{title}</Text>
    </View>
    <Text style={[styles.dataText, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#1E3A8A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#A5B4FC",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    marginLeft: 10,
  },
  dataContainer: {
    flexGrow: 1,
  },
  dataCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "column",
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  dataHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginLeft: 8,
  },
  dataText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
});

export default SensorScreen;
