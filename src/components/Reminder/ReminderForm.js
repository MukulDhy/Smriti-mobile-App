import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import API_BASE_URL from "../../config";
import { makeApiRequest } from "../../utils/api-error-utils";
import { useSelector } from "react-redux";
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
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const handleSet3MinutesLater = () => {
    const now = new Date();
    const threeMinutesLater = new Date(now.getTime() + 3 * 60000);
    setDate(threeMinutesLater);
    setTempDate(threeMinutesLater);
    Alert.alert("Reminder Set", "Reminder scheduled for 3 minutes from now");
  };

  const showDatepicker = () => {
    setTempDate(date);
    setShowModal(true);
  };

  const handleDateChange = (field, value) => {
    const newDate = new Date(tempDate);
    if (field === "hours") newDate.setHours(value);
    if (field === "minutes") newDate.setMinutes(value);
    if (field === "date") newDate.setDate(value);
    if (field === "month") newDate.setMonth(value);
    if (field === "year") newDate.setFullYear(value);
    setTempDate(newDate);
  };

  const confirmDate = () => {
    if (tempDate <= new Date()) {
      Alert.alert("Invalid Date", "Please select a future date and time");
      return;
    }
    setDate(tempDate);
    setShowModal(false);
  };
  const token = useSelector((state) => state.auth?.token); // ✅ Getting token from Redux
  const patientId = useSelector((state) => state.auth.user?.patient);

  const handleSubmit = async () => {
    console.log(token);
    if (!title || !date) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    console.log("adhwakjhdk");

    const reminderData = {
      title,
      description,
      scheduledTime: date.toISOString(),
      patientId: patientId,
    };

    // setIsSubmitting(true);
    console.log(reminderData);
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Backend expects this format
        },
        body: JSON.stringify(reminderData),
      };

      makeApiRequest(
        `${API_BASE_URL}/api/reminders/add`,
        options,
        (data) => {
          onSubmit(data);
          console.log("Successfully Reminder Set:", data);
          Alert.alert("Success", "Reminder set successfully!");
        },
        (errorMessage) => {
          console.log("Error occurred in the Reminder posting");
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
    <View style={styles.container}>
      <Text style={styles.label}>Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter reminder title"
      />

      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />

      <Text style={styles.label}>Date & Time:</Text>
      <Text style={styles.dateText}>{date.toLocaleString()}</Text>

      <View style={styles.buttonGroup}>
        <Button title="Set Date/Time" onPress={showDatepicker} />
        <View style={styles.buttonSpacer} />
        <Button
          title="Set 3 Minutes Later"
          onPress={handleSet3MinutesLater}
          color="#4CAF50"
        />
      </View>

      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date and Time</Text>

            <View style={styles.dateInputContainer}>
              <Text>Date:</Text>
              <View style={styles.dateInputRow}>
                <TextInput
                  style={styles.dateInput}
                  value={tempDate.getDate().toString()}
                  onChangeText={(val) =>
                    handleDateChange("date", parseInt(val) || 1)
                  }
                  keyboardType="numeric"
                />
                <Text>/</Text>
                <TextInput
                  style={styles.dateInput}
                  value={(tempDate.getMonth() + 1).toString()}
                  onChangeText={(val) =>
                    handleDateChange("month", (parseInt(val) || 1) - 1)
                  }
                  keyboardType="numeric"
                />
                <Text>/</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempDate.getFullYear().toString()}
                  onChangeText={(val) =>
                    handleDateChange("year", parseInt(val) || 2023)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.dateInputContainer}>
              <Text>Time:</Text>
              <View style={styles.dateInputRow}>
                <TextInput
                  style={styles.dateInput}
                  value={tempDate.getHours().toString()}
                  onChangeText={(val) =>
                    handleDateChange("hours", parseInt(val) || 0)
                  }
                  keyboardType="numeric"
                />
                <Text>:</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempDate.getMinutes().toString()}
                  onChangeText={(val) =>
                    handleDateChange("minutes", parseInt(val) || 0)
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <Button title="Cancel" onPress={() => setShowModal(false)} />
              <View style={styles.buttonSpacer} />
              <Button title="Confirm" onPress={confirmDate} />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.button}>
        <Button
          title={initialValues ? "Update Reminder" : "Add Reminder"}
          onPress={handleSubmit}
          disabled={isSubmitting || !title || !date}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  multiline: {
    minHeight: 80,
  },
  button: {
    marginTop: 20,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 16,
    padding: 8,
  },
  buttonGroup: {
    flexDirection: "row",
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  dateInputContainer: {
    marginBottom: 15,
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginHorizontal: 5,
    width: 50,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});

export default ReminderForm;

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useReminders } from "../../contexts/ReminderContext";

// const ReminderForm = ({ onSubmit, initialValues }) => {
//   const [title, setTitle] = useState(initialValues?.title || "");
//   const [description, setDescription] = useState(
//     initialValues?.description || ""
//   );
//   const [date, setDate] = useState(
//     initialValues?.scheduledTime
//       ? new Date(initialValues.scheduledTime)
//       : new Date()
//   );
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const { createReminder, updateReminder } = useReminders();

//   const handleDateChange = (event, selectedDate) => {
//     // Always hide the picker first to avoid Android issues
//     setShowDatePicker(Platform.OS === "ios"); // Keep open on iOS, close on Android

//     if (selectedDate) {
//       // Prevent selecting past dates
//       const now = new Date();
//       if (selectedDate >= now) {
//         setDate(selectedDate);
//       } else {
//         alert("Please select a future date and time");
//       }
//     }
//   };

//   const handleSubmit = async () => {
//     const reminderData = {
//       title,
//       description,
//       scheduledTime: date.toISOString(),
//     };

//     try {
//       if (initialValues?._id) {
//         await updateReminder(initialValues._id, reminderData);
//       } else {
//         await createReminder(reminderData);
//       }
//       onSubmit();
//     } catch (error) {
//       alert(error.message || "An error occurred");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>Title:</Text>
//       <TextInput
//         style={styles.input}
//         value={title}
//         onChangeText={setTitle}
//         placeholder="Enter reminder title"
//       />

//       <Text style={styles.label}>Description:</Text>
//       <TextInput
//         style={[styles.input, styles.multiline]}
//         value={description}
//         onChangeText={setDescription}
//         placeholder="Enter description"
//         multiline
//       />

//       <Text style={styles.label}>Date & Time:</Text>
//       <Button
//         title={date.toLocaleString()}
//         onPress={() => setShowDatePicker(true)}
//       />

//       {showDatePicker && (
//         <DateTimePicker
//           value={date}
//           mode="datetime"
//           display={Platform.OS === "ios" ? "spinner" : "default"}
//           onChange={handleDateChange}
//           minimumDate={new Date()} // This disables past dates
//         />
//       )}

//       <View style={styles.button}>
//         <Button
//           title={initialValues ? "Update Reminder" : "Add Reminder"}
//           onPress={handleSubmit}
//           disabled={!title || !date}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//     fontWeight: "bold",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 4,
//     padding: 8,
//     marginBottom: 16,
//   },
//   multiline: {
//     minHeight: 80,
//   },
//   button: {
//     marginTop: 20,
//   },
// });

// export default ReminderForm;
