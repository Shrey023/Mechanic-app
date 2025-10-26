import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../ThemeContext';

export default function MechanicEarningsScreen({ route }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const mechanic = route?.params?.mechanic;
  const [selectedTab, setSelectedTab] = useState('Week');

  const dummyData = [
    { day: 'Mon', amount: 100 },
    { day: 'Tue', amount: 120 },
    { day: 'Wed', amount: 110 },
    { day: 'Thu', amount: 130 },
    { day: 'Fri', amount: 115 },
    { day: 'Sat', amount: 105 },
    { day: 'Sun', amount: 140 },
  ];

  const recentPayments = [
    { id: '1', amount: 120, service: 'Oil Change' },
    { id: '2', amount: 350, service: 'Brake Repair' },
    { id: '3', amount: 80, service: 'Tire Rotation' },
  ];

  const totalEarnings = dummyData.reduce((acc, d) => acc + d.amount, 0);

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
          ₹{totalEarnings}
        </Text>
      </View>

      <View
        style={[
          styles.toggleContainer,
          { backgroundColor: isDarkMode ? '#222' : '#f3f3f3' },
        ]}
      >
        {['Week', 'Month'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.toggleButton,
              selectedTab === tab && {
                backgroundColor: isDarkMode ? '#444' : '#fff',
                elevation: 2,
              },
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.toggleText,
                {
                  color:
                    selectedTab === tab
                      ? isDarkMode
                        ? '#fff'
                        : '#000'
                      : '#888',
                  fontWeight: selectedTab === tab ? 'bold' : '500',
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text
        style={[styles.subHeading, { color: isDarkMode ? '#fff' : '#000' }]}
      >
        Earnings
      </Text>
      <View style={styles.graph}>
        {dummyData.map((item) => (
          <View key={item.day} style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: item.amount,
                  backgroundColor: isDarkMode ? '#00BFFF' : '#000',
                },
              ]}
            />
            <Text style={{ color: isDarkMode ? '#ccc' : '#555', fontSize: 12 }}>
              {item.day}
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={[styles.subHeading, { color: isDarkMode ? '#fff' : '#000' }]}
      >
        Recent Payments
      </Text>
      {recentPayments.map((item) => (
        <View
          key={item.id}
          style={[
            styles.paymentItem,
            { borderBottomColor: isDarkMode ? '#333' : '#eee' },
          ]}
        >
          <View style={styles.paymentLeft}>
            <Text
              style={[
                styles.paymentAmount,
                { color: isDarkMode ? '#fff' : '#000' },
              ]}
            >
              ₹{item.amount}
            </Text>
            <Text
              style={[
                styles.paymentService,
                { color: isDarkMode ? '#aaa' : '#555' },
              ]}
            >
              {item.service}
            </Text>
          </View>
          <Text style={{ color: isDarkMode ? '#bbb' : '#444' }}>
            Completed
          </Text>
        </View>
      ))}
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
});
