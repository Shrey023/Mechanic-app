import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { useTheme } from '../ThemeContext';

export default function MechanicEarningsScreen({ route }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const mechanic = route?.params?.mechanic;
  const [platformFees, setPlatformFees] = useState(null);
  const [platformFeesError, setPlatformFeesError] = useState(null);
  const [platformFeesLoading, setPlatformFeesLoading] = useState(false);

  useEffect(() => {
    const fetchPlatformFees = async () => {
      setPlatformFeesLoading(true);
      setPlatformFeesError(null);
      try {
        const stored = await AsyncStorage.getItem('mechanic');
        const mech = stored ? JSON.parse(stored) : null;
        const token = mech?.token;
        if (!token) {
          throw new Error('Token missing');
        }
        const res = await axios.get(`${API_BASE_URL}/mechanic/platform-dues`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlatformFees({
          totalUnpaidAmount: res.data?.totalUnpaidAmount ?? null,
          unpaidTripCount: res.data?.unpaidTripCount ?? null,
        });
      } catch (err) {
        console.error('Platform fees load failed:', err?.message || err);
        setPlatformFees(null);
        setPlatformFeesError('unavailable');
      } finally {
        setPlatformFeesLoading(false);
      }
    };

    fetchPlatformFees();
  }, []);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#000' : '#FFF9F0' },
      ]}
    >
      <Text style={[styles.header, { color: isDarkMode ? '#fff' : '#000' }]}>
        Earnings
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: isDarkMode ? '#111' : '#F3F3F3' },
        ]}
      >
        <Text style={[styles.totalText, { color: isDarkMode ? '#ccc' : '#333' }]}>
          Total Earnings
        </Text>
        <Text
          style={[styles.totalAmount, { color: isDarkMode ? '#fff' : '#000' }]}
        >
          Coming Soon
        </Text>
      </View>

      <Text style={[styles.subHeading, { color: isDarkMode ? '#fff' : '#000' }]}>Platform Fees</Text>
      <View
        style={[
          styles.platformCard,
          { backgroundColor: isDarkMode ? '#111' : '#F3F3F3' },
        ]}
      >
        <Text style={[styles.platformLabel, { color: isDarkMode ? '#ccc' : '#555' }]}>Total Due</Text>
        <Text style={[styles.platformAmount, { color: isDarkMode ? '#fff' : '#000' }]}>₹{platformFees?.totalUnpaidAmount ?? '—'}</Text>

        <View style={styles.platformRow}>
          <Text style={[styles.platformSubLabel, { color: isDarkMode ? '#aaa' : '#777' }]}>Unpaid Trips</Text>
          <Text style={[styles.platformSubValue, { color: isDarkMode ? '#fff' : '#000' }]}>
            {platformFees?.unpaidTripCount ?? '—'}
          </Text>
        </View>

        <TouchableOpacity style={styles.payDisabled} disabled>
          <Text style={styles.payDisabledText}>Pay Now (Coming Soon)</Text>
        </TouchableOpacity>

        {platformFeesLoading ? (
          <Text style={[styles.platformHint, { color: isDarkMode ? '#888' : '#666' }]}>Loading platform fees…</Text>
        ) : platformFeesError ? (
          <Text style={[styles.platformHint, { color: isDarkMode ? '#888' : '#666' }]}>Platform fees unavailable</Text>
        ) : (
          <Text style={[styles.platformHint, { color: isDarkMode ? '#888' : '#666' }]}>Payment integration coming soon</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  totalText: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '500',
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 10,
  },
  graph: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    width: 30,
  },
  bar: {
    width: 20,
    borderRadius: 6,
    marginBottom: 5,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  paymentLeft: {},
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentService: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  platformCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  platformLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  platformAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginVertical: 8,
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformSubLabel: {
    fontSize: 14,
  },
  platformSubValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  payDisabled: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  payDisabledText: {
    color: '#777',
    fontSize: 16,
    fontWeight: '600',
  },
  platformHint: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
