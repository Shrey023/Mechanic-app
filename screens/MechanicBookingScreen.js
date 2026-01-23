import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { API_BASE_URL } from '../config/api';
import axios from "axios";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useTheme } from "../ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MechanicBookingScreen({ route, navigation }) {
  const routeMechanic = route?.params?.mechanic || null;
  const [mechanic, setMechanic] = useState(routeMechanic);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [routes] = useState([
    { key: "pending", title: "Pending" },
    { key: "accepted", title: "Accepted" },
    { key: "completed", title: "Completed" },
  ]);

  useEffect(() => {
    const init = async () => {
      if (!mechanic) {
        try {
          const raw = await AsyncStorage.getItem("mechanic");
          if (raw) setMechanic(JSON.parse(raw));
        } catch (e) {
          console.warn("Failed to load mechanic from storage", e);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (mechanic?._id) fetchBookings();
    else setLoading(false); // stop spinner if no mechanic
  }, [mechanic]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = mechanic?.token || (await AsyncStorage.getItem("mechanicToken"));
      const res = await axios.get(
        `${API_BASE_URL}/bookings/mechanic/${mechanic._id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      console.log("🔧 mechanic bookings:", res.data);
      setBookings(res.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = mechanic?.token;
      await axios.put(
        `${API_BASE_URL}/bookings/${bookingId}/respond`,
        { status: action },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      fetchBookings();
    } catch (err) {
      console.error("Action failed:", err.response?.data || err.message);
    }
  };

  const renderBookingItem = (statusFilter) => ({ item }) => {
    if (item.status?.toLowerCase() !== statusFilter) return null;

    return (
      <View style={[styles.bookingCard, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}>
        <View>
          <Text style={[styles.customerName, { color: isDarkMode ? "#fff" : "#000" }]}>
            {item.customer?.name || item.customerName || "Unnamed Customer"}
          </Text>
          <Text style={[styles.serviceType, { color: isDarkMode ? "#ccc" : "#666" }]}>
            {item.serviceType || "No service listed"}
          </Text>
        </View>

        {statusFilter === "pending" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isDarkMode ? "#444" : "#ccc" }]}
            onPress={() => handleBookingAction(item._id, "accepted")}
          >
            <Text style={[styles.buttonText, { color: isDarkMode ? "#fff" : "#000" }]}>Accept</Text>
          </TouchableOpacity>
        )}

        {statusFilter === "accepted" && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#6f42c1" }]}
            onPress={() => navigation.navigate("Navigate", { booking: item })}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>Navigate</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTabScene = (statusKey) => () =>
    loading ? (
      <ActivityIndicator size="large" color={isDarkMode ? "#fff" : "#000"} style={{ marginTop: 20 }} />
    ) : (
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={renderBookingItem(statusKey)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 30, color: isDarkMode ? "#ccc" : "#333" }}>
            No {statusKey} bookings.
          </Text>
        }
        contentContainerStyle={{ padding: 10 }}
      />
    );

  const renderScene = SceneMap({
    pending: renderTabScene("pending"),
    accepted: renderTabScene("accepted"),
    completed: renderTabScene("completed"),
  });

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#fff" }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: isDarkMode ? "#fff" : "#000" }}
            style={{ backgroundColor: isDarkMode ? "#1e1e1e" : "#fff" }}
            activeColor={isDarkMode ? "#fff" : "#000"}
            inactiveColor={isDarkMode ? "#888" : "#aaa"}
            labelStyle={{ fontWeight: "bold" }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bookingCard: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  customerName: { fontSize: 16, fontWeight: "600" },
  serviceType: { marginTop: 2 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  buttonText: { fontWeight: "600" },
});
