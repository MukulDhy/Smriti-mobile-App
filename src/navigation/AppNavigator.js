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
import AddReminderScreen from "../screens/AddReminderScreen";
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

// Additional screens

import SensorScreen from "../screens/SensorScreen";
import FriendsFamilyMemoriesScreen from "../screens/FriendsFamilyMemoriesScreen";
import VoiceRecordingScreen from "../screens/VoiceRecordingScreen";
import ReminderScreen from "../screens/ReminderScreen";
import FamilyMemberScreen from "../screens/AddFmDeviceScreen";
import FamilyMembersPage from "../screens/FamilyMembersPage";
import DetailsGatheringScreen from "../screens/UserAuth/DetailsGatheringScreen";
import FamilyMembersDetailsScreen from "../screens/AdditionalScreen/FamilyMemberDetails";
import CarePatientDetails from "../screens/AdditionalScreen/CarePatientDetails";

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

const ScrollableReminderScreen = createScrollableScreen(ReminderScreen);
const ScrollableAddReminderScreen = createScrollableScreen(AddReminderScreen);
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
const HomeStackNavigator = () => {
  const { t } = useTranslation();
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen" // Changed from "Home" to "HomeScreen"
        component={ScrollableHomeScreen}
        options={{ headerShown: true, title: t("home") }}
      />

      <HomeStack.Screen
        name="ReminderScreen"
        component={ScrollableReminderScreen}
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
    <NavigationContainer>
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
