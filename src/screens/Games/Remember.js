import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ObjectTrackerScreen = () => {
  const [memories, setMemories] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  // Mock data for demonstration
  useEffect(() => {
    const mockMemories = [
      {
        id: "1",
        image:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop",
        tag: "Keys on kitchen counter 🗝️",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "2",
        image:
          "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=300&fit=crop",
        tag: "Reading glasses on bedside table 👓",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        id: "3",
        image:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop",
        tag: "Phone charger in living room drawer 🔌",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];
    setMemories(mockMemories);
  }, []);

  const filteredMemories = memories.filter((memory) =>
    memory.tag.toLowerCase().includes(searchInput.toLowerCase())
  );

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need camera roll permissions to help you track your items."
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const saveMemory = () => {
    if (!selectedImage || !tagInput.trim()) {
      Alert.alert(
        "Missing Information",
        "Please take a photo and add a description to save your memory."
      );
      return;
    }

    const newMemory = {
      id: Date.now().toString(),
      image: selectedImage,
      tag: tagInput.trim(),
      timestamp: new Date(),
    };

    setMemories((prev) => [newMemory, ...prev]);
    setSelectedImage(null);
    setTagInput("");

    Alert.alert("Memory Saved! 🎉", "Your item location has been recorded.");
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days === 0) {
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes < 1 ? "Just now" : `${minutes} minutes ago`;
      }
      return `${hours} hours ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const MemoryCard = ({ memory }) => (
    <View style={styles.memoryCard}>
      <Image source={{ uri: memory.image }} style={styles.memoryImage} />
      <View style={styles.memoryContent}>
        <Text style={styles.memoryTag}>{memory.tag}</Text>
        <Text style={styles.memoryTimestamp}>
          {formatTimestamp(memory.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track My Things 🧠</Text>
        <Text style={styles.headerSubtitle}>
          Remember where you put your items
        </Text>

        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search memories..."
          placeholderTextColor="#a0a0a0"
          value={searchInput}
          onChangeText={setSearchInput}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Capture Section */}
        <View style={styles.captureSection}>
          <Text style={styles.sectionTitle}>📸 Add New Memory</Text>

          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="#ff4757" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#fff" />
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="images" size={32} color="#fff" />
                <Text style={styles.imageButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tag Input */}
          <TextInput
            style={styles.tagInput}
            placeholder="Where did you put this item? (e.g., Keys in kitchen drawer)"
            placeholderTextColor="#a0a0a0"
            value={tagInput}
            onChangeText={setTagInput}
            multiline
            maxLength={100}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedImage || !tagInput.trim()) && styles.saveButtonDisabled,
            ]}
            onPress={saveMemory}
            disabled={!selectedImage || !tagInput.trim()}
          >
            <Ionicons name="bookmark" size={24} color="white" />
            <Text style={styles.saveButtonText}>Save Memory</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>📅 Your Recent Memories</Text>

          {filteredMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No memories found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try searching for an item!
              </Text>
            </View>
          ) : (
            filteredMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2d3748",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#718096",
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#2d3748",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  captureSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 16,
  },
  selectedImageContainer: {
    position: "relative",
    alignSelf: "center",
    marginBottom: 16,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f7fafc",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: "#667eea",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: (width - 80) / 2,
    minHeight: 100,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 8,
  },
  tagInput: {
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#2d3748",
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: "#cbd5e0",
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  timelineSection: {
    marginTop: 24,
    marginBottom: 40,
  },
  memoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  memoryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f7fafc",
    marginRight: 16,
  },
  memoryContent: {
    flex: 1,
  },
  memoryTag: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 4,
    lineHeight: 24,
  },
  memoryTimestamp: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#718096",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#a0aec0",
    textAlign: "center",
  },
});

export default ObjectTrackerScreen;
