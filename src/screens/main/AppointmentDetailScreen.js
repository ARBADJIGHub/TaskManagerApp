// src/screens/main/AppointmentDetailScreen.js
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
  List,
} from "react-native-paper";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import apiClient from "../../api/apiClient";
import moment from "moment";
import "moment/locale/fr";

// Importer le modal et le contexte d'authentification
import UserSearchModal from "../../components/sharing/UserSearchModal"; // Vérifiez/Adaptez ce chemin
import { AuthContext } from "../../context/AuthContext"; // Importer AuthContext

moment.locale("fr");

export default function AppointmentDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const { appointmentId } = route.params;

  // Récupérer userInfo pour l'ID de l'utilisateur actuel
  const { userInfo } = useContext(AuthContext);
  // État pour la visibilité de la modale de partage
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les détails du RDV (inchangée)
  const fetchAppointmentDetails = useCallback(async () => {
    if (!appointmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log(`AppointmentDetail: Fetching appointment ${appointmentId}`);
      const response = await apiClient.get(`/appointments/${appointmentId}`);
      setAppointment(response.data);
    } catch (err) {
      console.error(
        "Erreur chargement détail RDV:",
        err.response?.data || err.message
      );
      if (err.response && err.response.status === 404) {
        setError("Rendez-vous non trouvé.");
      } else if (err.response && err.response.status === 401) {
        setError("Accès non autorisé ou session expirée.");
      } else {
        setError("Impossible de charger les détails du rendez-vous.");
      }
      setAppointment(null);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  useFocusEffect(fetchAppointmentDetails);

  // Gérer la suppression (inchangée)
  const handleDelete = () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer ce rendez-vous ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            // setIsLoading(true); // Optionnel
            try {
              await apiClient.delete(`/appointments/${appointmentId}`);
              Alert.alert("Succès", "Rendez-vous supprimé.");
              navigation.goBack();
            } catch (err) {
              console.error("Erreur suppression RDV:", err);
              Alert.alert("Erreur", "Impossible de supprimer le rendez-vous.");
              // setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Gérer la modification (inchangée)
  const handleEdit = () => {
    if (appointment) {
      navigation.navigate("EditAppointment", { appointment: appointment });
    } else {
      Alert.alert(
        "Erreur",
        "Données du rendez-vous non disponibles pour la modification."
      );
    }
  };

  // NOUVELLE fonction pour ouvrir la modale de partage
  const handleShare = () => {
    console.log("Ouverture modale partage pour RDV ID:", appointmentId);
    setIsShareModalVisible(true);
  };

  // NOUVELLE fonction appelée par la modale quand un utilisateur est sélectionné
  const handleShareAppointmentWithUser = async (selectedUserId) => {
    console.log(
      `AppointmentDetail: Partage du RDV ${appointmentId} avec user ID ${selectedUserId}`
    );
    // Optionnel: Gérer un état de chargement spécifique au partage
    // setIsSharing(true);
    try {
      await apiClient.post(`/appointments/${appointmentId}/share`, {
        sharedWith: selectedUserId,
      });
      // Le feedback (Snackbar) est géré dans la modale
      console.log(`AppointmentDetail: Partage RDV ${appointmentId} réussi.`);
    } catch (err) {
      console.error(
        "Erreur API partage RDV:",
        err.response?.data || err.message
      );
      // Le feedback (Snackbar) est géré dans la modale
    } finally {
      // setIsSharing(false);
    }
  };

  // --- Rendu ---
  if (isLoading && !appointment) {
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
          <Button onPress={fetchAppointmentDetails}>Réessayer</Button>
        </View>
      </View>
    );
  }

  if (!appointment) {
    // Si pas de RDV après chargement sans erreur
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Introuvable" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text>Ce rendez-vous n'a pas été trouvé.</Text>
        </View>
      </View>
    );
  }

  // Rendu principal
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Détails RDV"
          subtitle={appointment.title}
          subtitleStyle={{ fontSize: 14 }}
        />
        {/* Bouton Partager appelle maintenant handleShare (qui ouvre la modale) */}
        <Appbar.Action
          icon="share-variant"
          onPress={handleShare}
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

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title={appointment.title} titleVariant="headlineMedium" />
          <Card.Content>
            {/* Date et Heure */}
            <List.Item
              title="Date et Heure"
              description={`Du ${moment(appointment.start_time).format(
                "ddd D MMM, HH:mm"
              )} \nau ${moment(appointment.end_time).format(
                "ddd D MMM, HH:mm"
              )}`}
              descriptionNumberOfLines={2}
              left={(props) => <List.Icon {...props} icon="calendar-clock" />}
            />
            <Divider />

            {/* Lieu */}
            {appointment.location && (
              <>
                <List.Item
                  title="Lieu"
                  description={appointment.location}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                />
                <Divider />
              </>
            )}

            {/* Description */}
            {appointment.description && (
              <>
                <List.Item
                  title="Description"
                  description={appointment.description}
                  descriptionNumberOfLines={10}
                  left={(props) => <List.Icon {...props} icon="text" />}
                />
                <Divider />
              </>
            )}

            {/* TODO: Afficher les informations de partage ici (prochaine étape) */}
          </Card.Content>
          {/* TODO: Ajouter Card.Actions avec Confirmer/Refuser ici (prochaine étape) */}
        </Card>
      </ScrollView>

      {/* Rendu conditionnel du Modal de partage */}
      <UserSearchModal
        visible={isShareModalVisible}
        onDismiss={() => setIsShareModalVisible(false)}
        onShare={handleShareAppointmentWithUser} // Passe la fonction qui appelle l'API
        itemType="appointment" // Spécifie le type d'élément
        itemId={appointmentId}
        currentUserId={userInfo?.id} // Passe l'ID de l'utilisateur connecté
      />
    </View>
  );
}

// Styles
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
