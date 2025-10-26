import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";

export default function WalletScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.text, { color: isDark ? "#fff" : "#000" }]}>
        💼 Wallet - Coming Soon!
      </Text>
      <Text style={[styles.subText, { color: isDark ? "#ccc" : "#555" }]}>
        You’ll soon be able to track your wallet balance, earnings & payouts here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  text: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subText: { fontSize: 16, textAlign: "center" },
});
