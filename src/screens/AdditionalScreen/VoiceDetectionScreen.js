import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import io from "socket.io-client";
import { navigate } from "../../utils/NavigationService";
import { makeApiRequest } from "../../utils/api-error-utils";
import API_BASE_URL from "../../config";
import { useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");

// Enhanced microphone icon component
const MicIcon = ({ isRecording, size = 80 }) => (
  <Text style={[styles.micIcon, { fontSize: size }]}>
    {isRecording ? "🔴" : "🎤"}
  </Text>
);

const VoiceDetectionScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speaker, setSpeaker] = useState(null);
  const [error, setError] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(5);
  const [processingStage, setProcessingStage] = useState("");

  const recordingRef = useRef(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const autoStopTimeoutRef = useRef(null); // Add ref for auto-stop timeout

  // Enhanced animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const patientID = useSelector((state) => state.patient?.data?._id);

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced pulse animation with multiple waves
  const startPulse = () => {
    // Main pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Wave animations with staggered timing
    const startWave = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startWave(waveAnim1, 0);
    startWave(waveAnim2, 400);
    startWave(waveAnim3, 800);
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    waveAnim1.stopAnimation();
    waveAnim2.stopAnimation();
    waveAnim3.stopAnimation();
  };
  const stageTimeouts = useRef([]);
  useEffect(() => {
    return () => {
      stopProcessing(); // Cleanup on unmount
    };
  }, []);
  // Enhanced processing animation with stages
  const startProcessing = () => {
    setProcessingStage("Initializing AI...");

    const stages = [
      { text: "Processing audio signal...", delay: 2000 },
      { text: "Extracting voice features...", delay: 4500 },
      { text: "Analyzing vocal patterns...", delay: 6000 },
      { text: "Matching voice signatures...", delay: 7500 },
      { text: "Finalizing identification...", delay: 9000 },
    ];

    // Clear any existing timeouts
    if (stageTimeouts.current) {
      stageTimeouts.current.forEach(clearTimeout);
    }
    stageTimeouts.current = [];

    // Set up stage timeouts
    stages.forEach(({ text, delay }) => {
      const timeoutId = setTimeout(() => {
        setProcessingStage(text);
      }, delay);
      stageTimeouts.current.push(timeoutId);
    });

    // Spinning animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 14000, // 8 seconds total processing time
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
  };

  // Add this ref at the top of your component to store timeout IDs
  // const stageTimeouts = useRef([]);

  // Also add a cleanup function to clear timeouts when component unmounts or processing stops
  const stopProcessing = () => {
    if (stageTimeouts.current) {
      stageTimeouts.current.forEach(clearTimeout);
      stageTimeouts.current = [];
    }
    // Stop animations if needed
    spinAnim.stopAnimation();
    breatheAnim.stopAnimation();
    glowAnim.stopAnimation();
    progressAnim.stopAnimation();
  };

  // Result slide-in animation
  const showResult = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startRecordingTimer = () => {
    setRecordingTimer(5);
    timerRef.current = setInterval(() => {
      setRecordingTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartRecording = async () => {
    try {
      setError(null);
      setSpeaker(null);
      setIsRecording(true);
      startPulse();
      startRecordingTimer();

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

      // Auto-stop after 5 seconds - FIXED VERSION
      autoStopTimeoutRef.current = setTimeout(async () => {
        // Don't check isRecording state, just stop if we have a recording
        if (recordingRef.current) {
          await handleStopRecording();
        }
      }, 5000);
    } catch (err) {
      console.error("Failed to start recording", err);
      setError(
        "Failed to start recording. Please check microphone permissions."
      );
      setIsRecording(false);
      stopPulse();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
    }
  };

  const handleStopRecording = async () => {
    try {
      // Clear the auto-stop timeout if manually stopping
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }

      setIsRecording(false);
      stopPulse();

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null; // Clear the ref

        if (uri) {
          const audioData = await readAudioFile(uri);
          await sendAudioToBackend(audioData);
        } else {
          throw new Error("No recording data available");
        }
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      setError("Failed to process recording. Please try again.");
      setIsProcessing(false);
    }
  };

  const readAudioFile = async (uri) => {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to read audio file: ${response.status}`);
      }
      const blob = await response.blob();
      return await convertBlobToBase64(blob);
    } catch (err) {
      console.error("Error reading audio file:", err);
      throw new Error("Failed to read audio file");
    }
  };

  const convertBlobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () =>
        reject(new Error("Failed to convert audio to base64"));
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result.split(",")[1]); // Extract base64 data
        } else {
          reject(new Error("Invalid file reader result"));
        }
      };
      reader.readAsDataURL(blob);
    });

  const sendAudioToBackend = async (audioBase64) => {
    try {
      setIsProcessing(true);
      startProcessing();

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: audioBase64,
          patientId: patientID,
        }),
      };

      makeApiRequest(
        `${API_BASE_URL}/analyze-audio`,
        options,
        (data) => {
          console.log("Voice analysis result:", data);
          setSpeaker(data.speaker || "Unknown Speaker");
          setIsProcessing(false);
          stopProcessing();
          showResult();
        },
        (error) => {
          console.error("API Error:", error);
          setError(`Failed to analyze audio: ${error.message || error}`);
          setIsProcessing(false);
          stopProcessing();
        }
      );
    } catch (err) {
      console.error("Error sending audio to backend:", err);
      setError(
        "Failed to analyze audio. Please check your connection and try again."
      );
      setIsProcessing(false);
      stopProcessing();
    }
  };

  const resetScreen = () => {
    // Clear any existing timeouts/intervals
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    slideAnim.setValue(0);
    fadeAnim.setValue(0);
    progressAnim.setValue(0);
    setSpeaker(null);
    setError(null);
    setProcessingStage("");
    setRecordingTimer(5);
    setIsRecording(false);
    setIsProcessing(false);
  };

  // Animation interpolations
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pulseInterpolation = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const wave1Scale = waveAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const wave1Opacity = waveAnim1.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.6, 0.2, 0],
  });

  const wave2Scale = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const wave2Opacity = waveAnim2.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.4, 0.15, 0],
  });

  const wave3Scale = waveAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.9],
  });

  const wave3Opacity = waveAnim3.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.3, 0.1, 0],
  });

  const slideY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* Animated background gradient effect */}
      <View style={styles.backgroundGradient} />

      {/* Floating particles effect */}
      <View style={styles.particlesContainer}>
        {[...Array(8)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${10 + i * 10}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.3}s`,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        {isProcessing ? (
          <View style={styles.animationContainer}>
            {/* Enhanced processing animation */}
            <View style={styles.processingWrapper}>
              <Animated.View
                style={[
                  styles.processingGlow,
                  {
                    opacity: glowOpacity,
                    transform: [{ scale: breatheAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.processingRing,
                  {
                    transform: [{ rotate: spin }, { scale: breatheAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.processingRingInner,
                  {
                    transform: [{ rotate: spin }, { scaleX: -1 }],
                  },
                ]}
              />
              <View style={styles.processingCenter}>
                <Text style={styles.processingIcon}>🧠</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[styles.progressFill, { width: progressWidth }]}
                />
              </View>
            </View>

            {/* Pulsing dots */}
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.processingDot,
                    {
                      opacity: pulseAnim,
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1.2],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={styles.statusText}>AI Processing Audio</Text>
            <Text style={styles.subStatusText}>{processingStage}</Text>
          </View>
        ) : speaker ? (
          <Animated.View
            style={[
              styles.resultContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideY }],
              },
            ]}
          >
            <View style={styles.resultWrapper}>
              <Text style={styles.resultLabel}>Voice Identified</Text>
              <View style={styles.speakerNameContainer}>
                <Text style={styles.speakerName}>{speaker}</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              </View>
              <Text style={styles.confidenceText}>High Confidence Match</Text>
            </View>

            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={resetScreen}
              activeOpacity={0.8}
            >
              <Text style={styles.tryAgainText}>Analyze Again</Text>
              <Text style={styles.tryAgainIcon}>🔄</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.micContainer}>
            {/* Sound waves */}
            {isRecording && (
              <>
                <Animated.View
                  style={[
                    styles.soundWave,
                    {
                      transform: [{ scale: wave1Scale }],
                      opacity: wave1Opacity,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.soundWave,
                    styles.soundWave2,
                    {
                      transform: [{ scale: wave2Scale }],
                      opacity: wave2Opacity,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.soundWave,
                    styles.soundWave3,
                    {
                      transform: [{ scale: wave3Scale }],
                      opacity: wave3Opacity,
                    },
                  ]}
                />
              </>
            )}

            <TouchableOpacity
              onPress={handleStartRecording}
              disabled={isRecording}
              activeOpacity={0.8}
              style={styles.micTouchable}
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
                <View style={styles.micButtonInner}>
                  <MicIcon isRecording={isRecording} />
                  {isRecording && <View style={styles.recordingIndicator} />}
                </View>
              </Animated.View>
            </TouchableOpacity>

            <Text style={styles.instructionText}>
              {isRecording
                ? "Recording... Speak clearly"
                : "Tap to start voice detection"}
            </Text>

            {isRecording && (
              <View style={styles.recordingInfo}>
                <View style={styles.recordingTimer}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.timerText}>{recordingTimer} seconds</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {error && (
          <Animated.View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={resetScreen}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.8) 70%)",
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(59, 130, 246, 0.3)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  micContainer: {
    alignItems: "center",
    position: "relative",
  },
  micTouchable: {
    position: "relative",
  },
  micButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderWidth: 3,
    borderColor: "rgba(59, 130, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  micButtonInner: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  micIcon: {
    fontSize: 80,
    textAlign: "center",
  },
  recordingIndicator: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ff4444",
    shadowColor: "#ff4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  soundWave: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
  soundWave2: {
    borderColor: "rgba(168, 85, 247, 0.4)",
  },
  soundWave3: {
    borderColor: "rgba(34, 197, 94, 0.4)",
  },
  instructionText: {
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 30,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
  },
  recordingInfo: {
    marginTop: 20,
    alignItems: "center",
  },
  recordingTimer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff4444",
    marginRight: 8,
  },
  timerText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
  },
  animationContainer: {
    alignItems: "center",
  },
  processingWrapper: {
    position: "relative",
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  processingGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  processingRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "transparent",
    borderTopColor: "#3b82f6",
    borderRightColor: "#8b5cf6",
  },
  processingRingInner: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: "#22c55e",
    borderLeftColor: "#f59e0b",
  },
  processingCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  processingIcon: {
    fontSize: 32,
  },
  progressContainer: {
    width: width * 0.7,
    marginBottom: 20,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginHorizontal: 4,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subStatusText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    textAlign: "center",
    minHeight: 20,
  },
  resultContainer: {
    alignItems: "center",
    maxWidth: width * 0.8,
  },
  resultWrapper: {
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    marginBottom: 30,
  },
  resultLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  speakerNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  speakerName: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "bold",
    marginRight: 12,
  },
  verifiedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  confidenceText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "500",
  },
  tryAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tryAgainText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  tryAgainIcon: {
    fontSize: 18,
  },
  errorContainer: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
    maxWidth: width * 0.8,
  },
  errorIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "rgba(255, 68, 68, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.4)",
  },
  retryText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default VoiceDetectionScreen;
