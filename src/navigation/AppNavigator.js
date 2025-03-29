// src/navigation/AppNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/main/HomeScreen";
// Importez vos autres écrans principaux ici (Appointments, Settings, etc.)
// import AppointmentScreen from '../screens/main/AppointmentScreen';
// import SettingsScreen from '../screens/main/SettingsScreen';

// Optionnel: Importer des icônes
import Ionicons from "@expo/vector-icons/Ionicons"; // ou une autre bibliothèque d'icônes

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Accueil") {
            iconName = focused ? "home" : "home-outline";
          }
          // Ajoutez des conditions pour les autres onglets ici
          // else if (route.name === 'Rendez-vous') { ... }

          // Vous pouvez retourner n'importe quel composant ici !
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Cache l'en-tête pour chaque onglet (peut être activé si besoin)
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      {/* Ajoutez vos autres écrans principaux ici */}
      {/* <Tab.Screen name="Rendez-vous" component={AppointmentScreen} /> */}
      {/* <Tab.Screen name="Paramètres" component={SettingsScreen} /> */}
    </Tab.Navigator>
  );
}
