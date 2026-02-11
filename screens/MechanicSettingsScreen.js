import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import {
  Ionicons,
  Feather,
  Entypo,
} from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';

export default function MechanicSettingsScreen({ navigation, route }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const mechanic = route?.params?.mechanic;
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: async () => {
        await logout('manual');
        navigation.replace('Login');
      } },
    ]);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@mechze.com?subject=Support Request – Mechanic App');
  };

  const styles = getStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>

        <View style={styles.option}>
          <Feather name="moon" size={20} color={styles.iconColor.color} />
          <Text style={styles.optionText}>Dark Mode</Text>
          <View style={{ flex: 1 }} />
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.option} onPress={handleContactSupport}>
          <Feather name="mail" size={20} color={styles.iconColor.color} />
          <Text style={styles.optionText}>Contact Support</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Entypo name="log-out" size={20} color="#d9534f" />
          <Text style={[styles.optionText, { color: '#d9534f' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#FFF9F0',
      padding: 20,
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: isDark ? '#FFF' : '#000',
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 15,
      color: isDark ? '#CCC' : '#555',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    optionText: {
      fontSize: 16,
      marginLeft: 15,
      color: isDark ? '#EEE' : '#333',
    },
    iconColor: {
      color: isDark ? '#CCC' : '#333',
    },
  });
