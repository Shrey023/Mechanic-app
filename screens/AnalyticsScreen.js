import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";
import { useTheme } from "../ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '../config/api';

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const mechData = await AsyncStorage.getItem("mechanic");
        const mechanic = mechData ? JSON.parse(mechData) : null;
        if (!mechanic?._id) return;

        const res = await axios.get(
          `${API_BASE_URL}/bookings/mechanic/${mechanic._id}`
        );
        const all = res.data || [];
        const completed = all.filter(b => b.status === "completed");
        const pending = all.filter(b => b.status === "pending");
        const rejected = all.filter(b => b.status === "rejected");
        const earnings = completed.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

        setAnalytics({
          totalBookings: all.length,
          completedBookings: completed.length,
          pendingBookings: pending.length,
          rejectedBookings: rejected.length,
          totalEarnings: earnings,
        });
      } catch (err) {
        console.error("Analytics fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        📈 Performance Analytics
      </Text>

      <View style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2" }]}>
        <Text style={styles.metric}>Total Bookings: {analytics.totalBookings}</Text>
        <Text style={styles.metric}>Completed: {analytics.completedBookings}</Text>
        <Text style={styles.metric}>Pending: {analytics.pendingBookings}</Text>
        <Text style={styles.metric}>Rejected: {analytics.rejectedBookings}</Text>
        <Text style={[styles.metric, { color: "#28a745" }]}>
          Total Earnings: ₹{analytics.totalEarnings.toFixed(2)}
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: { padding: 20, borderRadius: 12, marginBottom: 20 },
  metric: { fontSize: 16, marginBottom: 8 },
  note: { textAlign: "center", marginTop: 10 },
});
