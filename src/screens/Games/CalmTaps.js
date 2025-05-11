import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';

const screen = {
  START: 'START',
  TUTORIAL: 'TUTORIAL',
  LEVELS: 'LEVELS',
  GAME: 'GAME',
};

const puzzles = {
  easy: 3,
  medium: 4,
  hard: 5,
};

const CalmTaps = () => {
  const { t } = useTranslation();

  const [currentScreen, setCurrentScreen] = useState(screen.START);
  const [gridSize, setGridSize] = useState(null);
  const [tiles, setTiles] = useState([]);

  const tileSize = Math.min(Dimensions.get('window').width - 40, Dimensions.get('window').height - 40) / gridSize - 10; 

  useEffect(() => {
    if (gridSize) generatePuzzle(gridSize);
  }, [gridSize]);

  const generatePuzzle = (size) => {
    let arr = Array.from({ length: size * size }, (_, i) => (i === size * size - 1 ? null : i + 1));
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setTiles(arr);
  };

  const moveTile = (index) => {
    const newTiles = [...tiles];
    const emptyIndex = tiles.indexOf(null);
    const size = gridSize;

    const canSwap = [1, -1, size, -size].some((offset) => index + offset === emptyIndex &&
      !(index % size === 0 && offset === -1) &&
      !((index + 1) % size === 0 && offset === 1)
    );

    if (canSwap) {
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
    }
  };

  const renderTile = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: item ? '#e3f9f3' : 'transparent' }]}
      onPress={() => moveTile(index)}
      disabled={!item}
    >
      <Text style={styles.tileText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderGameGrid = () => (
    <FlatList
      data={tiles}
      renderItem={renderTile}
      keyExtractor={(_, i) => i.toString()}
      numColumns={gridSize}
      scrollEnabled={false}
      contentContainerStyle={[styles.grid, { width: gridSize * tileSize + (gridSize - 1) * 10 }]} // Adjusting grid width
    />
  );

  return (
    <View style={styles.container}>
      {currentScreen === screen.START && (
        <>
         <Text style={styles.title}>{t('calmPuzzleTitle')}</Text>
          <Text style={styles.subtitle}>{t('calmPuzzleSubtitle')}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen(screen.TUTORIAL)}>
            <Text style={styles.btnText}>{t('start')}</Text>
          </TouchableOpacity>
        </>
      )}

      {currentScreen === screen.TUTORIAL && (
        <>
          <Text style={styles.title}>{t('howToPlay')}</Text>
          <View style={styles.tutorialBox}>
            <Text style={styles.tutorialText}>{t('tutorialStep1')}</Text>
<Text style={styles.tutorialText}>{t('tutorialStep2')}</Text>
<Text style={styles.tutorialText}>{t('tutorialStep3')}</Text>
<Text style={styles.tutorialText}>{t('tutorialStep4')}</Text>
<Text style={styles.tutorialText}>{t('enjoyPuzzle')}</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setCurrentScreen(screen.LEVELS)}>
            <Text style={styles.title}>{t('selectDifficulty')}</Text>
          </TouchableOpacity>
        </>
      )}

      {currentScreen === screen.LEVELS && (
        <>
          <Text style={styles.title}>Select Difficulty</Text>
          {Object.entries(puzzles).map(([label, size]) => (
            <TouchableOpacity
              key={label}
              style={styles.secondaryBtn}
              onPress={() => {
                setGridSize(size);
                setCurrentScreen(screen.GAME);
              }}
            >
              <Text style={styles.btnText}>{label.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {currentScreen === screen.GAME && (
        <>
          <Text style={[styles.title, currentScreen === screen.GAME && { marginTop: 130 }]}>
            Puzzle - {gridSize} x {gridSize}
          </Text>

          {renderGameGrid()}
          <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentScreen(screen.START)}>
            <Text style={styles.backText}>{t('home')}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default CalmTaps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3fdf3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  grid: {
    marginTop: 10,
    flexDirection: 'row', // Ensure horizontal arrangement of tiles
    flexWrap: 'wrap', // Wrap the tiles to fit in the screen
    justifyContent: 'center', // Center the grid
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#355c7d',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#557a95',
    marginBottom: 30,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#6fa8dc',
    padding: 15,
    width: '70%',
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  secondaryBtn: {
    backgroundColor: '#6fa8dc',
    padding: 12,
    width: '70%',
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  backBtn: {
    marginTop: 20,
    padding: 12,
  },
  backText: {
    fontSize: 16,
    color: '#999',
  },
  btnText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  tile: {
    width: 60,
    height: 60,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c0d6df',
  },
  tileText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a6572',
  },
  tutorialBox: {
    backgroundColor: '#fffef0',
    padding: 20,
    borderRadius: 12,
    borderColor: '#f6e58d',
    borderWidth: 1,
    marginBottom: 20,
    width: '95%',
  },
  tutorialText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#4d4d4d',
  },
});
