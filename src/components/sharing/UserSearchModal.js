// src/components/sharing/UserSearchModal.js
import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Modal,
  Portal,
  Searchbar,
  List,
  ActivityIndicator,
  Text,
  Button,
  Divider,
  useTheme,
  Snackbar, // Pour les messages de succès/erreur
} from "react-native-paper";
import apiClient from "../../api/apiClient";
import debounce from "lodash.debounce"; // Pour éviter trop d'appels API

// Définir le délai pour le debounce (en millisecondes)
const DEBOUNCE_DELAY = 500;

const UserSearchModal = ({
  visible, // Booléen pour afficher/cacher la modale
  onDismiss, // Fonction appelée quand la modale doit se fermer
  onShare, // Fonction appelée avec l'ID de l'utilisateur sélectionné
  itemType, // 'task' ou 'appointment' (pour les messages d'erreur/succès)
  itemId, // ID de l'élément à partager
  currentUserId, // ID de l'utilisateur actuel pour l'exclure des résultats
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState(null);
  const [isSharing, setIsSharing] = useState(false); // Pour l'indicateur lors du partage
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Fonction pour exécuter la recherche d'utilisateurs
  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      // Ne pas chercher si vide ou trop court
      setSearchResults([]);
      setErrorSearch(null);
      setIsLoadingSearch(false);
      return;
    }
    console.log(`[UserSearchModal] Recherche utilisateurs pour: "${query}"`);
    setIsLoadingSearch(true);
    setErrorSearch(null);
    try {
      const response = await apiClient.get("/messages/users/search", {
        params: { q: query.trim() },
      });
      // Exclure l'utilisateur actuel des résultats
      const filteredResults = response.data.filter(
        (user) => user.id !== currentUserId
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error(
        "[UserSearchModal] Erreur recherche:",
        error.response?.data || error.message
      );
      setErrorSearch("Erreur lors de la recherche.");
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Créer une version "debounced" de la fonction de recherche
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce(performSearch, DEBOUNCE_DELAY), [
    currentUserId,
  ]);

  // Effet pour lancer la recherche quand searchQuery change (après debounce)
  useEffect(() => {
    debouncedSearch(searchQuery);
    // Annuler la recherche debounced si le composant est démonté ou si searchQuery change
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  // Fonction appelée lorsqu'un utilisateur est sélectionné pour le partage
  const handleSelectUser = async (selectedUser) => {
    console.log(
      `[UserSearchModal] Partage de ${itemType} ID ${itemId} avec User ID ${selectedUser.id}`
    );
    setIsSharing(true); // Afficher l'indicateur
    try {
      // Construire l'URL en fonction du type d'élément
      const shareUrl = `/${itemType}s/${itemId}/share`; // Ex: /tasks/123/share ou /appointments/456/share
      await apiClient.post(shareUrl, { sharedWith: selectedUser.id });

      setSnackbarMessage(
        `${itemType === "task" ? "Tâche" : "Rendez-vous"} partagé avec ${
          selectedUser.username
        } !`
      );
      setSnackbarVisible(true);
      // Appeler la fonction onShare si elle est fournie (optionnel)
      if (onShare) {
        onShare(selectedUser.id);
      }
      // Fermer la modale après un court délai pour voir le Snackbar
      setTimeout(onDismiss, 1500);
    } catch (error) {
      console.error(
        "[UserSearchModal] Erreur partage:",
        error.response?.data || error.message
      );
      setSnackbarMessage(
        error.response?.data?.message || `Erreur lors du partage.`
      );
      setSnackbarVisible(true);
    } finally {
      setIsSharing(false); // Cacher l'indicateur
    }
  };

  // Rendu d'un utilisateur dans la liste des résultats
  const renderUserItem = ({ item }) => (
    <List.Item
      title={item.username}
      description={item.email}
      left={(props) => <List.Icon {...props} icon="account-circle-outline" />}
      right={(props) =>
        isSharing ? ( // Afficher indicateur si en cours de partage
          <ActivityIndicator style={{ marginRight: 10 }} />
        ) : (
          <Button
            {...props}
            mode="text"
            onPress={() => handleSelectUser(item)}
            disabled={isSharing} // Désactiver pendant le partage
          >
            Partager
          </Button>
        )
      }
    />
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">Partager</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>
        <Searchbar
          placeholder="Rechercher un utilisateur..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          loading={isLoadingSearch} // Indicateur dans la barre de recherche
        />

        {/* Zone d'affichage des résultats ou messages */}
        <View style={styles.resultsContainer}>
          {!isLoadingSearch && errorSearch && (
            <Text style={[styles.messageText, { color: theme.colors.error }]}>
              {errorSearch}
            </Text>
          )}
          {!isLoadingSearch &&
            !errorSearch &&
            searchQuery.length > 1 &&
            searchResults.length === 0 && (
              <Text style={styles.messageText}>Aucun utilisateur trouvé.</Text>
            )}
          {!isLoadingSearch && !errorSearch && searchQuery.length < 2 && (
            <Text style={styles.messageText}>
              Entrez au moins 2 caractères pour rechercher.
            </Text>
          )}

          {/* Liste des résultats */}
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUserItem}
            ItemSeparatorComponent={Divider}
            style={styles.list} // Pour que la liste prenne l'espace
            keyboardShouldPersistTaps="handled" // Permet de cliquer sur un item même si le clavier est ouvert
          />
        </View>
        {/* Snackbar pour les messages de succès/erreur */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={Snackbar.DURATION_SHORT} // Ou DURATION_MEDIUM
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: "80%", // Limiter la hauteur
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  searchbar: {
    marginBottom: 15,
  },
  resultsContainer: {
    flex: 1, // Prend l'espace restant pour la liste/messages
    minHeight: 100, // Hauteur minimale pour voir les messages
  },
  list: {
    flex: 1, // S'assure que la liste remplit l'espace
  },
  messageText: {
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  snackbar: {
    // Positionnement ou style si besoin
  },
});

export default UserSearchModal;
