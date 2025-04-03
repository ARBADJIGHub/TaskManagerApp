// src/screens/main/EditAppointmentScreen.js
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

export default function EditAppointmentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  // Récupérer le rendez-vous passé en paramètre
  const { appointment } = route.params;

  // Initialiser les états avec les données existantes
  const [title, setTitle] = useState(appointment?.title || "");
  const [description, setDescription] = useState(
    appointment?.description || ""
  );
  const [location, setLocation] = useState(appointment?.location || "");
  const [startTime, setStartTime] = useState(
    appointment?.start_time
      ? moment(appointment.start_time).toDate()
      : new Date()
  );
  const [endTime, setEndTime] = useState(
    appointment?.end_time
      ? moment(appointment.end_time).toDate()
      : moment().add(1, "hour").toDate()
  );
  // États pour le picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [pickerTarget, setPickerTarget] = useState("start");
  // Autres états
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Logique du DateTimePicker (identique à CreateAppointmentScreen)
  const onChangeDateTime = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      const currentDate = selectedDate;
      if (pickerTarget === "start") {
        if (moment(currentDate).isSameOrAfter(moment(endTime))) {
          setEndTime(moment(currentDate).add(1, "hour").toDate());
        }
        setStartTime(currentDate);
      } else {
        // pickerTarget === 'end'
        if (moment(currentDate).isSameOrBefore(moment(startTime))) {
          Alert.alert(
            "Erreur",
            "L'heure de fin doit être après l'heure de début."
          );
        } else {
          setEndTime(currentDate);
        }
      }
    }
  };

  const showModeFor = (target, currentMode) => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Non supporté",
        "Sélection date/heure non interactive sur web."
      );
      return;
    }
    setPickerTarget(target);
    setPickerMode(currentMode);
    setShowPicker(true);
  };

  // Validation (identique à CreateAppointmentScreen)
  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Le titre est requis.";
    if (!startTime) newErrors.startTime = "L'heure de début est requise.";
    if (!endTime) newErrors.endTime = "L'heure de fin est requise.";
    if (
      startTime &&
      endTime &&
      moment(endTime).isSameOrBefore(moment(startTime))
    ) {
      newErrors.endTime = "La fin doit être après le début.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Logique de mise à jour du rendez-vous
  const handleUpdateAppointment = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const updatedAppointmentData = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || null,
        start_time: moment(startTime).format("YYYY-MM-DD HH:mm:ss"),
        end_time: moment(endTime).format("YYYY-MM-DD HH:mm:ss"),
      };
      console.log(
        `Mise à jour RDV ID ${appointment.id}:`,
        updatedAppointmentData
      );
      // Utiliser la méthode PUT et l'ID du rendez-vous
      await apiClient.put(
        `/appointments/${appointment.id}`,
        updatedAppointmentData
      );
      Alert.alert("Succès", "Rendez-vous mis à jour avec succès !");
      navigation.goBack(); // Revenir à l'écran précédent
    } catch (error) {
      console.error(
        "Erreur mise à jour RDV:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Erreur",
        error.response?.data?.message ||
          "Impossible de mettre à jour le rendez-vous."
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
        <Appbar.Content title="Modifier Rendez-vous" />
        <Appbar.Action
          icon="content-save"
          onPress={handleUpdateAppointment}
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
          {moment(startTime).format("ddd D MMM H:mm")}
        </Text>
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
          {moment(endTime).format("ddd D MMM H:mm")}
        </Text>
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
        {Platform.OS === "web" && (
          <Text style={styles.webDateInfo}>
            (Sélection date/heure non interactive sur web)
          </Text>
        )}
        {errors.endTime && (
          <HelperText type="error">{errors.endTime}</HelperText>
        )}

        {/* Le DateTimePicker communautaire */}
        {showPicker && Platform.OS !== "web" && (
          <DateTimePicker
            testID="dateTimePickerApptEdit"
            value={pickerTarget === "start" ? startTime : endTime}
            mode={pickerMode}
            is24Hour={true}
            display="default"
            onChange={onChangeDateTime}
            minimumDate={
              pickerTarget === "end" && startTime
                ? moment(startTime).add(1, "minute").toDate()
                : undefined
            }
          />
        )}

        {isLoading && (
          <ActivityIndicator
            animating={true}
            style={styles.activityIndicator}
          />
        )}

        {/* Le bouton principal est dans l'Appbar */}
      </ScrollView>
    </View>
  );
}

// Styles (similaires à CreateAppointmentScreen)
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
