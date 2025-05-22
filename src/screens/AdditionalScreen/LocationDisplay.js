// LocationTrackingScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useAuth } from "../../contexts/AuthContext";
import API_BASE_URL from "../../config";
import { useSelector } from "react-redux";
import { makeApiRequest } from "../../utils/api-error-utils";

const LocationTrackingScreen = () => {
  const patientId = useSelector((state) => state.auth?.user?.patient);
  const { userToken } = useAuth();

  const [myLocation, setMyLocation] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get current user location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setMyLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error getting current location:", err);
      setError("Failed to get current location");
    }
  };

  // Fetch patient location from backend
  const fetchPatientLocation = async () => {
    if (!userToken || !patientId) return;

    try {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      };
      makeApiRequest(
        `${API_BASE_URL}/api/location/${patientId}`,
        options,
        (data) => {
          setPatientLocation(data);
          setLastUpdated(new Date().toISOString());
          setError(null);
        },
        (errorMessage) => {
          console.log(errorMessage);
          setError(errorMessage);
        }
      );
    } catch (err) {
      console.error("Error fetching patient location:", err);
      // setError("Failed to fetch patient location");
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    await Promise.all([getCurrentLocation(), fetchPatientLocation()]);
    setLoading(false);
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Open Google Maps with directions
  const openGoogleMaps = () => {
    if (!myLocation || !patientLocation) {
      Alert.alert("Error", "Location data not available");
      return;
    }

    const url = Platform.select({
      ios: `maps:0,0?q=${patientLocation.latitude},${patientLocation.longitude}`,
      android: `geo:0,0?q=${patientLocation.latitude},${patientLocation.longitude}`,
    });

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${myLocation.latitude},${myLocation.longitude}&destination=${patientLocation.latitude},${patientLocation.longitude}&travelmode=driving`;

    Linking.canOpenURL(directionsUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(directionsUrl);
        } else {
          Linking.openURL(url);
        }
      })
      .catch((err) => {
        console.error("Error opening maps:", err);
        Alert.alert("Error", "Could not open maps application");
      });
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      fetchPatientLocation();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [patientId, userToken]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading location data...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Location Tracking</Text>
          <Text style={styles.headerSubtitle}>
            Real-time location monitoring
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* My Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.cardTitle}>My Location</Text>
          </View>

          {myLocation ? (
            <View style={styles.locationInfo}>
              <View style={styles.coordinateRow}>
                <MaterialIcons name="my-location" size={16} color="#666" />
                <Text style={styles.coordinateText}>
                  {myLocation.latitude.toFixed(6)},{" "}
                  {myLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.timestampRow}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.timestampText}>
                  Updated: {formatTime(myLocation.timestamp)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>Location not available</Text>
          )}
        </View>

        {/* Patient Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.cardTitle}>Patient Location</Text>
          </View>

          {patientLocation ? (
            <View style={styles.locationInfo}>
              <View style={styles.coordinateRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.coordinateText}>
                  {patientLocation.latitude.toFixed(6)},{" "}
                  {patientLocation.longitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.timestampRow}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.timestampText}>
                  Updated: {formatTime(patientLocation.updatedAt)}
                </Text>
              </View>

              {/* Distance */}
              {myLocation && (
                <View style={styles.distanceRow}>
                  <MaterialIcons name="straighten" size={16} color="#4A90E2" />
                  <Text style={styles.distanceText}>
                    Distance:{" "}
                    {calculateDistance(
                      myLocation.latitude,
                      myLocation.longitude,
                      patientLocation.latitude,
                      patientLocation.longitude
                    )}{" "}
                    km
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noDataText}>
              Patient location not available
            </Text>
          )}
        </View>

        {/* Google Maps Button */}
        {myLocation && patientLocation && (
          <TouchableOpacity style={styles.mapsButton} onPress={openGoogleMaps}>
            <LinearGradient
              colors={["#4CAF50", "#45a049"]}
              style={styles.mapsButtonGradient}
            >
              <MaterialIcons name="directions" size={24} color="white" />
              <Text style={styles.mapsButtonText}>Get Directions</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Status Info */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="information-circle" size={20} color="#4A90E2" />
            <Text style={styles.statusTitle}>Status Information</Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Last Updated:</Text>
            <Text style={styles.statusValue}>{formatTime(lastUpdated)}</Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Auto Refresh:</Text>
            <Text style={styles.statusValue}>Every 30 seconds</Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Patient ID:</Text>
            <Text style={styles.statusValue}>{patientId || "N/A"}</Text>
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color="#4A90E2" />
          <Text style={styles.refreshButtonText}>Refresh Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    padding: 30,
    alignItems: "center",
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  errorText: {
    marginLeft: 10,
    color: "#FF6B6B",
    fontSize: 14,
    flex: 1,
  },
  locationCard: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  locationInfo: {
    marginTop: 10,
  },
  coordinateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  coordinateText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timestampText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#666",
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  distanceText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  mapsButton: {
    margin: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  mapsButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  mapsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statusCard: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    margin: 15,
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "600",
  },
});

export default LocationTrackingScreen;
