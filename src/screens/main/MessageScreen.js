// src/screens/main/MessageScreen.js
import React, { useState, useContext, useCallback, useEffect } from "react";
import { View, StyleSheet, FlatList, Keyboard } from "react-native";
import {
  Text,
  Appbar,
  useTheme,
  List,
  Divider,
  ActivityIndicator,
  Searchbar, // Importé
  // Button, // Probablement plus nécessaire ici
  // TouchableRipple, // Probablement plus nécessaire ici
} from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient";
import debounce from "lodash.debounce"; // Assurez-vous de l'installer: npm install lodash.debounce

const DEBOUNCE_DELAY = 400; // Délai en ms

export default function MessageScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  // Correction: useContext(AuthContext) est utilisé correctement ici
  const { userToken, logout, userInfo } = useContext(AuthContext);

  // États pour les conversations existantes
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Chargement des conversations
  const [error, setError] = useState(null); // Erreur des conversations

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // Chargement de la recherche
  const [searchError, setSearchError] = useState(null); // Erreur de la recherche
  // On détermine si on affiche les résultats basé sur la longueur de la query
  const showSearchResults = searchQuery.trim().length > 0;

  // Fonction pour charger les conversations existantes
  const fetchConversations = useCallback(async () => {
    if (!userToken) return;
    console.log("MessageScreen: Appel fetchConversations");
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/messages/conversations");
      console.log("Conversations reçues:", response.data);
      setConversations(response.data);
    } catch (err) {
      console.error(
        "Erreur chargement conversations:",
        err.response?.data || err.message
      );
      if (err.response && err.response.status === 401) {
        setError("Session invalide.");
        setTimeout(logout, 1500);
      } else {
        setError("Impossible de charger les conversations.");
      }
      setConversations([]); // Vider en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  }, [userToken, logout]);

  // Recharger les conversations quand l'écran est focus
  useFocusEffect(fetchConversations);

  // Fonction pour exécuter la recherche d'utilisateurs
  const performSearch = async (query) => {
    const trimmedQuery = query.trim();
    // Ne cherche que si > 1 caractère pour éviter trop de résultats/charge
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      // Pas besoin de setShowSearchResults(false) ici, car basé sur searchQuery.length
      return;
    }

    console.log(`MessageScreen: Recherche pour "${trimmedQuery}"`);
    setIsSearching(true);
    setSearchError(null);

    try {
      // Correction de la typo: /search et non /serach
      const response = await apiClient.get("/messages/users/search", {
        params: { q: trimmedQuery },
      });
      // Filtrer l'utilisateur actuel des résultats
      const filteredResults = response.data.filter(
        (user) => user.id !== userInfo?.id
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error(
        "[MessageScreen] Erreur recherche:",
        err.response?.data || err.message
      );
      setSearchError("Erreur lors de la recherche.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Version debounced de la recherche
  const debouncedSearch = useCallback(debounce(performSearch, DEBOUNCE_DELAY), [
    userInfo?.id,
  ]);

  // Effet pour lancer la recherche quand searchQuery change
  useEffect(() => {
    debouncedSearch(searchQuery);
    // Nettoyage du debounce si le composant est démonté ou searchQuery change
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  // Naviguer vers la conversation quand un utilisateur est sélectionné
  const handleSelectUserFromSearch = (user) => {
    console.log(
      `Navigation vers conversation avec ${user.username} (ID: ${user.id})`
    );
    Keyboard.dismiss(); // Fermer le clavier
    setSearchQuery(""); // Réinitialiser la recherche après sélection
    setSearchResults([]);
    // setShowSearchResults(false); // N'est plus nécessaire avec la condition basée sur searchQuery
    navigation.navigate("Conversation", {
      userId: user.id,
      userName: user.username,
    });
  };

  // Rendu d'un item de résultat de recherche
  const renderSearchResultItem = ({ item }) => (
    <List.Item
      title={item.username}
      description={item.email}
      left={(props) => <List.Icon {...props} icon="account-plus-outline" />}
      onPress={() => handleSelectUserFromSearch(item)}
      // Utiliser TouchableRipple si on veut un effet visuel différent au clic
      // right={props => <Button {...props} mode="contained-tonal">Ouvrir</Button>}
    />
  );

  // Rendu d'un item de conversation existante
  const renderConversationItem = ({ item }) => (
    <List.Item
      title={item.username}
      left={(props) => <List.Icon {...props} icon="account-circle-outline" />}
      onPress={() =>
        navigation.navigate("Conversation", {
          userId: item.id,
          userName: item.username,
        })
      }
    />
  );

  // --- Rendu JSX du Composant ---
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Messages" />
        {/* Optionnel: Icône pour forcer/annuler recherche? Pas nécessaire pour l'instant */}
      </Appbar.Header>

      {/* Barre de recherche */}
      <Searchbar
        placeholder="Rechercher ou démarrer une conversation"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        loading={isSearching && searchQuery.trim().length >= 2} // Indicateur si recherche active
        onClearIconPress={() => setSearchQuery("")} // Vider la recherche
      />

      {/* Conteneur pour la liste (recherche OU conversations) */}
      <View style={styles.listContainer}>
        {/* Afficher les résultats de recherche si query non vide */}
        {showSearchResults ? (
          <>
            {isSearching && (
              <ActivityIndicator
                animating={true}
                style={styles.activityIndicator}
              />
            )}
            {searchError && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {searchError}
              </Text>
            )}
            {!isSearching &&
              !searchError &&
              searchQuery.trim().length >= 2 &&
              searchResults.length === 0 && (
                <Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text>
              )}
            {!isSearching && !searchError && searchQuery.trim().length < 2 && (
              <Text style={styles.emptyText}>
                Entrez au moins 2 caractères pour rechercher.
              </Text>
            )}
            {!searchError && searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => `search-${item.id.toString()}`}
                renderItem={renderSearchResultItem}
                ItemSeparatorComponent={Divider}
                keyboardShouldPersistTaps="handled" // Permet de cliquer sur un item sans fermer le clavier d'abord
              />
            )}
          </>
        ) : (
          // Sinon, afficher les conversations existantes
          <>
            {isLoading && conversations.length === 0 && (
              <ActivityIndicator
                animating={true}
                size="large"
                style={styles.activityIndicator}
              />
            )}
            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}
            {!isLoading && !error && conversations.length === 0 && (
              <Text style={styles.emptyText}>Aucune conversation active.</Text>
            )}
            {!error && conversations.length > 0 && (
              <FlatList
                data={conversations}
                keyExtractor={(item) => `conv-${item.id.toString()}`}
                renderItem={renderConversationItem}
                ItemSeparatorComponent={Divider}
                refreshing={isLoading}
                onRefresh={fetchConversations}
              />
            )}
          </>
        )}
      </View>
      {/* Le FAB n'est plus vraiment utile ici car on initie via la recherche */}
      {/* <FAB style={styles.fab} icon="message-plus-outline" onPress={() => {}} /> */}
    </View>
  );
}

// Styles (ajoutés/modifiés)
const styles = StyleSheet.create({
  container: { flex: 1 },
  searchbar: {
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  listContainer: {
    flex: 1, // Important pour que la FlatList s'affiche correctement
  },
  activityIndicator: {
    marginTop: 50, // Un peu d'espace
  },
  errorText: { margin: 20, textAlign: "center" },
  emptyText: { margin: 20, textAlign: "center", fontStyle: "italic" },
  // list: { flex: 1 }, // Plus nécessaire car listContainer a flex: 1
  // fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});
