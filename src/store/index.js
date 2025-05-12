import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import authReducer from "../features/auth/authSlice";
import reminderReducer from "../features/reminders/reminderSlice";
import patientReducer from "../features/details/patientSlice";
import caregiverReducer from "../features/details/caregiverSlice";
import familyMemberReducer from "../features/details/familyMemberSlice";
import connectionReducer from "./actions/connectionReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  reminders: reminderReducer,
  patient: patientReducer,
  caregiver: caregiverReducer,
  familyMember: familyMemberReducer,
  connections: connectionReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"],
  timeout: 0,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

// Debugging
if (__DEV__) {
  store.subscribe(() => {
    console.log("Updated Reduxx State : ", store.getState());
  });
  persistor.subscribe(() => {
    const state = store.getState();
    console.log("Persisted State:", {
      auth: state.auth,
    });
  });
}
