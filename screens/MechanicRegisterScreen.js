import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../ThemeContext";
import axios from "axios";
import * as ImagePicker from "react-native-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";

export default function MechanicRegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    experienceYears: "",
    vehicleTypes: "",
    servicesOffered: "",
    serviceRadius: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  // ✅ Get location automatically
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Allow location access to register.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        type: "Point",
        coordinates: [loc.coords.longitude, loc.coords.latitude],
      });
      Alert.alert("Location fetched successfully ✅");
    } catch (err) {
      console.error("Location error:", err);
      Alert.alert("Error", "Unable to fetch location.");
    }
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibrary({ mediaType: "photo" });
    if (!result.didCancel && result.assets?.length > 0) {
      setProfileImage(result.assets[0]);
    }
  };

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });
      if (!result.canceled) {
        setDocuments(result.assets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    const {
      name,
      email,
      password,
      phone,
      experienceYears,
      vehicleTypes,
      servicesOffered,
      serviceRadius,
    } = form;

    if (!name || !email || !password || !phone) {
      return Alert.alert("Error", "Please fill all required fields");
    }
    if (!location) {
      return Alert.alert("Error", "Please fetch your location first");
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append("experienceYears", experienceYears);
      formData.append("serviceRadius", serviceRadius);

      // ✅ Split comma-separated lists
      vehicleTypes
        .split(",")
        .map((v) => v.trim())
        .forEach((v) => formData.append("vehicleTypes", v));

      servicesOffered
        .split(",")
        .map((s) => s.trim())
        .forEach((s) => formData.append("servicesOffered", s));

      // ✅ Attach current location
      formData.append("location[type]", "Point");
      formData.append("location[coordinates][]", location.coordinates[0]);
      formData.append("location[coordinates][]", location.coordinates[1]);

      // ✅ Add files
      if (profileImage) {
        formData.append("profileImage", {
          uri: profileImage.uri,
          type: profileImage.type || "image/jpeg",
          name: profileImage.fileName || "profile.jpg",
        });
      }
      documents.forEach((doc, index) => {
        formData.append("documents", {
          uri: doc.uri,
          type: doc.type || "application/octet-stream",
          name: doc.name || `document_${index}`,
        });
      });

      const res = await axios.post(
        "https://mechtrix.onrender.com/api/auth/mechanic/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Alert.alert("✅ Success", "Registration complete!");
      navigation.navigate("Login");
    } catch (err) {
      console.error("Register Error:", err.response?.data || err.message);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while registering";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#111" : "#fff" }]}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        Mechanic Registration
      </Text>

      {[
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Password", key: "password", secure: true },
        { label: "Phone", key: "phone" },
        { label: "Experience (Years)", key: "experienceYears" },
        { label: "Vehicle Types (comma-separated)", key: "vehicleTypes" },
        { label: "Services Offered (comma-separated)", key: "servicesOffered" },
        { label: "Service Radius (km)", key: "serviceRadius" },
      ].map((field) => (
        <TextInput
          key={field.key}
          placeholder={field.label}
          secureTextEntry={field.secure}
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          value={form[field.key]}
          onChangeText={(val) => handleChange(field.key, val)}
          style={[
            styles.input,
            {
              backgroundColor: isDark ? "#222" : "#f2f2f2",
              color: isDark ? "#fff" : "#000",
            },
          ]}
        />
      ))}

      <TouchableOpacity style={styles.fileButton} onPress={getLocation}>
        <Text style={styles.fileButtonText}>
          {location
            ? `📍 Location: ${location.coordinates.join(", ")}`
            : "Get Current Location"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fileButton} onPress={pickProfileImage}>
        <Text style={styles.fileButtonText}>
          {profileImage ? "Change Profile Image" : "Pick Profile Image"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fileButton} onPress={pickDocuments}>
        <Text style={styles.fileButtonText}>
          {documents.length > 0
            ? `${documents.length} Document(s) Selected`
            : "Pick Documents"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: { padding: 12, marginBottom: 15, borderRadius: 8, fontSize: 15 },
  button: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  fileButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  fileButtonText: { color: "#fff", fontSize: 15 },
});
