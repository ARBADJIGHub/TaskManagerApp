// src/screens/main/ConversationScreen.js
import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react"; // Ajouter useCallback, useRef
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Appbar,
  useTheme,
  TextInput,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native"; // Ajouter useFocusEffect
import apiClient from "../../api/apiClient";
import { AuthContext } from "../../context/AuthContext";
import moment from "moment";
import "moment/locale/fr"; // S'assurer que la locale est chargée

moment.locale("fr");

export default function ConversationScreen() {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, userName } = route.params;
  const { userInfo, userToken, logout } = useContext(AuthContext); // Ajouter logout

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null); // Référence pour scroller la liste

  const fetchMessages = useCallback(async () => {
    // useCallback pour la fonction de fetch
    if (!userToken || !userId) return;
    console.log(`ConversationScreen: Fetch messages avec user ID: ${userId}`);
    setIsLoading(true); // Peut être utilisé pour un indicateur spécifique ou le refresh
    setError(null);
    try {
      const response = await apiClient.get(`/messages/conversations/${userId}`);
      console.log("Messages reçus:", response.data);
      // Les messages sont déjà triés par le backend (ORDER BY created_at ASC)
      setMessages(response.data);
      // Marquer les messages comme lus (idéalement, le backend devrait le faire quand on les récupère)
      markMessagesAsRead();
    } catch (err) {
      console.error(
        "Erreur chargement messages:",
        err.response?.data || err.message
      );
      if (err.response && err.response.status === 401) {
        setError("Session invalide.");
        setTimeout(logout, 1500);
      } else {
        setError("Impossible de charger les messages.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, userToken, logout]); // Dépendances

  // Utiliser useFocusEffect pour rafraîchir quand on revient sur l'écran
  useFocusEffect(fetchMessages);

  // Fonction pour marquer les messages comme lus (appel API)
  const markMessagesAsRead = async () => {
    try {
      // On pourrait optimiser et ne marquer que les IDs non lus, mais pour l'instant on marque toute la conv
      await apiClient.patch(`/messages/conversations/${userId}/read`);
      console.log("Messages marqués comme lus (tentative)");
    } catch (readError) {
      console.error("Erreur lors du marquage comme lu:", readError);
    }
  };

  const handleSendMessage = async () => {
    // ... (logique d'envoi existante) ...
    if (!newMessage.trim() || !userId || isSending) return;
    const tempMessageId = `temp_${Date.now()}`; // ID temporaire unique
    const messageContent = newMessage.trim(); // Sauvegarder le contenu
    setNewMessage(""); // Vider l'input immédiatement

    // Ajout optimiste
    const sentMessage = {
      id: tempMessageId, // Utiliser l'ID temporaire
      content: messageContent,
      sender_id: userInfo.id,
      receiver_id: userId,
      created_at: new Date().toISOString(),
      is_read: false,
      isSending: true, // Marqueur pour UI si besoin
    };
    setMessages((prevMessages) => [...prevMessages, sentMessage]);

    setIsSending(true);
    setError(null);
    try {
      console.log("Envoi message:", {
        content: messageContent,
        receiverId: userId,
      });
      const response = await apiClient.post("/messages", {
        content: messageContent,
        receiverId: userId,
      });
      console.log("Réponse envoi:", response.data);

      // Mettre à jour le message local avec l'ID réel et retirer l'indicateur d'envoi
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === tempMessageId
            ? { ...msg, id: response.data.messageId, isSending: false }
            : msg
        )
      );
    } catch (err) {
      console.error("Erreur envoi message:", err.response?.data || err.message);
      setError("Erreur d'envoi.");
      // Marquer le message local comme échoué
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === tempMessageId
            ? { ...msg, isSending: false, error: true }
            : msg
        )
      );
      // Remettre le texte dans l'input pour que l'user puisse réessayer?
      // setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isMyMessage = item.sender_id === userInfo?.id; // Vérifier si userInfo existe
    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isMyMessage ? "flex-end" : "flex-start" }, // Aligner toute la ligne
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessage : styles.otherMessage,
            {
              backgroundColor: isMyMessage
                ? theme.colors.primaryContainer
                : theme.colors.surfaceVariant,
            },
            item.error ? styles.errorMessage : null, // Style si erreur d'envoi
          ]}
        >
          <Text
            style={{
              color: isMyMessage
                ? theme.colors.onPrimaryContainer
                : theme.colors.onSurfaceVariant,
            }}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isMyMessage
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
                opacity: 0.7,
              },
            ]}
          >
            {/* Afficher indicateur d'envoi ou l'heure */}
            {item.isSending
              ? "Envoi..."
              : moment(item.created_at).format("HH:mm")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined} // 'height' peut poser problème parfois
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Ajuster selon l'en-tête et la barre d'onglets/stack
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={userName || "Conversation"} />
      </Appbar.Header>

      {isLoading && messages.length === 0 && (
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
      {!isLoading && !error && messages.length === 0 && (
        <Text style={styles.emptyText}>
          Aucun message. Commencez la conversation !
        </Text>
      )}

      <FlatList
        ref={flatListRef} // Ajouter la référence
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessageItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        inverted // Important pour le chat
        refreshing={isLoading} // Peut être utilisé pour un indicateur de rafraîchissement
        onRefresh={fetchMessages} // Permettre le pull-to-refresh pour recharger
      />

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Votre message..."
          value={newMessage}
          onChangeText={setNewMessage}
          mode="outlined"
          multiline
          dense // Rendre un peu moins haut
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSendMessage}
          disabled={isSending || !newMessage.trim()}
          iconColor={theme.colors.primary}
          animated // Ajouter une petite animation
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// Styles mis à jour pour le chat
const styles = StyleSheet.create({
  container: { flex: 1 },
  activityIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: { margin: 20, textAlign: "center" },
  emptyText: {
    flex: 1,
    textAlign: "center",
    marginTop: 50,
    fontStyle: "italic",
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingBottom: 10 }, // Espace en bas aussi
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "grey", // Ou theme.colors.outline
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100, // Limiter la hauteur si multiline
  },
  messageRow: {
    // Nouvelle vue pour aligner la bulle
    marginVertical: 4,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20, // Plus arrondi
    maxWidth: "75%", // Un peu moins large
  },
  myMessage: {
    // Pas besoin de alignSelf ici si messageRow le gère
    backgroundColor: "#DCF8C6", // Exemple couleur pour mes messages
    borderBottomRightRadius: 5,
  },
  otherMessage: {
    // Pas besoin de alignSelf ici
    backgroundColor: "#FFFFFF", // Exemple couleur pour autres messages
    borderBottomLeftRadius: 5,
    // Ajouter une bordure pour mieux distinguer sur fond blanc
    // borderWidth: StyleSheet.hairlineWidth,
    // borderColor: '#E0E0E0',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
    opacity: 0.6, // Rendre plus discret
  },
  errorMessage: {
    // Style pour les messages échoués
    opacity: 0.7,
    borderColor: "red",
    borderWidth: 1,
  },
});
