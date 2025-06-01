// First install required packages:
// expo install expo-speech expo-av
// npm install axios

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import axios from "axios";

const VoiceAssistant = () => {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [response, setResponse] = useState("");

  // System prompt for AI to handle identity questions
  const SYSTEM_PROMPT = `You are Smriti AI Assistant. When someone asks about your name, identity, who you are, who created you, or similar questions in ANY language (English, Hindi, Hinglish, or any other language), always respond with: "मेरा नाम स्मृति AI असिस्टेंट है" (Mera naam Smriti AI Assistant hai).

For all other questions, respond naturally in the same language the user spoke in.

Examples of identity questions you should respond to with "मेरा नाम स्मृति AI असिस्टेंट है":
- What is your name? / आपका नाम क्या है? / kya hai apka naam?
- Who are you? / आप कौन हैं? / aap kaun ho?
- Tell me about yourself / अपने बारे में बताएं
- What are you? / आप क्या हैं?
- Who made you? / आपको किसने बनाया?

Always detect the intent, not exact phrases.`;



  // Initialize audio recording
  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

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
      setResponse(aiResponse);
      speakResponse(aiResponse, language);
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

        setResponse(aiResponse);
        speakResponse(aiResponse, language);
      } catch (hfError) {
        console.error("Hugging Face API error, trying Cohere...", hfError);

        // Fallback to Cohere API (Free tier)
        try {
          const COHERE_API_KEY = "YOUR_COHERE_API_KEY";

          const response = await axios.post(
            "https://api.cohere.ai/v1/generate",
            {
              model: "command-light",
              prompt: `${SYSTEM_PROMPT}\n\nUser: ${text}\nAssistant:`,
              max_tokens: 100,
              temperature: 0.7,
            },
            {
              headers: {
                Authorization: `Bearer ${COHERE_API_KEY}`,
                "Content-Type": "application/json",
              },
            }
          );

          const aiResponse = response.data.generations[0].text.trim();
          setResponse(aiResponse);
          speakResponse(aiResponse, language);
        } catch (cohereError) {
          console.error("All APIs failed:", cohereError);
          const fallbackResponse =
            "मुझे समझने में कठिनाई हो रही है। कृपया दोबारा कोशिश करें।";
          setResponse(fallbackResponse);
          speakResponse(fallbackResponse, language);
        }
      }
    }
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

// Alternative free APIs you can use:

// 1. For Speech-to-Text (Free alternatives):
// - AssemblyAI (Free tier)
// - Deepgram (Free tier)
// - Rev.ai (Free tier)

// 2. For Text Generation (Free alternatives):
// - Cohere API (Free tier)
// - OpenAI GPT-3.5 (Free tier with limits)
// - Anthropic Claude (Free tier)

// 3. For Translation (Free alternatives):
// - Google Translate API (Free tier)
// - Microsoft Translator (Free tier)
// - LibreTranslate (Open source, free)

// Usage Instructions:
// 1. Get API keys from Google Cloud (Speech-to-Text) and Hugging Face
// 2. Replace 'YOUR_GOOGLE_CLOUD_API_KEY' and 'YOUR_HUGGING_FACE_API_KEY'
// 3. Install required packages: expo install expo-speech expo-av && npm install axios
// 4. Import and use the VoiceAssistant component in your App.js
