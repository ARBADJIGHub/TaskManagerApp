// src/navigation/AppNavigator.js
import React, { useContext } from "react"; // Importer useContext
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/main/HomeScreen";
// Importer les écrans placeholders si créés, ou d'autres écrans réels
// import AppointmentScreen from '../screens/main/AppointmentScreen';
// import MessageScreen from '../screens/main/MessageScreen';
// import SettingsScreen from '../screens/main/SettingsScreen';

import { ThemeContext } from "../context/ThemeContext"; // Importer le contexte de thème

// Optionnel: Importer des icônes
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"; // Utiliser MaterialCommunityIcons qui est souvent inclus avec Paper

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  // Récupérer le thème pour les couleurs de la barre d'onglets
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Accueil") {
            iconName = focused ? "home" : "home-outline";
            // } else if (route.name === 'Rendez-vous') {
            //     iconName = focused ? 'calendar' : 'calendar-outline';
            // } else if (route.name === 'Messages') {
            //     iconName = focused ? 'message' : 'message-outline';
            // } else if (route.name === 'Paramètres') {
            //     iconName = focused ? 'cog' : 'cog-outline';
          } else {
            iconName = "help-circle"; // Icône par défaut
          }
          // Utiliser MaterialCommunityIcons
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        // Utiliser les couleurs du thème pour la barre d'onglets
        tabBarActiveTintColor: theme.colors.primary, // Couleur active du thème
        tabBarInactiveTintColor: "gray", // Ou theme.colors.onSurfaceDisabled
        tabBarStyle: {
          // Style de la barre d'onglets elle-même
          backgroundColor: theme.colors.elevation
            ? theme.colors.elevation.level2
            : theme.colors.surface, // Utilise l'élévation si disponible (MD3) ou surface (MD2)
          // borderTopColor: theme.colors.outline, // Optionnel: couleur de la bordure
          // borderTopWidth: StyleSheet.hairlineWidth,
        },
        headerStyle: {
          // Style de l'en-tête (si montré)
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface, // Couleur du texte de l'en-tête
        // headerShown: false, // Gardé caché pour l'instant
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      {/* Ajoutez vos autres écrans principaux ici avec leurs icônes */}
      {/* <Tab.Screen name="Rendez-vous" component={AppointmentScreen} /> */}
      {/* <Tab.Screen name="Messages" component={MessageScreen} /> */}
      {/* <Tab.Screen name="Paramètres" component={SettingsScreen} /> */}
    </Tab.Navigator>
  );
}
