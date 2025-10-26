import React, { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "../ThemeContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://mechtrix.onrender.com/api/auth/mechanic/login",
        { email, password }
      );
      const data = res.data || {};

      // backend may return user object in different shapes, handle common ones
      const mech = data.mechanic || data.user || data;
      const mechanicData = {
        _id: mech._id || mech.id || data._id || null,
        name: mech.name || mech.fullName || mech.username || "",
        email: mech.email || email,
        token: data.token || mech.token || null,
      };

      await AsyncStorage.setItem("mechanic", JSON.stringify(mechanicData));

      Alert.alert(t("Success"), t("Welcome"));

      // ✅ Step 2 — Updated navigation logic
      const accepted = await AsyncStorage.getItem("acceptedTerms");
      if (accepted === "true") {
        navigation.replace("Main", { mechanic: mechanicData });
      } else {
        navigation.replace("Terms", { mechanic: mechanicData });
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      Alert.alert(t("Error"), t("Failed"));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#fff" }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/8197/8197088.png",
            }}
            style={styles.image}
          />

          <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>
            {t("Welcome Back")}
          </Text>

          <TextInput
            placeholder={t("email")}
            value={email}
            onChangeText={setEmail}
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? "#333" : "#f2f2f2",
                color: isDarkMode ? "#fff" : "#000",
              },
            ]}
            placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder={t("Password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? "#333" : "#f2f2f2",
                color: isDarkMode ? "#fff" : "#000",
              },
            ]}
            placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>{t("Login")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text
              style={[
                styles.registerText,
                { color: isDarkMode ? "#ccc" : "#5c5c5c" },
              ]}
            >
              {t("Don't have an account? Sign up")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingVertical: 40,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 20,
  },
  input: {
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  registerText: {
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
