import React from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  Switch,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../themes/ThemeContext";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import LanguageSelectorModal from "./LanguageSelectorModal";

const SettingsScreen = ({ navigation }) => {
  // Get theme context with proper error handling
  const themeContext = useTheme();
  const { theme, toggleTheme, isDarkMode } = themeContext || {
    theme: {},
    toggleTheme: () => {},
    isDarkMode: false,
  };

  const [isLangModalVisible, setLangModalVisible] = React.useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "hi" : "en";
    i18n.changeLanguage(newLang);
  };

  // In SettingsScreen.js - Fix the thunk dispatch and clean up the logic
  const handleLogout = () => {
    Alert.alert(
      t("settingsLogoutConfirmTitle"),
      t("settingsLogoutConfirmMessage"),
      [
        {
          text: t("commonCancel"),
          style: "cancel",
        },
        {
          text: t("commonLogout"),
          onPress: () => {
            // Properly dispatch the async thunk and handle the promise
            dispatch(logoutUser())
              .unwrap() // Extract the resolved value from the Promise
              .then(() => navigation.navigate("Welcome"))
              .catch((error) => {
                console.error("Logout error:", error);
                Alert.alert(t("commonError"), t("settingsLogoutError"));
              });
          },
          style: "destructive",
        },
      ]
    );
  };
  // Helper function to safely access theme colors with fallbacks
  const getThemeColor = (colorName, fallback = "#000000") => {
    if (theme && theme.colors && theme.colors[colorName]) {
      return theme.colors[colorName];
    }
    return fallback;
  };

  const renderListItem = ({
    icon,
    title,
    description,
    onPress,
    rightComponent,
  }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.2 : 1}
    >
      <View style={styles.listItemLeft}>
        {icon && (
          <Text
            style={[
              styles.listIcon,
              { color: getThemeColor("primary", "#6200ee") },
            ]}
          >
            {icon}
          </Text>
        )}
        <View style={styles.listTextContainer}>
          <Text
            style={[
              styles.listItemTitle,
              { color: getThemeColor("text", "#000000") },
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text
              style={[
                styles.listItemDescription,
                { color: getThemeColor("textSecondary", "#757575") },
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
      {rightComponent && (
        <View style={styles.listItemRight}>{rightComponent}</View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: getThemeColor("background", "#ffffff") },
      ]}
    >
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: getThemeColor("primary", "#6200ee") },
          ]}
        >
          <Text style={styles.avatarText}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "??"}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text
            style={[
              styles.userName,
              { color: getThemeColor("text", "#000000") },
            ]}
          >
            {user?.name || t("settingsGuest")}
          </Text>
          <Text
            style={[
              styles.userEmail,
              { color: getThemeColor("textSecondary", "#757575") },
            ]}
          >
            {user?.email || ""}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: getThemeColor("border", "#e0e0e0") },
        ]}
      />

      {/* Appearance Settings */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionHeader,
            { color: getThemeColor("text", "#000000") },
          ]}
        >
          {t("settingsAppearance")}
        </Text>
        {renderListItem({
          icon: "🌓",
          title: t("darkMode"),
          rightComponent: (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              thumbColor={getThemeColor("primary", "#6200ee")}
              trackColor={{
                false: getThemeColor("surfaceVariant", "#e0e0e0"),
                true: getThemeColor("primaryContainer", "#bb86fc"),
              }}
            />
          ),
        })}
        {/* {renderListItem({
          icon: "🌐",
          title: t("language"),
          description: i18n.language === "en" ? "English" : "हिन्दी",
          rightComponent: (
            <Switch
              value={i18n.language === "hi"}
              onValueChange={toggleLanguage}
              thumbColor={getThemeColor("primary", "#6200ee")}
              trackColor={{
                false: getThemeColor("surfaceVariant", "#e0e0e0"),
                true: getThemeColor("primaryContainer", "#bb86fc"),
              }}
            />
          ),
        })} */}
        {renderListItem({
          icon: "🌐",
          title: t("language"),
          description:
            i18n.language === "en"
              ? "English"
              : i18n.language === "hi"
              ? "हिन्दी"
              : i18n.language === "kn"
              ? "Kannada"
              : "Tamil",
          onPress: () => setLangModalVisible(true),
        })}

        <LanguageSelectorModal
          isVisible={isLangModalVisible}
          onClose={() => setLangModalVisible(false)}
        />
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: getThemeColor("border", "#e0e0e0") },
        ]}
      />

      {/* Account Settings */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionHeader,
            { color: getThemeColor("text", "#000000") },
          ]}
        >
          {t("settingsAccount")}
        </Text>
        {renderListItem({
          icon: "👤",
          title: t("settingsProfile"),
          description: t("settingsProfileDescription"),
          onPress: () => navigation.navigate("Profile"),
        })}
        {renderListItem({
          icon: "🔒",
          title: t("settingsSecurity"),
          description: t("settingsSecurityDescription"),
          onPress: () => navigation.navigate("Security"),
        })}
        {renderListItem({
          icon: "🔔",
          title: t("settingsNotifications"),
          description: t("settingsNotificationsDescription"),
          onPress: () => navigation.navigate("Notifications"),
        })}
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: getThemeColor("border", "#e0e0e0") },
        ]}
      />

      {/* About & Support */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionHeader,
            { color: getThemeColor("text", "#000000") },
          ]}
        >
          {t("settingsAbout")}
        </Text>
        {renderListItem({
          icon: "❓",
          title: t("settingsHelp"),
          onPress: () => navigation.navigate("Help"),
        })}
        {renderListItem({
          icon: "🛡️",
          title: t("settingsPrivacy"),
          onPress: () => navigation.navigate("Privacy"),
        })}
        {renderListItem({
          icon: "📄",
          title: t("settingsTerms"),
          onPress: () => navigation.navigate("Terms"),
        })}
        {renderListItem({
          icon: "ℹ️",
          title: t("settingsVersion"),
          description: "1.0.0",
        })}
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: getThemeColor("error", "#B00020") },
          ]}
          onPress={handleLogout}
        >
          <Text
            style={[
              styles.logoutButtonText,
              { color: getThemeColor("onError", "#ffffff") },
            ]}
          >
            {t("settingsLogout")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 20,
    paddingVertical: 8,
    opacity: 0.7,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  listIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  listTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
  },
  listItemDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  listItemRight: {
    marginLeft: 16,
  },
  logoutSection: {
    padding: 20,
    marginTop: 16,
  },
  logoutButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingsScreen;
