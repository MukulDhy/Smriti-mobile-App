import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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
  const authTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const messageQueue = useRef([]);

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

  // Main connection handler
  useEffect(() => {
    if (userToken) {
      connectWebSocket();
    }

    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
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

    // Set authentication timeout (8 seconds)
    authTimeoutRef.current = setTimeout(() => {
      if (!isAuthenticated) {
        console.log("Authentication timeout - closing connection");
        ws.close(1008, "Authentication timeout");
      }
    }, 8000);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      console.log("WebSocket connected, waiting for authentication...");

      // Process any queued messages
      flushMessageQueue();
    };

    ws.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data);

        if (
          message.type === "connection" &&
          message.status === "authenticated"
        ) {
          clearTimeout(authTimeoutRef.current);
          setIsAuthenticated(true);
          console.log("WebSocket authenticated successfully");
          return;
        }

        if (message.type === "pong") {
          console.log("Heartbeat acknowledged");
          return;
        }

        handleIncomingMessage(message);
      } catch (err) {
        console.error("Message parse error:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e.message);
    };

    ws.onclose = (e) => {
      clearTimeout(authTimeoutRef.current);
      setIsConnected(false);
      setIsAuthenticated(false);
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

  const flushMessageQueue = () => {
    if (socket?.readyState === WebSocket.OPEN && isAuthenticated) {
      while (messageQueue.current.length > 0) {
        const message = messageQueue.current.shift();
        socket.send(JSON.stringify(message));
      }
    }
  };

  const handleIncomingMessage = (message) => {
    switch (message.type) {
      case "startRecording":
        Alert.alert(
          "Recording Triggered",
          "Starting voice recording as requested",
          [{ text: "OK" }]
        );
        break;
      default:
        console.log("Received message:", message);
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
      return false;
    }
  };

  const registerUser = (userId) => {
    return sendMessage({
      type: "registerUser",
      userId,
    });
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        isAuthenticated,
        sendMessage,
        registerUser,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
