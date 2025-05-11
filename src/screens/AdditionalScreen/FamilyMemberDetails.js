// src/screens/FamilyMembersScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { colors } from "../../constants/colors";

const FamilyMembersScreen = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: patientData } = useSelector((state) => state.patient);
  const { list: familyMembers } = useSelector((state) => state.familyMember);
  const isPatient = user.userType.toLowerCase() === "patient";

  const renderIcon = (iconName) => {
    // Simple text-based icons
    const icons = {
      email: "✉️",
      phone: "📱",
      people: "👥",
      add: "➕",
    };
    return <Text style={styles.icon}>{icons[iconName] || ""}</Text>;
  };

  const renderPatientDetails = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Your Details</Text>
      <View style={styles.detailCard}>
        <Image
          source={{
            uri: patientData?.avatar || "https://via.placeholder.com/150",
          }}
          style={styles.avatar}
        />
        <View style={styles.detailTextContainer}>
          <Text style={styles.name}>{patientData?.name || "Patient Name"}</Text>
          <View style={styles.detailRow}>
            {renderIcon("email")}
            <Text style={styles.detailText}>{patientData?.email || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            {renderIcon("phone")}
            <Text style={styles.detailText}>{patientData?.phone || "N/A"}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFamilyMembers = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        {isPatient ? "Your Family Members" : "Family Members"}
      </Text>
      {familyMembers?.length > 0 ? (
        familyMembers.map((member, index) => (
          <View key={index} style={[styles.detailCard, styles.familyCard]}>
            <Image
              source={{
                uri: member?.avatar || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
            <View style={styles.detailTextContainer}>
              <Text style={styles.name}>{member?.name || "Family Member"}</Text>
              <View style={styles.detailRow}>
                {renderIcon("people")}
                <Text style={styles.detailText}>
                  {member?.relationship || "Relationship not specified"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                {renderIcon("email")}
                <Text style={styles.detailText}>{member?.email || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                {renderIcon("phone")}
                <Text style={styles.detailText}>{member?.phone || "N/A"}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.emptyText}>
            {isPatient
              ? "No family members added yet"
              : "No other family members found"}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {!isPatient && patientData && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <View style={styles.detailCard}>
            <Image
              source={{
                uri: patientData?.avatar || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
            <View style={styles.detailTextContainer}>
              <Text style={styles.name}>
                {patientData?.name || "Patient Name"}
              </Text>
              <View style={styles.detailRow}>
                {renderIcon("email")}
                <Text style={styles.detailText}>
                  {patientData?.email || "N/A"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                {renderIcon("phone")}
                <Text style={styles.detailText}>
                  {patientData?.phone || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {isPatient && renderPatientDetails()}
      {renderFamilyMembers()}

      {isPatient && (
        <TouchableOpacity style={styles.addButton}>
          {renderIcon("add")}
          <Text style={styles.addButtonText}>Add Family Member</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
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
  detailCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  familyCard: {
    marginBottom: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 2,
    borderColor: colors.lightPrimary,
    backgroundColor: colors.lightGray,
  },
  detailTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    marginRight: 8,
    fontSize: 16,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default FamilyMembersScreen;
