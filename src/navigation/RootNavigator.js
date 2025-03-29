// src/navigation/RootNavigator.js
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native"; // Importer View et ActivityIndicator
import { AuthContext } from "../context/AuthContext"; // Adaptez le chemin
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { StatusBar } from "expo-status-bar"; // Garder StatusBar si utile globalement

export default function RootNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  // Afficher un indicateur pendant la vérification initiale du token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <StatusBar style="auto" />
      </View>
    );
  }

  // Rendu conditionnel des navigateurs
  return (
    <NavigationContainer>
      {userToken ? <AppNavigator /> : <AuthNavigator />}
      {/* StatusBar peut être mis ici ou dans les navigateurs/écrans spécifiques */}
      {/* <StatusBar style="auto" /> */}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
