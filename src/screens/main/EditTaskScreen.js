// src/screens/main/EditTaskScreen.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView, Platform } from "react-native";
import {
  TextInput,
  Button,
  Appbar,
  useTheme,
  ActivityIndicator,
  HelperText,
  Text,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import "moment/locale/fr";
import apiClient from "../../api/apiClient";
import { useRoute, useNavigation } from "@react-navigation/native";

moment.locale("fr");

export default function EditTaskScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const { task } = route.params; // Récupérer la tâche passée en paramètre

  // Initialiser les états avec les données de la tâche existante
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  // Convertir la date de la tâche (si elle existe) en objet Date pour le picker
  const [dueDate, setDueDate] = useState(
    task?.due_date ? moment(task.due_date).toDate() : new Date()
  );
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Logique du DatePicker (identique à CreateTaskScreen)
  const onChangeDate = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }
    const currentDate = selectedDate || dueDate;
    setShowPicker(Platform.OS === "ios"); // Garder ouvert sur iOS si besoin
    setShowPicker(false); // Fermer sur Android
    setDueDate(currentDate);
  };

  const showMode = (currentMode) => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Non supporté",
        "La sélection de date n'est pas interactive sur le web pour le moment."
      );
      return;
    }
    setShowPicker(true);
    setPickerMode(currentMode);
  };

  const showDatepicker = () => showMode("date");
  const showTimepicker = () => showMode("time");

  // Validation (identique à CreateTaskScreen)
  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = "Le titre est requis.";
    }
    // Ajouter d'autres validations si nécessaire
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Logique de mise à jour
  const handleUpdateTask = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const updatedTaskData = {
        title: title.trim(),
        description: description.trim(),
        // Formater la date pour l'API, ou envoyer null si invalide/non définie
        due_date: moment(dueDate).isValid()
          ? moment(dueDate).format("YYYY-MM-DD HH:mm:ss")
          : null,
      };
      console.log(`Mise à jour tâche ID ${task.id}:`, updatedTaskData);
      // Utiliser la méthode PUT et l'ID de la tâche
      await apiClient.put(`/tasks/${task.id}`, updatedTaskData);
      Alert.alert("Succès", "Tâche mise à jour avec succès !");
      // Revenir en arrière (probablement vers TaskDetailScreen qui se rafraîchira)
      navigation.goBack();
    } catch (error) {
      console.error(
        "Erreur mise à jour tâche:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Impossible de mettre à jour la tâche."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Modifier la Tâche" />
        {/* Ajouter un bouton Sauvegarder dans l'Appbar */}
        <Appbar.Action
          icon="content-save"
          onPress={handleUpdateTask}
          disabled={isLoading}
        />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Titre *"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
          error={!!errors.title}
        />
        {errors.title && (
          <HelperText type="error" visible={!!errors.title}>
            {errors.title}
          </HelperText>
        )}

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.dateLabel}>Échéance :</Text>
        <Text style={styles.dateValue}>
          {moment(dueDate).format("ddd D MMM YYYY à HH:mm")}
        </Text>

        {Platform.OS !== "web" && (
          <View style={styles.dateButtonsContainer}>
            <Button
              icon="calendar"
              mode="outlined"
              onPress={showDatepicker}
              style={styles.dateButton}
            >
              Modifier Date
            </Button>
            <Button
              icon="clock-outline"
              mode="outlined"
              onPress={showTimepicker}
              style={styles.dateButton}
            >
              Modifier Heure
            </Button>
          </View>
        )}
        {Platform.OS === "web" && (
          <Text style={styles.webDateInfo}>
            (Sélection date/heure non supportée sur web)
          </Text>
        )}

        {showPicker && Platform.OS !== "web" && (
          <DateTimePicker
            testID="dateTimePickerEditTask"
            value={dueDate}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onChange={onChangeDate}
          />
        )}

        {isLoading && (
          <ActivityIndicator
            animating={true}
            style={styles.activityIndicator}
          />
        )}

        {/* Le bouton principal est maintenant dans l'Appbar */}
        {/*
                <Button
                    mode="contained"
                    onPress={handleUpdateTask}
                    style={styles.button}
                    disabled={isLoading}
                >
                   {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                </Button>
                */}
      </ScrollView>
    </View>
  );
}

// Utiliser les mêmes styles que CreateTaskScreen ou adapter si besoin
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  input: { marginBottom: 16 },
  dateLabel: { fontSize: 16, marginBottom: 4, color: "grey" },
  dateValue: { fontSize: 18, marginBottom: 12, fontWeight: "500" },
  dateButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  dateButton: { flex: 1, marginHorizontal: 5 },
  webDateInfo: {
    alignSelf: "center",
    fontStyle: "italic",
    color: "grey",
    marginBottom: 16,
  },
  button: { marginTop: 16, paddingVertical: 8 },
  activityIndicator: { marginTop: 20 },
});
