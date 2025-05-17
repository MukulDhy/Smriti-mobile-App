// src/screens/CaregiverDetailsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { colors } from "../../constants/colors";
import {
  searchUsers,
  addConnection,
} from "../../store/actions/connectionActions";
import API_BASE_URL from "../../config";
import { makeApiRequest } from "../../utils/api-error-utils";
import { useTheme } from "react-native-paper";

const CaregiverDetailsScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: patientData } = useSelector((state) => state.patient);
  const { data: caregiverData } = useSelector((state) => state.caregiver);
  const { searchResults, loading: searchLoading } = useSelector(
    (state) => state.connections
  );
  const themeContext = useTheme();
  const { theme, toggleTheme, isDarkMode } = themeContext || {
    theme: {},
    toggleTheme: () => {},
    isDarkMode: false,
  };
  const isPatient = user.userType.toLowerCase() === "patient";
  const isFamily = user.userType.toLowerCase() === "family";
  // State for modals and interactions
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  // Set default invite message based on user type
  useEffect(() => {
    if (isPatient) {
      setMessage(
        `Hi, I'm ${user.name}. I would like to invite you to be my caregiver on the Smriti app. Please click the link to join. User ID - ${user?.email}`
      );
    } else {
      setMessage(
        `Hi, I'm ${user.name}. I would like to invite you to connect as my patient on the Smriti app. Please click the link to join. ${user?.email}`
      );
    }
  }, [user.name, isPatient]);

  const renderIcon = (iconName) => {
    const icons = {
      email: "✉️",
      phone: "📱",
      user: "👤",
      calendar: "📅",
      medical: "🏥",
      emergency: "🚨",
      add: "➕",
      close: "❌",
      search: "🔍",
      link: "🔗",
      whatsapp: "📱",
      location: "📍",
      id: "🆔",
      organization: "🏢",
      specialization: "🎓",
      experience: "📊",
      language: "🗣️",
      availability: "⏰",
      certification: "📜",
    };
    return <Text style={styles.icon}>{icons[iconName] || ""}</Text>;
  };

  const searchExistingUsers = () => {
    if (searchQuery.trim().length < 3) {
      Alert.alert("Error", "Please enter at least 3 characters to search");
      return;
    }

    dispatch(searchUsers(searchQuery, isPatient ? "caregiver" : "patient"));
  };

  const handleAddConnection = (selectedUser) => {
    Alert.alert(
      "Confirm Connection",
      `Are you sure you want to add ${selectedUser.name} as your ${
        isPatient ? "caregiver" : "patient"
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            dispatch(
              addConnection(
                user.id,
                selectedUser.id,
                isPatient ? "patient-caregiver" : "caregiver-patient"
              )
            )
              .then(() => {
                Alert.alert(
                  "Success",
                  `${selectedUser.name} has been added as your ${
                    isPatient ? "caregiver" : "patient"
                  }`
                );
                setSearchModalVisible(false);
              })
              .catch((error) => {
                Alert.alert(
                  "Error",
                  error.message || "Failed to add connection"
                );
              });
          },
        },
      ]
    );
  };

  const sendWhatsAppInvite = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    if (phoneNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setIsSending(true);
    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: `whatsapp:+91${phoneNumber}`,
          message: message,
        }),
      };

      makeApiRequest(
        `${API_BASE_URL}/api/whatsapp/send`,
        options,
        async (data) => {
          // console.log("data = ", data);
          Alert.alert("Success", "Invitation sent successfully!");
          setInviteModalVisible(false);
          setPhoneNumber("");
          setPhoneNumber("");
        },
        (error) => {
          Alert.alert(
            "Error",
            error.message || "Failed to send WhatsApp message"
          );
          console.log(error);
        }
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send WhatsApp message");
      console.log(error);
    } finally {
      setIsSending(false);
    }
  };

  const getThemeColor = (colorName, fallback = "#000000") => {
    if (theme && theme.colors && theme.colors[colorName]) {
      return theme.colors[colorName];
    }
    return fallback;
  };
  const renderDetailsSection = (title, data) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.detailCard}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: getThemeColor("primary", "#6200ee") },
          ]}
        >
          <Text style={styles.avatarText}>
            {data?.name ? data.name.substring(0, 2).toUpperCase() : "??"}
          </Text>
        </View>

        <View style={styles.detailTextContainer}>
          <Text style={styles.name}>{data?.name || "Name not available"}</Text>

          <View style={styles.detailRow}>
            {renderIcon("email")}
            <Text style={styles.detailText}>{data?.email || "N/A"}</Text>
          </View>

          <View style={styles.detailRow}>
            {renderIcon("phone")}
            <Text style={styles.detailText}>{data?.phone || "N/A"}</Text>
          </View>

          {data?.dateOfBirth && (
            <View style={styles.detailRow}>
              {renderIcon("calendar")}
              <Text style={styles.detailText}>
                {new Date(data.dateOfBirth).toLocaleDateString()}
              </Text>
            </View>
          )}

          {data?.address && (
            <View style={styles.detailRow}>
              {renderIcon("location")}
              <Text style={styles.detailText}>{data.address}</Text>
            </View>
          )}

          {data?.emergencyContact && (
            <>
              <Text style={styles.subsectionTitle}>Emergency Contact</Text>
              <View style={styles.detailRow}>
                {renderIcon("user")}
                <Text style={styles.detailText}>
                  {data.emergencyContact.name}
                </Text>
              </View>
              <View style={styles.detailRow}>
                {renderIcon("emergency")}
                <Text style={styles.detailText}>
                  {data.emergencyContact.relationship}
                </Text>
              </View>
              <View style={styles.detailRow}>
                {renderIcon("phone")}
                <Text style={styles.detailText}>
                  {data.emergencyContact.phone}
                </Text>
              </View>
            </>
          )}

          {data?.primaryDiagnosis && (
            <View style={styles.detailRow}>
              {renderIcon("medical")}
              <Text style={styles.detailText}>{data.primaryDiagnosis}</Text>
            </View>
          )}

          {data?.userType === "caregiver" && (
            <>
              <Text style={styles.subsectionTitle}>Professional Details</Text>

              {data?.deviceId && (
                <View style={styles.detailRow}>
                  {renderIcon("id")}
                  <Text style={styles.detailText}>
                    Device ID: {data.deviceId}
                  </Text>
                </View>
              )}

              {data?.organization && (
                <View style={styles.detailRow}>
                  {renderIcon("organization")}
                  <Text style={styles.detailText}>{data.organization}</Text>
                </View>
              )}

              {data?.specialization && (
                <View style={styles.detailRow}>
                  {renderIcon("specialization")}
                  <Text style={styles.detailText}>{data.specialization}</Text>
                </View>
              )}

              {data?.yearsOfExperience && (
                <View style={styles.detailRow}>
                  {renderIcon("experience")}
                  <Text style={styles.detailText}>
                    {data.yearsOfExperience} years of experience
                  </Text>
                </View>
              )}

              {data?.languages && (
                <View style={styles.detailRow}>
                  {renderIcon("language")}
                  <Text style={styles.detailText}>
                    Languages: {data.languages.join(", ")}
                  </Text>
                </View>
              )}

              {data?.availability && (
                <View style={styles.detailRow}>
                  {renderIcon("availability")}
                  <Text style={styles.detailText}>
                    Availability: {data.availability}
                  </Text>
                </View>
              )}

              {data?.certifications && data.certifications.length > 0 && (
                <>
                  <Text style={styles.subsectionTitle}>Certifications</Text>
                  {data.certifications.map((cert, index) => (
                    <View key={index} style={styles.detailRow}>
                      {renderIcon("certification")}
                      <Text style={styles.detailText}>{cert}</Text>
                    </View>
                  ))}
                </>
              )}
              {data?.isAlsoFamilyMember === true && (
                <View style={styles.detailRow}>
                  {renderIcon("user")}
                  <Text style={styles.detailText}>
                    Relationship: {data.relationship}
                  </Text>
                </View>
              )}
              {data?.createdAt && (
                <View style={styles.detailRow}>
                  {renderIcon("calendar")}
                  <Text style={styles.detailText}>
                    Member since:{" "}
                    {new Date(data.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderNoConnection = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>👨‍⚕️</Text>
      <Text style={styles.emptyText}>
        {isPatient
          ? "No caregiver assigned yet"
          : "No patient assigned to you yet"}
      </Text>
      <Text style={styles.emptySubText}>
        {isPatient
          ? "Connect with a caregiver for better care management"
          : "Connect with patients to manage their care"}
      </Text>
    </View>
  );

  const renderSearchResults = () => (
    <View style={styles.searchResultsContainer}>
      {searchLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : searchResults.length > 0 ? (
        <>
          <Text style={styles.searchResultsTitle}>Search Results</Text>
          {searchResults.map((result) => (
            <TouchableOpacity
              key={result.id}
              style={styles.searchResultItem}
              onPress={() => handleAddConnection(result)}
            >
              <View style={styles.searchResultContent}>
                <Image
                  source={{
                    uri: result.avatar || "https://via.placeholder.com/150",
                  }}
                  style={styles.searchResultAvatar}
                />
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultName}>{result.name}</Text>
                  <Text style={styles.searchResultDetail}>{result.email}</Text>
                  {result.phone && (
                    <Text style={styles.searchResultDetail}>
                      {result.phone}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.addConnectionButton}
                onPress={() => handleAddConnection(result)}
              >
                {renderIcon("link")}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </>
      ) : searchQuery.length > 0 ? (
        <Text style={styles.noResultsText}>No users found</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {isPatient
          ? caregiverData
            ? renderDetailsSection("Your Caregiver Details", caregiverData)
            : renderNoConnection()
          : patientData
          ? renderDetailsSection("Your Patient Details", patientData)
          : renderNoConnection()}
        {isFamily
          ? renderDetailsSection("Caregiver Details", caregiverData)
          : renderNoConnection()}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={() => setSearchModalVisible(true)}
        >
          {renderIcon("search")}
          <Text style={styles.actionButtonText}>
            {isPatient ? "Find Caregiver" : "Find Patient"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.whatsapp }]}
          onPress={() => setInviteModalVisible(true)}
        >
          {renderIcon("whatsapp")}
          <Text style={styles.actionButtonText}>Send Invite</Text>
        </TouchableOpacity>
      </View>

      {/* Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSearchModalVisible(false)}
            >
              {renderIcon("close")}
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {isPatient ? "Find Caregiver" : "Find Patient"}
            </Text>

            <Text style={styles.modalSubtitle}>
              {isPatient
                ? "Search for a caregiver by name or email"
                : "Search for a patient by name or email"}
            </Text>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={`Search by name or email...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={searchExistingUsers}
              >
                {renderIcon("search")}
              </TouchableOpacity>
            </View>

            {renderSearchResults()}
          </View>
        </View>
      </Modal>

      {/* WhatsApp Invitation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setInviteModalVisible(false)}
            >
              {renderIcon("close")}
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              {isPatient ? "Invite Caregiver" : "Invite Patient"}
            </Text>

            <Text style={styles.modalSubtitle}>
              Enter phone number to send WhatsApp invitation
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.phoneInputWrapper}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter your Phone Number"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={10}
                />
              </View>
            </View>

            {/* <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.phoneInput, styles.messageInput]}
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />
            </View> */}

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendWhatsAppInvite}
              disabled={isSending}
            >
              <Text style={styles.sendButtonText}>
                {isSending ? "Sending..." : "Send WhatsApp Invite"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding to account for action buttons
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginTop: 10,
    marginBottom: 5,
  },
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  // avatar: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 40,
  //   marginRight: 15,
  //   borderWidth: 2,
  //   borderColor: colors.primaryLight,
  //   backgroundColor: colors.lightGray,
  // },
  detailTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
    fontSize: 16,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray,
    flexShrink: 1,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray,
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.modalOverlay,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: "80%",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 5,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 20,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    backgroundColor: colors.white,
    color: colors.dark,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginLeft: 10,
  },
  searchResultsContainer: {
    maxHeight: 350,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 10,
  },
  searchResultItem: {
    backgroundColor: colors.lightBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchResultContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.dark,
  },
  searchResultDetail: {
    fontSize: 12,
    color: colors.gray,
  },
  addConnectionButton: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 8,
  },
  noResultsText: {
    textAlign: "center",
    color: colors.gray,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 5,
    fontWeight: "500",
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    overflow: "hidden",
  },
  countryCode: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.lightBackground,
    color: colors.dark,
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    padding: 10,
    color: colors.dark,
    backgroundColor: colors.white,
  },
  messageInput: {
    height: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 10,
  },
  sendButton: {
    backgroundColor: colors.whatsapp,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CaregiverDetailsScreen;
