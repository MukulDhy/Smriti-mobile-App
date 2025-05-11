import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

const mazes = [
  [
    ['S', 0, 1, 0, 0],
    [1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 1, 'E'],
  ],
  [
    ['S', 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 'E'],
  ],
  [
    ['S', 1, 1, 1, 0],
    [0, 0, 1, 0, 1],
    [0, 1, 0, 0, 0],
    [1, 1, 0, 1, 'E'],
  ]
];

const MazeGame = () => {
  const { t } = useTranslation();
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [level, setLevel] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);

  const move = (dx, dy) => {
    const [x, y] = playerPos;
    const newX = x + dx;
    const newY = y + dy;
    const maze = mazes[level];

    if (
      newX >= 0 &&
      newY >= 0 &&
      newX < maze.length &&
      newY < maze[0].length &&
      maze[newX][newY] !== 1
    ) {
      if (maze[newX][newY] === 'E') {
        Alert.alert(t('mazeSuccess'), t('mazeSuccessMessage'));
        if (level < mazes.length - 1) {
          setLevel(level + 1);
          setPlayerPos([0, 0]);
        } else {
          Alert.alert(t('mazeComplete'), t('mazeCompleteMessage'));
        }
      } else {
        setPlayerPos([newX, newY]);
      }
    }
  };

  const renderCell = (cell, x, y) => {
    const isPlayer = playerPos[0] === x && playerPos[1] === y;
    const maze = mazes[level];

    if (isPlayer) {
      return (
        <View key={`${x}-${y}`} style={styles.cell}>
          <Image source={require('../../../assets/old-man.jpg')} style={styles.image} />
        </View>
      );
    }

    if (cell === 'E') {
      return (
        <View key={`${x}-${y}`} style={styles.cell}>
          <Image source={require('../../../assets/caregiver.png')} style={styles.image} />
        </View>
      );
    }

    if (cell === 1) {
      return <View key={`${x}-${y}`} style={[styles.cell, { backgroundColor: '#8B0000' }]} />; // blocker
    }

    return <View key={`${x}-${y}`} style={styles.cell} />;
  };

  const tutorialMessages = [
  t('tutorialStep0'),
  t('tutorialStep1'),
  t('tutorialStep2'),
  t('tutorialStep3'),
  t('tutorialStep4'),
  t('tutorialStep5'),
];

  const handleNextTutorial = () => {
    if (tutorialStep < tutorialMessages.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  };

  const handleBackTutorial = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👴 {t('mazeTitle')}</Text>

      <View style={styles.instructionsBox}>
        <Text style={styles.instructionsTitle}>{t('howToPlay')}</Text>
        <Text style={styles.instructions}>{tutorialMessages[tutorialStep]}</Text>

        <View style={styles.tutorialButtons}>
          <TouchableOpacity onPress={handleBackTutorial} style={styles.button}>
            <Text>{t('back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextTutorial} style={styles.button}>
            <Text>{t('next')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.maze}>
        {mazes[level].map((row, x) => (
          <View key={x} style={styles.row}>
            {row.map((cell, y) => renderCell(cell, x, y))}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => move(-1, 0)} style={styles.button}><Text>↑</Text></TouchableOpacity>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => move(0, -1)} style={styles.button}><Text>←</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => move(0, 1)} style={styles.button}><Text>→</Text></TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => move(1, 0)} style={styles.button}><Text>↓</Text></TouchableOpacity>
      </View>
    </View>
  );
};

export default MazeGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#5D4037',
  },
  instructionsBox: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  instructions: {
    fontSize: 14,
    color: '#3E2723',
  },
  tutorialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  maze: {
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#A1887F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  image: {
    width: 40,
    height: 40,
  },
  controls: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFD54F',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
});

