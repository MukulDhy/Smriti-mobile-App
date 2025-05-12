// src/screens/DetailsGatheringScreen.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getPatientDetails } from "../../features/details/patientSlice";
import { getCaregiverDetails } from "../../features/details/caregiverSlice";
import { getFamilyMembers } from "../../features/details/familyMemberSlice";
import ApiCallLog from "../../components/ApiCallLog";
import LoadingIndicator from "../../components/LoadingIndicator";
import { colors } from "../../constants/colors";

const DetailsGatheringScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [overallStatus, setOverallStatus] = useState("loading");
  const [errors, setErrors] = useState({
    patient: null,
    caregiver: null,
    familyMembers: null,
  });
  const logIdCounter = useRef(0);

  const addLog = useCallback((message, status) => {
    const uniqueId = `log-${Date.now()}-${logIdCounter.current}`;
    logIdCounter.current += 1;
    setLogs((prev) => [...prev, { id: uniqueId, message, status }]);
  }, []);

  const navigateToHome = useCallback(
    (loadStatus) => {
      navigation.navigate("MainApp", {
        screen: "Home",
        params: {
          patientId,
          dataStatus: loadStatus,
          ...(route.params || {}),
        },
      });
    },
    [navigation, patientId, route.params]
  );

  const fetchAllDetails = useCallback(async () => {
    try {
      setOverallStatus("loading");
      setLogs([]);
      logIdCounter.current = 0;
      setErrors({
        patient: null,
        caregiver: null,
        familyMembers: null,
      });

      addLog("Starting data synchronization...", "info");

      const loadStatus = {
        patient: false,
        caregiver: false,
        familyMembers: false,
      };

      // Fetch patient details (critical)
      addLog("Fetching patient information...", "info");
      try {
        await dispatch(getPatientDetails({ token, patientId })).unwrap();
        loadStatus.patient = true;
        addLog("Patient data loaded successfully", "success");
      } catch (error) {
        setErrors((prev) => ({ ...prev, patient: error }));
        addLog(`Failed to load patient data: ${error.message}`, "error");
      }

      // Fetch caregiver details (non-critical)
      addLog("Fetching caregiver information...", "info");
      try {
        await dispatch(getCaregiverDetails({ token, patientId })).unwrap();
        loadStatus.caregiver = true;
        addLog("Caregiver data loaded successfully", "success");
      } catch (error) {
        setErrors((prev) => ({ ...prev, caregiver: error }));
        addLog(`Failed to load caregiver data: ${error.message}`, "warning");
      }

      // Fetch family members (semi-critical)
      addLog("Fetching family members...", "info");
      try {
        await dispatch(getFamilyMembers({ token, patientId })).unwrap();
        loadStatus.familyMembers = true;
        addLog("Family members loaded successfully", "success");
      } catch (error) {
        setErrors((prev) => ({ ...prev, familyMembers: error }));
        addLog(`Failed to load family members: ${error.message}`, "warning");
      }

      // Determine overall status
      if (!loadStatus.patient) {
        setOverallStatus("error");
        addLog("Critical patient data failed to load", "error");
      } else if (!loadStatus.caregiver || !loadStatus.familyMembers) {
        setOverallStatus("partial");
        addLog("Some optional data failed to load", "warning");
      } else {
        setOverallStatus("success");
        addLog("All data loaded successfully!", "success");
        // Navigate after showing success for 1 second
        setTimeout(() => navigateToHome(loadStatus), 1000);
      }
    } catch (error) {
      setOverallStatus("error");
      addLog(`Data synchronization failed: ${error.message || error}`, "error");
      console.error("Unexpected error in fetchAllDetails:", error);
    }
  }, [addLog, dispatch, navigateToHome, patientId, token]);

  useEffect(() => {
    fetchAllDetails();
  }, [fetchAllDetails]);

  const handleTryAgain = () => {
    fetchAllDetails();
  };

  const handleContinue = () => {
    navigation.replace("MainApp", {
      screen: "Home",
      params: {
        patientId,
        dataStatus: {
          patient: errors.patient === null,
          caregiver: errors.caregiver === null,
          familyMembers: errors.familyMembers === null,
        },
        ...(route.params || {}),
      },
    });
  };

  if (overallStatus === "loading" && logs.length === 0) {
    return (
      <View style={styles.fullScreenLoading}>
        <LoadingIndicator text="Preparing to load your data..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gathering Your Data</Text>
      <Text style={styles.subtitle}>
        Please wait while we load your information
      </Text>

      <ScrollView
        style={styles.logsContainer}
        contentContainerStyle={styles.logsContentContainer}
      >
        {logs.map((log) => (
          <ApiCallLog key={log.id} message={log.message} status={log.status} />
        ))}
      </ScrollView>

      {overallStatus === "loading" && (
        <View style={styles.loadingFooter}>
          <LoadingIndicator size="small" text="Loading remaining data..." />
        </View>
      )}

      {(overallStatus === "error" || overallStatus === "partial") && (
        <View style={styles.errorFooter}>
          <Text style={styles.errorText}>
            {errors.patient
              ? `Critical error: ${errors.patient.message}`
              : "Some data failed to load. You can try again or continue with available data."}
          </Text>

          {/* Show specific error messages */}
          {errors.caregiver && (
            <Text style={styles.specificError}>
              Caregiver: {errors.caregiver.message}
            </Text>
          )}
          {errors.familyMembers && (
            <Text style={styles.specificError}>
              Family Members: {errors.familyMembers.message}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={handleTryAgain}
            >
              <Text style={styles.tryAgainButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.continueButton,
                errors.patient && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={!!errors.patient}
            >
              <Text style={styles.continueButtonText}>
                {errors.patient ? "Cannot Continue" : "Continue Anyway"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  fullScreenLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 20,
  },
  logsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  logsContentContainer: {
    paddingBottom: 10,
  },
  loadingFooter: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    alignItems: "center",
  },
  errorFooter: {
    padding: 15,
    backgroundColor: colors.errorLight,
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    marginBottom: 10,
    textAlign: "center",
  },
  specificError: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  tryAgainButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  tryAgainButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  continueButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
});

export default DetailsGatheringScreen;
