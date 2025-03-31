// src/navigation/AuthNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen"; // Importer le nouvel écran

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    // Mettre headerShown à false ici s'applique à tous les écrans par défaut
    // Mais on peut le surcharger par écran si besoin (comme fait dans RegisterScreen)
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* Ajouter l'écran d'inscription */}
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
