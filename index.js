// index.js (à la racine)
import React from "react"; // Import React
import { registerRootComponent } from "expo";
import { AuthProvider } from "./src/context/AuthContext"; // Adaptez le chemin si nécessaire
import RootNavigator from "./src/navigation/RootNavigator"; // Adaptez le chemin si nécessaire

// Créez le composant racine qui enveloppe tout avec AuthProvider
const AppRoot = () => (
  <AuthProvider>
    <RootNavigator />
  </AuthProvider>
);

// registerRootComponent appelle AppRegistry.registerComponent('main', () => App);
// Il s'assure aussi que l'environnement est bien configuré.
registerRootComponent(AppRoot); // Enregistrez AppRoot au lieu de App

// L'ancien fichier App.js n'est plus utilisé comme point d'entrée direct.
// Vous pouvez le supprimer, le renommer ou vider son contenu.
