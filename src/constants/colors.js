// src/constants/colors.js
export const colors = {
  // Primary colors
  primary: "#3366FF", // Main brand blue
  primaryDark: "#2541B2", // Darker blue
  primaryLight: "#EBF2FF", // Very light blue

  // Secondary colors
  secondary: "#00B4D8", // Teal
  secondaryDark: "#0077B6",
  secondaryLight: "#90E0EF",

  // Status colors
  success: "#28A745", // Green
  error: "#DC3545", // Red
  warning: "#FFC107", // Yellow
  info: "#17A2B8", // Cyan

  // Background colors
  background: "#F8F9FA", // Very light gray
  lightBackground: "#FFFFFF", // White
  darkBackground: "#212529", // Dark gray

  // Text colors
  textPrimary: "#212529", // Almost black
  textSecondary: "#495057", // Dark gray
  textLight: "#FFFFFF", // White
  textDisabled: "#6C757D", // Medium gray

  // Grayscale
  white: "#FFFFFF",
  lightGray: "#E9ECEF",
  gray: "#ADB5BD",
  darkGray: "#495057",
  black: "#000000",

  // Additional UI colors
  shadow: "#000000", // For shadows (with opacity)
  border: "#DEE2E6", // Light border color
  placeholder: "#6C757D", // For input placeholders

  // Specific component colors
  avatarBorder: "#E9ECEF", // Light border for avatars
  cardBackground: "#FFFFFF", // White for cards
  modalOverlay: "rgba(0,0,0,0.5)", // Semi-transparent black

  // Health-related colors
  healthGood: "#4CAF50", // Green for positive health
  healthWarning: "#FF9800", // Orange for warning
  healthCritical: "#F44336", // Red for critical

  // Social/communication colors
  whatsapp: "#25D366", // WhatsApp green
};

// Optional: Export color sets for specific purposes
export const buttonColors = {
  primary: {
    background: colors.primary,
    text: colors.white,
  },
  secondary: {
    background: colors.secondary,
    text: colors.white,
  },
  disabled: {
    background: colors.gray,
    text: colors.textDisabled,
  },
};

export const alertColors = {
  success: {
    background: "#D4EDDA",
    text: colors.success,
    icon: colors.success,
  },
  error: {
    background: "#F8D7DA",
    text: colors.error,
    icon: colors.error,
  },
  warning: {
    background: "#FFF3CD",
    text: "#856404",
    icon: colors.warning,
  },
  info: {
    background: "#D1ECF1",
    text: colors.info,
    icon: colors.info,
  },
};

export default colors;
