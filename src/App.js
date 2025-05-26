import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { View, ActivityIndicator, Text, Alert } from "react-native";
import * as Location from "expo-location";
import { useTheme } from "./themes/ThemeContext";
import AppNavigator from "./navigation/AppNavigator";
import { initializeAuth } from "./features/auth/authSlice";
import { useDispatch } from "react-redux";
import API_BASE_URL from "./config";
import { useAuth } from "./contexts/AuthContext";
// import { useLocation } from './LocationContext';
const App = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  // LOCATION SERVICE STATE
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLocationServiceActive, setIsLocationServiceActive] = useState(false);
  const { userToken } = useAuth(); // Only using userToken

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(initializeAuth()).unwrap();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      }
    };

    initAuth();
  }, [dispatch]);

  // Function to send location to backend
  const sendLocationToBackend = async (latitude, longitude) => {
    if (!userToken) return;

    try {
      console.log("Sending location to backend...");
      const response = await fetch(`${API_BASE_URL}/api/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send location");
      }

      console.log("Location sent successfully:", { latitude, longitude });
    } catch (error) {
      console.error("Error sending location:", error);
      // Don't throw error - let app continue working
    }
  };

  // Function to get current location
  const getCurrentLocation = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000, // 10 second timeout
      });

      setLocation(currentLocation);

      // Send location to backend if user is logged in
      if (userToken) {
        await sendLocationToBackend(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      }
    } catch (error) {
      const errorMessage = "Error getting location: " + error.message;
      setErrorMsg(errorMessage);
      console.error("Location error:", error);
      // Don't throw error - let app continue working
    }
  };

  // Main location tracking effect
  useEffect(() => {
    let locationInterval;

    const startLocationTracking = async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          const errorMessage = "Permission to access location was denied";
          setErrorMsg(errorMessage);
          console.warn(
            "Location permission denied - app will continue without location tracking"
          );
          // Don't show alert or stop app flow
          return;
        }

        // Get initial location
        await getCurrentLocation();
        setIsTracking(true);

        // Set up interval to get location every 4 minutes
        locationInterval = setInterval(() => {
          getCurrentLocation();
        }, 240000); // 4 minutes (4 * 60 * 1000 milliseconds)

        console.log("Location tracking started - will update every 4 minutes");
      } catch (error) {
        console.error("Error starting location tracking:", error);
        setErrorMsg("Failed to start location tracking");
        // Don't throw error - let app continue working
      }
    };

    const stopLocationTracking = () => {
      if (locationInterval) {
        clearInterval(locationInterval);
        locationInterval = null;
      }
      setIsTracking(false);
      setIsLocationServiceActive(false);
      console.log("Location tracking stopped");
    };

    // Only start tracking if user is logged in with userToken
    if (userToken && !isLocationServiceActive) {
      setIsLocationServiceActive(true);
      startLocationTracking();
    } else if (!userToken && isLocationServiceActive) {
      stopLocationTracking();
    }

    // Cleanup interval on unmount or when user logs out
    return () => {
      stopLocationTracking();
    };
  }, [userToken]); // Re-run effect when userToken changes

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 10 }}>
          Loading user data...
        </Text>
      </View>
    );
  }

  return <AppNavigator />;
};

export default App;

// import React, { useEffect } from "react";
// import { Provider as PaperProvider } from "react-native-paper";
// import {
//   Provider as ReduxProvider,
//   useSelector,
//   useDispatch,
// } from "react-redux";
// import { NavigationContainer } from "@react-navigation/native";
// import { store } from "./store";
// import AppNavigator from "./navigation/AppNavigator";
// import { useTheme } from "./themes/ThemeContext";
// import { I18nextProvider } from "react-i18next";
// import i18n from "./i18n";
// import { ActivityIndicator, View, Text } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   loginSuccess,
//   initAuthSuccess,
//   initializeAuth,
// } from "./features/auth/authSlice";
// import { StatusBar } from "expo-status-bar";
// const AppWrapper = () => {
//   return (
//     <ReduxProvider store={store}>
//       <I18nextProvider i18n={i18n}>
//         <StatusBar style="auto" />
//         <App />
//       </I18nextProvider>
//     </ReduxProvider>
//   );
// };

// const App = () => {
//   const { theme } = useTheme();
//   const dispatch = useDispatch();
//   // Only select the specific state properties you need
//   const { token, isInitialized } = useSelector((state) => state.auth);

//   useEffect(() => {
//     let isMounted = true;

//     const initialize = async () => {
//       try {
//         await dispatch(initializeAuth());
//       } catch (error) {
//         if (isMounted) {
//           console.error("Initialization error:", error);
//         }
//       }
//     };

//     initialize();

//     return () => {
//       isMounted = false;
//     };
//   }, [dispatch]);

//   // // Initialize auth state from AsyncStorage
//   // useEffect(() => {
//   //   const initializeAuthState = async () => {
//   //     try {
//   //       // Check if auth data exists in AsyncStorage
//   //       const authDataString = await AsyncStorage.getItem("expo_auth_user");
//   //       console.log(authDataString);
//   //       if (authDataString) {
//   //         try {
//   //           const authData = JSON.parse(authDataString);
//   //           console.log("authData = ", authData);
//   //           // Only dispatch if we have valid user and token
//   //           if (authData && authData.user && authData.token) {
//   //             dispatch(
//   //               loginSuccess({
//   //                 user: authData.user,
//   //                 token: authData.token,
//   //               })
//   //             );
//   //           }
//   //         } catch (parseError) {
//   //           console.error("Error parsing auth data:", parseError);
//   //         }
//   //       }
//   //     } catch (error) {
//   //       console.error("Error accessing AsyncStorage:", error);
//   //     } finally {
//   //       // Mark as initialized with an empty object instead of null
//   //       dispatch(initAuthSuccess({}));
//   //     }
//   //   };

//   //   initializeAuthState();
//   // }, [dispatch]);

//   // Show loading screen while checking authentication
//   if (!isInitialized) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <PaperProvider theme={theme}>
//       <AppNavigator />
//     </PaperProvider>
//   );
// };

// export default AppWrapper;

// // import React from "react";
// // import { Provider as PaperProvider } from "react-native-paper";
// // import { Provider as ReduxProvider, useSelector } from "react-redux";
// // import { NavigationContainer } from "@react-navigation/native";
// // import { store } from "./store";
// // import AppNavigator from "./navigation/AppNavigator";
// // import { useTheme } from "./themes/ThemeContext";
// // import { I18nextProvider } from "react-i18next";
// // import i18n from "./i18n";
// // // import { useAuthInit } from "./store";
// // import { ActivityIndicator, View } from "react-native";

// // const AppWrapper = () => {
// //   return (
// //     <ReduxProvider store={store}>
// //       <I18nextProvider i18n={i18n}>
// //         <App />
// //       </I18nextProvider>
// //     </ReduxProvider>
// //   );
// // };

// // const App = () => {
// //   const { theme } = useTheme();

// //   // Use custom hook to initialize auth state from AsyncStorage
// //   // useAuthInit();

// //   // Get auth state from Redux
// //   const { token, isInitialized } = useSelector((state) => state.auth);

// //   // Show loading screen while checking authentication
// //   if (!isInitialized) {
// //     return (
// //       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
// //         <ActivityIndicator size="large" color="#0000ff" />
// //         <Text>Loading...</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <PaperProvider theme={theme}>
// //       <NavigationContainer theme={theme}>
// //         <AppNavigator />
// //       </NavigationContainer>
// //     </PaperProvider>
// //   );
// // };

// // export default AppWrapper;
