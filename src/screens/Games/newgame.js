import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MemoryGameScreen = () => {
  const [currentStreak, setCurrentStreak] = useState(5);
  const [todayProgress, setTodayProgress] = useState(2);
  const [selectedGame, setSelectedGame] = useState(null);

  // Sample data for games
  const faceMatchData = [
    { id: 1, name: 'Sarah', image: 'https://picsum.photos/100/100?random=1' },
    { id: 2, name: 'John', image: 'https://picsum.photos/100/100?random=2' },
    { id: 3, name: 'Emma', image: 'https://picsum.photos/100/100?random=3' },
    { id: 4, name: 'Mike', image: 'https://picsum.photos/100/100?random=4' },
  ];

  const sequenceData = ['🌟', '🌙', '☀️', '⭐', '🌟', '🌙'];

  const games = [
    {
      id: 'match-face',
      title: 'Match the Face',
      subtitle: 'Connect names with faces',
      icon: 'people-outline',
      color: ['#667eea', '#764ba2'],
      difficulty: 'Easy',
      time: '3 min',
      points: 50,
    },
    {
      id: 'sequence',
      title: 'What Comes Next?',
      subtitle: 'Complete the pattern',
      icon: 'shuffle-outline',
      color: ['#f093fb', '#f5576c'],
      difficulty: 'Medium',
      time: '4 min',
      points: 75,
    },
    {
      id: 'sound-memory',
      title: 'Remember the Sound',
      subtitle: 'Audio memory challenge',
      icon: 'musical-notes-outline',
      color: ['#4facfe', '#00f2fe'],
      difficulty: 'Hard',
      time: '5 min',
      points: 100,
    },
  ];

  const dailyChallenges = [
    { title: 'Morning Brain Boost', completed: true, points: 25 },
    { title: 'Afternoon Focus', completed: true, points: 30 },
    { title: 'Evening Wind Down', completed: false, points: 20 },
  ];

  const startGame = (gameId) => {
    setSelectedGame(gameId);
    Alert.alert(
      'Game Starting!',
      `Starting ${games.find(g => g.id === gameId)?.title}. Good luck!`,
      [{ text: 'Let\'s Go!', onPress: () => console.log('Game started') }]
    );
  };

  const GameCard = ({ game }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => startGame(game.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={game.color}
        style={styles.gameCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.gameCardHeader}>
          <Ionicons name={game.icon} size={32} color="white" />
          <View style={styles.gameCardBadge}>
            <Text style={styles.gameCardBadgeText}>{game.difficulty}</Text>
          </View>
        </View>
        
        <View style={styles.gameCardContent}>
          <Text style={styles.gameCardTitle}>{game.title}</Text>
          <Text style={styles.gameCardSubtitle}>{game.subtitle}</Text>
          
          <View style={styles.gameCardStats}>
            <View style={styles.gameCardStat}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.gameCardStatText}>{game.time}</Text>
            </View>
            <View style={styles.gameCardStat}>
              <Ionicons name="star-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.gameCardStatText}>{game.points} pts</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.playButton}>
          <Ionicons name="play" size={20} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ChallengeItem = ({ challenge, index }) => (
    <View style={styles.challengeItem}>
      <View style={styles.challengeIcon}>
        {challenge.completed ? (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        ) : (
          <View style={styles.challengeIconEmpty}>
            <Text style={styles.challengeNumber}>{index + 1}</Text>
          </View>
        )}
      </View>
      <View style={styles.challengeContent}>
        <Text style={[styles.challengeTitle, challenge.completed && styles.challengeCompleted]}>
          {challenge.title}
        </Text>
        <Text style={styles.challengePoints}>+{challenge.points} points</Text>
      </View>
      {!challenge.completed && (
        <TouchableOpacity style={styles.startChallengeButton}>
          <Text style={styles.startChallengeText}>Start</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Memory Games</Text>
            <Text style={styles.headerSubtitle}>Train your brain daily</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FFD93D" />
            <Text style={styles.statNumber}>{todayProgress}/3</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#6BCF7F" />
            <Text style={styles.statNumber}>87%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brain Exercises</Text>
          <Text style={styles.sectionSubtitle}>Choose your challenge</Text>
          
          <View style={styles.gamesContainer}>
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Challenges</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.challengesContainer}>
            {dailyChallenges.map((challenge, index) => (
              <ChallengeItem key={index} challenge={challenge} index={index} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.progressGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.progressContent}>
                <Ionicons name="brain" size={32} color="white" />
                <View style={styles.progressText}>
                  <Text style={styles.progressTitle}>Memory Strength</Text>
                  <Text style={styles.progressSubtitle}>Keep up the great work!</Text>
                </View>
                <Text style={styles.progressScore}>92%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '92%' }]} />
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
    marginBottom: 20,
  },
  viewAllText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  gamesContainer: {
    gap: 16,
  },
  gameCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gameCardGradient: {
    padding: 20,
    position: 'relative',
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gameCardBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  gameCardContent: {
    marginBottom: 16,
  },
  gameCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  gameCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  gameCardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  gameCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameCardStatText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  playButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengesContainer: {
    gap: 12,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeIcon: {
    marginRight: 16,
  },
  challengeIconEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  challengeCompleted: {
    textDecorationLine: 'line-through',
    color: '#718096',
  },
  challengePoints: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  startChallengeButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startChallengeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    marginBottom: 30,
  },
  progressGradient: {
    padding: 20,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    flex: 1,
    marginLeft: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  progressSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  progressScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
});

export default MemoryGameScreen;