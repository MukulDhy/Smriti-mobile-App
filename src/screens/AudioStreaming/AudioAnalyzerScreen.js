import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import AudioSpectralVisualizer from "./AudioSpectralVisualizer";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useSelector } from "react-redux";
import LiveAudioPlayer from "./LiveAudioPlayer";

const AudioAnalyzerScreen = () => {
  const { socket, isConnected, isAuthenticated, sendMessage, registerUser } =
    useWebSocket();

  const [esp32Status, setEsp32Status] = useState("Unknown");
  const [recordingStatus, setRecordingStatus] = useState(false);
  const [audioSettings, setAudioSettings] = useState({
    sampleRate: 16000,
    bitDepth: 16,
    channels: 1,
  });
  const [connectionQuality, setConnectionQuality] = useState("Good");
  const [lastMessageTime, setLastMessageTime] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const messageTimeoutRef = useRef(null);
  const registrationAttempted = useRef(false);

  // Register user on component mount with better error handling
  //   useEffect(() => {
  //     if (isAuthenticated && user?._id && !registrationAttempted.current) {
  //       try {
  //         const success = registerUser(user._id);
  //         registrationAttempted.current = true;

  //         if (!success) {
  //           console.warn("User registration failed");
  //         }
  //       } catch (error) {
  //         console.error("Error registering user:", error);
  //       }
  //     }

  //     // Reset registration flag when authentication changes
  //     if (!isAuthenticated) {
  //       registrationAttempted.current = false;
  //     }
  //   }, [isAuthenticated, user?._id, registerUser]);

  // Monitor connection quality
  useEffect(() => {
    if (lastMessageTime) {
      const now = Date.now();
      const timeDiff = now - lastMessageTime;

      if (timeDiff < 1000) {
        setConnectionQuality("Excellent");
      } else if (timeDiff < 3000) {
        setConnectionQuality("Good");
      } else if (timeDiff < 10000) {
        setConnectionQuality("Poor");
      } else {
        setConnectionQuality("Disconnected");
      }
    }
  }, [lastMessageTime]);

  // Set up WebSocket binaryType and handle ESP32 specific messages
  useEffect(() => {
    if (!socket || !isConnected) {
      setConnectionQuality("Disconnected");
      return;
    }

    // Set binary type for audio data handling
    try {
      if (socket.binaryType !== "arraybuffer") {
        socket.binaryType = "arraybuffer";
      }
    } catch (error) {
      console.warn("Could not set WebSocket binaryType:", error);
    }

    const handleMessage = (event) => {
      try {
        setLastMessageTime(Date.now());

        // Clear existing timeout
        if (messageTimeoutRef.current) {
          clearTimeout(messageTimeoutRef.current);
        }

        // Set timeout to monitor connection quality
        messageTimeoutRef.current = setTimeout(() => {
          setConnectionQuality("Poor");
        }, 5000);

        // Handle binary data (audio streams)
        if (event.data instanceof ArrayBuffer) {
          // Audio data is handled by AudioSpectralVisualizer
          return;
        }

        // Handle Blob data
        if (event.data instanceof Blob) {
          // Audio data is handled by AudioSpectralVisualizer
          return;
        }

        // Handle text/JSON messages
        if (typeof event.data === "string") {
          let message;
          try {
            message = JSON.parse(event.data);
          } catch (parseError) {
            console.warn("Could not parse WebSocket message:", event.data);
            return;
          }

          switch (message.type) {
            case "esp32Status":
              setEsp32Status(message.status || "Unknown");
              break;

            case "recordingStatus":
              setRecordingStatus(Boolean(message.isRecording));
              break;

            case "audioSettings":
              if (message.settings && typeof message.settings === "object") {
                setAudioSettings((prevSettings) => ({
                  ...prevSettings,
                  ...message.settings,
                }));
              }
              break;

            case "deviceInfo":
              console.log("ESP32 Device Info:", message.info);
              if (message.info) {
                Alert.alert(
                  "Device Information",
                  `Device: ${message.info.deviceName || "ESP32"}\n` +
                    `Version: ${message.info.version || "Unknown"}\n` +
                    `Free Memory: ${message.info.freeMemory || "Unknown"}`
                );
              }
              break;

            case "error":
              console.error("ESP32 Error:", message.error);
              Alert.alert(
                "ESP32 Error",
                message.error || "Unknown error occurred"
              );
              break;

            case "connectionStatus":
              if (message.status) {
                setConnectionQuality(message.status);
              }
              break;

            default:
          }
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    const handleError = (error) => {
      console.error("WebSocket error:", error);
      setConnectionQuality("Error");
    };

    const handleClose = () => {
      console.log("WebSocket connection closed");
      setConnectionQuality("Disconnected");
      setRecordingStatus(false);
      setEsp32Status("Disconnected");
    };

    socket.addEventListener("message", handleMessage);
    socket.addEventListener("error", handleError);
    socket.addEventListener("close", handleClose);

    return () => {
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("error", handleError);
      socket.removeEventListener("close", handleClose);

      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [socket, isConnected]);

  // Control functions with better error handling
  const startRecording = () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please wait for authentication to complete");
      return;
    }

    try {
      const success = sendMessage({
        type: "startRecording",
        settings: {
          duration: 0, // Continuous recording
          quality: "high",
          sampleRate: audioSettings.sampleRate,
          bitDepth: audioSettings.bitDepth,
          channels: audioSettings.channels,
        },
      });

      if (success) {
        Alert.alert("Recording Started", "ESP32 is now recording audio");
        // Optimistically update UI
        setRecordingStatus(true);
      } else {
        Alert.alert("Error", "Failed to start recording. Check connection.");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Failed to start recording due to an error.");
    }
  };

  const stopRecording = () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please wait for authentication to complete");
      return;
    }

    try {
      const success = sendMessage({
        type: "stopRecording",
      });

      if (success) {
        Alert.alert("Recording Stopped", "ESP32 has stopped recording");
        // Optimistically update UI
        setRecordingStatus(false);
      } else {
        Alert.alert("Error", "Failed to stop recording. Check connection.");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Failed to stop recording due to an error.");
    }
  };

  const requestDeviceInfo = () => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please wait for authentication to complete");
      return;
    }

    try {
      const success = sendMessage({
        type: "getDeviceInfo",
      });

      if (!success) {
        Alert.alert(
          "Error",
          "Failed to request device info. Check connection."
        );
      }
    } catch (error) {
      console.error("Error requesting device info:", error);
      Alert.alert("Error", "Failed to request device info due to an error.");
    }
  };

  const updateAudioSettings = (newSettings) => {
    if (!isAuthenticated) {
      Alert.alert("Error", "Please wait for authentication to complete");
      return;
    }

    // Validate settings
    if (!newSettings || typeof newSettings !== "object") {
      Alert.alert("Error", "Invalid audio settings");
      return;
    }

    try {
      const success = sendMessage({
        type: "updateAudioSettings",
        settings: newSettings,
      });

      if (success) {
        setAudioSettings((prevSettings) => ({
          ...prevSettings,
          ...newSettings,
        }));
        Alert.alert("Settings Updated", "Audio settings have been updated");
      } else {
        Alert.alert("Error", "Failed to update settings. Check connection.");
      }
    } catch (error) {
      console.error("Error updating audio settings:", error);
      Alert.alert("Error", "Failed to update settings due to an error.");
    }
  };

  const resetConnection = () => {
    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }

      // Reset states
      setEsp32Status("Unknown");
      setRecordingStatus(false);
      setConnectionQuality("Disconnected");
      registrationAttempted.current = false;

      Alert.alert("Connection Reset", "Please wait for reconnection...");
    } catch (error) {
      console.error("Error resetting connection:", error);
      Alert.alert("Error", "Failed to reset connection");
    }
  };

  const renderControlPanel = () => (
    <View style={styles.controlPanel}>
      <Text style={styles.sectionTitle}>ESP32 Controls</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            recordingStatus ? styles.stopButton : styles.startButton,
            !isAuthenticated && styles.disabledButton,
          ]}
          onPress={recordingStatus ? stopRecording : startRecording}
          disabled={!isAuthenticated}
        >
          <Text style={styles.buttonText}>
            {recordingStatus ? "Stop Recording" : "Start Recording"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            !isAuthenticated && styles.disabledButton,
          ]}
          onPress={requestDeviceInfo}
          disabled={!isAuthenticated}
        >
          <Text style={styles.buttonText}>Device Info</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.controlButton, styles.resetButton]}
        onPress={resetConnection}
      >
        <Text style={styles.buttonText}>Reset Connection</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatusInfo = () => (
    <View style={styles.statusPanel}>
      <Text style={styles.sectionTitle}>System Status</Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>WebSocket:</Text>
        <Text
          style={[
            styles.statusValue,
            { color: isConnected ? "#4CAF50" : "#F44336" },
          ]}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Authentication:</Text>
        <Text
          style={[
            styles.statusValue,
            { color: isAuthenticated ? "#4CAF50" : "#FF9800" },
          ]}
        >
          {isAuthenticated ? "Authenticated" : "Pending"}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Connection Quality:</Text>
        <Text
          style={[
            styles.statusValue,
            {
              color:
                connectionQuality === "Excellent"
                  ? "#4CAF50"
                  : connectionQuality === "Good"
                  ? "#8BC34A"
                  : connectionQuality === "Poor"
                  ? "#FF9800"
                  : "#F44336",
            },
          ]}
        >
          {connectionQuality}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>ESP32 Status:</Text>
        <Text style={styles.statusValue}>{esp32Status}</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Recording:</Text>
        <Text
          style={[
            styles.statusValue,
            { color: recordingStatus ? "#4CAF50" : "#757575" },
          ]}
        >
          {recordingStatus ? "Active" : "Inactive"}
        </Text>
      </View>

      {user?._id && (
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>User ID:</Text>
          <Text style={[styles.statusValue, { fontSize: 12 }]}>
            {user._id.substring(0, 8)}...
          </Text>
        </View>
      )}
    </View>
  );

  const renderAudioSettings = () => (
    <View style={styles.settingsPanel}>
      <Text style={styles.sectionTitle}>Audio Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Sample Rate:</Text>
        <Text style={styles.settingValue}>{audioSettings.sampleRate} Hz</Text>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Bit Depth:</Text>
        <Text style={styles.settingValue}>{audioSettings.bitDepth} bit</Text>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Channels:</Text>
        <Text style={styles.settingValue}>
          {audioSettings.channels === 1 ? "Mono" : "Stereo"}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.settingsButton,
            !isAuthenticated && styles.disabledButton,
          ]}
          onPress={() => {
            const newRate =
              audioSettings.sampleRate === 44100
                ? 16000
                : audioSettings.sampleRate === 16000
                ? 22050
                : 44100;
            updateAudioSettings({
              ...audioSettings,
              sampleRate: newRate,
            });
          }}
          disabled={!isAuthenticated}
        >
          <Text style={styles.buttonText}>Change Sample Rate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.settingsButton,
            !isAuthenticated && styles.disabledButton,
          ]}
          onPress={() => {
            const newChannels = audioSettings.channels === 1 ? 2 : 1;
            updateAudioSettings({
              ...audioSettings,
              channels: newChannels,
            });
          }}
          disabled={!isAuthenticated}
        >
          <Text style={styles.buttonText}>Toggle Channels</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Audio Spectral Analyzer</Text>

        {/* Primary Visualizer - Default Theme */}
        <AudioSpectralVisualizer
          height={220}
          colorScheme="default"
          showFrequencyLabels={true}
          showAmplitudeLabels={true}
          barCount={64}
          smoothing={0.8}
        />

        {/* Add the Live Audio Player here */}
        <LiveAudioPlayer
          socket={socket}
          isConnected={isConnected}
          audioSettings={audioSettings}
        />

        {renderStatusInfo()}
        {renderControlPanel()}
        {renderAudioSettings()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ESP32-S3 Audio Streaming via WebSocket
          </Text>
          <Text style={styles.footerSubtext}>
            Real-time spectral analysis and visualization
          </Text>
          {lastMessageTime && (
            <Text style={styles.footerSubtext}>
              Last message: {new Date(lastMessageTime).toLocaleTimeString()}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  secondaryVisualizer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  statusPanel: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  controlPanel: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  resetButton: {
    backgroundColor: "#9C27B0",
    flex: 0,
    minWidth: "100%",
  },
  disabledButton: {
    backgroundColor: "#424242",
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  settingsPanel: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: "#B0B0B0",
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  settingsButton: {
    flex: 1,
    backgroundColor: "#FF9800",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#B0B0B0",
    textAlign: "center",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
    marginBottom: 2,
  },
});

export default AudioAnalyzerScreen;
