// src/navigation/AppNavigator.js
import React, { useContext } from "react";
import { View, StyleSheet } from 'react-native'; // Importer View et StyleSheet pour le badge
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme, Badge } from "react-native-paper"; // Importer useTheme et Badge
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from '../context/AuthContext'; // Importer AuthContext pour le badge

// Importer tous les écrans nécessaires
import HomeScreen from "../screens/main/HomeScreen";
import CreateTaskScreen from "../screens/main/CreateTaskScreen";
import EditTaskScreen from "../screens/main/EditTaskScreen"; // Ajouté
import TaskDetailScreen from "../screens/main/TaskDetailScreen"; // Ajouté
import AppointmentScreen from "../screens/main/AppointmentScreen";
import CreateAppointmentScreen from "../screens/main/CreateAppointmentScreen";
import EditAppointmentScreen from "../screens/main/EditAppointmentScreen"; // Ajouté
import AppointmentDetailScreen from "../screens/main/AppointmentDetailScreen"; // Ajouté
import MessageScreen from "../screens/main/MessageScreen";
import ConversationScreen from "../screens/main/ConversationScreen";
import SettingsScreen from "../screens/main/SettingsScreen";

// Importer les icônes
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Composant pour les onglets du bas (avec badge)
function MainTabs() {
  const { theme } = useContext(ThemeContext); // Pour les couleurs
  const { unreadCount } = useContext(AuthContext); // Récupérer le compteur de messages non lus

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          // Définir l'icône basée sur le nom de la route
          if (route.name === "Accueil") iconName = focused ? "home" : "home-outline";
          else if (route.name === "RendezVous") iconName = focused ? "calendar-check" : "calendar-blank-outline";
          else if (route.name === "Messages") iconName = focused ? "message-text" : "message-text-outline";
          else if (route.name === "Parametres") iconName = focused ? "cog" : "cog-outline";
          else iconName = "help-circle"; // Icône par défaut

          // Cas spécial pour l'onglet Messages pour afficher le badge
          if (route.name === 'Messages') {
            return (
              <View>
                <MaterialCommunityIcons name={iconName} size={size} color={color} />
                {/* Afficher le badge si unreadCount > 0 */}
                {unreadCount > 0 && (
                  <Badge style={styles.badge} size={16} visible={true}>
                    {unreadCount > 9 ? '9+' : unreadCount} {/* Limiter affichage si > 9 */}
                  </Badge>
                )}
              </View>
            );
          }
          // Pour les autres onglets, afficher juste l'icône
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        // Couleurs et style de la barre d'onglets basés sur le thème
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: theme.colors.elevation?.level2 ?? theme.colors.surface,
        },
        headerShown: false, // Masquer l'en-tête par défaut pour les écrans dans les onglets
      })}
    >
      {/* Définition des écrans des onglets */}
      <Tab.Screen name="Accueil" component={HomeScreen} options={{ title: "Accueil" }} />
      <Tab.Screen name="RendezVous" component={AppointmentScreen} options={{ title: "RDV" }} />
      <Tab.Screen name="Messages" component={MessageScreen} options={{ title: "Messages" }}/>
      <Tab.Screen name="Parametres" component={SettingsScreen} options={{ title: "Paramètres" }} />
    </Tab.Navigator>
  );
}

// Navigateur principal (Stack) qui contient les onglets et les autres écrans
export default function AppNavigator() {
  const theme = useTheme(); // Utiliser le thème pour styliser l'en-tête du Stack

  return (
    <Stack.Navigator
      screenOptions={{
        // Appliquer un style par défaut à l'en-tête de toutes les pages du Stack
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        // Par défaut, l'en-tête est affiché (contrairement à headerShown: false)
      }}
    >
      {/* Le premier écran est le composant contenant les onglets */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }} // On masque l'en-tête ici car MainTabs a sa propre structure (onglets)
      />
      {/* Écrans accessibles depuis les onglets ou via navigation */}
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: "Nouvelle Tâche" }} // L'en-tête sera affiché avec ce titre
      />
       <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{ title: "Modifier Tâche" }}
      />
       <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: "Détails Tâche" }}
      />
      <Stack.Screen
        name="CreateAppointment"
        component={CreateAppointmentScreen}
        options={{ title: "Nouveau RDV" }}
      />
       <Stack.Screen
        name="EditAppointment"
        component={EditAppointmentScreen}
        options={{ title: "Modifier RDV" }}
      />
       <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: "Détails RDV" }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
         // Titre dynamique basé sur le nom de l'interlocuteur passé en paramètre
        options={({ route }) => ({ title: route.params?.userName || "Conversation" })}
      />
      {/* Ajoutez ici d'autres écrans si nécessaire */}
    </Stack.Navigator>
  );
}

// Styles pour le badge de notification
const styles = StyleSheet.create({
    badge: {
        position: 'absolute', // Positionnement absolu par rapport à l'icône
        top: -5,              // Ajustez pour le positionnement vertical
        right: -10,            // Ajustez pour le positionnement horizontal
        // backgroundColor: theme.colors.error // Optionnel: couleur spécifique pour le badge
    }
});