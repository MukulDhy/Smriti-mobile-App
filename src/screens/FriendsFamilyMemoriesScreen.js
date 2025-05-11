import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";

const scrapbookPages = [
  {
    id: "1",
    image: require("../../assets/family.jpg"),
    note: "Our family picture!",
  },
  {
    id: "2",
    image: require("../../assets/beach.jpg"),
    note: "A day at the beach!",
  },
  {
    id: "3",
    image: require("../../assets/party.jpg"),
    note: "Mom's birthday celebration!",
  },
  {
    id: "4",
    image: require("../../assets/picnic.jpg"),
    note: "Picnic in the park.",
  },
  {
    id: "5",
    image: require("../../assets/recipe.jpg"),
    note: "Grandma’s secret recipe!",
  },
  {
    id: "6",
    image: require("../../assets/wedding.jpg"),
    note: "Best friend's wedding day.",
  },
];

const ScrapbookScreen = () => {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(0);
  const [sound, setSound] = useState(null);

  const playVoiceNote = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/audio.mp4")
    );
    setSound(sound);
    await sound.playAsync();
  };

  const nextPage = () => {
    if (currentPage < scrapbookPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("scrapbookHeader")}</Text>
      <View style={styles.scrapbookPage}>
        <Image
          source={scrapbookPages[currentPage].image}
          style={styles.image}
        />
        <Text style={styles.note}>{t(`scrapbookNote${currentPage + 1}`)}</Text>
        <TouchableOpacity
          onPress={playVoiceNote}
          style={styles.voiceNoteButton}
        >
          <Text style={styles.voiceNoteText}>{t("scrapbookVoiceNote")}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={prevPage}
          disabled={currentPage === 0}
          style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
        >
          <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={nextPage}
          disabled={currentPage === scrapbookPages.length - 1}
          style={[
            styles.navButton,
            currentPage === scrapbookPages.length - 1 && styles.disabledButton,
          ]}
        >
          <Text style={styles.navButtonText}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#4A4A4A",
  },
  scrapbookPage: {
    width: "90%",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: { width: 280, height: 280, borderRadius: 15, marginBottom: 15 },
  note: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    color: "#555",
  },
  voiceNoteButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#E76F51",
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  voiceNoteText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  navigation: { flexDirection: "row", marginTop: 20 },
  navButton: {
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: "#2A9D8F",
    borderRadius: 10,
    width: 60,
    alignItems: "center",
  },
  disabledButton: { backgroundColor: "#A8A8A8" },
  navButtonText: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
});

export default ScrapbookScreen;
