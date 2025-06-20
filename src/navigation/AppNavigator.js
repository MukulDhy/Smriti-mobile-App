import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ThemeColors, useTheme } from "../themes/ThemeContext";

// Screens for main app (tab navigator)
import HomeScreen from "../screens/HomeScreen";
// import AddReminderScreen from "../screens/AddReminderScreen";
import SettingsScreen from "../screens/SettingsScreen";

// Screens for auth stack
import WelcomeScreen from "../screens/UserAuth/WelcomeScreen";
import UserTypeScreen from "../screens/UserAuth/UserTypeScreen";
import CaregiverLoginScreen from "../screens/UserAuth/CaregiverLoginScreen";
import CaregiverSignupScreen from "../screens/UserAuth/CaregivenSignupScreen";
import PatientLoginScreen from "../screens/UserAuth/PatientLoginScreen";
import PatientSignupScreen from "../screens/UserAuth/PatientSignupScreen";
import FamilySignupScreen from "../screens/UserAuth/FamilySignupScreen";
import FamilyLoginScreen from "../screens/UserAuth/FamilyLoginScreen";
import EmergencyScreen from "../screens/EmergencyScreen";
// Additional screens

import SensorScreen from "../screens/SensorScreen";
import FriendsFamilyMemoriesScreen from "../screens/FriendsFamilyMemoriesScreen";
import VoiceRecordingScreen from "../screens/VoiceRecordingScreen";
import ReminderScreen from "../screens/ReminderScreen1";
import FamilyMemberScreen from "../screens/AddFmDeviceScreen";
import FamilyMembersPage from "../screens/FamilyMembersPage";
import DetailsGatheringScreen from "../screens/UserAuth/DetailsGatheringScreen";
import FamilyMembersDetailsScreen from "../screens/AdditionalScreen/FamilyMemberDetails";
import CarePatientDetails from "../screens/AdditionalScreen/CarePatientDetails";

import RemindersScreen from "../screens/Reminder/RemindersScreen";
import AddReminderScreen from "../screens/Reminder/AddReminderScreen";
import ReminderPage from "../screens/Reminder/ReminderPage";
import AlertListener from "../AlertListener";
import CalmTaps from "../screens/Games/CalmTaps";
import BreathingExerciseGame from "../screens/Games/BreathingExerciseGame";
import GameNavigation from "../screens/Games/GameNavigationScreen";
import MazeGame from "../screens/Games/MatchingFacesGame";
import LocationDisplay from "../screens/AdditionalScreen/LocationDisplay";
import { navigationRef } from "../utils/NavigationService";
import VoiceDetectionScreen from "../screens/AdditionalScreen/VoiceDetectionScreen";
import AIVoiceAssistantScreen from "../screens/AI_Voice_Assistant/AIVoiceAssistantScreen";
import OnBoardingScreen from "../screens/AI_Voice_Assistant/OnBoardingScreen";
// import AudioStreamScreen from "../screens/AudioStreaming/AudioStreamScreen";
import AudioAnalyzerScreen from "../screens/AudioStreaming/AudioAnalyzerScreen";
import ESP32Dashboard from "../screens/SensorScreen/SensorScreen";
import FamilyGuessingGame from "../screens/Games/ProfileScreenGame";
import ObjectTrackerScreen from "../screens/Games/Remember";
import PatientMonitoringDashboard from "../screens/Games/Patientmonitoring";
import MemoryWallScreen from "../screens/Games/Memorywall";
import MemoryGameScreen from "../screens/Games/newgame";
import ESP32DashboardMoniter from "../screens/Esp32DashBoard/Esp32Dash";

const Tab = createBottomTabNavigator();
const MainStack = createStackNavigator();
const HomeStack = createStackNavigator();

// Scrollable Wrapper Component
const ScrollableScreen = ({ children }) => (
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    {children}
  </ScrollView>
);

// Create scrollable versions of screens
const createScrollableScreen = (ScreenComponent) => (props) =>
  (
    <ScrollableScreen>
      <ScreenComponent {...props} />
    </ScrollableScreen>
  );

// Create scrollable versions of all screens
const ScrollableHomeScreen = createScrollableScreen(HomeScreen);

// const ScrollableReminderScreen = createScrollableScreen(ReminderScreen);
const ScrollableReminderScreen = createScrollableScreen(RemindersScreen);
const ScrollableAddReminderScreen = createScrollableScreen(AddReminderScreen);
const ScrollableReminderPage = createScrollableScreen(ReminderPage);

const ScrollableSettingsScreen = createScrollableScreen(SettingsScreen);
const ScrollableSensorScreen = createScrollableScreen(SensorScreen);
const ScrollableFriendsFamilyMemoriesScreen = createScrollableScreen(
  FriendsFamilyMemoriesScreen
);
const ScrollableVoiceRecordingScreen =
  createScrollableScreen(VoiceRecordingScreen);
const ScrollableFamilyMemberScreen = createScrollableScreen(FamilyMemberScreen);
const ScrollableFamilyMembersPage = createScrollableScreen(FamilyMembersPage);
const ScollableFamilyMemberDetail = createScrollableScreen(
  FamilyMembersDetailsScreen
);
const ScrollableCarePatientDetail = createScrollableScreen(CarePatientDetails);
const ScrollableGameNavigation = createScrollableScreen(GameNavigation);
const ScrollableLocationScreen = createScrollableScreen(LocationDisplay);
const ScrollableAudioStreamScreen = createScrollableScreen(AudioAnalyzerScreen);
const ScrollableEsp32Dash = createScrollableScreen(ESP32Dashboard);
const ScrollableObjectTrackerScreen = createScrollableScreen(ObjectTrackerScreen);
const ScrollableESP32Dashboard = createScrollableScreen(ESP32DashboardMoniter);
const ScrollableVoiceDetectionScreen =
  createScrollableScreen(VoiceDetectionScreen);
const HomeStackNavigator = () => {
  const { t } = useTranslation();
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen" // Changed from "Home" to "HomeScreen"
        component={ScrollableHomeScreen}
        options={{ headerShown: true, title: t("home"), gestureEnabled: false }}
      />
      <HomeStack.Screen
        name="EmergencyScreen"
        component={EmergencyScreen}
        options={{ headerShown: false }} // Full-screen alert
      />

      <HomeStack.Screen
        name="ReminderScreen"
        component={ScrollableReminderScreen}
      />
      <HomeStack.Screen
        name="ReminderPage"
        component={ScrollableReminderPage}
      />
      <HomeStack.Screen
        name="AddFamily&DeviceScreen"
        component={ScrollableFamilyMemberScreen}
      />
      <HomeStack.Screen
        name="FamilyMemDetails"
        component={ScollableFamilyMemberDetail}
      />
      <HomeStack.Screen
        name="CarePatientDetails"
        component={ScrollableCarePatientDetail}
      />
      <HomeStack.Screen
        name="FamilyMembersPage"
        component={ScrollableFamilyMembersPage}
      />
      <HomeStack.Screen
        name="SensorDataScreen"
        component={ScrollableSensorScreen}
      />
      <HomeStack.Screen
        name="FriendsFamilyMemoriesScreen"
        component={ScrollableFriendsFamilyMemoriesScreen}
      />
      <HomeStack.Screen
        name="VoiceRecordingScreen"
        component={ScrollableVoiceRecordingScreen}
      />
      <HomeStack.Screen
        name="GameNavigation"
        component={ScrollableGameNavigation}
      />
      <HomeStack.Screen
        name="LocationScreen"
        component={ScrollableLocationScreen}
      />
      <HomeStack.Screen
        name="AudioStream"
        component={ScrollableAudioStreamScreen}
      />
      {/* <HomeStack.Screen name="Esp32DashBoard" component={ScrollableEsp32Dash} /> */}

      <HomeStack.Screen
        name="VoiceDetectionScreen"
        component={ScrollableVoiceDetectionScreen}
        // options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ESP32Dash"
        component={ScrollableESP32Dashboard}
        // options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
};

const AppTabNavigator = () => {
  const { t } = useTranslation();
  const theme = ThemeColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "HomeTab") {
            // Changed from "Home" to "HomeTab"
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "AddReminder") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="HomeTab" // Changed from "Home" to "HomeTab"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          title: t("home"),
          // tabBarLabel: ({ focused, color }) => (
          //   <Text style={{ color, fontSize: 12 }}>Home</Text>
          // ),
        }}
      />
      <Tab.Screen
        name="AddReminder"
        component={ScrollableAddReminderScreen}
        options={{ title: t("addReminder") }}
      />
      <Tab.Screen
        name="Settings"
        component={ScrollableSettingsScreen}
        options={{ title: t("settings") }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  // Using destructured theme to avoid returning the entire state
  const { colors } = useTheme();

  return (
    <NavigationContainer ref={navigationRef}>
      <AlertListener>
        <MainStack.Navigator>
          {/* Auth Screens */}
          <MainStack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />

          <MainStack.Screen name="UserTypeScreen" component={UserTypeScreen} />
          <MainStack.Screen
            name="CaregiverLoginScreen"
            component={CaregiverLoginScreen}
          />
          <MainStack.Screen
            name="CaregiverSignupScreen"
            component={CaregiverSignupScreen}
          />
          <MainStack.Screen
            name="PatientSignupScreen"
            component={PatientSignupScreen}
          />
          <MainStack.Screen
            name="PatientLoginScreen"
            component={PatientLoginScreen}
          />
          <MainStack.Screen
            name="FamilySignupScreen"
            component={FamilySignupScreen}
          />
          <MainStack.Screen
            name="FamilyLoginScreen"
            component={FamilyLoginScreen}
          />
          <MainStack.Screen
            name="DetailsGathering"
            component={DetailsGatheringScreen}
          />
          <MainStack.Screen name="CalmTaps" component={CalmTaps} />
          <MainStack.Screen
            name="BreathingExerciseGame"
            component={BreathingExerciseGame}
          />
          <MainStack.Screen name="MazeGame" component={MazeGame} />
          <MainStack.Screen
            name="OnBoarding"
            component={OnBoardingScreen}
            options={{
              headerShown: false,
            }}
          />
          <MainStack.Screen
            name="AiVoiceAssistant"
            component={AIVoiceAssistantScreen}
            options={{
              headerShown: false,
            }}
          />
          <MainStack.Screen name="ProfileGameScreen" component={FamilyGuessingGame} />
<MainStack.Screen name="MemoryGame" component={MemoryGameScreen} />
<MainStack.Screen name="MemoryWallScreen" component={MemoryWallScreen} />
<MainStack.Screen name="Remember" component={ScrollableObjectTrackerScreen} />
<MainStack.Screen name="Patientmonitering" component={PatientMonitoringDashboard} />

          {/* Main App */}
          <MainStack.Screen
            name="MainApp"
            component={AppTabNavigator}
            options={{
              headerShown: false,
              gestureEnabled: false, // Prevents going back to auth
            }}
          />
        </MainStack.Navigator>
      </AlertListener>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // padding: 16,
  },
});

export default AppNavigator;
