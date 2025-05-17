import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import API_BASE_URL from "../config";

const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get token from Redux auth state
  const token = useSelector((state) => state.auth.token);

  // Create Axios instance with auth token
  const axiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });

  const fetchReminders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/reminders");

      setReminders(
        Array.isArray(response?.data?.data) ? response?.data?.data : []
      );
    } catch (err) {
      // setReminders([]);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch reminders"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createReminder = async (reminderData) => {
    try {
      const response = await axiosInstance.post("/reminders", reminderData);
      setReminders((prev) =>
        Array.isArray(prev) ? [...prev, response.data] : [response.data]
      );
      return response.data;
    } catch (err) {
      throw (
        err.response?.data?.message ||
        err.message ||
        "Failed to create reminder"
      );
    }
  };

  const updateReminder = async (id, updateData) => {
    try {
      const response = await axiosInstance.patch(
        `/reminders/${id}`,
        updateData
      );
      setReminders((prev) =>
        Array.isArray(prev)
          ? prev.map((r) => (r._id === id ? response.data : r))
          : []
      );
      return response.data;
    } catch (err) {
      throw (
        err.response?.data?.message ||
        err.message ||
        "Failed to update reminder"
      );
    }
  };

  const cancelReminder = async (id) => {
    try {
      await axiosInstance.delete(`/reminders/${id}`);
      setReminders((prev) =>
        Array.isArray(prev) ? prev.filter((r) => r._id !== id) : []
      );
    } catch (err) {
      throw (
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel reminder"
      );
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <ReminderContext.Provider
      value={{
        reminders: Array.isArray(reminders) ? reminders : [],
        isLoading,
        error,
        fetchReminders,
        createReminder,
        updateReminder,
        cancelReminder,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminders must be used within a ReminderProvider");
  }
  return {
    ...context,
    reminders: Array.isArray(context.reminders) ? context.reminders : [],
  };
};
