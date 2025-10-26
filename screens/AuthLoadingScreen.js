// screens/AuthLoadingScreen.js
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const storedMechanic = await AsyncStorage.getItem("mechanic");
        const acceptedTerms = await AsyncStorage.getItem("acceptedTerms");
        if (storedMechanic) {
          const mechanic = JSON.parse(storedMechanic);
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
        navigation.replace("Login");
      }
    };
    checkLogin();
  }, []);

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
