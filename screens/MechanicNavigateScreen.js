import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { API_BASE_URL, GOOGLE_MAPS_KEY } from '../config/api';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

let locationWatcher = null;

export default function MechanicNavigateScreen({ route, navigation }) {
  const { booking } = route?.params || {};
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [polylineCoords, setPolylineCoords] = useState([]);
  const [mechanic, setMechanic] = useState(null);

  // Defensive check for missing booking
  if (!booking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#d9534f', marginBottom: 10 }}>⚠️ Error</Text>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          No booking information provided
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#007BFF', padding: 12, borderRadius: 8 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    const loadMechanic = async () => {
      const raw = await AsyncStorage.getItem('mechanic');
      if (raw) setMechanic(JSON.parse(raw));
    };
    loadMechanic();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setCurrentLocation(coords);

    if (booking?.location?.coordinates) {
      fetchRoute(
        coords.latitude,
        coords.longitude,
        booking.location.coordinates[1],
        booking.location.coordinates[0]
      );
    }
  };

  const fetchRoute = async (startLat, startLng, endLat, endLng) => {
    try {
      const apiKey = GOOGLE_MAPS_KEY;
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=${apiKey}`
      );

      const points = res.data?.routes?.[0]?.overview_polyline?.points;
      if (points) {
        setPolylineCoords(decodePolyline(points));
      } else {
        Alert.alert('Error', 'No route found. Check your API key & billing.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch route.');
    }
  };

  function decodePolyline(encoded) {
    if (!encoded) return [];
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  }

  // 🔴 Start sending live location
  const handleStart = async () => {
    if (!mechanic?.token) {
      Alert.alert('Error', 'Mechanic not logged in.');
      return;
    }
    if (locationWatcher) {
      Alert.alert('Already running');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location access is required.');
      return;
    }

    locationWatcher = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 20 },
      async (pos) => {
        try {
          setCurrentLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          await axios.post(
            `${API_BASE_URL}/location/update`,
            { lat: pos.coords.latitude, lng: pos.coords.longitude },
            { headers: { Authorization: `Bearer ${mechanic.token}` } }
          );
        } catch (err) {
          console.log('❌ Update failed:', err.message);
        }
      }
    );
    Alert.alert('Started', 'Live location updates started.');
  };

  const handleStop = () => {
    if (locationWatcher) {
      locationWatcher.remove();
      locationWatcher = null;
      Alert.alert('Stopped', 'Live location updates stopped.');
    }
  };

  const handleSearch = () => {
    if (searchQuery) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          searchQuery
        )}`
      );
    }
  };

  // const handleCall = () => {
  //   booking?.customerPhone
  //     ? Linking.openURL(`tel:${booking.customerPhone}`)
  //     : Alert.alert('No phone number provided');
  // };

  const openInGoogleMaps = () => {
    if (currentLocation && customerCoords) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${customerCoords.latitude},${customerCoords.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Location data not available.');
    }
  };

  const handleCompleteBooking = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/bookings/${booking._id}/respond`,
        { status: 'completed' }
      );
      Alert.alert('Success', 'Booking marked as completed!');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to complete booking.');
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(2);
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const customerCoords = booking?.location?.coordinates
    ? {
        latitude: booking.location.coordinates[1],
        longitude: booking.location.coordinates[0],
      }
    : null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        region={{
          latitude: currentLocation?.latitude || 20.5937,
          longitude: currentLocation?.longitude || 78.9629,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {customerCoords && (
          <Marker coordinate={customerCoords} title="Customer" />
        )}
        {polylineCoords.length > 0 && (
          <Polyline
            coordinates={polylineCoords}
            strokeWidth={4}
            strokeColor="#007BFF"
          />
        )}
      </MapView>

      <ScrollView
        style={[
          styles.controls,
          { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        ]}
      >
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: '#000' }]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: isDarkMode ? '#444' : '#ccc' },
            ]}
            onPress={handleStop}
          >
            <Text
              style={[
                styles.buttonText,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              Stop
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
              color: isDarkMode ? '#fff' : '#000',
              borderColor: isDarkMode ? '#555' : '#ddd',
            },
          ]}
          placeholder="Search for a location"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />

        <View style={styles.detailsBox}>
          <Text
            style={[
              styles.detailsText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Distance:{' '}
            {currentLocation && customerCoords
              ? `${getDistance(
                  currentLocation.latitude,
                  currentLocation.longitude,
                  customerCoords.latitude,
                  customerCoords.longitude
                )} km`
              : 'N/A'}
          </Text>
          <Text
            style={[
              styles.detailsText,
              { color: isDarkMode ? '#fff' : '#000' },
            ]}
          >
            Earning: ₹{booking.estimatedEarnings || 0}
          </Text>

          {/* <View style={styles.contactRow}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          </View> */}

          <TouchableOpacity
            style={[
              styles.contactButton,
              { marginTop: 10, backgroundColor: '#FF5722' },
            ]}
            onPress={openInGoogleMaps}
          >
            <Text style={styles.contactButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteBooking}
          >
            <Text style={styles.completeButtonText}>Complete Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  controls: { maxHeight: 400, padding: 10 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  startButton: {
    flex: 1,
    marginRight: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    marginLeft: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { fontWeight: 'bold', color: '#fff' },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  detailsBox: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  contactButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
