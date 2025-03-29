import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen() {
  // Fontion pour l'écran de connexion
  const [email, setEmail] = useState(""); // Permet de stocker l'email
  const [password, setPassword] = useState(""); // Permet de stocker le mot de passe
  const [isLoading, setIsLoading] = useState(false); // Permet de gérer l'affichage du spinner
  const { login } = useContext(AuthContext); // Utiliser le contexte pour appeler la fonction login

  const handleLogin = async () => {
    // Fontion pour gérer la connexion de l'utilisateur
    if (!email || !password) {
      // Vérifier si l'email et le mot de passe sont renseignés
      Alert.alert("Erreur", "Veuillez reseigner tous les champs"); // Afficher une alerte
      return;
    }

    setIsLoading(true); // Afficher le spinner
    try {
      await login(email, password); // Appeler la fonction login
      // La navigation vers AppNavigator sera gérée automatiquement par RootNavigator grace au changement de userToken dans le contexte
      console.log("Connexion réussie depuis l'écran de connexion");
    } catch (error) {
      console.error("Erreur de connexion : ", error);
      Alert.alert(
        "Erreur de connexion",
        error.message || "Email ou mot de passe incorrect"
      );
    } finally {
      setIsLoading(false); // Masquer le spinner
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {isLoading ? (
        <ActtivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Se connecter" onPress={handleLogin} />
      )}
      {/* Ajouter ici un bouton ou lien pour aller vers l'inscription plus tard */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
});
