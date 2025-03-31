// src/screens/auth/RegisterScreen.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Appbar, useTheme } from "react-native-paper"; // Importer Appbar

export default function RegisterScreen({ navigation }) {
  // Recevoir navigation prop
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Ajouter un en-tête simple pour revenir en arrière */}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Inscription" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
          Créer un compte
        </Text>
        {/* Mettre ici les champs TextInput et le bouton d'inscription plus tard */}
        <Text>Formulaire d'inscription à venir...</Text>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          Retour à la connexion
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Pas besoin de centrer ici car Appbar prend le haut
  },
  content: {
    flex: 1, // Prend le reste de l'espace
    justifyContent: "center", // Centre le contenu verticalement
    alignItems: "center", // Centre le contenu horizontalement
    padding: 20,
  },
});
