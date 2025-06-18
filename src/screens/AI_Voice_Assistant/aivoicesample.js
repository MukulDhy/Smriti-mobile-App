import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { scale, verticalScale } from "react-native-size-matters";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Audio } from "expo-av";
import axios from "axios";
import LottieView from "lottie-react-native";
import * as Speech from "expo-speech";
import { PermissionsAndroid } from "react-native";
import Regenerate from "../../../assets/svgs/regenerate";
import Reload from "../../../assets/svgs/reload";
import * as FileSystem from "expo-file-system";

export default function AIVoiceAssistantScreen() {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState();
  const [AIResponse, setAIResponse] = useState(false);
  const [AISpeaking, setAISpeaking] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const lottieRef = useRef(null);
  // Enhanced system prompt for intelligent handling
  const SYSTEM_PROMPT = `You are Smriti AI Assistant, a helpful and intelligent voice assistant. Handle these requests intelligently:

1. IDENTITY QUESTIONS: When someone asks about your name, identity, who you are, who created you, or similar questions in ANY language, always respond with: "मेरा नाम स्मृति AI असिस्टेंट है" (My name is Smriti AI Assistant)

2. HEALTH REPORTS: When user asks for health reports, medical reports, health data, or similar in any language, respond with: "FETCH_HEALTH_REPORTS"

3. HEART BEAT/PULSE: When user asks for heart rate, pulse, heartbeat, दिल की धड़कन, heart beat check, etc., respond with: "FETCH_HEART_BEAT"

4. CAREGIVER CALL: When user asks to call caregiver, contact caregiver, caregiver ko call karo, or similar, respond with: "CALL_CAREGIVER"

5. OTHER HEALTH QUERIES: For blood pressure, temperature, oxygen level, sugar level, etc., respond with: "FETCH_HEALTH_DATA"

6. EMERGENCY: For emergency situations, pain, help, मदद, emergency, etc., respond with: "EMERGENCY_CALL"

For all other general questions, respond naturally and helpfully in the same language the user spoke in. Always be polite, helpful, and caring as you're assisting people with their health and daily needs.`;

  // Health API endpoints (configure these based on your backend)
  const HEALTH_APIS = {
    healthReports: "https://your-health-api.com/api/health-reports",
    heartBeat: "https://your-health-api.com/api/heart-rate",
    bloodPressure: "https://your-health-api.com/api/blood-pressure",
    emergency: "https://your-health-api.com/api/emergency",
  };

  // Initialize permissions
  useEffect(() => {
    const initializeApp = async () => {
      await getMicrophonePermission();
      // Request phone call permissions for caregiver calling
      if (Platform.OS === "android") {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE
          );
        } catch (error) {
          console.log("Phone permission error:", error);
        }
      }
    };
    initializeApp();
  }, []);

  // Get microphone permission
  const getMicrophonePermission = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access microphone for voice functionality"
        );
        return false;
      }
      return true;
    } catch (error) {
      console.log("Microphone permission error:", error);
      return false;
    }
  };

  // Enhanced recording options
  const recordingOptions = {
    android: {
      extension: ".wav",
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".wav",
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };

  // Start recording with enhanced error handling
  const startRecording = async () => {
    const hasPermission = await getMicrophonePermission();
    if (!hasPermission) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
    } catch (error) {
      console.log("Failed to start Recording", error);
      Alert.alert(
        "Recording Error",
        "Failed to start recording. Please try again."
      );
      setIsRecording(false);
    }
  };

  // Stop recording and process
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setLoading(true);
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording?.getURI();

      if (uri) {
        // Enhanced transcription with language detection
        const transcript = await sendAudioToMyWhisperModel(uri);
        setText(transcript);

        if (transcript) {
          await processTranscript(transcript);
        } else {
          setLoading(false);
          Alert.alert(
            "Transcription Error",
            "Could not understand the audio. Please try again."
          );
        }
      }
    } catch (error) {
      console.log("Failed to stop Recording", error);
      Alert.alert("Error", "Failed to process recording");
      setLoading(false);
    }
  };

  // Enhanced Whisper API call with language detection
  const sendAudioToMyWhisperModel = async (uri, retries = 3) => {
    try {
      // Read audio file as base64
      const audioData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await axios.post(
        "http://192.168.0.103:5000/api/v1/ai/transcribe",
        {
          audio_data: uri,
          options: {
            return_timestamps: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer 563@2323re2f2421fewkvn0913u4hfkenrwjlfmw`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        }
      );
      console.log(response)
      // Handle the response format from Hugging Face
      if (response.data.text) {
        // Hugging Face Whisper might not return language info, so we'll detect it from text
        const isHindi = /[\u0900-\u097F]/.test(response.data.text);
        setDetectedLanguage(isHindi ? "hi" : "en");
        return response.data.text;
      } else {
        throw new Error("No transcription returned");
      }
    } catch (error) {
      console.log("Whisper API error:", error);

      // Handle rate limiting (429) and model loading (503)
      if (
        (error.response?.status === 429 || error.response?.status === 503) &&
        retries > 0
      ) {
        const waitTime = error.response?.status === 429 ? 5000 : 10000; // 5s for rate limit, 10s for model loading
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return sendAudioToWhisper(uri, retries - 1);
      }

      // Return error message in detected language
      const isHindi = detectedLanguage === "hi";
      return isHindi
        ? "ऑडियो समझने में समस्या हुई। कृपया फिर से कोशिश करें।"
        : "Could not understand the audio. Please try again.";
    }
  };

  // Process transcript with intelligent handling
  const processTranscript = async (transcript) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: transcript,
            },
          ],
          max_tokens: 200,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      await handleSpecialResponses(aiResponse, transcript);
    } catch (error) {
      console.log("Error processing transcript:", error);
      setLoading(false);
      Alert.alert("AI Error", "Failed to get AI response. Please try again.");
    }
  };

  // Handle special AI responses (health data, caregiver calls, etc.)
  const handleSpecialResponses = async (aiResponse, originalText) => {
    let finalResponse = aiResponse;

    try {
      // Check for special commands in AI response
      if (aiResponse.includes("FETCH_HEALTH_REPORTS")) {
        finalResponse = await fetchHealthData(
          HEALTH_APIS.healthReports,
          "healthReports"
        );
      } else if (aiResponse.includes("FETCH_HEART_BEAT")) {
        finalResponse = await fetchHealthData(
          HEALTH_APIS.heartBeat,
          "heartBeat"
        );
      } else if (aiResponse.includes("CALL_CAREGIVER")) {
        finalResponse = await callCaregiver();
      } else if (aiResponse.includes("FETCH_HEALTH_DATA")) {
        finalResponse = await fetchHealthData(
          HEALTH_APIS.healthReports,
          "healthData"
        );
      } else if (aiResponse.includes("EMERGENCY_CALL")) {
        finalResponse = await handleEmergency();
      }

      setText(finalResponse);
      setLoading(false);
      setAIResponse(true);
      await speakText(finalResponse);
    } catch (error) {
      console.log("Error handling special response:", error);
      setText(aiResponse);
      setLoading(false);
      setAIResponse(true);
      await speakText(aiResponse);
    }
  };

  // Fetch health data from APIs
  const fetchHealthData = async (endpoint, dataType) => {
    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: "Bearer YOUR_HEALTH_API_TOKEN", // Configure with your token
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      });

      return formatHealthResponse(response.data, dataType);
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);

      // Return appropriate error message based on detected language
      if (detectedLanguage === "hi" || detectedLanguage === "hindi") {
        return `${dataType} की जानकारी प्राप्त करने में समस्या है। कृपया बाद में कोशिश करें।`;
      } else {
        return `Unable to fetch ${dataType} information. Please try again later.`;
      }
    }
  };

  // Format health data response
  const formatHealthResponse = (data, type) => {
    const isHindi = detectedLanguage === "hi" || detectedLanguage === "hindi";

    switch (type) {
      case "healthReports":
        return isHindi
          ? `आपकी स्वास्थ्य रिपोर्ट तैयार है। मुख्य बिंदु: ${JSON.stringify(
              data,
              null,
              2
            )}`
          : `Your health report is ready. Key points: ${JSON.stringify(
              data,
              null,
              2
            )}`;
      case "heartBeat":
        const heartRate = data.heartRate || data.pulse || "डेटा उपलब्ध नहीं";
        return isHindi
          ? `आपकी दिल की धड़कन: ${heartRate} बीट प्रति मिनट`
          : `Your heart rate: ${heartRate} beats per minute`;
      case "healthData":
        return isHindi
          ? `आपका स्वास्थ्य डेटा: ${JSON.stringify(data)}`
          : `Your health data: ${JSON.stringify(data)}`;
      default:
        return `${type}: ${JSON.stringify(data)}`;
    }
  };

  // Call caregiver function
  const callCaregiver = async () => {
    try {
      const caregiverNumber = "+1234567890"; // Replace with actual caregiver number
      const phoneUrl = `tel:${caregiverNumber}`;
      const canCall = await Linking.canOpenURL(phoneUrl);

      if (canCall) {
        await Linking.openURL(phoneUrl);
        return detectedLanguage === "hi"
          ? "आपके देखभालकर्ता को कॉल किया जा रहा है..."
          : "Calling your caregiver...";
      } else {
        return detectedLanguage === "hi"
          ? "कॉल करने में समस्या है।"
          : "Unable to make the call.";
      }
    } catch (error) {
      console.error("Caregiver call error:", error);
      return detectedLanguage === "hi"
        ? "देखभालकर्ता को कॉल करने में समस्या है।"
        : "Error calling caregiver.";
    }
  };

  // Handle emergency situations
  const handleEmergency = async () => {
    try {
      // First, try to call emergency services
      const emergencyNumber = "911"; // or local emergency number
      const phoneUrl = `tel:${emergencyNumber}`;

      Alert.alert(
        "Emergency Detected",
        "Do you want to call emergency services?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Call Emergency",
            onPress: async () => {
              const canCall = await Linking.canOpenURL(phoneUrl);
              if (canCall) {
                await Linking.openURL(phoneUrl);
              }
            },
          },
          {
            text: "Call Caregiver",
            onPress: callCaregiver,
          },
        ]
      );

      return detectedLanguage === "hi"
        ? "आपातकाल का पता चला है। मदद मंगाई जा रही है।"
        : "Emergency detected. Getting help.";
    } catch (error) {
      console.error("Emergency handling error:", error);
      return detectedLanguage === "hi"
        ? "आपातकालीन सेवाओं से संपर्क करने में समस्या है।"
        : "Error contacting emergency services.";
    }
  };

  // Enhanced text-to-speech with language detection
  const speakText = async (text) => {
    setAISpeaking(true);

    // Determine voice and language based on detected language
    const isHindi =
      detectedLanguage === "hi" ||
      detectedLanguage === "hindi" ||
      /[\u0900-\u097F]/.test(text); // Check for Devanagari script

    const options = {
      voice: isHindi
        ? "com.apple.ttsbundle.Samiksha-compact" // Hindi voice
        : "com.apple.ttsbundle.Samantha-compact", // English voice
      language: isHindi ? "hi-IN" : "en-US",
      pitch: 1.2,
      rate: 0.9,
      onDone: () => {
        setAISpeaking(false);
      },
      onError: () => {
        setAISpeaking(false);
      },
    };

    Speech.speak(text, options);
  };

  // Reset to initial state
  const resetAssistant = () => {
    setIsRecording(false);
    setAIResponse(false);
    setText("");
    setDetectedLanguage("");
    Speech.stop();
    setAISpeaking(false);
  };

  // Regenerate response
  const regenerateResponse = async () => {
    if (text) {
      setLoading(true);
      await processTranscript(text);
    }
  };

  useEffect(() => {
    if (AISpeaking) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.reset();
    }
  }, [AISpeaking]);

  return (
    <LinearGradient
      colors={["#250152", "#000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle={"light-content"} />

      {/* Background shadows */}
      <Image
        source={require("../../../assets/main/blur.png")}
        style={{
          position: "absolute",
          right: scale(-15),
          top: 0,
          width: scale(240),
        }}
      />
      <Image
        source={require("../../../assets/main/purple-blur.png")}
        style={{
          position: "absolute",
          left: scale(-15),
          bottom: verticalScale(100),
          width: scale(210),
        }}
      />

      {/* Back arrow */}
      {AIResponse && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: verticalScale(50),
            left: scale(20),
          }}
          onPress={resetAssistant}
        >
          <AntDesign name="arrowleft" size={scale(20)} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Language indicator */}
      {detectedLanguage && (
        <View
          style={{
            position: "absolute",
            top: verticalScale(50),
            right: scale(20),
            backgroundColor: "rgba(255,255,255,0.2)",
            paddingHorizontal: scale(10),
            paddingVertical: scale(5),
            borderRadius: scale(15),
          }}
        >
          <Text style={{ color: "#fff", fontSize: scale(12) }}>
            {detectedLanguage.toUpperCase()}
          </Text>
        </View>
      )}

      <View style={{ marginTop: verticalScale(-40) }}>
        {loading ? (
          <TouchableOpacity>
            <LottieView
              source={require("../../../assets/animations/loading.json")}
              autoPlay
              loop
              speed={1.3}
              style={{ width: scale(270), height: scale(270) }}
            />
          </TouchableOpacity>
        ) : (
          <>
            {!isRecording ? (
              <>
                {AIResponse ? (
                  <View>
                    <LottieView
                      ref={lottieRef}
                      source={require("../../../assets/animations/ai-speaking.json")}
                      autoPlay={false}
                      loop={false}
                      style={{ width: scale(250), height: scale(250) }}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      width: scale(110),
                      height: scale(110),
                      backgroundColor: "#fff",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: scale(100),
                      elevation: 5,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                    }}
                    onPress={startRecording}
                  >
                    <FontAwesome
                      name="microphone"
                      size={scale(50)}
                      color="#2b3356"
                    />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity onPress={stopRecording}>
                <LottieView
                  source={require("../../../assets/animations/animation.json")}
                  autoPlay
                  loop
                  speed={1.3}
                  style={{ width: scale(250), height: scale(250) }}
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <View
        style={{
          alignItems: "center",
          width: scale(350),
          position: "absolute",
          bottom: verticalScale(90),
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: scale(16),
            width: scale(320),
            textAlign: "center",
            lineHeight: 25,
            paddingHorizontal: scale(20),
          }}
        >
          {loading
            ? "Processing..."
            : text ||
              "Press the microphone to start speaking! मैं हिंदी और अंग्रेजी दोनों समझ सकता हूं।"}
        </Text>
      </View>

      {AIResponse && (
        <View
          style={{
            position: "absolute",
            bottom: verticalScale(40),
            left: 0,
            paddingHorizontal: scale(30),
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: scale(360),
          }}
        >
          <TouchableOpacity onPress={regenerateResponse}>
            <Regenerate />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => speakText(text)}>
            <Reload />
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#131313",
  },
});
