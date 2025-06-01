// LanguageSelectorModal.tsx

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "kananada" },
  { code: "ta", label: "Tamil" },
];

const LanguageSelectorModal = ({ isVisible, onClose }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (code) => {
    if (code !== i18n.language) {
      i18n.changeLanguage(code);
    }
    onClose();
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.container}>
        <Text style={styles.title}>🌐 Select Language</Text>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            style={[
              styles.option,
              i18n.language === lang.code && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.label,
                i18n.language === lang.code && styles.selectedLabel,
              ]}
            >
              {lang.label} {i18n.language === lang.code ? "✅" : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  option: {
    paddingVertical: 14,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  selectedOption: {
    backgroundColor: "#e0f7fa",
  },
  selectedLabel: {
    fontWeight: "bold",
    color: "#00796b",
  },
});

export default LanguageSelectorModal;
