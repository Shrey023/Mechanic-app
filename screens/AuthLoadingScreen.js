// screens/AuthLoadingScreen.js
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../AuthContext";

export default function AuthLoadingScreen({ navigation }) {
  const { loading, user, isTokenExpired } = useAuth();
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const storedMechanic = await AsyncStorage.getItem("mechanic");
        const acceptedTerms = await AsyncStorage.getItem("acceptedTerms");
        
        if (storedMechanic) {
          const mechanic = JSON.parse(storedMechanic);
          const jwt = mechanic?.token;
          
          // If user exists in context, trust it (already validated by AuthProvider)
          if (user && jwt) {
            if (acceptedTerms === "true") {
              navigation.replace("Main", { mechanic });
            } else {
              navigation.replace("Terms", { mechanic });
            }
            return;
          }
          
          // Fallback: check token manually
          if (!jwt) {
            console.log('No token found, redirecting to login');
            navigation.replace("Login");
            return;
          }
          
          // More lenient validation - let backend decide if token is invalid
          try {
            if (isTokenExpired(jwt)) {
              console.log('Token expired, redirecting to login');
              await AsyncStorage.removeItem("mechanic");
              navigation.replace("Login");
              return;
            }
          } catch (e) {
            // If token validation fails, keep the token and let backend validate
            console.log('Token validation error, proceeding anyway:', e);
          }
          
          if (acceptedTerms === "true") {
            navigation.replace("Main", { mechanic });
          } else {
            navigation.replace("Terms", { mechanic });
          }
        } else {
          navigation.replace("Login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // Don't clear storage on error, just redirect to login
        navigation.replace("Login");
      }
    };
    // Wait for provider rehydrate if necessary
    if (!loading) {
      checkLogin();
    }
  }, [loading, user]);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#007BFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
