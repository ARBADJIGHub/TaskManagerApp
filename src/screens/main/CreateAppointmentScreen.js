// src/screens/main/CreateAppointmentScreen.js
import React, { useState } from "react";
// Assurez-vous que Platform est bien importé depuis react-native
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
// --- MODIFICATION IMPORT ---
// Importer le picker de base de la communauté
import DateTimePicker from "@react-native-community/datetimepicker";
// Supprimer l'import du modal picker
// import DateTimePickerModal from "react-native-modal-datetime-picker";
// --- FIN MODIFICATION IMPORT ---
import moment from "moment";
import "moment/locale/fr";
import apiClient from "../../api/apiClient";
import { useNavigation } from "@react-navigation/native";

moment.locale("fr");

export default function CreateAppointmentScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  // Initialiser avec des dates valides
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(moment().add(1, "hour").toDate());
  // États pour gérer le picker communautaire
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date"); // 'date' ou 'time'
  const [pickerTarget, setPickerTarget] = useState("start"); // 'start' ou 'end'
  // Autres états
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const theme = useTheme();
  const navigation = useNavigation();

  // --- GESTION MISE À JOUR DU PICKER COMMUNAUTAIRE ---
  const onChangeDateTime = (event, selectedDate) => {
    // Cacher le picker immédiatement (surtout nécessaire sur Android après sélection/annulation)
    setShowPicker(false);
    // Si une date est sélectionnée (et non annulée)
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;

      if (pickerTarget === "start") {
        console.log("Nouvelle heure de début:", currentDate);
        // Vérifier et ajuster l'heure de fin si nécessaire
        if (moment(currentDate).isSameOrAfter(moment(endTime))) {
          setEndTime(moment(currentDate).add(1, "hour").toDate());
        }
        setStartTime(currentDate);
      } else {
        // pickerTarget === 'end'
        console.log("Nouvelle heure de fin:", currentDate);
        // Vérifier si la fin est bien après le début
        if (moment(currentDate).isSameOrBefore(moment(startTime))) {
          Alert.alert(
            "Erreur",
            "L'heure de fin doit être après l'heure de début."
          );
          // Ne pas mettre à jour endTime
        } else {
          setEndTime(currentDate);
        }
      }
    } else {
      // L'utilisateur a annulé (surtout sur Android), ne rien faire
      console.log("Sélection de date/heure annulée");
    }
  };

  // Fonction pour déclencher l'affichage du picker
  const showModeFor = (target, currentMode) => {
    // Désactiver sur le web pour l'instant
    if (Platform.OS === "web") {
      Alert.alert(
        "Non supporté",
        "La sélection de date/heure n'est pas interactive sur le web dans cette version."
      );
      return; // Ne pas afficher le picker sur web
    }
    // Définir quelle date ('start'/'end') et quel mode ('date'/'time') afficher
    setPickerTarget(target);
    setPickerMode(currentMode);
    setShowPicker(true); // Afficher le picker (sur mobile)
  };
  // --- FIN GESTION PICKER ---

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Le titre est requis.";
    if (!startTime) newErrors.startTime = "L'heure de début est requise."; // Garder la validation
    if (!endTime) newErrors.endTime = "L'heure de fin est requise.";
    if (
      startTime &&
      endTime &&
      moment(endTime).isSameOrBefore(moment(startTime))
    ) {
      newErrors.endTime = "La fin doit être après le début."; // Ajouter cette validation
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAppointment = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const appointmentData = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || null,
        start_time: moment(startTime).format("YYYY-MM-DD HH:mm:ss"),
        end_time: moment(endTime).format("YYYY-MM-DD HH:mm:ss"),
      };
      console.log("Envoi des données RDV:", appointmentData);
      await apiClient.post("/appointments", appointmentData);
      Alert.alert("Succès", "Rendez-vous créé avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error(
        "Erreur création RDV:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Impossible de créer le rendez-vous."
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
        <Appbar.Content title="Nouveau Rendez-vous" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ... TextInput Titre, Description, Lieu (inchangés) ... */}
        <TextInput
          label="Titre *"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
          error={!!errors.title}
        />
        {errors.title && <HelperText type="error">{errors.title}</HelperText>}
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={3}
        />
        <TextInput
          label="Lieu"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          mode="outlined"
        />

        {/* Affichage et boutons pour StartTime */}
        <Text style={styles.dateLabel}>Début* :</Text>
        <Text style={styles.dateValue}>
          {/* Afficher la date même si on ne peut pas la changer sur web */}
          {moment(startTime).format("ddd D MMM H:mm")}
        </Text>
        {/* N'afficher les boutons que sur mobile */}
        {Platform.OS !== "web" && (
          <View style={styles.dateButtonsContainer}>
            <Button
              icon="calendar"
              mode="outlined"
              onPress={() => showModeFor("start", "date")}
              style={styles.dateButton}
            >
              {" "}
              Date Début{" "}
            </Button>
            <Button
              icon="clock-outline"
              mode="outlined"
              onPress={() => showModeFor("start", "time")}
              style={styles.dateButton}
            >
              {" "}
              Heure Début{" "}
            </Button>
          </View>
        )}
        {errors.startTime && (
          <HelperText type="error">{errors.startTime}</HelperText>
        )}

        {/* Affichage et boutons pour EndTime */}
        <Text style={styles.dateLabel}>Fin* :</Text>
        <Text style={styles.dateValue}>
          {/* Afficher la date même si on ne peut pas la changer sur web */}
          {moment(endTime).format("ddd D MMM H:mm")}
        </Text>
        {/* N'afficher les boutons que sur mobile */}
        {Platform.OS !== "web" && (
          <View style={styles.dateButtonsContainer}>
            <Button
              icon="calendar"
              mode="outlined"
              onPress={() => showModeFor("end", "date")}
              style={styles.dateButton}
            >
              {" "}
              Date Fin{" "}
            </Button>
            <Button
              icon="clock-outline"
              mode="outlined"
              onPress={() => showModeFor("end", "time")}
              style={styles.dateButton}
            >
              {" "}
              Heure Fin{" "}
            </Button>
          </View>
        )}
        {/* Message informatif pour le web */}
        {Platform.OS === "web" && (
          <Text style={styles.webDateInfo}>
            (Sélection date/heure non interactive sur web)
          </Text>
        )}
        {errors.endTime && (
          <HelperText type="error">{errors.endTime}</HelperText>
        )}

        {/* Le DateTimePicker communautaire (affiché conditionnellement UNIQUEMENT sur mobile) */}
        {showPicker && Platform.OS !== "web" && (
          <DateTimePicker
            testID="dateTimePickerAppt"
            value={pickerTarget === "start" ? startTime : endTime}
            mode={pickerMode}
            is24Hour={true}
            display="default" // Laisser le système natif choisir
            onChange={onChangeDateTime}
            locale="fr-FR" // Peut ne pas être supporté sur toutes les plateformes natives
            minimumDate={
              pickerTarget === "end" && startTime
                ? moment(startTime).add(1, "minute").toDate()
                : undefined
            }
          />
        )}

        {/* Bouton Créer / ActivityIndicator (inchangés) */}
        {isLoading ? (
          <ActivityIndicator
            animating={true}
            style={styles.activityIndicator}
          />
        ) : (
          <Button
            mode="contained"
            onPress={handleCreateAppointment}
            style={styles.button}
          >
            Créer le Rendez-vous
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

// Styles mis à jour pour inclure le message web
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  input: { marginBottom: 16 },
  dateLabel: { fontSize: 16, marginTop: 8, marginBottom: 4, color: "grey" },
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
