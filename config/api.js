import Constants from "expo-constants";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || Constants.expoConfig?.extra?.GOOGLE_MAPS_KEY;

if (!API_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_URL environment variable");
}

export const API_BASE_URL = API_URL;
export { GOOGLE_MAPS_KEY };
