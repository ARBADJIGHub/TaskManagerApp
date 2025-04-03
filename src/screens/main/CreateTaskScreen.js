// src/screens/main/CreateTaskScreen.js
import React, { useState } from "react";
// Platform est nécessaire pour la condition
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
// Importer le picker (même s'il n'est pas utilisé sur web)
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import "moment/locale/fr";
import apiClient from "../../api/apiClient";
import { useNavigation } from "@react-navigation/native";

moment.locale("fr");

export default function CreateTaskScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Garder l'état, mais il ne sera pas modifié sur web
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const theme = useTheme();
  const navigation = useNavigation();

  const onChangeDate = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      return;
    }
    const currentDate = selectedDate || dueDate;
    setShowPicker(Platform.OS === "ios"); // Peut-être seulement setShowPicker(false) suffit
    setShowPicker(false);
    setDueDate(currentDate);
  };
  const showMode = (currentMode) => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Non supporté",
        "La sélection de date n'est pas supportée sur le web pour le moment."
      );
      return;
    }
    setShowPicker(true);
    setPickerMode(currentMode);
  };
  const showDatepicker = () => showMode("date");
  const showTimepicker = () => showMode("time");

  const validateForm = () => {
    console.log("[CreateTaskScreen] validateForm: Vérification titre =", title);
    const newErrors = {};
    if (!title.trim()) {
      console.log("[CreateTaskScreen] validateForm: Erreur - Titre vide");
      newErrors.title = "Le titre est requis.";
    }
    setErrors(newErrors);
    const result = Object.keys(newErrors).length === 0;
    console.log("[CreateTaskScreen] validateForm: Retourne", result);
    return result;
  };
  const handleCreateTask = async () => {
    console.log("[CreateTaskScreen] handleCreateTask: Bouton cliqué !");
    const isValid = validateForm();
    console.log(
      "[CreateTaskScreen] handleCreateTask: Résultat validation =",
      isValid
    );
    if (!isValid) {
      console.log(
        "[CreateTaskScreen] handleCreateTask: Validation échouée, sortie."
      );
      return;
    }
    console.log(
      "[CreateTaskScreen] handleCreateTask: Validation réussie, début création API..."
    );
    setIsLoading(true);
    setErrors({});
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        due_date: moment(dueDate).isValid()
          ? moment(dueDate).format("YYYY-MM-DD HH:mm:ss")
          : null,
      };
      console.log(
        "[CreateTaskScreen] handleCreateTask: Envoi des données tâche:",
        taskData
      );
      const response = await apiClient.post("/tasks", taskData);
      console.log(
        "[CreateTaskScreen] handleCreateTask: Réponse API reçue:",
        response.date
      );
      Alert.alert("Succès", "Tâche créée avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error(
        "[CreateTaskScreen] handleCreateTask: Erreur API",
        error.response?.data || error.message || error
      );
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Impossible de créer la tâche."
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
        <Appbar.Content title="Nouvelle Tâche" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ... TextInput Titre / Description ... */}
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

        {/* Affichage de la date (même si non modifiable sur web) */}
        <Text style={styles.dateLabel}>Échéance :</Text>
        <Text style={styles.dateValue}>
          {moment(dueDate).format("ddd D MMM Yfine à HH:mm")}
        </Text>

        {/* Boutons pour ouvrir les pickers (désactivés sur web implicitement par showMode) */}
        {Platform.OS !== "web" && ( // N'afficher les boutons que si PAS web
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
        {/* Message informatif pour le web */}
        {Platform.OS === "web" && (
          <Text style={styles.webDateInfo}>
            (Sélection date/heure non supportée sur web)
          </Text>
        )}

        {/* Affichage conditionnel du DateTimePicker (ne s'affichera pas sur web si showPicker reste false) */}
        {showPicker && Platform.OS !== "web" && (
          <DateTimePicker
            testID="dateTimePickerTask"
            value={dueDate}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* ... Bouton Créer / ActivityIndicator ... */}
        {isLoading ? (
          <ActivityIndicator
            animating={true}
            style={styles.activityIndicator}
          />
        ) : (
          <Button
            mode="contained"
            onPress={handleCreateTask}
            style={styles.button}
          >
            {" "}
            Créer la Tâche{" "}
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

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
  }, // Style pour le message web
  button: { marginTop: 16, paddingVertical: 8 },
  activityIndicator: { marginTop: 20 },
});
