import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  ScrollView,
  Modal,
  Button,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { makeApiRequest } from "../../utils/api-error-utils";
import API_BASE_URL from "../../config";

const PatientSignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [medicalRecordNumber, setMedicalRecordNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  // const [fullName, setFullName] = useState("mukul dahiya");
  // const [email, setEmail] = useState("m1@gmail.com");
  // const [password, setPassword] = useState("mukul@1234");
  // const [showPassword, setShowPassword] = useState(true);
  // const [phone, setPhone] = useState("9999849790");
  // const [medicalRecordNumber, setMedicalRecordNumber] = useState("8989812");
  // const [dateOfBirth, setDateOfBirth] = useState("1989-04-20");
  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const [primaryDiagnosis, setPrimaryDiagnosis] = useState("erferferef");
  // const [emergencyContactName, setEmergencyContactName] = useState("aarti");
  // const [emergencyContactRelationship, setEmergencyContactRelationship] =
  //   useState("bhen");
  // const [emergencyContactPhone, setEmergencyContactPhone] =
  //   useState("08088809899");

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setDateOfBirth(formattedDate);
    }
  };

  const handleSignup = () => {
    console.log("sign up");

    const patientData = {
      name: fullName,
      email: email,
      password: password,
      phone: phone,
      userType: "patient",
      medicalRecordNumber: medicalRecordNumber,
      dateOfBirth: dateOfBirth,
      primaryDiagnosis: primaryDiagnosis,
      emergencyContact: {
        name: emergencyContactName,
        relationship: emergencyContactRelationship,
        phone: emergencyContactPhone,
      },
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    };

    makeApiRequest(
      `${API_BASE_URL}/api/auth/register`,
      options,
      (data) => {
        // Success callback
        console.log("Patient Signup Successful:", data);
        alert("Registration successful!");
        navigation.navigate("PatientLoginScreen");
      },
      (errorMessage) => {
        // Error callback
        console.log("Signup Failed");
        alert(errorMessage);
      }
    );
  };

  const openURL = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL", err)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../assets/login.jpg")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>
      <Text style={styles.patientSignTitle}>Patient SignUp</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bottomSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Enter email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Medical Record Number</Text>
            <TextInput
              style={styles.input}
              value={medicalRecordNumber}
              onChangeText={setMedicalRecordNumber}
              placeholder="Enter medical record number"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                placeholder="YYYY-MM-DD"
                editable={false}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Primary Diagnosis</Text>
            <TextInput
              style={styles.input}
              value={primaryDiagnosis}
              onChangeText={setPrimaryDiagnosis}
              placeholder="Enter primary diagnosis"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              placeholder="Enter emergency contact name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Emergency Contact Relationship</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactRelationship}
              onChangeText={setEmergencyContactRelationship}
              placeholder="E.g. Spouse, Parent, etc."
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Emergency Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              keyboardType="phone-pad"
              placeholder="Enter emergency contact phone"
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Or</Text>

          <View style={styles.socialIcons}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
              onPress={() => openURL("https://accounts.google.com")}
            >
              <FontAwesome name="google" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#1DA1F2" }]}
              onPress={() => openURL("https://twitter.com/login")}
            >
              <FontAwesome name="twitter" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#1877F2" }]}
              onPress={() => openURL("https://www.facebook.com/login")}
            >
              <FontAwesome name="facebook" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signupContainer}
            onPress={() => navigation.navigate("PatientLoginScreen")}
          >
            <Text style={styles.signupText}>Already have an account? </Text>
            <Text style={styles.signupLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  topSection: {
    backgroundColor: "#800080",
    height: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: "white",
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    color: "#800080",
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  patientSignTitle: {
    margin: 20,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
  },
  loginButton: {
    backgroundColor: "#FFD750",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#777",
    marginBottom: 25,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
    color: "#555",
  },
  signupLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6A0DAD",
  },
});
