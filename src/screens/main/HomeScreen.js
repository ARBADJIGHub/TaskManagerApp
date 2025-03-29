import react, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";

export default function HomeScreen() {
  const { logout, useInfo } = useContext(AuthContext); // Utiliser le contexte pour appeler la fonction logout
  const [tasksn, setTasks] = useState([]); // Permet de stocker les tâches
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
            setError("Session invalide. Dzconnexion..."); // Message d'erreur

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Bienvenue, {userInfo?.username || "Utilisateur"}!
      </Text>
      <Text style={styles.subtitle}>Vos tâches : </Text>

      {/* Affichage pendant le chagement des tâches */}
      {isLoadingTasks && <ActtivityIndicator size="large" color="#0000ff" />}

      {/* Affichage de l'erreur */}
      {error && !isLoadingTasks && (
        <Text style={styles.errorText}>Erreur : {error} </Text>
      )}

      {/* Affichage si aucune tâche est pas d'erreur */}
      {!error && !isLoadingTasks && tasks.length === 0 && (
        <Text>Aucune tâche à aaficher</Text>
      )}

      {/* Affichage de la liste des tâches */}
      {!error && !isLoadingTasks && tasks.length > 0 && (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id || item.id.toString()} // Utiliser _id ou id pour la clé
          renderItem={({ item }) => (
            <Text style={styles.taskItem}>{item.title}</Text> // Afficher le titre de la tâche
          )}
          style={styles.list}
        />
      )}

      {/* Bouton de déconnexion */}
      <Button tile="Se déconnecter" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    alignSelf: "flex-start", // Aligner à gauche
  },
  list: {
    width: "100%",
  },
  taskItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16,
  },
  errorText: {
    color: "reds",
    marginVertical: 10,
  },
});
