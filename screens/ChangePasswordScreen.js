import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';

export default function ChangePasswordScreen({ route, navigation }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const mechanic = route?.params?.mechanic;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'New passwords do not match');
    }

    if (!mechanic?.token) {
      return Alert.alert('Error', 'Unauthorized. Please log in again.');
    }

    setLoading(true);

    try {
      // ✅ Correct API route: `/change-password` (not `/changeMechanicPassword`)
      const res = await axios.post(
  `${API_BASE_URL}/mechanic/change-password`,
  { currentPassword, newPassword },
  { headers: { Authorization: `Bearer ${mechanic.token}` } }
);


      Alert.alert('Success', res.data.message);
      navigation.goBack();
    } catch (err) {
      console.error('❌ Change Password Error:', err.response?.data || err.message);
      const msg = err.response?.data?.message || 'Something went wrong';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#111' : '#fff' }]}>
      <Text style={[styles.header, { color: isDarkMode ? '#fff' : '#000' }]}>Change Password</Text>

      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#222' : '#f2f2f2', color: isDarkMode ? '#fff' : '#000' }]}
        placeholder="Current Password"
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#222' : '#f2f2f2', color: isDarkMode ? '#fff' : '#000' }]}
        placeholder="New Password"
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={[styles.input, { backgroundColor: isDarkMode ? '#222' : '#f2f2f2', color: isDarkMode ? '#fff' : '#000' }]}
        placeholder="Confirm New Password"
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
