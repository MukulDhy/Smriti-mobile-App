import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const MemoryWallScreen = () => {
  const [playingAudio, setPlayingAudio] = useState(null);
  const [sound, setSound] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Enhanced memory data with timeline and AI-like suggestions
  const memories = [
    {
      id: 1,
      date: "2010-09-19",
      year: 2010,
      title: "Family Trip to Manali",
      description:
        "What a magical day in the mountains! You loved the crisp mountain air and kept saying how beautiful the snow-capped peaks looked. We took that wonderful photo by the riverside where you taught us to skip stones.",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&auto=format",
      audioUrl:
        "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      fromWhom: "Love, Sarah ❤️",
      tags: ["Travel", "Family", "Mountains"],
      mood: "joyful",
      aiSuggestion:
        "Based on your love for mountains, would you like to remember your other hill station visits?",
    },
    {
      id: 2,
      date: "2015-12-25",
      year: 2015,
      title: "Christmas Morning Magic",
      description:
        "The grandchildren's faces lit up when they saw you! Little Emma made you that beautiful drawing of our family tree, and you helped them bake those famous gingerbread cookies that filled the whole house with warmth.",
      image:
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=400&fit=crop&auto=format",
      audioUrl:
        "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      fromWhom: "Love, Michael & Kids 👨‍👩‍👧‍👦",
      tags: ["Christmas", "Grandchildren", "Baking"],
      mood: "heartwarming",
      aiSuggestion:
        "This reminds me of your special recipe book. Would you like to see more cooking memories?",
    },
    {
      id: 3,
      date: "2018-06-15",
      year: 2018,
      title: "Garden Paradise",
      description:
        'Your roses were in full bloom! You spent the morning showing me how to prune them properly, sharing stories about each variety. The yellow ones were always your favorite - "sunshine flowers" you called them.',
      image:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&auto=format",
      audioUrl:
        "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
      fromWhom: "Love, David 🌹",
      tags: ["Gardening", "Roses", "Teaching"],
      mood: "peaceful",
      aiSuggestion:
        "Your garden brought you so much joy. Shall we explore more of your gardening adventures?",
    },
  ];

  const years = [...new Set(memories.map((m) => m.year))].sort((a, b) => b - a);

  const playAudio = async (memoryId) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (playingAudio === memoryId) {
        setPlayingAudio(null);
        return;
      }

      setPlayingAudio(memoryId);
      setTimeout(() => {
        setPlayingAudio(null);
      }, 5000);
    } catch (error) {
      console.log("Audio playback error:", error);
      setPlayingAudio(playingAudio === memoryId ? null : memoryId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRandomMemoryPrompt = () => {
    const prompts = [
      "🌟 On this day in 2012, you celebrated your anniversary...",
      "🎂 Remember your 70th birthday party in 2016?",
      "🌸 Spring of 2014 - your garden was magnificent...",
      "📚 That book club meeting in 2017 was so special...",
      "🎵 The concert we attended in 2013 - you loved every song...",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const filteredMemories = selectedYear
    ? memories.filter((m) => m.year === selectedYear)
    : memories;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={["#1e40af", "#3b82f6", "#60a5fa"]}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>✨ Memory Wall</Text>
          <Text style={styles.headerSubtitle}>
            Your Beautiful Journey Through Time
          </Text>
          <View style={styles.headerStats}>
            <Text style={styles.statsText}>
              {memories.length} Precious Memories
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* AI-Powered Daily Prompt */}
      <View style={styles.aiPromptContainer}>
        <LinearGradient
          colors={["#fef3c7", "#fde68a"]}
          style={styles.aiPromptGradient}
        >
          <Text style={styles.aiPromptIcon}>🤖</Text>
          <Text style={styles.aiPromptTitle}>Memory Spark</Text>
          <Text style={styles.aiPromptText}>{getRandomMemoryPrompt()}</Text>
          <TouchableOpacity style={styles.aiPromptButton}>
            <Text style={styles.aiPromptButtonText}>Tell me more ✨</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Timeline Year Selector */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>📅 Journey Through Time</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.yearSelector}
        >
          <TouchableOpacity
            style={[
              styles.yearButton,
              !selectedYear && styles.yearButtonActive,
            ]}
            onPress={() => setSelectedYear(null)}
          >
            <Text
              style={[
                styles.yearButtonText,
                !selectedYear && styles.yearButtonTextActive,
              ]}
            >
              All Years
            </Text>
          </TouchableOpacity>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearButton,
                selectedYear === year && styles.yearButtonActive,
              ]}
              onPress={() => setSelectedYear(year)}
            >
              <Text
                style={[
                  styles.yearButtonText,
                  selectedYear === year && styles.yearButtonTextActive,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Enhanced Memory Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredMemories.map((memory, index) => (
          <Animated.View
            key={memory.id}
            style={[
              styles.memoryCard,
              {
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 * (index + 1), 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Premium Card Header */}
            <LinearGradient
              colors={["#f8fafc", "#e2e8f0"]}
              style={styles.cardHeader}
            >
              <View style={styles.dateContainer}>
                <Text style={styles.memoryDate}>
                  📅 {formatDate(memory.date)}
                </Text>
                <View style={styles.tagsContainer}>
                  {memory.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.moodIndicator}>
                <Text style={styles.moodText}>
                  {memory.mood === "joyful"
                    ? "😊"
                    : memory.mood === "heartwarming"
                    ? "🥰"
                    : "😌"}
                </Text>
              </View>
            </LinearGradient>

            {/* Enhanced Image Container */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: memory.image }}
                style={styles.memoryImage}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.3)"]}
                style={styles.imageOverlay}
              >
                <Text style={styles.imageTitle}>{memory.title}</Text>
              </LinearGradient>
            </View>

            {/* Rich Content Section */}
            <View style={styles.contentSection}>
              <Text style={styles.memoryDescription}>{memory.description}</Text>

              {/* AI Suggestion */}
              <View style={styles.aiSuggestionContainer}>
                <Text style={styles.aiSuggestionIcon}>💡</Text>
                <Text style={styles.aiSuggestionText}>
                  {memory.aiSuggestion}
                </Text>
              </View>

              {/* Enhanced Audio Controls */}
              <View style={styles.audioSection}>
                <TouchableOpacity
                  style={[
                    styles.audioButton,
                    playingAudio === memory.id && styles.audioButtonActive,
                  ]}
                  onPress={() => playAudio(memory.id)}
                >
                  <Text style={styles.audioButtonIcon}>
                    {playingAudio === memory.id ? "⏸️" : "🎧"}
                  </Text>
                  <Text style={styles.audioButtonText}>
                    {playingAudio === memory.id
                      ? "Playing Message..."
                      : "Listen to Voice Message"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* From Section with Enhanced Design */}
              <View style={styles.fromSection}>
                <View style={styles.fromContainer}>
                  <Text style={styles.fromText}>{memory.fromWhom}</Text>
                  <View style={styles.heartPulse}>
                    <Text style={styles.heartIcon}>💕</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Enhanced Bottom Section */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        style={styles.bottomGradient}
      >
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonIcon}>✨</Text>
          <Text style={styles.addButtonText}>Create New Memory</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  headerGradient: {
    paddingBottom: 30,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#e0f2fe",
    fontStyle: "italic",
    marginBottom: 15,
  },
  headerStats: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statsText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  aiPromptContainer: {
    margin: 20,
    marginTop: -15,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  aiPromptGradient: {
    padding: 20,
    alignItems: "center",
  },
  aiPromptIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  aiPromptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  aiPromptText: {
    fontSize: 16,
    color: "#b45309",
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 22,
  },
  aiPromptButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  aiPromptButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  timelineContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 15,
  },
  yearSelector: {
    paddingHorizontal: 5,
  },
  yearButton: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  yearButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#1d4ed8",
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  yearButtonTextActive: {
    color: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  memoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 25,
    marginBottom: 25,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
  },
  dateContainer: {
    flex: 1,
  },
  memoryDate: {
    fontSize: 16,
    color: "#7c3aed",
    fontWeight: "700",
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#ddd6fe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#6d28d9",
    fontWeight: "600",
  },
  moodIndicator: {
    backgroundColor: "#ffffff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  moodText: {
    fontSize: 20,
  },
  imageContainer: {
    position: "relative",
  },
  memoryImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: "flex-end",
    padding: 20,
  },
  imageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentSection: {
    padding: 20,
  },
  memoryDescription: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 24,
    marginBottom: 20,
  },
  aiSuggestionContainer: {
    backgroundColor: "#f0f9ff",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  aiSuggestionIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  aiSuggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#0c4a6e",
    fontStyle: "italic",
    lineHeight: 20,
  },
  audioSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  audioButton: {
    backgroundColor: "#f3e8ff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#a855f7",
    minWidth: 200,
    justifyContent: "center",
  },
  audioButtonActive: {
    backgroundColor: "#a855f7",
  },
  audioButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  audioButtonText: {
    fontSize: 16,
    color: "#7c3aed",
    fontWeight: "600",
  },
  fromSection: {
    alignItems: "flex-end",
  },
  fromContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fromText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "700",
    marginRight: 8,
  },
  heartPulse: {
    // Add animation later if needed
  },
  heartIcon: {
    fontSize: 16,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  addButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  addButtonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "800",
  },
});

export default MemoryWallScreen;
