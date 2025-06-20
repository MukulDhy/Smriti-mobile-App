import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated
} from 'react-native';
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  BatteryLow, 
  Heart, 
  Mic, 
  Navigation, 
  Activity,
  ArrowLeft,
  Power,
  PowerOff,
  Zap,
  Monitor,
  X,
  TrendingUp
} from 'lucide-react-native';
import { useWebSocket } from '../../contexts/WebSocketContext';

const { width, height } = Dimensions.get('window');

const ESP32Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { subscribeToMessages, sendMessage, isConnected, esp32Status } = useWebSocket();

  // Dynamic device data from WebSocket
  const [devices, setDevices] = useState([
    {
      id: 'ESP-Now',
      name: 'ESP32 Main',
      type: 'ESP32',
      status: 'offline',
      lastSeen: new Date(),
      batteryLevel: 0,
      isStreaming: false,
      espNow: false,
      sensors: {
        heartRate: { enabled: false, value: 0, unit: 'bpm' },
        gyroscope: { enabled: false, value: { x: 0, y: 0, z: 0 }, unit: 'm/s²' },
        microphone: { enabled: false, value: 0, unit: 'dB' },
        gps: { enabled: false, value: { lat: 0, lng: 0 }, unit: 'coords' }
      }
    },
    {
      id: '2113',
      name: 'ESP32-CYD',
      type: 'ESP32-CYD',
      status: 'offline',
      lastSeen: new Date(),
      batteryLevel: 0,
      wifiSignal: 0,
      temperature: 0,
      displayBrightness: 0,
      uptime: 0,
      sensors: {
        temperature: { enabled: false, value: 0, unit: '°C' },
        display: { enabled: false, value: 0, unit: '%' },
        wifi: { enabled: false, value: 0, unit: 'dBm' }
      }
    }
  ]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Listen to WebSocket messages
    const unsubscribe = subscribeToMessages((message) => {
      if (message.type === 'esp32Status') {
        updateESP32MainDevice(message);
      }
      
      if (message.type === 'esp32-cyd-status') {
        console.log("message === ",message);
        updateESP32CydDevice(message.status);
      }
    });

    return unsubscribe;
  }, [subscribeToMessages]);

  const updateESP32MainDevice = (data) => {
    setDevices(prev => prev.map(device => {
      if (device.id === 'ESP-Now') {
        return {
          ...device,
          status: data.connected ? 'online' : 'offline',
          lastSeen: data.lastSeen ? new Date(data.lastSeen) : new Date(),
          batteryLevel: data.battery || 0,
          isStreaming: data.isStreaming || false,
          espNow: data.espNow || false,
          sensors: {
            heartRate: { 
              enabled: data.heartRate || false, 
              value: data.sensors?.heartRate?.value || 0, 
              unit: 'bpm' 
            },
            gyroscope: { 
              enabled: data.gyro || false, 
              value: data.sensors?.gyroscope?.value || { x: 0, y: 0, z: 0 }, 
              unit: 'm/s²' 
            },
            microphone: { 
              enabled: data.microphone || false, 
              value: data.sensors?.microphone?.value || 0, 
              unit: 'dB' 
            },
            gps: { 
              enabled: data.gps || false, 
              value: data.sensors?.gps?.value || { lat: 0, lng: 0 }, 
              unit: 'coords' 
            }
          }
        };
      }
      return device;
    }));
  };

  const updateESP32CydDevice = (data) => {
    setDevices(prev => prev.map(device => {
      if (device.id === '2113') {
        return {
          ...device,
          status: data.currentStatus === 'online' ? 'online' : 'offline',
          lastSeen: data.lastSeen !== 'Not Available' ? new Date(data.lastSeen) : new Date(),
          batteryLevel: data.batteryLevel || 0,
          wifiSignal: data.wifiSignal || 0,
          temperature: data.temperature || 0,
          displayBrightness: data.displayBrightness || 0,
          uptime: data.uptime || 0,
          sensors: {
            temperature: { 
              enabled: data.temperature > 0, 
              value: data.temperature || 0, 
              unit: '°C' 
            },
            display: { 
              enabled: data.displayBrightness > 0, 
              value: data.displayBrightness || 0, 
              unit: '%' 
            },
            wifi: { 
              enabled: data.wifiSignal !== 0, 
              value: data.wifiSignal || 0, 
              unit: 'dBm' 
            }
          }
        };
      }
      return device;
    }));
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const getBatteryIcon = (level) => {
    if (level > 50) return Battery;
    return BatteryLow;
  };

  const getBatteryColor = (level) => {
    if (level > 50) return '#10B981';
    if (level > 20) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusColor = (status) => {
    return status === 'online' ? '#10B981' : '#6B7280';
  };

  const formatLastSeen = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const toggleSensor = (deviceId, sensorName) => {
    setDevices(prev => prev.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          sensors: {
            ...device.sensors,
            [sensorName]: {
              ...device.sensors[sensorName],
              enabled: !device.sensors[sensorName].enabled
            }
          }
        };
      }
      return device;
    }));
  };

  const showSensorModal = (sensor, sensorName) => {
    setSelectedSensor({ ...sensor, name: sensorName });
    setModalVisible(true);
  };

  const getSensorIcon = (sensorName) => {
    switch (sensorName) {
      case 'heartRate': return Heart;
      case 'gyroscope': return Activity;
      case 'microphone': return Mic;
      case 'gps': return Navigation;
      default: return Activity;
    }
  };

  const renderSensorValue = (sensor, sensorName) => {
    if (!sensor.enabled) return 'Disabled';
    
    switch (sensorName) {
      case 'heartRate':
        return `${sensor.value} ${sensor.unit}`;
      case 'gyroscope':
        return `X: ${sensor.value.x.toFixed(1)}, Y: ${sensor.value.y.toFixed(1)}, Z: ${sensor.value.z.toFixed(1)}`;
      case 'microphone':
        return `${sensor.value} ${sensor.unit}`;
      case 'gps':
        return `${sensor.value.lat.toFixed(4)}, ${sensor.value.lng.toFixed(4)}`;
      default:
        return 'N/A';
    }
  };

  const DeviceCard = ({ device }) => (
    <TouchableOpacity
      style={[styles.deviceCard, { borderColor: getStatusColor(device.status) }]}
      onPress={() => {
        setSelectedDevice(device);
        setCurrentPage('device');
      }}
    >
      <View style={styles.deviceHeader}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceType}>{device.type}</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(device.status) }]} />
      </View>
      
      <View style={styles.deviceStats}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            {device.status === 'online' ? 
              <Wifi size={16} color="#10B981" /> : 
              <WifiOff size={16} color="#6B7280" />
            }
          </View>
          <Text style={[styles.statText, { color: getStatusColor(device.status) }]}>
            {device.status}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            {React.createElement(getBatteryIcon(device.batteryLevel), {
              size: 16,
              color: getBatteryColor(device.batteryLevel)
            })}
          </View>
          <Text style={[styles.statText, { color: getBatteryColor(device.batteryLevel) }]}>
            {device.batteryLevel}%
          </Text>
        </View>
      </View>
      
      <Text style={styles.lastSeen}>
        Last seen: {formatLastSeen(device.lastSeen)}
      </Text>
    </TouchableOpacity>
  );

  const SensorCard = ({ sensorName, sensor, deviceId }) => {
    const Icon = getSensorIcon(sensorName);
    
    return (
      <View style={styles.sensorCard}>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorInfo}>
            <Icon size={24} color={sensor.enabled ? '#3B82F6' : '#9CA3AF'} />
            <Text style={styles.sensorName}>
              {sensorName.charAt(0).toUpperCase() + sensorName.slice(1).replace(/([A-Z])/g, ' $1')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: sensor.enabled ? '#3B82F6' : '#E5E7EB' }]}
            onPress={() => toggleSensor(deviceId, sensorName)}
          >
            {sensor.enabled ? 
              <Power size={16} color="#FFFFFF" /> : 
              <PowerOff size={16} color="#6B7280" />
            }
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.sensorValue}
          onPress={() => showSensorModal(sensor, sensorName)}
          disabled={!sensor.enabled}
        >
          <Text style={[styles.sensorValueText, { opacity: sensor.enabled ? 1 : 0.5 }]}>
            {renderSensorValue(sensor, sensorName)}
          </Text>
          {sensor.enabled && <TrendingUp size={16} color="#10B981" />}
        </TouchableOpacity>
      </View>
    );
  };

  const SensorModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedSensor?.name?.charAt(0).toUpperCase() + 
               selectedSensor?.name?.slice(1).replace(/([A-Z])/g, ' $1')} Sensor
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.realTimeIndicator}>
              <View style={styles.pulsingDot} />
              <Text style={styles.realTimeText}>Real-time Data</Text>
            </View>
            
            <View style={styles.dataDisplay}>
              <Text style={styles.dataValue}>
                {selectedSensor && renderSensorValue(selectedSensor, selectedSensor.name)}
              </Text>
              <Text style={styles.dataUnit}>
                Current Reading
              </Text>
            </View>
            
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartText}>📊 Live Chart</Text>
              <Text style={styles.chartSubtext}>Real-time sensor data visualization</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (currentPage === 'device' && selectedDevice) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentPage('dashboard')}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedDevice.name}</Text>
          <View style={[styles.headerStatus, { backgroundColor: getStatusColor(selectedDevice.status) }]}>
            <Text style={styles.headerStatusText}>{selectedDevice.status}</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.deviceOverview}>
            <View style={styles.overviewCard}>
              <Monitor size={32} color="#3B82F6" />
              <Text style={styles.overviewTitle}>Hardware Status</Text>
              <Text style={styles.overviewValue}>{selectedDevice.type}</Text>
            </View>
            
            <View style={styles.overviewCard}>
              <Zap size={32} color={getBatteryColor(selectedDevice.batteryLevel)} />
              <Text style={styles.overviewTitle}>Battery Level</Text>
              <Text style={[styles.overviewValue, { color: getBatteryColor(selectedDevice.batteryLevel) }]}>
                {selectedDevice.batteryLevel}%
              </Text>
            </View>
          </View>

          <View style={styles.sensorsSection}>
            <Text style={styles.sectionTitle}>Sensors</Text>
            {Object.entries(selectedDevice.sensors).map(([sensorName, sensor]) => (
              <SensorCard
                key={sensorName}
                sensorName={sensorName}
                sensor={sensor}
                deviceId={selectedDevice.id}
              />
            ))}
          </View>
        </ScrollView>

        <SensorModal />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ESP32 Devices</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{devices.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.devicesGrid}>
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  devicesGrid: {
    gap: 16,
  },
  deviceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
  },
  statIcon: {
    marginRight: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastSeen: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  deviceOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  overviewTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sensorsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sensorCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sensorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  sensorValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
  },
  sensorValueText: {
    fontSize: 14,
    color: '#D1D5DB',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 20,
  },
  realTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  realTimeText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  dataDisplay: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 16,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dataUnit: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  chartPlaceholder: {
    backgroundColor: '#374151',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4B5563',
    borderStyle: 'dashed',
  },
  chartText: {
    fontSize: 18,
    marginBottom: 8,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ESP32Dashboard;