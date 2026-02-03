import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from './config/api';

const AuthContext = createContext(null);

// Decode JWT without verifying signature to read exp claim
// Minimal base64url decoder (no dependencies)
function base64UrlDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const base64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let bc = 0, bs, buffer;
  for (let idx = 0; idx < base64.length; idx++) {
    buffer = chars.indexOf(base64.charAt(idx));
    if (~buffer) {
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      bc++;
      if (bc % 4) {
        const charCode = 255 & (bs >> ((-2 * bc) & 6));
        output += String.fromCharCode(charCode);
      }
    }
  }
  return output;
}

function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    return JSON.parse(payloadJson);
  } catch (_) {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true; // treat missing exp as expired
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // mechanic object
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInit = useRef(false);

  // Rehydrate on mount
  useEffect(() => {
    const rehydrate = async () => {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem('mechanic');
        if (raw) {
          const mech = JSON.parse(raw);
          const jwt = mech?.token || null;
          // More lenient: only reject if token decode fails or clearly expired
          if (jwt) {
            try {
              const payload = decodeJwt(jwt);
              // If we can't decode, keep the token anyway and let backend validate
              if (!payload) {
                console.log('Token decode failed, keeping token for backend validation');
                setUser(mech);
                setToken(jwt);
              } else if (payload.exp) {
                const nowSec = Math.floor(Date.now() / 1000);
                // Add 60 second grace period
                if (payload.exp > nowSec - 60) {
                  setUser(mech);
                  setToken(jwt);
                } else {
                  console.log('Token expired, clearing storage');
                  await AsyncStorage.removeItem('mechanic');
                  setUser(null);
                  setToken(null);
                }
              } else {
                // No exp claim, keep the token
                console.log('No expiry claim, keeping token');
                setUser(mech);
                setToken(jwt);
              }
            } catch (decodeError) {
              console.log('Error decoding token, keeping anyway:', decodeError);
              setUser(mech);
              setToken(jwt);
            }
          } else {
            await AsyncStorage.removeItem('mechanic');
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.error('Rehydrate error:', e);
        // Don't clear storage on errors, just set null state
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
        isInit.current = true;
      }
    };
    rehydrate();
  }, []);

  // Attach axios interceptors that use latest token
  useEffect(() => {
    const reqId = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers || {};
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    const resId = axios.interceptors.response.use(
      (resp) => resp,
      async (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          // Explicit backend 401 → logout
          await logout('unauthorized');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, [token]);

  const login = async (mechanicObj, { fromLogin = true } = {}) => {
    const jwt = mechanicObj?.token || null;
    if (!jwt) {
      throw new Error('Invalid or expired token');
    }
    // More lenient: only check expiry for non-fresh logins
    if (!fromLogin) {
      try {
        if (isTokenExpired(jwt)) {
          throw new Error('Invalid or expired token');
        }
      } catch (e) {
        // If validation fails, proceed anyway and let backend decide
        console.log('Token validation failed during login, proceeding:', e);
      }
    }
    try {
      await AsyncStorage.setItem('mechanic', JSON.stringify(mechanicObj));
      setUser(mechanicObj);
      setToken(jwt);
    } catch (storageError) {
      console.error('Failed to save to AsyncStorage:', storageError);
      // Still set in memory even if storage fails
      setUser(mechanicObj);
      setToken(jwt);
    }
  };

  const logout = async (reason = 'manual') => {
    try {
      // Optional: call backend logout to blocklist token
      const currentToken = token;
      if (currentToken) {
        try {
          await axios.post(`${API_BASE_URL}/auth/logout`);
        } catch (_) {
          // ignore network errors during logout
        }
      }
    } finally {
      await AsyncStorage.removeItem('mechanic');
      setUser(null);
      setToken(null);
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, isTokenExpired }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
