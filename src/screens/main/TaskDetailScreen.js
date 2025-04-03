// src/screens/main/TaskDetailScreen.js
import React, { useState, useEffect, useCallback, useContext } from "react"; // Ajout de useContext
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Text,
  Appbar,
  useTheme,
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  List, // Assurez-vous que List est importé si vous l'utilisez dans le rendu
} from "react-native-paper";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import apiClient from "../../api/apiClient";
import moment from "moment";
import "moment/locale/fr";

// Vérifiez bien ce chemin d'importation
import UserSearchModal from "../../components/sharing/UserSearchModal";
import { AuthContext } from "../../context/AuthContext"; // Correction de la typo

moment.locale("fr");

export default function TaskDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const { taskId } = route.params;

  const { userInfo } = useContext(AuthContext); // Utilisation de useContext
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log(`TaskDetail: Fetching task ${taskId}`);
      const response = await apiClient.get(`/tasks/${taskId}`);
      setTask(response.data);
    } catch (err) {
      console.error(
        "Erreur chargement détail tâche:",
        err.response?.data || err.message
      );
      if (err.response && err.response.status === 404) {
        setError("Tâche non trouvée.");
      } else if (err.response && err.response.status === 401) {
        setError("Accès non autorisé.");
      } else {
        setError("Impossible de charger les détails de la tâche.");
      }
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useFocusEffect(fetchTaskDetails);

  const handleDelete = () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette tâche ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            // Utiliser un indicateur séparé ou non, selon préférence
            // setIsLoading(true);
            try {
              await apiClient.delete(`/tasks/${taskId}`);
              Alert.alert("Succès", "Tâche supprimée.");
              navigation.goBack();
            } catch (err) {
              console.error("Erreur suppression tâche:", err);
              Alert.alert("Erreur", "Impossible de supprimer la tâche.");
              // setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Pas de changement ici, mais la logique dépend de l'API backend
  const handleToggleComplete = async () => {
    const newStatus = task?.status === "completed" ? "pending" : "completed";
    console.log(`Toggle status pour tâche ${taskId} vers ${newStatus}`);
    // Utiliser un indicateur séparé ou non
    // setIsLoading(true);
    try {
      // Si l'API /complete bascule, c'est ok. Sinon, il faudrait une API PUT/PATCH
      await apiClient.patch(`/tasks/${taskId}/complete`);
      // Recharger les données pour voir le changement
      fetchTaskDetails();
      // Alert.alert("Succès", `Statut mis à jour.`); // Optionnel
    } catch (err) {
      console.error("Erreur complete task:", err);
      Alert.alert("Erreur", "Impossible de changer le statut.");
      // setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (task) {
      navigation.navigate("EditTask", { task: task });
    } else {
      Alert.alert(
        "Erreur",
        "Données de la tâche non disponibles pour modification."
      );
    }
  };

  // Fonction qui ouvre la modale
  const handleShareTask = () => {
    console.log("Ouverture modale partage pour Tâche ID:", taskId);
    setIsShareModalVisible(true);
  };

  // Fonction appelée par la modale quand un utilisateur est sélectionné
  const handleShareTaskWithUser = async (selectedUserId) => {
    console.log(
      `TaskDetail: Début partage tâche ${taskId} avec user ID ${selectedUserId}`
    );
    // Optionnel: afficher un indicateur spécifique au partage
    // setIsSharing(true);
    try {
      await apiClient.post(`/tasks/${taskId}/share`, {
        sharedWith: selectedUserId,
      });
      // Le feedback succès est dans le modal (Snackbar)
      console.log(`TaskDetail: Partage tâche ${taskId} réussi.`);
    } catch (err) {
      console.error(
        "Erreur API partage tâche:",
        err.response?.data || err.message
      );
      // Le feedback erreur est dans le modal (Snackbar)
    } finally {
      // setIsSharing(false);
    }
  };

  // --- Rendu ---
  if (isLoading && !task) {
    // Afficher chargement seulement si pas de données précédentes
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Erreur" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <Button onPress={fetchTaskDetails}>Réessayer</Button>
        </View>
      </View>
    );
  }

  if (!task) {
    // Si pas de tâche après chargement sans erreur (cas improbable?)
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Introuvable" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text>Cette tâche n'a pas été trouvée.</Text>
        </View>
      </View>
    );
  }

  // Rendu principal
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Détails Tâche" subtitle={task.title} />
        <Appbar.Action
          icon="share-variant"
          onPress={handleShareTask}
          disabled={isLoading}
        />
        <Appbar.Action
          icon="pencil"
          onPress={handleEdit}
          disabled={isLoading}
        />
        <Appbar.Action
          icon="delete"
          onPress={handleDelete}
          disabled={isLoading}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchTaskDetails} />
        }
      >
        <Card style={styles.card}>
          <Card.Title title={task.title} titleVariant="headlineMedium" />
          <Card.Content>
            <List.Item
              title="Statut"
              description={
                task.status === "completed"
                  ? "Terminée"
                  : task.status === "in_progress"
                  ? "En cours"
                  : "En attente"
              }
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={
                    task.status === "completed"
                      ? "check-circle"
                      : "progress-clock"
                  }
                />
              )}
              // Bouton pour changer le statut (si API le permet)
              right={() => (
                // Changé en fonction retournant un composant
                <Button onPress={handleToggleComplete} disabled={isLoading}>
                  {task.status === "completed"
                    ? "Marquer à faire"
                    : "Marquer terminée"}
                </Button>
              )}
            />
            <Divider />
            {task.due_date && (
              <>
                <List.Item
                  title="Échéance"
                  description={moment(task.due_date).format(
                    "dddd D MMMM YYYY à HH:mm"
                  )}
                  left={(props) => (
                    <List.Icon {...props} icon="calendar-clock" />
                  )}
                />
                <Divider />
              </>
            )}
            {task.description && (
              <>
                <List.Item
                  title="Description"
                  description={task.description}
                  descriptionNumberOfLines={10}
                  left={(props) => <List.Icon {...props} icon="text" />}
                />
                <Divider />
              </>
            )}
            {/* TODO: Afficher ici les informations de partage quand elles seront disponibles */}
            {/*
             <List.Section title="Partage">
                <List.Item title="Partagé par : ..." />
                <List.Item title="Partagé avec : ..." />
             </List.Section>
             */}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Rendu conditionnel du Modal */}
      <UserSearchModal
        visible={isShareModalVisible}
        onDismiss={() => setIsShareModalVisible(false)}
        onShare={handleShareTaskWithUser} // La fonction qui fait l'appel API
        itemType="task"
        itemId={taskId}
        currentUserId={userInfo?.id} // ID de l'utilisateur actuel
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: { padding: 16 },
  card: { marginBottom: 16 },
  errorText: { marginBottom: 10, textAlign: "center" },
});
