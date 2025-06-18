import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Audio } from "expo-av";

const LiveAudioPlayer = ({
  socket,
  isConnected,
  audioSettings = { sampleRate: 16000, bitDepth: 16, channels: 1 },
  style,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [bufferHealth, setBufferHealth] = useState(100);

  // Audio context and buffer management
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const audioBufferQueue = useRef([]);
  const isPlayingRef = useRef(false);
  const nextPlayTime = useRef(0);

  // Audio processing
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize Audio Context
  const initializeAudioContext = useCallback(async () => {
    try {
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Audio permissions are required to play live audio"
        );
        return false;
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Create Web Audio Context (for web compatibility)
      if (Platform.OS === "web") {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();

        // Create audio nodes
        gainNodeRef.current = audioContextRef.current.createGain();
        analyserNodeRef.current = audioContextRef.current.createAnalyser();

        // Connect nodes
        gainNodeRef.current.connect(analyserNodeRef.current);
        analyserNodeRef.current.connect(audioContextRef.current.destination);

        // Configure analyser
        analyserNodeRef.current.fftSize = 256;
        dataArrayRef.current = new Uint8Array(
          analyserNodeRef.current.frequencyBinCount
        );

        console.log("Web Audio Context initialized");
      }

      return true;
    } catch (error) {
      console.error("Error initializing audio context:", error);
      Alert.alert("Audio Error", "Failed to initialize audio system");
      return false;
    }
  }, []);

  // Decode base64 audio data to PCM
  const decodeAudioData = useCallback(
    (base64Data) => {
      try {
        // Decode base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Ensure buffer size is aligned for 16-bit samples
        const { bitDepth } = audioSettings;
        const bytesPerSample = bitDepth / 8;
        const alignedLength =
          Math.floor(bytes.length / bytesPerSample) * bytesPerSample;

        if (alignedLength === 0) {
          console.warn("Audio buffer too small after alignment");
          return null;
        }

        // Create aligned buffer
        const alignedBytes = bytes.slice(0, alignedLength);

        let samples;
        if (bitDepth === 16) {
          // Convert to 16-bit signed PCM samples
          samples = new Int16Array(
            alignedBytes.buffer,
            alignedBytes.byteOffset,
            alignedLength / 2
          );
        } else if (bitDepth === 8) {
          // Convert to 8-bit unsigned PCM samples
          const int8Samples = new Int8Array(
            alignedBytes.buffer,
            alignedBytes.byteOffset,
            alignedLength
          );
          samples = new Int16Array(int8Samples.length);
          for (let i = 0; i < int8Samples.length; i++) {
            samples[i] = (int8Samples[i] - 128) * 256; // Convert to 16-bit range
          }
        } else {
          console.error("Unsupported bit depth:", bitDepth);
          return null;
        }

        // Convert to float32 for Web Audio API
        const floatSamples = new Float32Array(samples.length);
        for (let i = 0; i < samples.length; i++) {
          floatSamples[i] = Math.max(-1, Math.min(1, samples[i] / 32768.0)); // Normalize and clamp
        }

        return floatSamples;
      } catch (error) {
        console.error("Error decoding audio data:", error, {
          dataLength: base64Data?.length,
          audioSettings,
        });
        return null;
      }
    },
    [audioSettings]
  );

  // Create audio buffer from PCM data
  const createAudioBuffer = useCallback(
    (pcmData) => {
      if (!audioContextRef.current || !pcmData) return null;

      try {
        const { sampleRate, channels } = audioSettings;
        const buffer = audioContextRef.current.createBuffer(
          channels,
          pcmData.length / channels,
          sampleRate
        );

        // Fill buffer with PCM data
        for (let channel = 0; channel < channels; channel++) {
          const channelData = buffer.getChannelData(channel);
          for (let i = 0; i < channelData.length; i++) {
            channelData[i] = pcmData[i * channels + channel] || 0;
          }
        }

        return buffer;
      } catch (error) {
        console.error("Error creating audio buffer:", error);
        return null;
      }
    },
    [audioSettings]
  );

  // Play audio buffer
  const playAudioBuffer = useCallback((audioBuffer) => {
    if (!audioContextRef.current || !audioBuffer || !isPlayingRef.current)
      return;

    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNodeRef.current);

      // Calculate when to start this buffer
      const currentTime = audioContextRef.current.currentTime;
      const startTime = Math.max(currentTime, nextPlayTime.current);

      source.start(startTime);

      // Update next play time
      nextPlayTime.current = startTime + audioBuffer.duration;

      // Clean up after playback
      source.onended = () => {
        source.disconnect();
      };
    } catch (error) {
      console.error("Error playing audio buffer:", error);
    }
  }, []);

  // Process incoming audio data
  const processAudioData = useCallback(
    (audioData) => {
      if (!isPlayingRef.current) return;

      // Validate input data
      if (!audioData || typeof audioData !== "string") {
        console.warn("Invalid audio data received:", typeof audioData);
        return;
      }

      const pcmData = decodeAudioData(audioData);
      if (!pcmData || pcmData.length === 0) {
        console.warn("Failed to decode audio data or empty result");
        return;
      }

      if (Platform.OS === "web" && audioContextRef.current) {
        const audioBuffer = createAudioBuffer(pcmData);
        if (audioBuffer) {
          audioBufferQueue.current.push(audioBuffer);

          // Play immediately if queue was empty
          if (audioBufferQueue.current.length === 1) {
            const buffer = audioBufferQueue.current.shift();
            playAudioBuffer(buffer);
          }

          // Update buffer health (limit queue size to prevent memory issues)
          if (audioBufferQueue.current.length > 10) {
            audioBufferQueue.current.shift(); // Remove oldest buffer
          }
          setBufferHealth(Math.min(100, audioBufferQueue.current.length * 10));
        }
      } else if (Platform.OS !== "web") {
        // For mobile platforms, you might want to implement a different approach
        // using Expo Audio or react-native-sound
        console.log("Mobile audio playback not yet implemented");
      }
    },
    [decodeAudioData, createAudioBuffer, playAudioBuffer]
  );

  // Audio level monitoring
  const updateAudioLevel = useCallback(() => {
    if (
      !analyserNodeRef.current ||
      !dataArrayRef.current ||
      !isPlayingRef.current
    )
      return;

    analyserNodeRef.current.getByteFrequencyData(dataArrayRef.current);

    // Calculate average level
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    setAudioLevel(Math.round((average / 255) * 100));

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  // WebSocket message handler
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessage = (event) => {
      try {
        // Handle binary data directly
        if (event.data instanceof ArrayBuffer) {
          // Convert ArrayBuffer to base64
          const uint8Array = new Uint8Array(event.data);
          let binaryString = "";
          for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
          }
          const base64Data = btoa(binaryString);
          processAudioData(base64Data);
          return;
        }

        // Handle Blob data
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
              const uint8Array = new Uint8Array(reader.result);
              let binaryString = "";
              for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
              }
              const base64Data = btoa(binaryString);
              processAudioData(base64Data);
            }
          };
          reader.readAsArrayBuffer(event.data);
          return;
        }

        // Handle JSON messages
        if (typeof event.data === "string") {
          let message;
          try {
            message = JSON.parse(event.data);
          } catch (e) {
            // Not JSON, might be raw base64 data
            if (
              event.data.length > 100 &&
              /^[A-Za-z0-9+/]*={0,2}$/.test(event.data)
            ) {
              processAudioData(event.data);
            }
            return;
          }

          if (message.type === "audio-data" && message.data) {
            processAudioData(message.data);
          }
        }
      } catch (error) {
        console.error("Error handling audio message:", error, {
          dataType: typeof event.data,
          dataLength: event.data?.length || 0,
        });
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, isConnected, processAudioData]);

  // Start playing
  const startPlaying = async () => {
    const initialized = await initializeAudioContext();
    if (!initialized) return;

    try {
      if (
        Platform.OS === "web" &&
        audioContextRef.current?.state === "suspended"
      ) {
        await audioContextRef.current.resume();
      }

      setIsPlaying(true);
      setIsBuffering(true);
      isPlayingRef.current = true;
      nextPlayTime.current = audioContextRef.current?.currentTime || 0;

      // Start audio level monitoring
      if (Platform.OS === "web") {
        updateAudioLevel();
      }

      // Clear buffering state after a moment
      setTimeout(() => setIsBuffering(false), 1000);
    } catch (error) {
      console.error("Error starting playback:", error);
      Alert.alert("Playback Error", "Failed to start audio playback");
    }
  };

  // Stop playing
  const stopPlaying = () => {
    setIsPlaying(false);
    setIsBuffering(false);
    isPlayingRef.current = false;
    setAudioLevel(0);

    // Clear audio buffer queue
    audioBufferQueue.current = [];

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop current source
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
      sourceNodeRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlaying();

      if (audioContextRef.current && Platform.OS === "web") {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Volume control
  const setVolume = (volume) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Audio Player</Text>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? "#4CAF50" : "#F44336" },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? "Connected" : "Disconnected"}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.playButton,
            isPlaying ? styles.stopButton : styles.startButton,
            !isConnected && styles.disabledButton,
          ]}
          onPress={isPlaying ? stopPlaying : startPlaying}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>
            {isBuffering ? "Buffering..." : isPlaying ? "Stop" : "Play Live"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.visualizer}>
        <View style={styles.levelMeter}>
          <Text style={styles.levelLabel}>Audio Level</Text>
          <View style={styles.levelBar}>
            <View style={[styles.levelFill, { width: `${audioLevel}%` }]} />
          </View>
          <Text style={styles.levelValue}>{audioLevel}%</Text>
        </View>

        <View style={styles.bufferInfo}>
          <Text style={styles.bufferLabel}>Buffer Health</Text>
          <View style={styles.bufferBar}>
            <View
              style={[
                styles.bufferFill,
                {
                  width: `${bufferHealth}%`,
                  backgroundColor:
                    bufferHealth > 50
                      ? "#4CAF50"
                      : bufferHealth > 25
                      ? "#FF9800"
                      : "#F44336",
                },
              ]}
            />
          </View>
          <Text style={styles.bufferValue}>{bufferHealth}%</Text>
        </View>
      </View>

      <View style={styles.audioInfo}>
        <Text style={styles.infoText}>
          Sample Rate: {audioSettings.sampleRate} Hz
        </Text>
        <Text style={styles.infoText}>
          Channels: {audioSettings.channels === 1 ? "Mono" : "Stereo"}
        </Text>
        <Text style={styles.infoText}>
          Bit Depth: {audioSettings.bitDepth} bit
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
    color: "#FFFFFF",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#B0B0B0",
  },
  controls: {
    alignItems: "center",
    marginBottom: 20,
  },
  playButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#F44336",
  },
  disabledButton: {
    backgroundColor: "#424242",
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  visualizer: {
    marginBottom: 16,
  },
  levelMeter: {
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  levelBar: {
    height: 8,
    backgroundColor: "#333333",
    borderRadius: 4,
    overflow: "hidden",
  },
  levelFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  levelValue: {
    fontSize: 12,
    color: "#B0B0B0",
    textAlign: "right",
    marginTop: 2,
  },
  bufferInfo: {
    marginBottom: 8,
  },
  bufferLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bufferBar: {
    height: 6,
    backgroundColor: "#333333",
    borderRadius: 3,
    overflow: "hidden",
  },
  bufferFill: {
    height: "100%",
    borderRadius: 3,
  },
  bufferValue: {
    fontSize: 12,
    color: "#B0B0B0",
    textAlign: "right",
    marginTop: 2,
  },
  audioInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  infoText: {
    fontSize: 12,
    color: "#B0B0B0",
    marginBottom: 2,
  },
});

export default LiveAudioPlayer;
