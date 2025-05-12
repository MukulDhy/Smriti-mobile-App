import React from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { calculateAge } from "../utils/dateUtils";
import { logoutUser } from "../features/auth/authSlice";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);
  return (
    <View style={styles.container}>
      <Ionicons
        name="notifications-outline"
        size={28}
        color="white"
        style={styles.notificationIcon}
      />

      {/* Top Box */}
      <View style={styles.topBox}>
        <View style={styles.innerTopBox}>
          <Text style={styles.profileText}>{t("myProfile")}</Text>
          {user?.userType === "caregiver" && (
            <Image
              source={require("../../assets/caregiverImg.jpg")}
              style={styles.profileImage}
            />
          )}
          {user?.userType === "patient" && (
            <Image
              source={require("../../assets/old-man.jpg")}
              style={styles.profileImage}
            />
          )}
          {user?.userType === "family" && (
            <Image
              source={require("../../assets/familyImg.jpg")}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.nameText}>
            {user?.name ? user.name : "Guest"}
          </Text>
          {user?.userType === "patient" && (
            <>
              <Text style={styles.detailsText}>
                {calculateAge(user?.dateOfBirth)} {t("yrs")},{" "}
                {t(user?.userType).toUpperCase()}
              </Text>
              <Text style={styles.detailsText}>{user?.phone}</Text>
            </>
          )}
          {user?.userType !== "patient" && (
            <>
              <Text style={styles.detailsText}>
                {t(user?.userType).toUpperCase()}
              </Text>
              <Text style={styles.detailsText}>{user?.phone}</Text>
            </>
          )}
          {/* <Text style={styles.detailsText}>
            {calculateAge(dateOfBirth)} {t("yrs")}, Port Angeles
          </Text> */}
        </View>
      </View>

      {/* Adding the Details of the of the patient and caregiver and family mmbers  */}
      <View style={styles.boxContainer1}>
        {/* Row 1 */}
        <View style={styles.rowInfo}>
          <TouchableOpacity
            style={[styles.boxInfo, styles.box2]}
            onPress={() => navigation.navigate("FamilyMemDetails")}
          >
            <Text style={styles.boxTitleBlack}>Friends & Family</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.boxInfo, styles.box1]}
            onPress={() => navigation.navigate("CarePatientDetails")}
          >
            <Text style={styles.boxTitleWhite}>Caregiver</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* "How can we help you today?" Text */}
      <View style={styles.helloContainer}>
        <Text style={styles.helloText}>How can we help you today?</Text>
      </View>

      {/* Boxes Section */}
      <View style={styles.boxContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.box, styles.box1]}
            onPress={() => navigation.navigate("FriendsFamilyMemoriesScreen")}
          >
            <Text style={styles.boxTitleWhite}>Friends & Family Memories</Text>
            <Text style={styles.boxDescWhite}>Relive and share moments.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.box, styles.box2]}>
            <Text style={styles.boxTitleBlack}>Personalized Care Plan</Text>
            <Text style={styles.boxDescBlack}>Track health and treatment.</Text>
          </TouchableOpacity>
        </View>
        {/* Row 2 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.box, styles.box3]}
            onPress={() => navigation.navigate("SensorDataScreen")}
          >
            <Text style={styles.boxTitleBlack}>Sensor Data</Text>
            <Text style={styles.boxDescBlack}>Monitor health metrics.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.box, styles.box4]}>
            <Text style={styles.boxTitleBlack}>Mindfulness & Relaxation</Text>
            <Text style={styles.boxDescBlack}>
              Meditation and stress relief.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  topBox: {
    width: "100%",
    height: height * 0.4,
    backgroundColor: "#36454F",
    borderBottomLeftRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ skewY: "3deg" }],
    bottom: 20,
  },
  innerTopBox: {
    transform: [{ skewY: "-3deg" }],
    alignItems: "center",
  },
  notificationIcon: {
    position: "absolute",
    top: 60,
    right: 20,
  },
  profileText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 30,
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  detailsText: {
    fontSize: 16,
    color: "#fff",
  },
  helloContainer: {
    marginTop: 20,
    marginLeft: 25,
  },
  helloText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  boxContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  boxContainer1: {
    marginTop: 10,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  rowInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  box: {
    width: width * 0.42,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  boxInfo: {
    width: width * 0.42,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  box1: {
    backgroundColor: "#FF69B4",
  },
  box2: {
    backgroundColor: "#FAF9F6",
  },
  box3: {
    backgroundColor: "#FAF9F6",
  },
  box4: {
    backgroundColor: "#EEDC82",
  },
  boxTitleWhite: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  boxDescWhite: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  boxTitleBlack: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 5,
  },
  boxDescBlack: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
});

export default HomeScreen;
