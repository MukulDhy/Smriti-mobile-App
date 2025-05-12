import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const UserSelectionScreen = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigation = useNavigation();

  // const handleNext = () => {
  //   if (selectedRole === "patient") {
  //     navigation.navigate("CaregiverLoginScreen");
  //   } else if (selectedRole === "caregiver") {
  //     navigation.navigate("VoiceRecordingScreen");
  //   } else if (selectedRole === "family") {
  //     navigation.navigate("FamilyMembersPage"); // Or whatever screen you want for family members
  //   }
  // };
  const handleNext = () => {
    if (selectedRole === "patient") {
      navigation.navigate("PatientSignupScreen");
      return;
    } else if (selectedRole === "caregiver") {
      navigation.navigate("CaregiverSignupScreen");
      return;
    } else if (selectedRole === "family") {
      navigation.navigate("FamilySignupScreen"); // Or whatever screen you want for family members
      return;
    }
    return;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>I am a</Text>

      <View style={styles.triangleContainer}>
        {/* Top Center - Patient */}
        <TouchableOpacity
          style={[
            styles.circle,
            styles.topCircle,
            selectedRole === "patient" && styles.selectedCircle,
          ]}
          onPress={() => setSelectedRole("patient")}
        >
          <FontAwesome5 name="user-injured" size={40} color="#4CAF50" />
          <Text style={styles.label}>Patient</Text>
        </TouchableOpacity>

        {/* Bottom Left - Caregiver */}
        <TouchableOpacity
          style={[
            styles.circle,
            styles.bottomLeftCircle,
            selectedRole === "caregiver" && styles.selectedCircle,
          ]}
          onPress={() => setSelectedRole("caregiver")}
        >
          <FontAwesome5 name="user-nurse" size={40} color="#ff6b6b" />
          <Text style={styles.label}>Caregiver</Text>
        </TouchableOpacity>

        {/* Bottom Right - Family Member */}
        <TouchableOpacity
          style={[
            styles.circle,
            styles.bottomRightCircle,
            selectedRole === "family" && styles.selectedCircle,
          ]}
          onPress={() => setSelectedRole("family")}
        >
          <FontAwesome5 name="users" size={40} color="#2196F3" />
          <Text style={styles.label}>Family</Text>
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selectedRole && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selectedRole}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserSelectionScreen;

const { width } = Dimensions.get("window");
const circleSize = width * 0.3; // 30% of screen width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 40,
  },
  triangleContainer: {
    width: width * 0.8,
    height: width * 0.8,
    position: "relative",
    marginBottom: 40,
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: "#FFD9D9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "transparent",
    shadowColor: "transparent",
    position: "absolute",
  },
  topCircle: {
    top: 0,
    left: (width * 0.8 - circleSize) / 2,
    backgroundColor: "#E8F5E9", // Light green for patient
  },
  bottomLeftCircle: {
    bottom: 40,
    left: 10,
    backgroundColor: "#FFEBEE", // Light red for caregiver
  },
  bottomRightCircle: {
    bottom: 40,
    right: 10,
    backgroundColor: "#E3F2FD", // Light blue for family
  },
  selectedCircle: {
    borderColor: "#800080",
    shadowColor: "#800080",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  nextButton: {
    backgroundColor: "#800080",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 25,
    position: "absolute",
    bottom: 40,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});
