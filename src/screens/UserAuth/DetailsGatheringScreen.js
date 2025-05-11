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

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const DetailsGatheringScreen = ({ route, navigation }) => {
  const { patientId } = route.params;
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [logs, setLogs] = useState([]);
  const [overallStatus, setOverallStatus] = useState("loading");
  const [retryCounts, setRetryCounts] = useState({
    patient: 0,
    caregiver: 0,
    familyMembers: 0,
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

  const fetchWithRetry = useCallback(
    async (fetchFunction, type) => {
      let retries = 0;
      const maxRetries = MAX_RETRIES;

      while (retries < maxRetries) {
        try {
          const result = await fetchFunction();
          return { success: true, data: result };
        } catch (error) {
          retries++;
          setRetryCounts((prev) => ({ ...prev, [type]: retries }));

          if (retries < maxRetries) {
            addLog(
              `Retrying ${type} fetch (attempt ${retries}/${maxRetries})...`,
              "warning"
            );
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          }
        }
      }

      return { success: false };
    },
    [addLog]
  );

  const fetchAllDetails = useCallback(async () => {
    try {
      setOverallStatus("loading");
      setLogs([]);
      logIdCounter.current = 0;
      setRetryCounts({
        patient: 0,
        caregiver: 0,
        familyMembers: 0,
      });

      addLog("Starting data synchronization...", "info");

      const loadStatus = {
        patient: false,
        caregiver: false,
        familyMembers: false,
      };

      // Fetch patient details (critical) with retry
      addLog("Fetching patient information...", "info");
      const patientResult = await fetchWithRetry(
        () => dispatch(getPatientDetails({ token, patientId })).unwrap(),
        "patient"
      );

      if (!patientResult.success) {
        addLog("Failed to load patient data after multiple attempts", "error");
        setOverallStatus("error");
        return;
      }

      loadStatus.patient = true;
      addLog("Patient data loaded successfully", "success");

      // Fetch caregiver details (non-critical) with retry
      addLog("Fetching caregiver information...", "info");
      const caregiverResult = await fetchWithRetry(
        () => dispatch(getCaregiverDetails({ token, patientId })).unwrap(),
        "caregiver"
      );

      if (caregiverResult.success) {
        loadStatus.caregiver = true;
        addLog("Caregiver data loaded successfully", "success");
      } else {
        addLog(
          "Caregiver data not available after multiple attempts",
          "warning"
        );
      }

      // Fetch family members (semi-critical) with retry
      addLog("Fetching family members...", "info");
      const familyResult = await fetchWithRetry(
        () => dispatch(getFamilyMembers({ token, patientId })).unwrap(),
        "familyMembers"
      );

      if (familyResult.success) {
        loadStatus.familyMembers = true;
        addLog("Family members loaded successfully", "success");
      } else {
        addLog(
          "Family members data not available after multiple attempts",
          "warning"
        );
      }

      // Determine overall status
      const optionalDataLoaded =
        loadStatus.caregiver && loadStatus.familyMembers;
      const finalStatus = optionalDataLoaded ? "success" : "partial";
      setOverallStatus(finalStatus);

      addLog(
        finalStatus === "success"
          ? "All data loaded successfully!"
          : "Critical data loaded with some optional data missing",
        finalStatus === "success" ? "success" : "warning"
      );

      // Navigate after showing success for 1 second
      setTimeout(() => navigateToHome(loadStatus), 5000);
    } catch (error) {
      setOverallStatus("error");
      addLog(`Data synchronization failed: ${error.message || error}`, "error");
      console.error("Unexpected error in fetchAllDetails:", error);
    }
  }, [addLog, dispatch, fetchWithRetry, navigateToHome, patientId, token]);

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
          patient: true,
          caregiver: retryCounts.caregiver < MAX_RETRIES,
          familyMembers: retryCounts.familyMembers < MAX_RETRIES,
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
          {Object.values(retryCounts).some((count) => count > 0) && (
            <Text style={styles.retryInfo}>
              Retrying failed requests (
              {Object.values(retryCounts).filter((count) => count > 0).length}{" "}
              active)
            </Text>
          )}
        </View>
      )}

      {overallStatus === "error" && (
        <View style={styles.errorFooter}>
          <Text style={styles.errorText}>
            {retryCounts.patient >= MAX_RETRIES
              ? "Failed to load critical patient data after multiple attempts."
              : "Some data failed to load. You can try again or continue with available data."}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={handleTryAgain}
              disabled={retryCounts.patient >= MAX_RETRIES}
            >
              <Text style={styles.tryAgainButtonText}>
                {retryCounts.patient >= MAX_RETRIES
                  ? "Max Retries Reached"
                  : "Try Again"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.continueButton,
                retryCounts.patient >= MAX_RETRIES && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={retryCounts.patient >= MAX_RETRIES}
            >
              <Text style={styles.continueButtonText}>
                {retryCounts.patient >= MAX_RETRIES
                  ? "Cannot Continue"
                  : "Continue Anyway"}
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
  retryInfo: {
    color: colors.gray,
    marginTop: 5,
    fontSize: 12,
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
