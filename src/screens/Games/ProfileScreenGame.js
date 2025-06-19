import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";

const { width, height } = Dimensions.get('window');

const FamilyGuessingGame = () => {
  const familyMembers = [
    {
      name: "Sumit",
      relation: "brother",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      hint: "He's your male sibling",
      question: "Who is this brother?"
    },
    {
      name: "Diksha",
      relation: "mother", 
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      hint: "She gave birth to you",
      question: "Who is this mother?"
    },
    {
      name: "Aartil",
      relation: "sister",
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c799?w=300&h=300&fit=crop&crop=face", 
      hint: "She's your female sibling",
      question: "Who is this sister?"
    },
    {
      name: "Ashok",
      relation: "father",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      hint: "He's the head of the family",
      question: "Who is this father?"
    },
    {
      name: "Grandma",
      relation: "grandmother",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
      hint: "She's your parent's mother",
      question: "Who is this grandmother?"
    },
    {
      name: "Uncle",
      relation: "uncle", 
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
      hint: "He's your parent's brother",
      question: "Who is this uncle?"
    },
  ];

  // Game States
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'gameOver'
  const [currentMember, setCurrentMember] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions] = useState(10);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !isAnswered) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing' && !isAnswered) {
      handleTimeOut();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, isAnswered]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setQuestionsAnswered(0);
    setStreak(0);
    setShowHint(false);
    setIsAnswered(false);
    setSelectedAnswer(null);
    pickRandomMember();
  };

  const pickRandomMember = () => {
    const randomIndex = Math.floor(Math.random() * familyMembers.length);
    const selectedMember = familyMembers[randomIndex];
    
    setCurrentMember(selectedMember);
    setTimeLeft(10);
    setShowHint(false);
    setIsAnswered(false);
    setSelectedAnswer(null);

    // Create options with wrong answers
    const wrongAnswers = familyMembers
      .filter(member => member.name !== selectedMember.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const options = [selectedMember, ...wrongAnswers].sort(() => 0.5 - Math.random());
    setShuffledOptions(options);
  };

  const handleAnswer = (selectedName) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedAnswer(selectedName);
    const isCorrect = selectedName === currentMember.name;
    
    setTimeout(() => {
      if (isCorrect) {
        const points = calculatePoints();
        setScore(prevScore => prevScore + points);
        setStreak(prevStreak => prevStreak + 1);
        
        setTimeout(() => {
          nextQuestion();
        }, 1500);
      } else {
        setLives(prevLives => prevLives - 1);
        setStreak(0);
        
        setTimeout(() => {
          if (lives - 1 <= 0) {
            endGame();
          } else {
            nextQuestion();
          }
        }, 1500);
      }
    }, 1000);
  };

  const handleTimeOut = () => {
    setLives(prevLives => prevLives - 1);
    setStreak(0);
    setIsAnswered(true);
    
    setTimeout(() => {
      if (lives - 1 <= 0) {
        endGame();
      } else {
        nextQuestion();
      }
    }, 1500);
  };

  const nextQuestion = () => {
    const newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);
    
    if (newQuestionsAnswered >= totalQuestions) {
      endGame();
    } else {
      pickRandomMember();
    }
  };

  const calculatePoints = () => {
    let basePoints = 10;
    
    // Time bonus (more points for faster answers)
    const timeBonus = Math.floor(timeLeft / 2);
    
    // Streak bonus
    const streakBonus = streak >= 2 ? streak * 5 : 0;
    
    return basePoints + timeBonus + streakBonus;
  };

  const endGame = () => {
    setGameState('gameOver');
    if (score > bestScore) {
      setBestScore(score);
    }
  };

  const useHint = () => {
    if (!showHint) {
      setShowHint(true);
      setScore(prevScore => Math.max(0, prevScore - 5)); // Penalty for using hint
    }
  };

  const resetGame = () => {
    setGameState('menu');
  };

  const getScoreGrade = () => {
    const percentage = (score / (totalQuestions * 20)) * 100;
    if (percentage >= 90) return { grade: 'S', color: '#FBBF24', message: 'Perfect! 🏆' };
    if (percentage >= 80) return { grade: 'A', color: '#10B981', message: 'Excellent! 🌟' };
    if (percentage >= 70) return { grade: 'B', color: '#3B82F6', message: 'Great Job! 👏' };
    if (percentage >= 60) return { grade: 'C', color: '#F97316', message: 'Good Effort! 👍' };
    return { grade: 'D', color: '#EF4444', message: 'Keep Trying! 💪' };
  };

  const renderHearts = () => {
    return (
      <View style={styles.heartsContainer}>
        {[...Array(3)].map((_, i) => (
          <Text key={i} style={[styles.heart, { opacity: i < lives ? 1 : 0.3 }]}>
            ❤️
          </Text>
        ))}
      </View>
    );
  };

  if (gameState === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <ScrollView contentContainerStyle={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.gameIcon}>🏠</Text>
              <Text style={styles.gameTitle}>Family Quiz</Text>
            </View>
            <Text style={styles.gameSubtitle}>Test your family knowledge!</Text>
            {bestScore > 0 && (
              <View style={styles.bestScoreContainer}>
                <Text style={styles.bestScoreText}>🏆 Best Score: {bestScore}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>🎮 Start Game</Text>
          </TouchableOpacity>

          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Game Rules:</Text>
            <View style={styles.rulesList}>
              <Text style={styles.ruleItem}>• Answer {totalQuestions} questions correctly</Text>
              <Text style={styles.ruleItem}>• You have 3 lives ❤️</Text>
              <Text style={styles.ruleItem}>• 10 seconds per question ⏰</Text>
              <Text style={styles.ruleItem}>• Use hints for -5 points 💡</Text>
              <Text style={styles.ruleItem}>• Build streaks for bonus points 🔥</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (gameState === 'playing') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        
        {/* Game Header */}
        <View style={styles.gameHeader}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          
          <View style={styles.questionCounter}>
            <Text style={styles.questionCounterText}>
              {questionsAnswered + 1}/{totalQuestions}
            </Text>
          </View>
          
          {renderHearts()}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>⏰ {timeLeft}s</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${((questionsAnswered) / totalQuestions) * 100}%` }]} />
        </View>

        {/* Streak Indicator */}
        {streak > 0 && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakText}>🔥 Streak: {streak}</Text>
          </View>
        )}

        <ScrollView style={styles.gameContent}>
          {currentMember && (
            <>
              {/* Image and Question */}
              <View style={styles.imageQuestionContainer}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: currentMember.image }}
                    style={styles.memberImage}
                    defaultSource={require('../../../assets/brain.png')} // Add a placeholder image
                  />
                  <View style={styles.questionContainer}>
                    <View style={styles.questionBubble}>
                      <Text style={styles.questionText}>{currentMember.question}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Hint Section */}
              <View style={styles.hintSection}>
                {showHint ? (
                  <View style={styles.hintContainer}>
                    <Text style={styles.hintText}>💡 {currentMember.hint}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.hintButton} onPress={useHint}>
                    <Text style={styles.hintButtonText}>💡 Use Hint (-5 pts)</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Answer Options */}
              <View style={styles.optionsContainer}>
                {shuffledOptions.map((member, index) => {
                  const isCorrect = member.name === currentMember.name;
                  const isSelected = selectedAnswer === member.name;
                  
                  let buttonStyle = [styles.optionButton];
                  let textStyle = [styles.optionText];
                  
                  if (isAnswered) {
                    if (isCorrect) {
                      buttonStyle.push(styles.correctOption);
                      textStyle.push(styles.correctOptionText);
                    } else if (isSelected) {
                      buttonStyle.push(styles.incorrectOption);
                      textStyle.push(styles.incorrectOptionText);
                    } else {
                      buttonStyle.push(styles.disabledOption);
                      textStyle.push(styles.disabledOptionText);
                    }
                  } else {
                    buttonStyle.push(styles.activeOption);
                    textStyle.push(styles.activeOptionText);
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={buttonStyle}
                      onPress={() => handleAnswer(member.name)}
                      disabled={isAnswered}
                    >
                      <Text style={textStyle}>{member.name}</Text>
                      {isAnswered && isCorrect && <Text style={styles.emoji}>✅</Text>}
                      {isAnswered && isSelected && !isCorrect && <Text style={styles.emoji}>❌</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Game Over Screen
  if (gameState === 'gameOver') {
    const gradeInfo = getScoreGrade();
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <ScrollView contentContainerStyle={styles.gameOverContainer}>
          <View style={[styles.gradeContainer, { backgroundColor: gradeInfo.color }]}>
            <Text style={styles.gradeText}>{gradeInfo.grade}</Text>
          </View>
          
          <Text style={styles.gameCompleteTitle}>Game Complete!</Text>
          <Text style={styles.gameCompleteMessage}>{gradeInfo.message}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{score}</Text>
              <Text style={styles.statLabel}>Final Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{questionsAnswered}</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bestScore}</Text>
              <Text style={styles.statLabel}>Best Score</Text>
            </View>
          </View>

          <View style={styles.gameOverButtons}>
            <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
              <Text style={styles.playAgainButtonText}>🎮 Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={resetGame}>
              <Text style={styles.menuButtonText}>🏠 Main Menu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  menuContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  bestScoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bestScoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rulesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    width: '100%',
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  rulesList: {
    paddingLeft: 10,
  },
  ruleItem: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 8,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  scoreValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  questionCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  questionCounterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heartsContainer: {
    flexDirection: 'row',
  },
  heart: {
    fontSize: 20,
    marginHorizontal: 2,
  },
  timerContainer: {
    alignItems: 'center',
    padding: 15,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  streakContainer: {
    alignItems: 'center',
    padding: 10,
  },
  streakText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameContent: {
    flex: 1,
    padding: 20,
  },
  imageQuestionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  memberImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  questionContainer: {
    alignItems: 'center',
  },
  questionBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 20,
    maxWidth: width - 60,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  hintSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 20,
    maxWidth: width - 60,
  },
  hintText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  hintButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
  },
  activeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  correctOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: '#10B981',
  },
  incorrectOption: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: '#EF4444',
  },
  disabledOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeOptionText: {
    color: 'white',
  },
  correctOptionText: {
    color: 'white',
  },
  incorrectOptionText: {
    color: 'white',
  },
  disabledOptionText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emoji: {
    fontSize: 20,
  },
  gameOverContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradeContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gradeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  gameCompleteTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  gameCompleteMessage: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  gameOverButtons: {
    width: '100%',
    gap: 15,
  },
  playAgainButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    borderRadius: 25,
  },
  playAgainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 25,
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FamilyGuessingGame;