import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import Svg, {
  Path,
  Rect,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useWebSocket } from "../../contexts/WebSocketContext"; // Adjust path as needed

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const AudioSpectralVisualizer = ({
  width = screenWidth - 40,
  height = 200,
  showFrequencyLabels = true,
  showAmplitudeLabels = true,
  barCount = 64,
  smoothing = 0.8,
  colorScheme = "default", // 'default', 'neon', 'warm', 'cool'
}) => {
  const {
    isConnected,
    isAuthenticated,
    audioStreamActive,
    subscribeToAudioData,
  } = useWebSocket();
  const [audioData, setAudioData] = useState(null);
  const [isReceivingData, setIsReceivingData] = useState(false);
  const [lastDataTimestamp, setLastDataTimestamp] = useState(null);
  const [spectralData, setSpectralData] = useState(new Array(barCount).fill(0));
  const smoothedData = useRef(new Array(barCount).fill(0));
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const dataTimeout = useRef(null);

  // Color schemes
  const colorSchemes = {
    default: {
      primary: "#4A90E2",
      secondary: "#7ED321",
      background: "#1A1A2E",
      text: "#FFFFFF",
      grid: "#333366",
      gradient: ["#4A90E2", "#7ED321", "#F5A623"],
    },
    neon: {
      primary: "#00FFFF",
      secondary: "#FF00FF",
      background: "#0D0D0D",
      text: "#FFFFFF",
      grid: "#1A1A1A",
      gradient: ["#00FFFF", "#FF00FF", "#FFFF00"],
    },
    warm: {
      primary: "#FF6B6B",
      secondary: "#FFE66D",
      background: "#2C1810",
      text: "#FFFFFF",
      grid: "#4A3728",
      gradient: ["#FF6B6B", "#FFE66D", "#FF8E53"],
    },
    cool: {
      primary: "#6BCF7F",
      secondary: "#4D96FF",
      background: "#0F2027",
      text: "#FFFFFF",
      grid: "#1E3A5F",
      gradient: ["#6BCF7F", "#4D96FF", "#9B59B6"],
    },
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.default;

  // Pulse animation for "no data" state
  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (!isReceivingData) {
      startPulse();
    }

    return () => {
      pulseAnimation.stopAnimation();
    };
  }, [isReceivingData]);

  // Subscribe to audio data from WebSocket context
  useEffect(() => {
    if (!isConnected || !isAuthenticated) {
      setIsReceivingData(false);
      return;
    }

    const unsubscribe = subscribeToAudioData((audioBuffer) => {
      processAudioData(audioBuffer);
    });

    return unsubscribe;
  }, [isConnected, isAuthenticated, subscribeToAudioData]);

  // Update receiving status based on audioStreamActive
  useEffect(() => {
    setIsReceivingData(audioStreamActive);

    if (audioStreamActive) {
      setLastDataTimestamp(new Date());
    }
  }, [audioStreamActive]);

  // Process binary audio data and generate spectral visualization
  const processAudioData = async (audioBuffer) => {
    try {
      let arrayBuffer = audioBuffer;

      // Ensure we have an ArrayBuffer
      if (audioBuffer instanceof Blob) {
        arrayBuffer = await audioBuffer.arrayBuffer();
      }

      // Validate ArrayBuffer
      if (!(arrayBuffer instanceof ArrayBuffer)) {
        console.error("Invalid audio buffer type:", typeof arrayBuffer);
        return;
      }

      // Check if buffer size is valid for Int16Array (must be divisible by 2)
      if (arrayBuffer.byteLength % 2 !== 0) {
        console.warn(
          `Buffer size ${arrayBuffer.byteLength} is not divisible by 2, padding...`
        );

        // Create a new buffer with even size
        const paddedBuffer = new ArrayBuffer(arrayBuffer.byteLength + 1);
        const paddedView = new Uint8Array(paddedBuffer);
        const originalView = new Uint8Array(arrayBuffer);

        // Copy original data
        paddedView.set(originalView);
        // Last byte is automatically 0

        arrayBuffer = paddedBuffer;
      }

      // Convert to audio samples (assuming 16-bit PCM)
      const audioArray = new Int16Array(arrayBuffer);

      // Skip empty buffers
      if (audioArray.length === 0) {
        return;
      }

      // Generate frequency bins from audio data
      const frequencyBins = generateFrequencyBins(audioArray);
      processSpectralData(frequencyBins);

      setAudioData(audioArray);
      setIsReceivingData(true);
      setLastDataTimestamp(new Date());

      // Clear existing timeout
      if (dataTimeout.current) {
        clearTimeout(dataTimeout.current);
      }

      // Set timeout to detect when data stops
      dataTimeout.current = setTimeout(() => {
        setIsReceivingData(false);
      }, 2000);
    } catch (error) {
      console.error("Error processing audio data:", error);
    }
  };

  // Generate frequency bins from audio data (simplified FFT approach)
  const generateFrequencyBins = (audioArray) => {
    const bins = new Array(barCount).fill(0);
    const samplesPerBin = Math.floor(audioArray.length / barCount);

    if (samplesPerBin === 0) {
      return bins;
    }

    // Simple frequency analysis - divide audio into frequency bands
    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      let count = 0;
      const start = i * samplesPerBin;
      const end = Math.min(start + samplesPerBin, audioArray.length);

      // Calculate RMS for this frequency band
      for (let j = start; j < end; j++) {
        const sample = audioArray[j] / 32768.0; // Normalize to -1 to 1
        sum += sample * sample;
        count++;
      }

      if (count > 0) {
        bins[i] = Math.sqrt(sum / count);
      }
    }

    // Apply frequency weighting (higher frequencies get more emphasis)
    for (let i = 0; i < barCount; i++) {
      const frequencyWeight = 1 + (i / barCount) * 2; // Weight increases with frequency
      bins[i] *= frequencyWeight;
    }

    // Normalize to 0-1 range
    const max = Math.max(...bins);
    return max > 0 ? bins.map((bin) => Math.min(bin / max, 1)) : bins;
  };

  // Process spectral data with smoothing
  const processSpectralData = (data) => {
    if (!Array.isArray(data)) {
      console.warn("Invalid spectral data:", data);
      return;
    }

    const normalized = data.slice(0, barCount);

    // Ensure we have enough data
    while (normalized.length < barCount) {
      normalized.push(0);
    }

    // Apply smoothing
    for (let i = 0; i < barCount; i++) {
      const targetValue = Math.max(0, Math.min(1, normalized[i] || 0));
      smoothedData.current[i] =
        smoothedData.current[i] * smoothing + targetValue * (1 - smoothing);
    }

    setSpectralData([...smoothedData.current]);
  };

  // Generate frequency labels
  const generateFrequencyLabels = () => {
    if (!showFrequencyLabels) return null;

    const labels = [];
    const labelCount = 5;
    const step = barCount / labelCount;

    for (let i = 0; i <= labelCount; i++) {
      const x = (i * step * width) / barCount;
      const frequency = Math.round((i * 22050) / labelCount); // Assuming 44.1kHz sample rate

      labels.push(
        <SvgText
          key={i}
          x={x}
          y={height - 5}
          fontSize="10"
          fill={colors.text}
          textAnchor="middle"
          opacity={0.7}
        >
          {frequency < 1000
            ? `${frequency}Hz`
            : `${(frequency / 1000).toFixed(1)}kHz`}
        </SvgText>
      );
    }

    return labels;
  };

  // Generate amplitude labels
  const generateAmplitudeLabels = () => {
    if (!showAmplitudeLabels) return null;

    const labels = [];
    const labelCount = 4;
    const step = (height - 40) / labelCount;

    for (let i = 0; i <= labelCount; i++) {
      const y = height - 20 - i * step;
      const amplitude = ((i / labelCount) * 100).toFixed(0);

      labels.push(
        <SvgText
          key={i}
          x={5}
          y={y + 3}
          fontSize="10"
          fill={colors.text}
          textAnchor="start"
          opacity={0.7}
        >
          {amplitude}%
        </SvgText>
      );
    }

    return labels;
  };

  // Render connection status
  const renderConnectionStatus = () => {
    let statusText = "";
    let statusColor = colors.text;

    if (!isConnected) {
      statusText = "Disconnected";
      statusColor = "#FF6B6B";
    } else if (!isAuthenticated) {
      statusText = "Connecting...";
      statusColor = "#FFE66D";
    } else if (isReceivingData) {
      statusText = "Receiving Audio Data";
      statusColor = colors.secondary;
    } else {
      statusText = "Connected - No Audio Stream";
      statusColor = "#FFA500";
    }

    return (
      <View style={styles.statusContainer}>
        <View
          style={[styles.statusIndicator, { backgroundColor: statusColor }]}
        />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {/* <Text style={[styles.title, { color: colors.text }]}>
          Audio Spectral Analyzer
        </Text> */}
        {renderConnectionStatus()}
      </View>

      <View style={styles.visualizerContainer}>
        {!isReceivingData ? (
          <Animated.View
            style={[
              styles.noDataContainer,
              {
                opacity: pulseAnimation,
                transform: [
                  {
                    scale: pulseAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1.05],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={[styles.noDataText, { color: colors.text }]}>
              {!isConnected
                ? "WebSocket Disconnected"
                : !isAuthenticated
                ? "Authenticating..."
                : "No Audio Stream"}
            </Text>
            <Text style={[styles.noDataSubtext, { color: colors.text }]}>
              {!isConnected
                ? "Check your connection"
                : !isAuthenticated
                ? "Please wait..."
                : "Waiting for audio data from ESP32"}
            </Text>
          </Animated.View>
        ) : (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient
                id="spectralGradient"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <Stop offset="0%" stopColor={colors.gradient[0]} />
                <Stop offset="50%" stopColor={colors.gradient[1]} />
                <Stop offset="100%" stopColor={colors.gradient[2]} />
              </LinearGradient>
            </Defs>

            {/* Grid lines */}
            {[...Array(5)].map((_, i) => (
              <Line
                key={`grid-${i}`}
                x1={0}
                y1={20 + (i * (height - 40)) / 4}
                x2={width}
                y2={20 + (i * (height - 40)) / 4}
                stroke={colors.grid}
                strokeWidth={0.5}
                opacity={0.3}
              />
            ))}

            {/* Spectral bars */}
            {spectralData.map((value, index) => {
              const barWidth = width / barCount;
              const x = index * barWidth;
              const barHeight = Math.max(0, value * (height - 40));
              const y = height - barHeight - 20;

              return (
                <Rect
                  key={index}
                  x={x}
                  y={y}
                  width={Math.max(0, barWidth - 1)}
                  height={barHeight}
                  fill="url(#spectralGradient)"
                  opacity={0.8}
                />
              );
            })}

            {/* Labels */}
            {generateFrequencyLabels()}
            {generateAmplitudeLabels()}
          </Svg>
        )}
      </View>

      {lastDataTimestamp && (
        <Text style={[styles.timestamp, { color: colors.text }]}>
          Last data: {lastDataTimestamp.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  visualizerContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  noDataSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  timestamp: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
});

export default AudioSpectralVisualizer;
