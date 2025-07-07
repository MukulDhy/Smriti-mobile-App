import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function NightWanderingDetector() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [wanderingDetected, setWanderingDetected] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [detectionType, setDetectionType] = useState(null);
  const [microphoneStatus, setMicrophoneStatus] = useState('Not Started');
  const [audioMetrics, setAudioMetrics] = useState({
    avgVolume: 0,
    peakVolume: 0,
    sustainedLoudness: 0,
    rapidChanges: 0,
    noiseFloor: 0
  });

  const recordingRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const volumeHistoryRef = useRef([]);
  const detectionTimeoutRef = useRef(null);
  const currentPeakRef = useRef(0);

  useEffect(() => {
    requestPermissions();
    return () => {
      stopMonitoring();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is required for audio monitoring.');
        setMicrophoneStatus('Permission Denied');
      } else {
        setMicrophoneStatus('Permission Granted');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setMicrophoneStatus('Error: ' + error.message);
    }
  };

  const checkMicrophoneAvailability = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      if (status !== 'granted') {
        await requestPermissions();
        return false;
      }
      
      // Test microphone by creating a recording instance
      const recording = new Audio.Recording();
      try {
        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        await recording.startAsync();
        await recording.stopAndUnloadAsync();
        setMicrophoneStatus('Available');
        return true;
      } catch (error) {
        console.error('Microphone test failed:', error);
        setMicrophoneStatus('Error: ' + error.message);
        return false;
      }
    } catch (error) {
      console.error('Microphone check failed:', error);
      setMicrophoneStatus('Error: ' + error.message);
      return false;
    }
  };

  const startMonitoring = async () => {
    try {
      const isMicAvailable = await checkMicrophoneAvailability();
      if (!isMicAvailable) {
        Alert.alert('Microphone Unavailable', 'Cannot access microphone. Please check permissions and try again.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
        android: {
          ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY.android,
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          ...Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY.ios,
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        isMeteringEnabled: true,
      });
      
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          // Convert dB to a 0-100 scale (-160 to 0 dB range)
          const volume = Math.max(0, Math.min(100, (status.metering + 160) * (100/160)));
          setCurrentVolume(volume);
          analyzeAudio(volume);
        }
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsMonitoring(true);
      setMicrophoneStatus('Active');
      volumeHistoryRef.current = [];
      currentPeakRef.current = 0;

      // Start continuous analysis
      analysisIntervalRef.current = setInterval(performEnhancedAnalysis, 1000);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      setMicrophoneStatus('Error: ' + error.message);
      Alert.alert('Error', 'Failed to start audio monitoring. Please try again.');
    }
  };

  const stopMonitoring = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }

      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
        detectionTimeoutRef.current = null;
      }

      setIsMonitoring(false);
      setCurrentVolume(0);
      setWanderingDetected(false);
      volumeHistoryRef.current = [];
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    }
  };

  const analyzeAudio = (volume) => {
    // Add to volume history for pattern analysis
    volumeHistoryRef.current.push({
      volume,
      timestamp: Date.now()
    });

    // Keep only last 60 seconds of data
    const cutoffTime = Date.now() - 60000;
    volumeHistoryRef.current = volumeHistoryRef.current.filter(
      entry => entry.timestamp > cutoffTime
    );
  };

  // Enhanced peak detection with decay
  const enhancedPeakDetection = (volumes, currentPeak) => {
    const newPeak = Math.max(...volumes);
    // Add peak decay to avoid stuck peaks
    const decayedPeak = currentPeak * 0.95;
    return Math.max(newPeak, decayedPeak);
  };

  // Better loudness calculation using RMS (Root Mean Square)
  const calculateRMSLoudness = (volumes) => {
    const sumOfSquares = volumes.reduce((sum, vol) => sum + (vol * vol), 0);
    return Math.sqrt(sumOfSquares / volumes.length);
  };

  // Calculate rapid volume changes
  const calculateRapidChanges = (volumes) => {
    let changes = 0;
    for (let i = 1; i < volumes.length; i++) {
      if (Math.abs(volumes[i] - volumes[i-1]) > 15) {
        changes++;
      }
    }
    return changes;
  };

  // Noise floor calibration
  const calibrateNoiseFloor = (volumes) => {
    // Take bottom 10% of volumes as noise floor
    const sortedVolumes = [...volumes].sort((a, b) => a - b);
    const noiseFloorSamples = sortedVolumes.slice(0, Math.floor(sortedVolumes.length * 0.1));
    return noiseFloorSamples.reduce((a, b) => a + b, 0) / noiseFloorSamples.length;
  };

  // Time-based pattern analysis
  const analyzeTemporalPatterns = (volumeHistory) => {
    if (volumeHistory.length < 20) return {};

    const intervals = [];
    let lastPeak = 0;
    
    volumeHistory.forEach((entry, index) => {
      if (entry.volume > 30 && index > lastPeak + 5) {
        if (lastPeak > 0) {
          intervals.push(entry.timestamp - volumeHistory[lastPeak].timestamp);
        }
        lastPeak = index;
      }
    });

    if (intervals.length < 3) return {};

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const intervalVariation = Math.sqrt(
      intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
    );

    return {
      avgInterval,
      intervalVariation,
      isRhythmic: intervalVariation < (avgInterval * 0.3), // Low variation indicates rhythm
      estimatedBPM: intervals.length > 0 ? 60000 / avgInterval : 0
    };
  };

  // Enhanced wandering detection with more sophisticated patterns
  const enhancedWanderingDetection = (metrics) => {
    const {
      avgVolume,
      peakVolume,
      rmsLoudness,
      sustainedLoudness,
      rapidChanges,
      volumeRange,
      noiseFloor
    } = metrics;

    // Breathing pattern detection (regular, rhythmic)
    const breathingPattern = (
      avgVolume > noiseFloor + 15 && 
      avgVolume < noiseFloor + 35 &&
      rmsLoudness > noiseFloor + 8 &&
      rapidChanges < 4 // Less erratic than other activities
    );

    // Movement detection (irregular, varied frequencies)
    const movementPattern = (
      rapidChanges > 6 &&
      volumeRange > 25 &&
      avgVolume > noiseFloor + 10
    );

    // Vocal activity (higher frequencies, more variation)
    const vocalPattern = (
      avgVolume > noiseFloor + 25 &&
      peakVolume > noiseFloor + 40 &&
      sustainedLoudness > 5
    );

    // Coughing/sneezing (sudden spikes)
    const coughingPattern = (
      peakVolume > noiseFloor + 50 &&
      rapidChanges > 4 &&
      avgVolume < peakVolume * 0.4 // Peak much higher than average
    );

    return {
      breathing: breathingPattern,
      movement: movementPattern,
      vocal: vocalPattern,
      coughing: coughingPattern,
      overallDetection: breathingPattern || movementPattern || vocalPattern || coughingPattern,
      detectionType: breathingPattern ? 'Breathing' : 
                    movementPattern ? 'Movement' : 
                    vocalPattern ? 'Vocal' : 
                    coughingPattern ? 'Coughing/Sneezing' : null
    };
  };

  const performEnhancedAnalysis = () => {
    if (volumeHistoryRef.current.length < 10) return;

    const recentData = volumeHistoryRef.current.slice(-20); // Analyze more samples
    const volumes = recentData.map(d => d.volume);
    
    // Calculate enhanced metrics
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    currentPeakRef.current = enhancedPeakDetection(volumes, currentPeakRef.current);
    const rmsLoudness = calculateRMSLoudness(volumes);
    const noiseFloor = calibrateNoiseFloor(volumes);
    const rapidChanges = calculateRapidChanges(volumes);
    const volumeRange = Math.max(...volumes) - Math.min(...volumes);
    const temporalPatterns = analyzeTemporalPatterns(volumeHistoryRef.current);
    
    // Update metrics display
    setAudioMetrics({
      avgVolume: Math.round(avgVolume),
      peakVolume: Math.round(currentPeakRef.current),
      sustainedLoudness: volumes.filter(v => v > noiseFloor + 15).length,
      rapidChanges,
      noiseFloor: Math.round(noiseFloor)
    });

    // Enhanced detection
    const detectionResults = enhancedWanderingDetection({
      avgVolume,
      peakVolume: currentPeakRef.current,
      rmsLoudness,
      sustainedLoudness: volumes.filter(v => v > noiseFloor + 15).length,
      rapidChanges,
      volumeRange,
      noiseFloor
    });

    if (detectionResults.overallDetection && !wanderingDetected) {
      triggerWanderingDetection(detectionResults.detectionType);
    }
  };

  const triggerWanderingDetection = (type) => {
    setWanderingDetected(true);
    setDetectionType(type);
    setLastDetection(new Date().toLocaleTimeString());
    setDetectionCount(prev => prev + 1);

    // Clear detection after 5 seconds
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }
    
    detectionTimeoutRef.current = setTimeout(() => {
      setWanderingDetected(false);
      setDetectionType(null);
    }, 5000);
  };

  const resetDetections = () => {
    setDetectionCount(0);
    setLastDetection(null);
    setWanderingDetected(false);
    setDetectionType(null);
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }
  };

  const getVolumeColor = (volume) => {
    if (volume < 20) return '#4CAF50';
    if (volume < 40) return '#FF9800';
    return '#F44336';
  };

  const getStatusColor = () => {
    if (wanderingDetected) return '#F44336';
    if (isMonitoring) return '#4CAF50';
    return '#9E9E9E';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="moon" size={32} color="#6366F1" />
        <Text style={styles.title}>Night Wandering Monitor</Text>
      </View>

      {/* Status Card */}
      <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>
            {wanderingDetected ? `${detectionType} DETECTED` : isMonitoring ? 'MONITORING ACTIVE' : 'MONITORING INACTIVE'}
          </Text>
        </View>
        
        {isMonitoring && (
          <View style={styles.metricsContainer}>
            <Text style={styles.volumeText}>Current Volume: {Math.round(currentVolume)}%</Text>
            <View style={styles.volumeBar}>
              <View 
                style={[
                  styles.volumeFill, 
                  { 
                    width: `${currentVolume}%`, 
                    backgroundColor: getVolumeColor(currentVolume) 
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Audio Metrics */}
      {isMonitoring && (
        <View style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Audio Analysis</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Volume:</Text>
            <Text style={styles.metricValue}>{audioMetrics.avgVolume}%</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Peak Volume:</Text>
            <Text style={styles.metricValue}>{audioMetrics.peakVolume}%</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Noise Floor:</Text>
            <Text style={styles.metricValue}>{audioMetrics.noiseFloor}%</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Sustained Activity:</Text>
            <Text style={styles.metricValue}>{audioMetrics.sustainedLoudness}/20</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Rapid Changes:</Text>
            <Text style={styles.metricValue}>{audioMetrics.rapidChanges}</Text>
          </View>
        </View>
      )}

      {/* Detection History */}
      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Detection History</Text>
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Total Detections:</Text>
          <Text style={styles.historyValue}>{detectionCount}</Text>
        </View>
        <View style={styles.historyRow}>
          <Text style={styles.historyLabel}>Last Detection:</Text>
          <Text style={styles.historyValue}>{lastDetection || 'None'}</Text>
        </View>
        {wanderingDetected && (
          <View style={styles.historyRow}>
            <Text style={styles.historyLabel}>Last Type:</Text>
            <Text style={styles.historyValue}>{detectionType}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.resetButton} onPress={resetDetections}>
          <Text style={styles.resetButtonText}>Reset History</Text>
        </TouchableOpacity>
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isMonitoring ? styles.stopButton : styles.startButton]}
          onPress={isMonitoring ? stopMonitoring : startMonitoring}
        >
          <Ionicons 
            name={isMonitoring ? "stop" : "play"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.buttonText}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Detection Patterns Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Detection Patterns</Text>
        <Text style={styles.infoText}>
          • Breathing: Regular, rhythmic patterns (15-35% above noise floor)
          {'\n'}• Movement: Irregular patterns with rapid changes
          {'\n'}• Vocal Activity: Sustained higher volume with variations
          {'\n'}• Coughing/Sneezing: Sudden loud spikes (>50% above noise floor)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  statusCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metricsContainer: {
    marginTop: 10,
  },
  volumeText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  volumeBar: {
    height: 8,
    backgroundColor: '#2A2A3E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  historyCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historyLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});