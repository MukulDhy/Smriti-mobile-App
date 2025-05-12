import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView
} from "react-native";

const ReminderScreen = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDateModal, setShowDateModal] = useState(false);

  // Temporary fields to pick date/time manually
  const [tempDate, setTempDate] = useState(new Date());

  const handleSetReminder = () => {
    setReminderDate(tempDate);
    setShowDateModal(false);
  };

  const renderNumberPicker = (min, max, value, onChange) => {
    const items = [];
    for (let i = min; i <= max; i++) {
      items.push(
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={[styles.pickerItem, value === i && styles.selectedItem]}>
            {i.toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>
      );
    }
    return <ScrollView>{items}</ScrollView>;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Reminder</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reminder Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
          placeholderTextColor="#A9A9A9"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          placeholderTextColor="#A9A9A9"
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date & Time</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => {
          setTempDate(new Date(reminderDate)); // clone
          setShowDateModal(true);
        }}>
          <Text style={styles.dateButtonText}>{reminderDate.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL for picking date and time */}
      <Modal visible={showDateModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date & Time</Text>

            <View style={styles.pickerRow}>
              {renderNumberPicker(1, 31, tempDate.getDate(), (val) =>
                setTempDate((prev) => new Date(prev.setDate(val)))
              )}
              {renderNumberPicker(0, 11, tempDate.getMonth(), (val) =>
                setTempDate((prev) => new Date(prev.setMonth(val)))
              )}
              {renderNumberPicker(2024, 2030, tempDate.getFullYear(), (val) =>
                setTempDate((prev) => new Date(prev.setFullYear(val)))
              )}
            </View>

            <View style={styles.pickerRow}>
              {renderNumberPicker(0, 23, tempDate.getHours(), (val) =>
                setTempDate((prev) => new Date(prev.setHours(val)))
              )}
              {renderNumberPicker(0, 59, tempDate.getMinutes(), (val) =>
                setTempDate((prev) => new Date(prev.setMinutes(val)))
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowDateModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSetReminder} style={styles.setButton}>
                <Text style={styles.setText}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.createButton} onPress={() => console.log({ title, description, reminderDate })}>
        <Text style={styles.createButtonText}>Create Reminder</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReminderScreen;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1B2A",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "white",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#1B263B",
    color: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "#1B263B",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  dateButtonText: {
    color: "white",
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#415A77",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#1B263B",
    margin: 30,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 120,
    marginBottom: 10,
  },
  pickerItem: {
    color: "#ccc",
    fontSize: 18,
    textAlign: "center",
    paddingVertical: 5,
  },
  selectedItem: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: "#6c757d",
    borderRadius: 6,
  },
  setButton: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
  setText: {
    color: "white",
    fontWeight: "bold",
  },
});
