import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useSelector } from "react-redux";

const WelcomeScreen = ({ navigation }) => {
  const auth = useSelector((state) => state.auth);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const handleNavigation = () => {
    if (
      auth.user === null ||
      (auth.user == null && auth.token === null) ||
      auth.token == null
    ) {
      navigation.navigate("UserTypeScreen");
      return;
    } else if (auth.user && auth.token) {
      if (auth.user?.userType === "caregiver") {
        navigation.navigate("DetailsGathering", {
          patientId: auth.user?.patient || null,
          caregiverId: auth.user?._id || null,
        });
        return;
      } else if (auth.user?.userType === "patient") {
        navigation.navigate("DetailsGathering", {
          patientId: auth.user?._id || auth.user?.patient || null,
        });
        return;
      } else if (auth.user?.userType === "family") {
        navigation.navigate("DetailsGathering", {
          patientId: auth.user?.
          patient || null,
        });
        return;
      }
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10, // Move up by 10 pixels
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0, // Move back to original position
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Brain Logo with Animation */}
      <Animated.Image
        source={require("../../../assets/brain.png")}
        style={[styles.logo, { transform: [{ translateY: bounceAnim }] }]}
      />

      {/* App Name */}
      <Text style={styles.title}>SMRITI</Text>

      {/* Alzheimer Patient Image */}
      <Image
        source={require("../../../assets/calm.png")}
        style={styles.patientImage}
      />

      {/* Get Started Button */}
      <TouchableOpacity style={styles.button} onPress={handleNavigation}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      {/* Alzheimer Quote */}
      <Text style={styles.quote}>
        "Memories may fade, but love remains forever."
      </Text>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1B2A", // Dark Blue
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Times New Roman",
    fontStyle: "italic",
    marginBottom: 50,
  },
  patientImage: {
    width: 320,
    height: 280,
    borderRadius: 20,
    marginBottom: 80,
  },
  button: {
    backgroundColor: "#1E90FF",
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  quote: {
    fontSize: 14,
    color: "white",
    fontStyle: "italic",
    textAlign: "center",
  },
});
