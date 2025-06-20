import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const GameNavigation = () => {
  const navigation = useNavigation();

  const games = [
  {
    name: "CalmTaps",
    title: "Calm Taps",
    icon: "👆",
    description: "Tap rhythmically to calm your mind",
    color: "#FF9AA2",
  },
  {
    name: "BreathingExerciseGame",
    title: "Breathing Exercise",
    icon: "🌬️",
    description: "Follow the pattern to regulate breathing",
    color: "#FFB7B2",
  },
  {
    name: "MazeGame",
    title: "Maze Game",
    icon: "🌀",
    description: "Navigate through puzzles to focus",
    color: "#FFDAC1",
  },
  {
    name: "ProfileGameScreen",
    title: "Pro Game",
    icon: "🎯",
    description: "Sharpen your focus with challenges",
    color: "#E2F0CB",
  },
  {
    name: "MemoryGame",
    title: "Memory Game",
    icon: "🧠",
    description: "Boost memory with fun tasks",
    color: "#B5EAD7",
  },
  {
    name: "MemoryWallScreen",
    title: "MemoryWall Game",
    icon: "📝",
    description: "Match and remember the patterns",
    color: "#C7CEEA",
  },
  {
    name: "Remember",
    title: "Remember Game",
    icon: "💡",
    description: "Strengthen recall and attention",
    color: "#D5AAFF",
  },
  {
    name: "Patientmonitering",
    title: "Patient Monitoring",
    icon: "❤️",
    description: "Track patient health and stats",
    color: "#FFCCCB",
  },
];


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mindful Games</Text>
      {games.map((game) => (
        <TouchableOpacity
          key={game.name}
          style={[styles.gameCard, { backgroundColor: game.color }]}
          onPress={() => navigation.navigate(game.name)}
        >
          <View style={styles.gameContent}>
            <Text style={styles.gameIcon}>{game.icon}</Text>
            <View style={styles.gameText}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  gameCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  gameText: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: "#555",
  },
});

export default GameNavigation;
