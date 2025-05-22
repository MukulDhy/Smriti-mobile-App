import { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import axios from "axios";
import { useAuth } from "./AuthContext";
import API_BASE_URL from "../config";

const API_URL = `${API_BASE_URL}/api/locations`;
const LOCATION_TASK_NAME = "background-location-task";

// Store for accessing auth data in background task
let authData = { user: null, userToken: null };

// Define the background task only once
if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
  TaskManager.defineTask(
    LOCATION_TASK_NAME,
    async ({ data: { locations }, error }) => {
      if (error) {
        console.error("Background location error:", error);
        return;
      }

      if (!locations || locations.length === 0) {
        console.warn("No location data received");
        return;
      }

      try {
        const response = await axios.post(
          API_URL,
          {
            user: authData.user,
            latitude: locations[0].coords.latitude,
            longitude: locations[0].coords.longitude,
            updatedAt: new Date().toISOString(),
          },
          {
            headers: {
              Authorization: `Bearer ${authData.userToken}`,
            },
          }
        );
        console.log("Location updated successfully");
      } catch (err) {
        console.error("Background update failed:", err);
      }
    }
  );
}

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const { user, userToken } = useAuth();
  console.log("user = = =", user);
  console.log("userToken = = =", userToken);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  // Update auth data for background task
  useEffect(() => {
    authData = { user, userToken };
  }, [user, userToken]);

  // Check if task is currently registered
  const checkTaskStatus = async () => {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        LOCATION_TASK_NAME
      );
      setIsTracking(isRegistered);
      return isRegistered;
    } catch (error) {
      console.error("Error checking task status:", error);
      return false;
    }
  };

  // Request permissions
  const requestPermissions = async () => {
    try {
      // Request foreground permission first
      const foregroundStatus =
        await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus.status !== "granted") {
        console.warn("Foreground location permission denied");
        return false;
      }

      // Request background permission
      const backgroundStatus =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== "granted") {
        console.warn("Background location permission denied");
        return false;
      }

      setHasPermissions(true);
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  const startTracking = async () => {
    try {
      // Check if already tracking
      const isAlreadyTracking = await checkTaskStatus();
      if (isAlreadyTracking) {
        console.log("Location tracking already active");
        return;
      }

      // Request permissions if not already granted
      if (!hasPermissions) {
        const permissionsGranted = await requestPermissions();
        if (!permissionsGranted) {
          console.error("Cannot start tracking without permissions");
          return;
        }
      }

      // Check if user is authenticated
      if (!user || !userToken) {
        console.error("Cannot start tracking without authentication");
        return;
      }

      // Start location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000, // Update every 5 seconds (adjust as needed)
        distanceInterval: 10, // Update when moved 10 meters (adjust as needed)
        foregroundService: {
          notificationTitle: "Location Tracking Active",
          notificationBody: "Smriti is tracking your location",
          notificationColor: "#FF0000",
        },
      });

      setIsTracking(true);
      console.log("Location tracking started successfully");
    } catch (error) {
      console.error("Failed to start location tracking:", error);
    }
  };

  const stopTracking = async () => {
    try {
      // Check if task is registered before trying to stop
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        LOCATION_TASK_NAME
      );

      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        setIsTracking(false);
        console.log("Location tracking stopped successfully");
      } else {
        console.log("Location tracking was not active");
        setIsTracking(false);
      }
    } catch (error) {
      console.error("Failed to stop location tracking:", error);
      // Set tracking to false even if there's an error
      setIsTracking(false);
    }
  };

  // Effect to handle user authentication changes
  useEffect(() => {
    const handleAuthChange = async () => {
      if (user && userToken) {
        // User is authenticated, start tracking
        await startTracking();
      } else {
        // User is not authenticated, stop tracking
        await stopTracking();
      }
    };

    handleAuthChange();
  }, [user, userToken]);

  // Effect to check initial task status
  useEffect(() => {
    checkTaskStatus();

    // Cleanup function
    return () => {
      stopTracking();
    };
  }, []);

  const contextValue = {
    startTracking,
    stopTracking,
    isTracking,
    hasPermissions,
    requestPermissions,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
