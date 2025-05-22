import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { ActivityIndicator, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "./themes/ThemeContext";
import App from "./App";
import { ReminderProvider } from "./contexts/ReminderContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { AuthProvider } from "./contexts/AuthContext";
import AlertListener from "./AlertListener";
import { LocationProvider } from "./contexts/LocationContext";
const AppWrapper = () => {
  const { theme } = useTheme();

  return (
    <ReduxProvider store={store}>
      <PersistGate
        loading={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme.colors.background,
            }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.text, marginTop: 10 }}>
              Loading app data...
            </Text>
          </View>
        }
        persistor={persistor}
      >
        <AuthProvider>
          <ReminderProvider>
            <LocationProvider>
              <WebSocketProvider>
                <I18nextProvider i18n={i18n}>
                  <PaperProvider theme={theme}>
                    <StatusBar style={theme.dark ? "light" : "dark"} />
                    <App />
                  </PaperProvider>
                </I18nextProvider>
              </WebSocketProvider>
            </LocationProvider>
          </ReminderProvider>
        </AuthProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default AppWrapper;
