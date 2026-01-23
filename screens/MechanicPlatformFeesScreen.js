import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { useTheme } from '../ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function MechanicPlatformFeesScreen({ navigation }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ totalUnpaidAmount: 0, unpaidTripCount: 0 });
  const [trips, setTrips] = useState([]);

  const fetchPlatformFees = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Get mechanic token from storage
      const mechanicData = await AsyncStorage.getItem('mechanic');
      const mechanic = mechanicData ? JSON.parse(mechanicData) : null;
      const token = mechanic?.token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      // Fetch both APIs in parallel
      const [summaryRes, tripsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/mechanics/platform-dues`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/mechanics/platform-trips`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSummary(summaryRes.data);
      setTrips(tripsRes.data.trips || []);
    } catch (err) {
      console.error('❌ Platform fees fetch error:', err.message);
      setError(err.response?.data?.message || err.message || 'Failed to load platform fees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlatformFees();
  }, []);

  const handleRefresh = () => {
    fetchPlatformFees(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
        <ActivityIndicator size="large" color="#C98A52" />
        <Text style={[styles.loadText, { color: isDark ? '#ccc' : '#666' }]}>
          Loading platform fees...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorText, { color: isDark ? '#fff' : '#000' }]}>
          Failed to load platform fees
        </Text>
        <Text style={[styles.errorSubtext, { color: isDark ? '#aaa' : '#666' }]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPlatformFees()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#C98A52" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
          Platform Fees
        </Text>
      </View>

      {/* Summary Card */}
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5' },
        ]}
      >
        <Text style={[styles.summaryLabel, { color: isDark ? '#ccc' : '#666' }]}>
          Total Due
        </Text>
        <Text style={[styles.summaryAmount, { color: '#C98A52' }]}>
          ₹{summary.totalUnpaidAmount}
        </Text>

        <View style={styles.summaryRow}>
          <Text style={[styles.summarySubLabel, { color: isDark ? '#aaa' : '#888' }]}>
            Unpaid Trips:
          </Text>
          <Text style={[styles.summarySubValue, { color: isDark ? '#fff' : '#000' }]}>
            {summary.unpaidTripCount}
          </Text>
        </View>

        {/* Disabled Pay Now Button */}
        <TouchableOpacity style={styles.payButtonDisabled} disabled={true}>
          <Text style={styles.payButtonTextDisabled}>Pay Now (Coming Soon)</Text>
        </TouchableOpacity>

        <Text style={[styles.helperText, { color: isDark ? '#888' : '#999' }]}>
          💡 Payment integration will be available soon
        </Text>
      </View>

      {/* Trips List */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
        Recent Unpaid Trips
      </Text>

      {trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
            No unpaid platform fees!
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#aaa' : '#666' }]}>
            You're all caught up.
          </Text>
        </View>
      ) : (
        trips.map((trip) => (
          <View
            key={trip.bookingId}
            style={[
              styles.tripCard,
              { backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9' },
            ]}
          >
            <View style={styles.tripHeader}>
              <Text style={[styles.tripService, { color: isDark ? '#fff' : '#000' }]}>
                {trip.serviceType || 'Service'} - {trip.vehicleType || 'Vehicle'}
              </Text>
              <Text style={styles.tripFee}>₹{trip.platformFeeAmount}</Text>
            </View>

            <Text style={[styles.tripDate, { color: isDark ? '#aaa' : '#666' }]}>
              {formatDate(trip.completedAt)}
            </Text>

            <View style={styles.tripFooter}>
              <Text style={[styles.tripLabel, { color: isDark ? '#888' : '#999' }]}>
                Platform Fee
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadText: {
    marginTop: 12,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  // Summary Card
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summarySubLabel: {
    fontSize: 14,
  },
  summarySubValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  payButtonDisabled: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonTextDisabled: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Trip Card
  tripCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripService: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  tripFee: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C98A52',
  },
  tripDate: {
    fontSize: 13,
    marginBottom: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tripLabel: {
    fontSize: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },

  // Error State
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#C98A52',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
