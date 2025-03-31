import react, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, FlatList } from "react-native";

// Importer les composants Paper
import {
  Text,
  Button,
  ActivityIndicator,
  List,
  Divider,
  useTheme,
  IconButton,
} from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import apiClient from "../../api/apiClient";

export default function HomeScreen() {
  const { logout, useInfo } = useContext(AuthContext); // Utiliser le contexte pour appeler la fonction logout
  const { toggleTheme, isDarkMode } = useContext(ThemeContext); // Récupérer la fonction pour changer le thème
  const [tasks, setTasks] = useState([]); // Permet de stocker les tâches
  const [isLoadingTasks, setIsLoadingTasks] = useState(false); // Permet de gérer l'affichage du spinner pour les tâches
  const [error, setError] = useState(null); // Permet de gérer les erreurs

  // Récupération des tâches de l'utilisateur connecté
  useEffect(() => {
    console.log("HomeScreen monté. Tentative de récupération des tâches.");
    setIsLoadingTasks(true); // Afficher le spinner
    setError(null); // Réinitialiser l'erreur

    apiClient
      .get("/tasks")
      .then((response) => {
        console.log("Tâches reçue dans HomeScreen : ", response.data);
        setTasks(response.data); // Mettre à jour l'état avec les tâches reçues");
      })
      .catch((error) => {
        console.error("Erreur tâches HomeScreen : ", error);
        if (error.response) {
          if (erreor.response.status === 401) {
            // Si l'erreur est 401, l'utilisateur n'est pas authentifié
            setError("Session invalide. Déconnexion..."); // Message d'erreur

            // Déconnecter si le token n'est plus valide
            setTimeout(logout, 1500); // Déconnexion après 1.5 secondes
          } else {
            setError(`Erreur serveur ${error.response.status}`); // Autre erreur serveur
          }
        } else if (error.request) {
          setError("Erreur de connexion au serveur"); // Erreur de connexion au serveur
        } else {
          setErreor(`Erreur : ${error.message}`);
        }
      })
      .finaly(() => {
        setIsLoadingTasks(false); // Masquer le spinner
      });
  }, []); // Se déclanche une seule fois à la monté du composant

  const renderTaskItem = ({ item }) => (
    // Utiliser List.Item de Paper pour afficher les tâches de l'utilisateur
    <List.Item
      title={item.title}
      description={item.description || "Pas de description"} // Afficher une description ou un texte par défaut
      // Ajouter des icônes ou des boutons si besoin ici
      // left={props => <List.icon {...props} icon="checkbox-marked-circle-outline" />}
      // right={prps => <IconButton {...props} icon="pencil" onPress={() => console.log("Edit tast", item.id) /> }
      style={styles.listItem}
    />
  );

  return (
    // Appliquer la couleur de fond du thème
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Utiliser Text de Paper avec les styles de typographie du thème */}
      <Text variant="headlineMedium" style={styles.title}>
        Bienvenue, {userInfo?.username || "Utilisateur"}!
      </Text>

      {/* Bouton pour changer de thème */}
      <IconButton
        icon={isDarkMode ? "weather-night" : "white-balance-sunny"}
        size={24}
        onPress={toggleTheme}
        style={styles.themeButton}
      />

      <Text variant="titleLarge" style={styles.subtitle}>
        Vos Tâches :
      </Text>

      {isLoadingTasks && (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.activityIndicator}
        />
      )}

      {error && !isLoadingTasks && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      {!error && !isLoadingTasks && tasks.length === 0 && (
        <Text>Aucune tâche à afficher.</Text>
      )}

      {!error && !isLoadingTasks && tasks.length > 0 && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id || item.id.toString()}
          renderItem={renderTaskItem}
          ItemSeparatorComponent={Divider} // Ajouter un séparateur entre les items
          style={styles.list}
        />
      )}

      {/* Bouton de déconnexion stylisé */}
      <Button
        mode="outlined" // Style différent pour logout
        onPress={logout}
        style={styles.logoutButton}
      >
        Se déconnecter
      </Button>
    </View>
  );
}

// Styles mis à jour
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center', // Peut être retiré si les éléments prennent toute la largeur
    paddingTop: 50,
    paddingHorizontal: 0, // Pas de padding horizontal ici si la liste prend toute la largeur
  },
  title: {
    textAlign: "center",
    marginBottom: 10, // Espacement réduit
  },
  themeButton: {
    position: "absolute",
    top: 40,
    right: 10,
  },
  subtitle: {
    marginTop: 20, // Ajouter de l'espace
    marginBottom: 10,
    marginHorizontal: 16, // Ajouter padding horizontal pour le titre de section
    // alignSelf: 'flex-start', // Déjà par défaut pour Text
  },
  list: {
    width: "100%",
    flex: 1, // Pour que la liste prenne l'espace restant
  },
  listItem: {
    // Ajouter un peu de padding interne géré par List.Item
    // backgroundColor: 'white', // Paper gère la couleur de fond basée sur le thème
  },
  errorText: {
    marginVertical: 10,
    textAlign: "center",
    marginHorizontal: 16,
  },
  logoutButton: {
    margin: 16, // Marge autour du bouton logout
  },
  activityIndicator: {
    marginTop: 20, // Espace au-dessus de l'indicateur
  },
});
