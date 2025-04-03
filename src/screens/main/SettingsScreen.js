// src/screens/main/SettingsScreen.js
import React, { useContext, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Appbar,
  useTheme,
  Switch,
  List,
  Divider,
  ActivityIndicator,
  Button,
} from "react-native-paper";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient"; // Assurez-vous que le chemin est correct
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { logout, userInfo, userToken } = useContext(AuthContext);

  const [settings, setSettings] = useState({ notification_enabled: true }); // Valeur par défaut
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les paramètres depuis le backend au montage (si implémenté)
  useEffect(() => {
    const fetchSettings = async () => {
      if (!userToken) return;
      setIsLoading(true);
      setError(null);
      try {
        console.log(
          "SettingsScreen: Tentative de récupération des paramètres..."
        );
        const response = await apiClient.get("/settings"); // Route GET /api/settings
        console.log("SettingsScreen: Paramètres reçus:", response.data);
        if (
          response.data &&
          typeof response.data.notification_enabled !== "undefined"
        ) {
          setSettings(response.data);
        } else {
          // Utiliser des valeurs par défaut si la réponse est vide ou incomplète
          setSettings({ notification_enabled: true, ...response.data });
          console.log(
            "SettingsScreen: Utilisation de paramètres par défaut ou partiels."
          );
        }
      } catch (err) {
        console.error(
          "Erreur chargement settings:",
          err.response?.data || err.message
        );
        setError("Impossible de charger les paramètres.");
        // Garder les valeurs par défaut en cas d'erreur
        setSettings({ notification_enabled: true });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [userToken]);

  // Mettre à jour les notifications (backend à implémenter si nécessaire)
  const handleUpdateNotificationSetting = async (isEnabled) => {
    console.log("Mise à jour notifs :", isEnabled);
    setSettings((prev) => ({ ...prev, notification_enabled: isEnabled })); // Mise à jour optimiste locale
    try {
      // Décommentez et adaptez si vous avez la route PATCH /api/settings/notifications
      // await apiClient.patch('/settings/notifications', { notificationsEnabled: isEnabled });
      console.log(
        "SettingsScreen: Préférence de notification mise à jour (localement)."
      );
      // Alert.alert("Info", "Paramètre de notification mis à jour.");
    } catch (err) {
      Alert.alert("Erreur", "Impossible de mettre à jour les notifications.");
      // Revenir à l'état précédent en cas d'erreur API
      setSettings((prev) => ({ ...prev, notification_enabled: !isEnabled }));
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Info",
      "Navigation vers changement de mot de passe (à implémenter)."
    );
    // navigation.navigate('ChangePassword'); // Créez cet écran si besoin
  };

  const handleExportData = async () => {
    Alert.alert("Info", "Exportation des données (à implémenter)...");
    // try {
    //     const response = await apiClient.get('/settings/export-data');
    //     console.log("Données exportées:", response.data);
    // } catch (err) { Alert.alert("Erreur", "Impossible d'exporter les données."); }
  };

  const handleDeleteAccount = () => {
    Alert.alert("Confirmation" /* ... (message de confirmation) ... */);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Paramètres" />
      </Appbar.Header>

      {isLoading && (
        <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
      )}
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      {!isLoading && !error && (
        <ScrollView>
          {/* Section Apparence */}
          <List.Section title="Apparence">
            <List.Item
              title="Mode Sombre"
              left={() => (
                <List.Icon
                  icon={isDarkMode ? "weather-night" : "white-balance-sunny"}
                />
              )}
              right={() => (
                <Switch value={isDarkMode} onValueChange={toggleTheme} />
              )}
            />
            {/* TODO: Ajouter le réglage des couleurs primaires/secondaires si souhaité */}
          </List.Section>
          <Divider />

          {/* Section Compte */}
          <List.Section title="Compte">
            <List.Item
              title="Nom d'utilisateur"
              description={userInfo?.username || "..."}
              left={() => <List.Icon icon="account" />}
            />
            <List.Item
              title="Email"
              description={userInfo?.email || "..."}
              left={() => <List.Icon icon="email" />}
            />
            <List.Item
              title="Changer le mot de passe"
              left={() => <List.Icon icon="lock-reset" />}
              onPress={handleChangePassword}
            />
            <List.Item
              title="Se déconnecter"
              left={() => (
                <List.Icon color={theme.colors.error} icon="logout" />
              )}
              titleStyle={{ color: theme.colors.error }}
              onPress={logout}
            />
          </List.Section>
          <Divider />

          {/* Section Notifications */}
          <List.Section title="Notifications">
            <List.Item
              title="Activer les notifications"
              left={() => <List.Icon icon="bell" />}
              // Utilise l'état local 'settings' qui peut être chargé depuis le backend
              right={() => (
                <Switch
                  value={settings?.notification_enabled ?? true}
                  onValueChange={handleUpdateNotificationSetting}
                />
              )}
            />
          </List.Section>
          <Divider />

          {/* Section Données */}
          <List.Section title="Données">
            <List.Item
              title="Exporter mes données"
              left={() => <List.Icon icon="export" />}
              onPress={handleExportData}
            />
            <List.Item
              title="Supprimer mon compte"
              titleStyle={{ color: theme.colors.error }}
              left={() => (
                <List.Icon color={theme.colors.error} icon="delete-forever" />
              )}
              onPress={handleDeleteAccount}
            />
          </List.Section>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { color: "red", textAlign: "center", margin: 10 },
});
