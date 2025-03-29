// src/navigation/AuthNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/auth/LoginScreen";
// Importez RegisterScreen ici si vous l'avez créé
// import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    // VÉRIFIEZ ICI : Assurez-vous qu'il n'y a aucun espace, texte,
    // ou caractère parasite directement entre cette ligne...
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ... et celle-ci, HORMIS les composants Screen/Group/Fragment ci-dessous. */}

      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Si vous avez un écran d'inscription, décommentez la ligne suivante */}
      {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}

      {/* VÉRIFIEZ ICI AUSSI : Pas d'espace ou autre avant la balise fermante */}
    </Stack.Navigator>
    // Et rien ici non plus après la balise fermante (pas de point-virgule etc.)
  );
}
