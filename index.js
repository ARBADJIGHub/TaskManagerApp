// index.js (à la racine)
import React, { useContext } from "react";
import { registerRootComponent } from "expo";

// --- Imports Corrigés ---
import { AuthProvider } from "./src/context/AuthContext"; // Provider pour l'authentification
// Importation de ThemeProvider ET ThemeContext depuis votre fichier
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext.js";
import RootNavigator from "./src/navigation/RootNavigator"; // Votre navigateur racine
import { Provider as PaperProvider } from "react-native-paper"; // Provider pour React Native Paper

// Composant intermédiaire pour appliquer le thème à PaperProvider
const ThemeApp = () => {
  // Utilise ThemeContext (maintenant importé) pour récupérer le thème
  const { theme } = useContext(ThemeContext);
  return (
    // PaperProvider reçoit le thème dynamique
    <PaperProvider theme={theme}>
      <RootNavigator />
    </PaperProvider>
  );
};

// Composant racine final, correctement enveloppé
const AppRoot = () => (
  // 1. AuthProvider englobe tout
  <AuthProvider>
    {/* 2. ThemeProvider englobe l'application thématisée */}
    <ThemeProvider>
      {/* 3. ThemeApp applique le thème à Paper et contient la navigation */}
      <ThemeApp />
    </ThemeProvider>
  </AuthProvider>
);

// --- Enregistrement Corrigé ---
// Enregistrer AppRoot UNE SEULE FOIS
registerRootComponent(AppRoot);

// L'ancien fichier App.js n'est plus utilisé comme point d'entrée direct.
// Vous pouvez le supprimer, le renommer ou vider son contenu si vous le souhaitez.
