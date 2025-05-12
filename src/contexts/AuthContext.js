import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  console.log(token);
  useEffect(() => {
    const loadUser = async () => {
      try {
        // const token = await AsyncStorage.getItem("expo_auth_user");

        if (token) {
          setUserToken(token);
          // Fetch user data if needed
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem("userToken", token);
      setUserToken(token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      setUser(null);
      setUserToken(null);
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
