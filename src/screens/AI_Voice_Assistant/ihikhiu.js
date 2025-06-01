// First install required packages:
// expo install expo-speech expo-av expo-linking
// npm install axios

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Linking,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import axios from "axios";

const VoiceAssistant = () => {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [response, setResponse] = useState("");

  // System prompt for AI to handle different types of requests
  const SYSTEM_PROMPT = `You are Smriti AI Assistant. Handle these requests intelligently:

1. IDENTITY QUESTIONS: When someone asks about your name, identity, who you are, who created you, or similar questions in ANY language, always respond with: "मेरा नाम स्मृति AI असिस्टेंट है"

2. HEALTH REPORTS: When user asks for health reports, medical reports, health data, or similar in any language, respond with: "FETCH_HEALTH_REPORTS"

3. HEART BEAT/PULSE: When user asks for heart rate, pulse, heartbeat, दिल की धड़कन, heart beat check, etc., respond with: "FETCH_HEART_BEAT"

4. CAREGIVER CALL: When user asks to call caregiver, contact caregiver, caregiver ko call karo, or similar, respond with: "CALL_CAREGIVER"

5. OTHER HEALTH QUERIES: For blood pressure, temperature, oxygen level, sugar level, etc., respond with: "FETCH_HEALTH_DATA"

For all other general questions, respond naturally in the same language the user spoke in.

Examples:
- "मेरी health report बताओ" → "FETCH_HEALTH_REPORTS"
- "What's my heart rate?" → "FETCH_HEART_BEAT"  
- "Call my caregiver" → "CALL_CAREGIVER"
- "दिल की धड़कन check करो" → "FETCH_HEART_BEAT"
- "Caregiver ko call karo" → "CALL_CAREGIVER"`;

  // Initialize audio recording and permissions
  useEffect(() => {
    const initializeApp = async () => {
      await Audio.requestPermissionsAsync();
      // Request phone call permissions for caregiver calling
      if (Platform.OS === "android") {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE
        );
      }
    };
    initializeApp();
  }, []);

  // Fetch health data from APIs
  const fetchHealthData = async (endpoint, dataType) => {
    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: "Bearer YOUR_HEALTH_API_TOKEN", // Add if required
          "Content-Type": "application/json",
        },
      });

      return formatHealthResponse(response.data, dataType);
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
      return `${dataType} की जानकारी प्राप्त करने में समस्या है। कृपया बाद में कोशिश करें।`;
    }
  };

  // Format health data response
  const formatHealthResponse = (data, type) => {
    switch (type) {
      case "healthReports":
        return `आपकी स्वास्थ्य रिपोर्ट: ${JSON.stringify(data, null, 2)}`;
      case "heartBeat":
        return `आपकी दिल की धड़कन: ${
          data.heartRate || data.pulse || "डेटा उपलब्ध नहीं"
        } बीट प्रति मिनट`;
      case "bloodPressure":
        return `रक्तचाप: ${data.systolic}/${data.diastolic} mmHg`;
      default:
        return `${type}: ${JSON.stringify(data)}`;
    }
  };

  // Call caregiver function
  const callCaregiver = async () => {
    try {
      // You can integrate with your calling API or use Expo's calling functionality
      const caregiverNumber = "+1234567890"; // Replace with actual caregiver number

      // Option 1: Using Expo Linking to make a call
      const phoneUrl = `tel:${caregiverNumber}`;
      const canCall = await Linking.canOpenURL(phoneUrl);

      if (canCall) {
        await Linking.openURL(phoneUrl);
        return "आपके देखभालकर्ता को कॉल किया जा रहा है...";
      } else {
        return "कॉल करने में समस्या है।";
      }

      // Option 2: API call to backend for automated calling
      /*
      const response = await axios.post('https://simiriti-backend.onrender.com/call-caregiver', {
        patientId: 'USER_ID',
        emergency: false
      });
      return 'देखभालकर्ता को सूचना भेजी गई है।';
      */
    } catch (error) {
      console.error("Caregiver call error:", error);
      return "देखभालकर्ता को कॉल करने में समस्या है।";
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // Stop recording and process
  const stopRecording = async () => {
    console.log("Stopping recording..");
    setRecording(undefined);
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);

    // Process the recorded audio
    await processAudio(uri);
  };

  // Convert audio to text using Google Speech-to-Text API (Free tier)
  const processAudio = async (audioUri) => {
    try {
      // Convert audio to base64
      const response = await fetch(audioUri);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];
        await transcribeAudio(base64Audio);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };

  // Transcribe audio using Google Speech-to-Text API
  const transcribeAudio = async (base64Audio) => {
    try {
      const API_KEY = "YOUR_GOOGLE_CLOUD_API_KEY"; // Replace with your API key

      const requestBody = {
        config: {
          encoding: "WEBM_OPUS",
          sampleRateHertz: 48000,
          languageCode: "hi-IN", // Hindi
          alternativeLanguageCodes: ["en-US", "hi-IN"], // Multi-language detection
          enableAutomaticPunctuation: true,
        },
        audio: {
          content: base64Audio,
        },
      };

      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
        requestBody
      );

      if (response.data.results && response.data.results.length > 0) {
        const transcript = response.data.results[0].alternatives[0].transcript;
        const confidence = response.data.results[0].alternatives[0].confidence;
        const detectedLang = response.data.results[0].languageCode || "unknown";

        setTranscribedText(transcript);
        setDetectedLanguage(detectedLang);

        console.log("Transcribed:", transcript);
        console.log("Language:", detectedLang);
        console.log("Confidence:", confidence);

        // Process the transcribed text
        await generateResponse(transcript, detectedLang);
      }
    } catch (error) {
      console.error("Transcription error:", error);
      Alert.alert("Error", "Failed to transcribe audio");
    }
  };

  // Generate response using AI API with intelligent detection
  const generateResponse = async (text, language) => {
    try {
      // Option 1: Using OpenAI API (Free tier available)
      const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: text,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content;

      // Handle special responses
      await handleSpecialResponses(aiResponse, language);
    } catch (error) {
      console.error("OpenAI API error, trying Hugging Face...", error);

      // Fallback to Hugging Face API
      try {
        const HF_API_KEY = "YOUR_HUGGING_FACE_API_KEY";

        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${text}\nAssistant:`;

        const response = await axios.post(
          "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
          {
            inputs: fullPrompt,
            parameters: {
              max_length: 100,
              temperature: 0.7,
              return_full_text: false,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${HF_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        let aiResponse =
          response.data[0]?.generated_text ||
          "मुझे समझने में कठिनाई हो रही है।";

        // Handle special responses
        await handleSpecialResponses(aiResponse, language);
      } catch (hfError) {
        console.error("All APIs failed:", hfError);
        const fallbackResponse =
          "मुझे समझने में कठिनाई हो रही है। कृपया दोबारा कोशिश करें।";
        setResponse(fallbackResponse);
        speakResponse(fallbackResponse, language);
      }
    }
  };

  // Handle special AI responses (health data, caregiver calls, etc.)
  const handleSpecialResponses = async (aiResponse, language) => {
    let finalResponse = aiResponse;

    // Check for special commands in AI response
    if (aiResponse.includes("FETCH_HEALTH_REPORTS")) {
      finalResponse = await fetchHealthData(
        HEALTH_APIS.healthReports,
        "healthReports"
      );
    } else if (aiResponse.includes("FETCH_HEART_BEAT")) {
      finalResponse = await fetchHealthData(HEALTH_APIS.heartBeat, "heartBeat");
    } else if (aiResponse.includes("CALL_CAREGIVER")) {
      finalResponse = await callCaregiver();
    } else if (aiResponse.includes("FETCH_HEALTH_DATA")) {
      // For general health data, you can expand this based on specific request
      finalResponse = await fetchHealthData(
        HEALTH_APIS.healthReports,
        "healthReports"
      );
    }

    setResponse(finalResponse);
    speakResponse(finalResponse, language);
  };

  // Translate response to Hindi using free API
  const translateToHindi = async (text) => {
    try {
      // Using LibreTranslate (free)
      const response = await axios.post(
        "https://translate.argosopentech.com/translate",
        {
          q: text,
          source: "en",
          target: "hi",
        }
      );

      return response.data.translatedText || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // Speak the response
  const speakResponse = (text, detectedLang) => {
    const language = detectedLang === "hi-IN" ? "hi" : "en";

    Speech.speak(text, {
      language: language,
      pitch: 1.0,
      rate: 0.8,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smriti AI Assistant</Text>

      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? "🛑 Stop" : "🎤 Speak"}
        </Text>
      </TouchableOpacity>

      {detectedLanguage && (
        <Text style={styles.languageText}>
          Detected Language: {detectedLanguage}
        </Text>
      )}

      {transcribedText && (
        <View style={styles.textContainer}>
          <Text style={styles.label}>You said:</Text>
          <Text style={styles.transcribedText}>{transcribedText}</Text>
        </View>
      )}

      {response && (
        <View style={styles.textContainer}>
          <Text style={styles.label}>Smriti AI Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  recordButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  recordingButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  languageText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  textContainer: {
    backgroundColor: "white",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    minWidth: "90%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  transcribedText: {
    fontSize: 16,
    color: "#555",
  },
  responseText: {
    fontSize: 16,
    color: "#2196F3",
  },
});

export default VoiceAssistant;

// Alternative Free APIs for AI Response:

// 1. OpenAI GPT-3.5 Turbo (Best option - Free tier $5 credit)
// 2. Cohere Command Light (Free tier - 100 calls/month)
// 3. Anthropic Claude (Free tier available)
// 4. Google PaLM API (Free tier)
// 5. Hugging Face Inference API (Free tier)

// Example with Google Gemini (Free tier):
/*
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const response = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
  {
    contents: [{
      parts: [{
        text: `${SYSTEM_PROMPT}\n\nUser: ${text}\nAssistant:`
      }]
    }]
  }
);
const aiResponse = response.data.candidates[0].content.parts[0].text;
*/

// The AI will now intelligently detect questions like:
// - "What's your name?" (English)
// - "आपका नाम क्या है?" (Hindi)
// - "Naam kya hai?" (Hinglish)
// - "¿Cuál es tu nombre?" (Spanish)
// - "Wie heißt du?" (German)
// And respond with "मेरा नाम स्मृति AI असिस्टेंट है" for ALL identity questions!

// Usage Instructions:
// 1. Get API keys from Google Cloud (Speech-to-Text) and Hugging Face
// 2. Replace 'YOUR_GOOGLE_CLOUD_API_KEY' and 'YOUR_HUGGING_FACE_API_KEY'
// 3. Install required packages: expo install expo-speech expo-av && npm install axios
// 4. Import and use the VoiceAssistant component in your App.js
