import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API_BASE_URL from "../../config";
import { makeApiRequest } from "../../utils/api-error-utils";
import { useSelector } from "react-redux";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const ReminderForm = ({ onSubmit, initialValues }) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [date, setDate] = useState(
    initialValues?.scheduledTime
      ? new Date(initialValues.scheduledTime)
      : new Date()
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useSelector((state) => state.auth?.token);
  const patientId = useSelector((state) => state.auth.user?.patient);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    if (selectedDate <= new Date()) {
      Alert.alert("Invalid Date", "Please select a future date and time");
      return;
    }
    setDate(selectedDate);
    hideDatePicker();
  };

  const handleSet3MinutesLater = () => {
    const now = new Date();
    const threeMinutesLater = new Date(now.getTime() + 3 * 60000);
    setDate(threeMinutesLater);
    Alert.alert("Reminder Set", "Reminder scheduled for 3 minutes from now");
  };

  const handleSubmit = async () => {
    if (!title || !date) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const reminderData = {
      title,
      description,
      scheduledTime: date.toISOString(),
      patientId: patientId,
    };

    setIsSubmitting(true);

    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reminderData),
      };

      makeApiRequest(
        `${API_BASE_URL}/api/reminders/add`,
        options,
        (data) => {
          onSubmit(data);
          Alert.alert("Success", "Reminder set successfully!");
        },
        (errorMessage) => {
          Alert.alert("Error", errorMessage);
        }
      );
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reminder Title</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="pencil"
              size={20}
              color="#6c5ce7"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter reminder title"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="document-text"
              size={20}
              color="#6c5ce7"
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor="#999"
              multiline
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date & Time</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={showDatePicker}
          >
            <Ionicons
              name="calendar"
              size={20}
              color="#6c5ce7"
              style={styles.icon}
            />
            <Text style={styles.dateText}>
              {date.toLocaleString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={date}
          minimumDate={new Date()}
          accentColor="#6c5ce7"
          textColor="#000"
        />

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleSet3MinutesLater}
          >
            <Ionicons name="time" size={18} color="#fff" />
            <Text style={styles.quickActionText}>3 Minutes Later</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: "#00b894" }]}
            onPress={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(9, 0, 0, 0);
              setDate(tomorrow);
            }}
          >
            <Ionicons name="sunny" size={18} color="#fff" />
            <Text style={styles.quickActionText}>Tomorrow AM</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !title || !date}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting
              ? "Processing..."
              : initialValues
              ? "Update Reminder"
              : "Add Reminder"}
          </Text>
          <Ionicons
            name="add-circle"
            size={22}
            color="#fff"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#f9f9f9",
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  multiline: {
    height: 100,
    paddingTop: 15,
    textAlignVertical: "top",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6c5ce7",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: "48%",
    justifyContent: "center",
  },
  quickActionText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6c5ce7",
    borderRadius: 12,
    padding: 18,
    marginTop: 10,
    shadowColor: "#6c5ce7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#a29bfe",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 10,
  },
});

export default ReminderForm;
