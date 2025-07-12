import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Alert } from "react-native";
import { WS_URL } from "../utils/constants.js";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [audioStreamActive, setAudioStreamActive] = useState(false);
  const [esp32Status, setEsp32Status] = useState("disconnected");

  // Refs for managing timeouts and reconnection
  const authTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const audioTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const messageQueue = useRef([]);

  // Audio data handlers
  const audioDataListeners = useRef(new Set());
  const messageListeners = useRef(new Set());

  // Subscribe to audio data
  const subscribeToAudioData = useCallback((callback) => {
    audioDataListeners.current.add(callback);
    return () => audioDataListeners.current.delete(callback);
  }, []);

  // Subscribe to specific message types
  const subscribeToMessages = useCallback((callback) => {
    messageListeners.current.add(callback);
    return () => messageListeners.current.delete(callback);
  }, []);

  // Heartbeat system
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        isConnected &&
        isAuthenticated &&
        socket?.readyState === WebSocket.OPEN
      ) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [isConnected, isAuthenticated, socket]);

  // Audio stream timeout detection
  useEffect(() => {
    if (audioStreamActive) {
      // Clear existing timeout
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }

      // Set timeout to detect when audio stream stops
      audioTimeoutRef.current = setTimeout(() => {
        setAudioStreamActive(false);
        console.log("Audio stream timeout - no data received for 3 seconds");
      }, 3000);
    }

    return () => {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
    };
  }, [audioStreamActive]);

  // Main connection handler
  useEffect(() => {
    if (userToken) {
      connectWebSocket();
    }

    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [userToken]);

  const connectWebSocket = () => {
    if (!userToken) {
      console.error("No token available for WebSocket connection");
      return;
    }

    // Clean up previous connection if exists
    if (socket) {
      socket.close();
    }

    const ws = new WebSocket(
      `${WS_URL}?token=${encodeURIComponent(userToken)}`
    );

    // Set binary type to handle audio data properly
    ws.binaryType = "arraybuffer";

    // Set authentication timeout (8 seconds)
    authTimeoutRef.current = setTimeout(() => {
      if (!isAuthenticated) {
        console.log("Authentication timeout - closing connection");
        ws.close(1008, "Authentication timeout");
      }
    }, 8000);

    ws.onopen = () => {
      setIsConnected(true);
      setEsp32Status("connected");
      reconnectAttemptsRef.current = 0;
      console.log("WebSocket connected, waiting for authentication...");

      // Process any queued messages
      flushMessageQueue();
    };

    ws.onmessage = (e) => {
      try {
        // Handle binary audio data (if sent directly as ArrayBuffer)
        if (e.data instanceof ArrayBuffer) {
          handleBinaryAudioData(e.data);
          return;
        }

        // Handle JSON messages (which is what your backend is sending)
        const message = JSON.parse(e.data);
        handleJSONMessage(message);
      } catch (err) {
        console.error("Message parse error:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e.message);
      setEsp32Status("error");
    };

    ws.onclose = (e) => {
      clearTimeout(authTimeoutRef.current);
      setIsConnected(false);
      setIsAuthenticated(false);
      setAudioStreamActive(false);
      setEsp32Status("disconnected");
      console.log(`Disconnected: ${e.code} ${e.reason}`);

      if (
        e.code !== 1008 &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        const delay = Math.min(
          3000 * (reconnectAttemptsRef.current + 1),
          30000
        );
        reconnectAttemptsRef.current++;
        console.log(
          `Reconnecting attempt ${reconnectAttemptsRef.current} in ${delay}ms`
        );
        setTimeout(connectWebSocket, delay);
      }
    };

    setSocket(ws);
  };

  const handleBinaryAudioData = (arrayBuffer) => {
    // Mark audio stream as active
    setAudioStreamActive(true);

    // Reset audio timeout
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    audioTimeoutRef.current = setTimeout(() => {
      setAudioStreamActive(false);
    }, 3000);

    // Notify all audio data listeners
    audioDataListeners.current.forEach((callback) => {
      try {
        callback(arrayBuffer);
      } catch (error) {
        console.error("Error in audio data listener:", error);
      }
    });
  };

  const handleJSONMessage = (message) => {
    // Handle authentication and system messages first
    if (message.type === "connection" && message.status === "authenticated") {
      clearTimeout(authTimeoutRef.current);
      setIsAuthenticated(true);
      console.log("WebSocket authenticated successfully");
      return;
    }

    if (message.type === "pong") {
      console.log("Heartbeat acknowledged");
      return;
    }

    // Handle audio data messages from backend
    if (message.type === "audio-data" && message.data) {
      try {
        // Convert base64 to ArrayBuffer
        const base64Data = message.data;
        const binaryString = atob(base64Data);

        // Ensure even number of bytes for 16-bit audio data
        const paddedLength =
          binaryString.length % 2 === 0
            ? binaryString.length
            : binaryString.length + 1;
        const bytes = new Uint8Array(paddedLength);

        // Copy the binary data
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Pad with zero if odd length
        if (binaryString.length % 2 !== 0) {
          bytes[binaryString.length] = 0;
        }

        // Handle as binary audio data
        handleBinaryAudioData(bytes.buffer);
        return;
      } catch (error) {
        console.error("Error decoding base64 audio data:", error);
        return;
      }
    }
    console.log(message);
    // Handle ESP32 specific messages
    switch (message.type) {
      case "esp32Status":
        setEsp32Status(message.status || "unknown");
        break;

      case "deviceInfo":
        console.log("ESP32 Device Info:", message);
        break;

      case "audioSettings":
        console.log("ESP32 Audio Settings:", message.settings);
        break;

      case "recordingStatus":
        console.log("ESP32 Recording Status:", message.isRecording);
        break;

      case "startRecording":
        Alert.alert(
          "Recording Triggered",
          "Starting voice recording as requested",
          [{ text: "OK" }]
        );
        break;

      case "error":
        console.error("ESP32 Error:", message.error);
        Alert.alert("ESP32 Error", message.error || "Unknown error occurred");
        break;

      default:
        console.log("Received message:", message);
    }

    // Notify all message listeners
    messageListeners.current.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("Error in message listener:", error);
      }
    });
  };

  const flushMessageQueue = () => {
    if (socket?.readyState === WebSocket.OPEN && isAuthenticated) {
      while (messageQueue.current.length > 0) {
        const message = messageQueue.current.shift();
        socket.send(JSON.stringify(message));
      }
    }
  };

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN && isAuthenticated) {
      try {
        socket.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error("Failed to send message:", err);
        return false;
      }
    } else {
      // Queue the message if not ready
      messageQueue.current.push(message);
      console.log("Message queued:", message.type);
      return false;
    }
  };

  // ESP32 Control Functions
  const startRecording = (settings = {}) => {
    return sendMessage({
      type: "startRecording",
      settings: {
        duration: 0, // Continuous
        quality: "high",
        ...settings,
      },
    });
  };

  const stopRecording = () => {
    return sendMessage({
      type: "stopRecording",
    });
  };

  const getDeviceInfo = () => {
    return sendMessage({
      type: "getDeviceInfo",
    });
  };

  const updateAudioSettings = (settings) => {
    return sendMessage({
      type: "updateAudioSettings",
      settings,
    });
  };

  const requestAudioStream = (enable = true) => {
    return sendMessage({
      type: "audioStream",
      enable,
    });
  };

  // Reconnect manually
  const reconnect = () => {
    if (socket) {
      socket.close();
    }
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  };

  // Get connection statistics
  const getConnectionStats = () => {
    return {
      isConnected,
      isAuthenticated,
      audioStreamActive,
      esp32Status,
      reconnectAttempts: reconnectAttemptsRef.current,
      queuedMessages: messageQueue.current.length,
      readyState: socket?.readyState || WebSocket.CLOSED,
    };
  };

  return (
    <WebSocketContext.Provider
      value={{
        // Connection state
        socket,
        isConnected,
        isAuthenticated,
        audioStreamActive,
        esp32Status,

        // Core functions
        sendMessage,
        reconnect,

        // ESP32 controls
        startRecording,
        stopRecording,
        getDeviceInfo,
        updateAudioSettings,
        requestAudioStream,

        // Subscription functions
        subscribeToAudioData,
        subscribeToMessages,

        // Utilities
        getConnectionStats,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
