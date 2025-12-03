import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TermsScreen({ navigation, route }) {
  const { mechanic } = route.params || {};
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem("acceptedTerms", "true");
      Alert.alert("Thank you", "You’ve accepted the Terms & Privacy Policy");
      navigation.replace("Main", { mechanic });
    } catch (err) {
      Alert.alert("Error", "Unable to save acceptance");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terms & Privacy Policy</Text>

      <Text style={styles.text}>
        Welcome to Mechze! By using our app, you agree to the following:
        {"\n\n"}1. We connect customers with mechanics for on-demand services.
        {"\n\n"}2. Your data (location, name, phone, etc.) is used only to improve your experience and connect you to nearby mechanics/customers.
        {"\n\n"}3. We never sell your personal data to third parties.
        {"\n\n"}4. Mechanics and customers are responsible for conducting services safely and legally.
        {"\n\n"}5. By continuing, you consent to our Privacy Policy and agree to receive notifications related to your bookings.
        {"\n\n"}You can read the full Terms & Privacy Policy on our website at:
        {"\n"}https://mechze.com/policy 
      </Text>

      <TouchableOpacity
        style={[styles.button, accepted && styles.activeButton]}
        onPress={() => {
          setAccepted(true);
          handleAccept();
        }}
      >
        <Text style={styles.buttonText}>I Accept</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#ccc",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#007BFF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
