import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Audio } from "expo-av";
import io from "socket.io-client";
import { navigate } from "../../utils/NavigationService";
import { makeApiRequest } from "../../utils/api-error-utils";
import API_BASE_URL from "../../config";
import { useSelector } from "react-redux";

// Local microphone icon (you can use any icon or emoji)
const MicIcon = () => <Text style={styles.micIcon}>🎤</Text>;

const VoiceDetectionScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speaker, setSpeaker] = useState(null);
  const [error, setError] = useState(null);
  const recordingRef = useRef(null);
  const socketRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const patientID = useSelector((state) => state.patient?.data?._id); // Replace with actual user ID
  // Connect to Socket.IO
  useEffect(() => {
    socketRef.current = io("http://your-backend-url.com", {
      transports: ["websocket"],
    });

    socketRef.current.emit("registerUser", "68306213b91ca93949d6aab4");

    socketRef.current.on("startRecording", () => {
      navigate("VoiceDetectionScreen");
      handleStartRecording();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Start pulse animation
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start processing animation
  const startProcessing = () => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };
  const handleStartRecording = async () => {
    try {
      setError(null);
      setSpeaker(null);
      setIsRecording(true);
      startPulse();

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;

      setTimeout(async () => {
        await handleStopRecording();
      }, 5000);
    } catch (err) {
      console.error("Failed to start recording", err);
      setError("Failed to start recording");
      setIsRecording(false);
      pulseAnim.stopAnimation();
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      pulseAnim.stopAnimation();

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        const audioData = await readAudioFile(uri);
        await sendAudioToBackend(audioData);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      setError("Failed to stop recording");
    }
  };

  // ... (keep readAudioFile, convertBlobToBase64, sendAudioToBackend functions same as before)
  const readAudioFile = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return await convertBlobToBase64(blob);
    } catch (err) {
      console.error("Error reading audio file:", err);
      throw err;
    }
  };

  const convertBlobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result.split(",")[1]); // Extract base64 data
      };
      reader.readAsDataURL(blob);
    });

  const sendAudioToBackend = async (audioBase64) => {
    try {
      setIsProcessing(true);
      startProcessing(); // Start the spinning animation

      //   const response = await fetch(
      //     "http://your-backend-url.com/analyze-audio",
      //     {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({ audio: audioBase64 }),
      //     }
      //   );

      //   if (!response.ok) {
      //     throw new Error(`HTTP error! status: ${response.status}`);
      //   }

      //   const data = await response.json();
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: audioBase64 }),
      };
      makeApiRequest(
        `${API_BASE_URL}/analyze-audio`,
        options,
        (data) => {
          setSpeaker(data.speaker);
          console.log(data);
        },
        (error) => setError(`Failed to analyze audio ERROR - ${error}`)
      );

      console.log(audioBase64);
      setTimeout(() => {}, 5000);

      //   setSpeaker("Mukul");
    } catch (err) {
      console.error("Error sending audio to backend:", err);
      setError("Failed to analyze audio");
      Alert.alert("Error", "Failed to process audio. Please try again.");
    } finally {
      setIsProcessing(false);
      spinAnim.stopAnimation();
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pulseInterpolation = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isProcessing ? (
          <View style={styles.animationContainer}>
            <Animated.View
              style={[
                styles.processingCircle,
                { transform: [{ rotate: spin }] },
              ]}
            >
              <View style={styles.innerCircle} />
              <View style={styles.outerCircle} />
            </Animated.View>
            <Text style={styles.statusText}>Analyzing voice...</Text>
          </View>
        ) : speaker ? (
          <View style={styles.resultContainer}>
            <Text style={styles.speakerText}>Speaker:</Text>
            <Text style={styles.speakerName}>{speaker}</Text>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => setSpeaker(null)}
            >
              <Text style={styles.tryAgainText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleStartRecording}
            disabled={isRecording}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.micButton,
                {
                  transform: [
                    { scale: isRecording ? pulseInterpolation : scaleAnim },
                  ],
                },
              ]}
            >
              {isRecording ? (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.micIcon}>🎤</Text>
                </View>
              ) : (
                <MicIcon />
              )}
            </Animated.View>
          </TouchableOpacity>
        )}

        {isRecording && (
          <Text style={styles.recordingText}>Recording... 5 seconds</Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  micButton: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  micIcon: {
    fontSize: 80,
    textAlign: "center",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "red",
    marginRight: 10,
  },
  recordingText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
  },
  animationContainer: {
    alignItems: "center",
  },
  processingCircle: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333",
    position: "absolute",
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: "#4CAF50",
    borderLeftColor: "transparent",
    position: "absolute",
  },
  statusText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 18,
  },
  resultContainer: {
    alignItems: "center",
  },
  speakerText: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 10,
  },
  speakerName: {
    color: "#4CAF50",
    fontSize: 32,
    fontWeight: "bold",
  },
  tryAgainButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#333",
    borderRadius: 20,
  },
  tryAgainText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "#f44336",
    marginTop: 20,
    fontSize: 16,
  },
});

export default VoiceDetectionScreen;
