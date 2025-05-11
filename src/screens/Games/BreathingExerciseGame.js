import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';

const BreathingExerciseGame = () => {
  const { t } = useTranslation();
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // Phases: inhale, hold, exhale
  const [countdown, setCountdown] = useState(4); // Start with the inhale phase (4 seconds)
  const [animationScale] = useState(new Animated.Value(1)); // Animation for breathing circle
  const [sound, setSound] = useState();
  const [isRunning, setIsRunning] = useState(false); // State to track if the exercise is running

  // Start the breathing sound
  useEffect(() => {
    const playSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/relaxing.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    };

    if (isRunning) {
      playSound();
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [isRunning]);

  // Function to animate breathing circle
  const animateBreathing = (phase) => {
    const scaleValue = phase === 'inhale' ? 1.5 : 1;
    Animated.timing(animationScale, {
      toValue: scaleValue,
      duration: 3000, // 3 seconds
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  // Function to handle the breathing cycle
  const startBreathingCycle = () => {
    if (!isRunning) {
      setIsRunning(true); // Start the exercise
    }

    switch (breathingPhase) {
      case 'inhale':
        setCountdown(4); // Inhale duration (seconds)
        setBreathingPhase('hold');
        animateBreathing('inhale');
        break;
      case 'hold':
        setCountdown(7); // Hold duration (seconds)
        setBreathingPhase('exhale');
        break;
      case 'exhale':
        setCountdown(8); // Exhale duration (seconds)
        setBreathingPhase('inhale');
        animateBreathing('exhale');
        break;
    }
  };

  // Function to stop the breathing exercise and reset
  const stopBreathingExercise = () => {
    setIsRunning(false); // Stop the exercise
    setCountdown(0); // Reset countdown
    setBreathingPhase('inhale'); // Reset phase to inhale
    animationScale.setValue(1); // Reset animation scale
  };

  // Countdown timer logic
  useEffect(() => {
    if (countdown === 0 && isRunning) {
      startBreathingCycle();
    } else if (isRunning) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown, isRunning]);

  const getPhaseText = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Inhale';
      case 'hold': return 'Hold';
      case 'exhale': return 'Exhale';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('breathingExerciseTitle')}</Text>
      <View style={styles.instructionBox}>
       <Text style={styles.instructions}>
  {t('breatheInFor', { count: countdown })}
</Text>
       <Text style={styles.phaseText}>{getPhaseText()}</Text>
      </View>

      <View style={styles.circleContainer}>
        <Animated.View
          style={[styles.circle, { transform: [{ scale: animationScale }] }]}
        >
          <Text style={styles.countdown}>{countdown}</Text>
        </Animated.View>
      </View>

      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={styles.button} onPress={startBreathingCycle}>
            <Text style={styles.buttonText}>{t('start')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.buttonStop} onPress={stopBreathingExercise}>
           <Text style={styles.buttonText}>{t('stop')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.instructions}>{t('focusOnBreathing')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796B',
    marginBottom: 20,
  },
  instructionBox: {
    backgroundColor: '#B2EBF2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#004D40',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004D40',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 40, // Add top margin to prevent overlap with the title and instruction
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderColor: '#00796B',
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdown: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00796B',
  },
  controls: {
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',  // Ensures buttons take full width space available
  },
  button: {
    backgroundColor: '#00796B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: 200, // Set width to ensure equal button lengths
    justifyContent: 'center', // Align content in the center horizontally
  },
  buttonStop: {
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: 200, // Same width as the Start button
    justifyContent: 'center', // Align content in the center horizontally
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default BreathingExerciseGame;
