import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function LocationRadiusTracker() {
  const [location, setLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [isOutsideRadius, setIsOutsideRadius] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [distance, setDistance] = useState(0);

  const RADIUS_METERS = 100; // 100 meters radius

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check if current location is outside the radius
  const checkRadius = (currentLoc, startLoc) => {
    if (!currentLoc || !startLoc) return false;
    
    const dist = calculateDistance(
      startLoc.latitude,
      startLoc.longitude,
      currentLoc.latitude,
      currentLoc.longitude
    );

    setDistance(dist);
    return dist > RADIUS_METERS;
  };

  // Request location permissions and start tracking
  useEffect(() => {
    let subscription;

    const startLocationTracking = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied');
          setLoading(false);
          return;
        }

        // Get initial location
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
        };

        setStartLocation(coords);
        setLocation(coords);
        setLoading(false);

        console.log('Starting location:', coords);

        // Start watching location changes
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000, // Update every 2 seconds
            distanceInterval: 3, // Update every 3 meters
          },
          (newLocation) => {
            const newCoords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            };

            setLocation(newCoords);

            // Check if outside radius
            const outsideRadius = checkRadius(newCoords, coords);
            
            if (outsideRadius && !isOutsideRadius) {
              setIsOutsideRadius(true);
              Alert.alert(
                '🚨 Location Alert',
                `You have moved outside the ${RADIUS_METERS}-meter radius from your starting location!\n\nCurrent distance: ${distance.toFixed(1)}m`,
                [
                  {
                    text: 'OK',
                    onPress: () => setIsOutsideRadius(false),
                  },
                ]
              );
            } else if (!outsideRadius && isOutsideRadius) {
              setIsOutsideRadius(false);
            }
          }
        );
      } catch (error) {
        setErrorMsg('Error getting location: ' + error.message);
        setLoading(false);
      }
    };

    startLocationTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isOutsideRadius]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
        <Text style={styles.loadingSubtext}>Make sure GPS is enabled</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Text style={styles.errorSubtext}>
          Please enable location permissions in your device settings and restart the app.
        </Text>
      </View>
    );
  }

  const getStatusColor = () => {
    if (distance <= RADIUS_METERS * 0.5) return '#34C759'; // Green - well within
    if (distance <= RADIUS_METERS * 0.8) return '#FF9500'; // Orange - approaching edge
    if (distance <= RADIUS_METERS) return '#FF9500'; // Orange - near edge
    return '#FF3B30'; // Red - outside
  };

  const getStatusText = () => {
    if (distance <= RADIUS_METERS * 0.5) return '✅ Well within safe zone';
    if (distance <= RADIUS_METERS * 0.8) return '⚠️ Approaching boundary';
    if (distance <= RADIUS_METERS) return '⚠️ Near boundary';
    return '🚨 Outside safe zone!';
  };

  const getProgressPercentage = () => {
    return Math.min((distance / RADIUS_METERS) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Location Radius Tracker</Text>
        <Text style={styles.headerSubtitle}>Monitoring {RADIUS_METERS}m radius</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        
        {/* Distance Display */}
        <View style={styles.distanceCard}>
          <Text style={styles.distanceLabel}>Distance from Starting Point</Text>
          <Text style={[styles.distanceValue, { color: getStatusColor() }]}>
            {distance.toFixed(1)}m
          </Text>
          <Text style={styles.radiusText}>out of {RADIUS_METERS}m allowed</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getProgressPercentage()}%`,
                    backgroundColor: getStatusColor()
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{getProgressPercentage().toFixed(0)}%</Text>
          </View>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderColor: getStatusColor() }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {/* Location Info */}
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>📍 Location Details</Text>
          
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Starting Point:</Text>
            <Text style={styles.locationValue}>
              {startLocation ? 
                `${startLocation.latitude.toFixed(6)}, ${startLocation.longitude.toFixed(6)}` 
                : 'Loading...'}
            </Text>
          </View>
          
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Current Location:</Text>
            <Text style={styles.locationValue}>
              {location ? 
                `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` 
                : 'Loading...'}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.cardTitle}>📋 Instructions</Text>
          <Text style={styles.instructionText}>
            • Stay within the {RADIUS_METERS}m radius from your starting point{'\n'}
            • You'll get an alert if you move outside the boundary{'\n'}
            • The progress bar shows how close you are to the limit{'\n'}
            • Keep the app open for continuous monitoring
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  distanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  distanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  radiusText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  locationRow: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});