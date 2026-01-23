import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_BASE_URL } from '../config/api';
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useTheme } from "../ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

let locationWatcher = null;

export default function MechanicDashboard({ route, navigation }) {
  const routeMechanic = route?.params?.mechanic;
  const [mechanic, setMechanic] = useState(routeMechanic || null);
  const [status, setStatus] = useState("available");
  const [liveSharing, setLiveSharing] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    const init = async () => {
      if (!mechanic) {
        try {
          const raw = await AsyncStorage.getItem("mechanic");
          if (raw) setMechanic(JSON.parse(raw));
        } catch (e) {
          console.warn("Failed to read mechanic from storage", e);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (mechanic?._id) fetchEarnings();
    else setLoading(false);
  }, [mechanic]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const token = mechanic?.token;
      const res = await axios.get(
        `${API_BASE_URL}/bookings/mechanic/${mechanic._id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const completed = (res.data || []).filter(
        (b) => (b.status || "").toLowerCase() === "completed"
      );
      const total = completed.reduce(
        (sum, b) => sum + (b.estimatedEarnings || 0),
        0
      );
      setEarnings(total);
    } catch (error) {
      console.error(
        "Error fetching earnings:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const token = mechanic?.token;
      await axios.patch(
        `${API_BASE_URL}/mechanic/status`,
        { status: newStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setStatus(newStatus);
    } catch (err) {
      console.error("Status update failed:", err.response?.data || err.message);
    }
  };

  // 🔴 Live location toggle
  const toggleLiveLocation = async () => {
    if (!mechanic?.token) {
      Alert.alert("Error", "No mechanic token found.");
      return;
    }

    if (!liveSharing) {
      // Start sharing
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      locationWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 20 },
        async (pos) => {
          try {
            await axios.post(
              `${API_BASE_URL}/location/update`,
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              { headers: { Authorization: `Bearer ${mechanic.token}` } }
            );
          } catch (err) {
            console.log("❌ Location update failed:", err.message);
          }
        }
      );

      setLiveSharing(true);
      Alert.alert(t("dashboard.location"), t("dashboard.started"));
    } else {
      // Stop sharing
      if (locationWatcher) {
        locationWatcher.remove();
        locationWatcher = null;
      }
      setLiveSharing(false);
      Alert.alert(t("dashboard.location"), t("dashboard.stopped"));
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: isDarkMode ? "#121212" : "#fff" },
        ]}
      >
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#fff" },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.brand, { color: isDarkMode ? "#fff" : "#000" }]}
        >
          Mechze
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text
            style={[styles.gear, { color: isDarkMode ? "#fff" : "#000" }]}
          >
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={[styles.greeting, { color: isDarkMode ? "#fff" : "#000" }]}
      >
        {t("Hello")}, {mechanic?.name || t("dashboard.mechanic")}
      </Text>

      <View style={styles.row}>
        <Text
          style={[styles.subText, { color: isDarkMode ? "#ccc" : "#555" }]}
        >
          {t("Shop Open")}
        </Text>
        <Switch value={liveSharing} onValueChange={toggleLiveLocation} />
      </View>

      <View
        style={[
          styles.earningsBox,
          { backgroundColor: isDarkMode ? "#1e1e1e" : "#f5f5f5" },
        ]}
      >
        <Text
          style={[styles.label, { color: isDarkMode ? "#ccc" : "#333" }]}
        >
          {t("TodaysEarnings")}
        </Text>
        <Text style={[styles.earningAmount, { color: "#28a745" }]}>
          ₹{earnings.toFixed(2)}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text
          style={[styles.label, { color: isDarkMode ? "#ccc" : "#333" }]}
        >
          {t("Status")}:
        </Text>
        <Picker
          selectedValue={status}
          style={[styles.picker, { color: isDarkMode ? "#fff" : "#000" }]}
          onValueChange={updateStatus}
          dropdownIconColor={isDarkMode ? "#fff" : "#000"}
        >
          <Picker.Item label={t("Available")} value="available" />
          <Picker.Item label={t("Busy")} value="busy" />
          <Picker.Item label={t("Offline")} value="offline" />
        </Picker>
      </View>

      <Text
        style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#000" }]}
      >
        {t("QuickAccess")}
      </Text>

      {/* 🧭 3️⃣ Updated QuickAccess Section */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[
            styles.quickButton,
            { backgroundColor: isDarkMode ? "#2a2a2a" : "#f2f2f2" },
          ]}
          onPress={() => navigation.navigate("Bookings")}
        >
          <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
            📅 {t("Bookings")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickButton,
            { backgroundColor: isDarkMode ? "#2a2a2a" : "#f2f2f2" },
          ]}
          onPress={() => navigation.navigate("NavigationScreen")}
        >
          <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
            🧭 Navigation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickButton,
            { backgroundColor: isDarkMode ? "#2a2a2a" : "#f2f2f2" },
          ]}
          onPress={() => navigation.navigate("WalletScreen")}
        >
          <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
            💼 Wallet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickButton,
            { backgroundColor: isDarkMode ? "#2a2a2a" : "#f2f2f2" },
          ]}
          onPress={() => navigation.navigate("AnalyticsScreen")}
        >
          <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
            📈 Analytics
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontSize: 24, fontWeight: "bold" },
  gear: { fontSize: 20 },
  greeting: { fontSize: 20, fontWeight: "600", marginVertical: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  subText: { fontSize: 16 },
  earningsBox: { marginVertical: 20, padding: 15, borderRadius: 10, alignItems: "center" },
  label: { fontSize: 16, fontWeight: "500" },
  earningAmount: { fontSize: 24, fontWeight: "bold" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  picker: { flex: 1, marginLeft: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 15 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  quickButton: { width: "48%", padding: 15, borderRadius: 10, alignItems: "center" },
});
