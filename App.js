import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 NEW imports
import io from "socket.io-client";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-audio";
import { API_BASE_URL } from './config/api';

import "./i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { AuthProvider } from "./AuthContext";

// Screens
import LoginScreen from "./screens/LoginScreen";
import MechanicDashboard from "./screens/MechanicDashboard";
import MechanicProfileScreen from "./screens/MechanicProfileScreen";
import MechanicNavigateScreen from "./screens/MechanicNavigateScreen";
import MechanicBookingScreen from "./screens/MechanicBookingScreen";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import TermsScreen from "./screens/TermsScreen";
import WalletScreen from "./screens/WalletScreen";
import NavigationScreen from "./screens/NavigationScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import MechanicEarningsScreen from "./screens/MechanicEarningsScreen";
import MechanicSettingsScreen from "./screens/MechanicSettingsScreen";
import ChatScreen from "./screens/ChatScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import MechanicRegisterScreen from "./screens/MechanicRegisterScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs({ route }) {
  const { theme } = useTheme();
  const [mechanic, setMechanic] = useState(route?.params?.mechanic || null);

  useEffect(() => {
    // fallback: read stored mechanic if route param missing
    const load = async () => {
      if (!mechanic) {
        try {
          const raw = await AsyncStorage.getItem("mechanic");
          if (raw) setMechanic(JSON.parse(raw));
        } catch (e) {
          console.warn("Failed to read mechanic from storage", e);
        }
      }
    };
    load();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = "ellipse";
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Bookings") iconName = "calendar";
          else if (route.name === "Earnings") iconName = "cash";
          else if (route.name === "Profile") iconName = "person";
          else if (route.name === "Settings") iconName = "settings";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme === "dark" ? "#fff" : "#000",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: theme === "dark" ? "#1c1c1e" : "#fff",
        },
      })}
    >
      <Tab.Screen name="Home" component={MechanicDashboard} initialParams={{ mechanic }} />
      <Tab.Screen name="Bookings" component={MechanicBookingScreen} initialParams={{ mechanic }} />
      <Tab.Screen name="Earnings" component={MechanicEarningsScreen} initialParams={{ mechanic }} />
      <Tab.Screen name="Profile" component={MechanicProfileScreen} initialParams={{ mechanic }} />
      <Tab.Screen name="Settings" component={MechanicSettingsScreen} initialParams={{ mechanic }} />
    </Tab.Navigator>
  );
}

function AppWrapper() {
  const { theme } = useTheme();

  useEffect(() => {
    const socket = io(API_BASE_URL.replace('/api', '')); // ✅ Backend URL

    socket.on("newBooking", async ({ mechanicId, booking }) => {
      // load mechanic from storage
      const raw = await AsyncStorage.getItem("mechanic");
      const mech = raw ? JSON.parse(raw) : null;

      if (mech && mech._id === mechanicId) {
        // 🔔 Local notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🚨 New Booking",
            body: `Service: ${booking.serviceType || "General"}`
          },
          trigger: null
        });

        // 🔊 Play buzzer for 10 seconds
        const { sound } = await Audio.Sound.createAsync(
          require("./assets/buzzer.mp3")
        );
        await sound.playAsync();

        setTimeout(() => {
          sound.unloadAsync();
        }, 10000);
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <NavigationContainer theme={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Navigate" component={MechanicNavigateScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="WalletScreen" component={WalletScreen} />
<Stack.Screen name="NavigationScreen" component={NavigationScreen} />
<Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
        <Stack.Screen name="Register" component={MechanicRegisterScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <AppWrapper />
        </I18nextProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
