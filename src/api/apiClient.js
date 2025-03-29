import axios from "axios"; // Correction: axiow -> axios
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native"; // Importer Platform

// Utiliser la même logique que dans App.js pour l'URL de base
const webApiUrl = "http://localhost:5000/api";
const androidApiUrl = "http://10.0.2.2:5000/api";
const API_URL = Platform.OS === "android" ? androidApiUrl : webApiUrl;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  async (config) => {
    // Utiliser const pour le token
    const token = await AsyncStorage.getItem("token"); // Correction: tiken -> token
    if (token) {
      // Ajouter l'en-tête Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;