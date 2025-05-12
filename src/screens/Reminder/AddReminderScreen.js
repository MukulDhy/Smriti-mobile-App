import React from "react";
import { View, StyleSheet } from "react-native";
import ReminderForm from "../../components/Reminder/ReminderForm";

const AddReminderScreen = ({ navigation }) => {
  const handleSubmit = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ReminderForm onSubmit={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default AddReminderScreen;
