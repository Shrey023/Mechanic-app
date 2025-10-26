import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

export default function MechanicProfileScreen({ route }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const mechanic = route?.params?.mechanic;

  if (!mechanic) {
    return (
      <View style={[styles.centered, { backgroundColor: isDarkMode ? '#000' : '#FFF9F0' }]}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>No mechanic data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFF9F0' }]}>
      <Text style={[styles.header, { color: isDarkMode ? '#fff' : '#000' }]}>Profile</Text>

      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://i.ibb.co/M6NR2R1/default-avatar.png' }}
          style={styles.avatar}
        />
        <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>{mechanic.name}</Text>
        <Text style={[styles.role, { color: isDarkMode ? '#aaa' : '#777' }]}>Mechanic</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Personal Information
        </Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.infoText, { color: isDarkMode ? '#fff' : '#000' }]}>
            {mechanic.email || 'Not provided'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.infoText, { color: isDarkMode ? '#fff' : '#000' }]}>
            {mechanic.phone || '+91-XXXXXXXXXX'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Entypo name="location-pin" size={20} color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.infoText, { color: isDarkMode ? '#fff' : '#000' }]}>
            {mechanic.address || 'No address available'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
          Service Details
        </Text>

        <View style={styles.infoRow}>
          <MaterialIcons name="directions-car" size={20} color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.infoText, { color: isDarkMode ? '#fff' : '#000' }]}>
            Vehicles: Cars, Trucks, SUVs
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="locate-outline" size={20} color={isDarkMode ? '#fff' : '#000'} />
          <Text style={[styles.infoText, { color: isDarkMode ? '#fff' : '#000' }]}>
            Radius: 50 miles
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: { fontSize: 20, fontWeight: '600' },
  role: {},

  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
  },
});
