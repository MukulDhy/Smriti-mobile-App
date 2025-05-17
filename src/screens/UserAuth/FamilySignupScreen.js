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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { makeApiRequest } from "../../utils/api-error-utils";
import API_BASE_URL from "../../config";

const FamilySignupScreen = ({ navigation }) => {
  // Test data (remove in production)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [patientId, setPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [fullName, setFullName] = useState("Family Member");
  // const [email, setEmail] = useState("family1@gmail.com");
  // const [password, setPassword] = useState("family@1234");
  // const [showPassword, setShowPassword] = useState(true);
  // const [phone, setPhone] = useState("9999849792");
  // const [relationship, setRelationship] = useState("Spouse");
  // const [patientId, setPatientId] = useState("12345");
  // const [isLoading, setIsLoading] = useState(false);

  const handleSignup = () => {
    const familyData = {
      name: fullName,
      email: email,
      password: password,
      phone: phone,
      userType: "family",
      relationship: relationship,
      patientEmail: patientId,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(familyData),
    };

    setIsLoading(true);
    makeApiRequest(
      `${API_BASE_URL}/api/auth/register`,
      options,
      (data) => {
        setIsLoading(false);
        console.log("Family Signup Successful:", data);
        alert("Registration successful!");
        navigation.navigate("FamilyLoginScreen");
      },
      (errorMessage) => {
        setIsLoading(false);
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
      <Text style={styles.signupTitle}>Family Member SignUp</Text>

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
            <Text style={styles.label}>Patient ID</Text>
            <TextInput
              style={styles.input}
              value={patientId}
              onChangeText={setPatientId}
              placeholder="Enter patient ID you're related to"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Relationship to Patient</Text>
            <TextInput
              style={styles.input}
              value={relationship}
              onChangeText={setRelationship}
              placeholder="E.g. Spouse, Parent, Child, Sibling"
            />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
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
            onPress={() => navigation.navigate("FamilyLoginScreen")}
          >
            <Text style={styles.signupText}>Already have an account? </Text>
            <Text style={styles.signupLink}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

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
  signupTitle: {
    margin: 20,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
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

export default FamilySignupScreen;
