import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/reminders");
      setReminders(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createReminder = async (reminderData) => {
    try {
      const response = await api.post("/reminders", reminderData);
      setReminders((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || err.message;
    }
  };

  const updateReminder = async (id, updateData) => {
    try {
      const response = await api.patch(`/reminders/${id}`, updateData);
      setReminders((prev) =>
        prev.map((r) => (r._id === id ? response.data : r))
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || err.message;
    }
  };

  const cancelReminder = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      throw err.response?.data?.message || err.message;
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <ReminderContext.Provider
      value={{
        reminders,
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

export const useReminders = () => useContext(ReminderContext);
