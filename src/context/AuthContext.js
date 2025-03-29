// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/apiClient"; // Assurez-vous que le chemin est correct

// Correction: createContext et non createontext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Correction: setIsLoading et initialisation à true
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Effet pour vérifier l'état de connexion au chargement initial
  useEffect(() => {
    isLoggedIn();
  }, []);

  const login = async (email, password) => {
    // Log au début de la tentative de connexion
    console.log("AuthContext: Tentative de connexion pour:", email);
    try {
      // Mettre isLoading à true pendant l'appel API de login
      setIsLoading(true);
      const response = await apiClient.post("/auth/login", { email, password });
      console.log("AuthContext: Réponse de /auth/login:", response.data); // Log de la réponse

      if (response.data.token) {
        const receivedToken = response.data.token;
        const receivedUserInfo = response.data.user;

        // Mettre à jour l'état
        setUserToken(receivedToken);
        setUserInfo(receivedUserInfo);

        // Stocker dans AsyncStorage
        await AsyncStorage.setItem("token", receivedToken);
        await AsyncStorage.setItem(
          "userInfo",
          JSON.stringify(receivedUserInfo)
        );
        console.log("AuthContext: Token et UserInfo stockés après login."); // Log succès stockage
      } else {
        // Si la réponse ne contient pas de token (ne devrait pas arriver si le backend est correct)
        console.warn("AuthContext: Réponse de login sans token.");
      }

      // Renvoyer la réponse (utile pour l'écran de login)
      return response.data;
    } catch (error) {
      console.error(
        "AuthContext: Erreur lors du login:",
        error.response?.data || error.message
      );
      // Propager l'erreur pour que l'écran de login puisse l'afficher
      throw (
        error.response?.data || {
          message: "Une erreur est survenue lors de la connexion",
        }
      );
    } finally {
      // Assurer que isLoading redevient false après la tentative de login
      setIsLoading(false);
      console.log("AuthContext: Fin tentative login, isLoading mis à false.");
    }
  };

  const register = async (username, email, password) => {
    console.log("AuthContext: Tentative d'inscription pour:", email);
    try {
      setIsLoading(true);
      const response = await apiClient.post("/auth/register", {
        username,
        email,
        password,
      });
      console.log("AuthContext: Réponse de /auth/register:", response.data);

      if (response.data.token) {
        const receivedToken = response.data.token;
        const receivedUserInfo = response.data.user;

        setUserToken(receivedToken);
        setUserInfo(receivedUserInfo);

        await AsyncStorage.setItem("token", receivedToken);
        // Correction: setItem et non settingItem
        await AsyncStorage.setItem(
          "userInfo",
          JSON.stringify(receivedUserInfo)
        );
        console.log("AuthContext: Token et UserInfo stockés après register.");
      } else {
        console.warn("AuthContext: Réponse de register sans token.");
      }
      return response.data;
    } catch (error) {
      console.error(
        "AuthContext: Erreur lors de l'inscription:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data || {
          message: "Une erreur est survenue lors de l'inscription",
        }
      );
    } finally {
      setIsLoading(false);
      console.log(
        "AuthContext: Fin tentative register, isLoading mis à false."
      );
    }
  };

  const logout = async () => {
    console.log("AuthContext: Déconnexion..."); // Log Logout
    setIsLoading(true); // Peut-être pas nécessaire de mettre loading ici, dépend de l'UX
    setUserToken(null);
    setUserInfo(null);
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userInfo");
      console.log("AuthContext: Token et UserInfo retirés.");
    } catch (error) {
      console.error(
        "AuthContext: Erreur lors de la suppression AsyncStorage:",
        error
      );
    } finally {
      setIsLoading(false); // S'assurer que loading est false après logout
    }
  };

  // C'est CETTE fonction qui vérifie l'état initial au lancement de l'app
  const isLoggedIn = async () => {
    // --- LOGS DE DÉBOGAGE IMPORTANTS ---
    console.log(
      "AuthContext: Début vérification isLoggedIn (au chargement)..."
    ); // LOG 1
    try {
      // Pas besoin de setIsLoading(true) ici car l'état initial est déjà true
      let token = await AsyncStorage.getItem("token");
      console.log("AuthContext: Token récupéré depuis AsyncStorage:", token); // LOG 2
      let info = await AsyncStorage.getItem("userInfo");
      console.log("AuthContext: UserInfo récupéré depuis AsyncStorage:", info); // LOG 3

      // Mettre à jour les états même si les valeurs sont null
      // Cela déclenchera la mise à jour dans RootNavigator
      setUserToken(token);
      setUserInfo(info ? JSON.parse(info) : null);
    } catch (error) {
      console.error(
        "AuthContext: Erreur AsyncStorage pendant isLoggedIn:",
        error
      ); // LOG ERREUR
      // En cas d'erreur de lecture, considérer l'utilisateur comme déconnecté
      setUserToken(null);
      setUserInfo(null);
    } finally {
      // Ce log est CRUCIAL pour savoir si le chargement initial se termine
      console.log(
        "AuthContext: Fin vérification isLoggedIn, appel de setIsLoading(false)"
      ); // LOG 4
      setIsLoading(false); // Important: Mettre isLoading à false APRÈS avoir mis à jour les états
    }
    // Le return true/false ici n'est pas utilisé par RootNavigator, qui se base sur userToken et isLoading
  };

  // Retourner le contexte avec les valeurs et fonctions nécessaires
  return (
    <AuthContext.Provider
      value={{
        isLoading, // La valeur utilisée par RootNavigator pour l'état de chargement initial
        userToken,
        userInfo,
        login,
        register,
        logout,
        // isLoggedIn n'est pas nécessaire dans 'value' car elle est appelée en interne par useEffect
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
