import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Core app translations
      home: "Home",

      patient: "Patient",
      addReminder: "Add Reminder",
      settings: "Settings",
      reminderTitle: "Reminder Title",
      selectTime: "Select Time",
      darkMode: "Dark Mode",
      language: "Language",
      loading: "Loading",
      noReminders: "No reminders yet",
      time: "Time",

      // Settings Screen - completely flat structure with prefixes
      settingsAppearance: "Appearance",
      settingsAccount: "Account",
      settingsAbout: "About & Support",
      settingsLogout: "Logout",
      settingsLogoutConfirmTitle: "Logout",
      settingsLogoutConfirmMessage: "Are you sure you want to logout?",
      settingsLogoutError: "Failed to logout. Please try again.",
      settingsGuest: "Guest",
      settingsProfile: "Profile",
      settingsProfileDescription: "Manage your profile information",
      settingsSecurity: "Security",
      settingsSecurityDescription: "Change password and security settings",
      settingsNotifications: "Notifications",
      settingsNotificationsDescription: "Manage notification preferences",
      settingsHelp: "Help & Support",
      settingsPrivacy: "Privacy Policy",
      settingsTerms: "Terms of Service",
      settingsVersion: "App Version",

      // MyProfile
      myProfile: "My Profile",
      yrs: "year",

      // Common translations
      commonCancel: "Cancel",
      commonLogout: "Logout",
      commonError: "Error",

      //sensor screen translation
      sensorRefresh: "Refreshing...",
      sensorTitle: "📊 Live Sensor Dashboard",
      sensorStartLive: "Start Live Data",
      heartRate: "Heart Rate",
      spO2: "SpO2",
      gyroscope: "Gyroscope",
      accelerometer: "Accelerometer",
      temperature: "Temperature",
      bloodPressure: "Blood Pressure",
      respirationRate: "Respiration Rate",

      //family section
      scrapbookHeader: "Scrapbook Memories",
      scrapbookVoiceNote: "▶ Play Voice Note",
      scrapbookNote1: "Our family picture!",
      scrapbookNote2: "A day at the beach!",
      scrapbookNote3: "Mom's birthday celebration!",
      scrapbookNote4: "Picnic in the park.",
      scrapbookNote5: "Grandma’s secret recipe!",
      scrapbookNote6: "Best friend's wedding day.",

      //Matching Face game
      mazeTitle: "👴 Grandpa's Maze",
      mazeHowToPlay: "How to Play:",
      mazeTutorial1: "Welcome to Grandpa's Maze!",
      mazeTutorial2: "Your goal is to guide Grandpa to meet his grandchild.",
      mazeTutorial3: "You can move Grandpa by tapping on the arrow buttons.",
      mazeTutorial4: "Avoid the blockers (dark red cells) while moving.",
      mazeTutorial5:
        "Once Grandpa reaches the grandchild, you can move on to the next level!",
      mazeTutorial6: "Let's start the game!",
      mazeBack: "Back",
      mazeNext: "Next",
      mazeSuccess: "🎉 Success!",
      mazeSuccessMessage: "Grandpa met his grandchild!",
      mazeCongrats: "🎉 Congratulations!",
      mazeCongratsMessage: "You completed all the levels!",

      //calmtaps game
      calmPuzzleTitle: "🧠 Calm Puzzle",
      calmPuzzleSubtitle: "A relaxing number slide game for mindfulness",
      start: "Start",
      howToPlay: "📘 How to Play",
      tutorialStep1: "1. A grid of numbered tiles will appear.",
      tutorialStep2: "2. One tile will be missing.",
      tutorialStep3: "3. Tap the number near the empty space to slide it.",
      tutorialStep4: "4. Arrange the tiles in order starting from 1.",
      enjoyPuzzle: "🧩 Enjoy the calm and solve the puzzle!",
      chooseLevel: "Choose Level",
      selectDifficulty: "Select Difficulty",
      home: "↩ Home",

      //breathing game
      breathingExerciseTitle: "Breathing Exercise",
      breatheInFor: "Breathe in for {{count}}s...",
      breatheIn: "Inhale",
      hold: "Hold",
      breatheOut: "Exhale",
      start: "Start",
      stop: "Stop",
      focusOnBreathing: "Focus on your breathing!",
    },
  },
  hi: {
    translation: {
      // Core app translations
      patient: "मरीज",
      home: "होम",
      addReminder: "अनुस्मारक जोड़ें",
      settings: "सेटिंग्स",
      reminderTitle: "अनुस्मारक शीर्षक",
      selectTime: "समय चुनें",
      darkMode: "डार्क मोड",
      language: "भाषा",
      loading: "लोड हो रहा है",
      noReminders: "अभी तक कोई अनुस्मारक नहीं",
      time: "समय",

      // Settings Screen - completely flat structure with prefixes
      settingsAppearance: "प्रकटन",
      settingsAccount: "खाता",
      settingsAbout: "सहायता एवं जानकारी",
      settingsLogout: "लॉग आउट",
      settingsLogoutConfirmTitle: "लॉग आउट",
      settingsLogoutConfirmMessage: "क्या आप वाकई लॉग आउट करना चाहते हैं?",
      settingsLogoutError: "लॉगआउट विफल। कृपया पुनः प्रयास करें।",
      settingsGuest: "अतिथि",
      settingsProfile: "प्रोफ़ाइल",
      settingsProfileDescription: "अपनी प्रोफ़ाइल जानकारी प्रबंधित करें",
      settingsSecurity: "सुरक्षा",
      settingsSecurityDescription: "पासवर्ड और सुरक्षा सेटिंग्स बदलें",
      settingsNotifications: "सूचनाएं",
      settingsNotificationsDescription: "सूचना वरीयताएं प्रबंधित करें",
      settingsHelp: "सहायता एवं समर्थन",
      settingsPrivacy: "गोपनीयता नीति",
      settingsTerms: "सेवा की शर्तें",
      settingsVersion: "ऐप संस्करण",

      // My Profile
      myProfile: "मेरी प्रोफाइल",
      yrs: "वर्ष",

      // Common translations
      commonCancel: "रद्द करें",
      commonLogout: "लॉग आउट",
      commonError: "त्रुटि",

      //sensor screen translation
      sensorRefresh: "रीफ़्रेश हो रहा है...",
      sensorTitle: "📊 लाइव सेंसर डैशबोर्ड",
      sensorStartLive: "लाइव डेटा शुरू करें",
      heartRate: "हृदय गति",
      spO2: "SpO2",
      gyroscope: "गायरोस्कोप",
      accelerometer: "एक्सेलेरोमीटर",
      temperature: "तापमान",
      bloodPressure: "रक्तचाप",
      respirationRate: "श्वसन दर",

      //family section
      scrapbookHeader: "स्क्रैपबुक यादें",
      scrapbookVoiceNote: "▶ वॉयस नोट चलाएं",
      scrapbookNote1: "हमारा पारिवारिक चित्र!",
      scrapbookNote2: "समुद्र तट पर एक दिन!",
      scrapbookNote3: "माँ का जन्मदिन मनाना!",
      scrapbookNote4: "पार्क में पिकनिक।",
      scrapbookNote5: "दादी माँ की गुप्त रेसिपी!",
      scrapbookNote6: "सबसे अच्छे दोस्त की शादी का दिन।",

      //Matching Face Game
      mazeTitle: "👴 दादाजी की भूल-भुलैया",
      mazeHowToPlay: "कैसे खेलें:",
      mazeTutorial1: "दादाजी की भूल-भुलैया में आपका स्वागत है!",
      mazeTutorial2: "आपका लक्ष्य है दादाजी को उनके पोते से मिलवाना।",
      mazeTutorial3: "तीर वाले बटन दबाकर दादाजी को चलाएं।",
      mazeTutorial4: "चलते समय ब्लॉकर (गहरे लाल सेल) से बचें।",
      mazeTutorial5:
        "जब दादाजी पोते तक पहुँच जाएं, तो आप अगले स्तर पर जा सकते हैं!",
      mazeTutorial6: "चलो खेल शुरू करते हैं!",
      mazeBack: "पीछे",
      mazeNext: "आगे",
      mazeSuccess: "🎉 सफलता!",
      mazeSuccessMessage: "दादाजी अपने पोते से मिल गए!",
      mazeCongrats: "🎉 बधाई हो!",
      mazeCongratsMessage: "आपने सभी स्तर पूरे कर लिए!",

      //calmtaps game
      calmPuzzleTitle: "🧠 शांत पज़ल",
      calmPuzzleSubtitle: "मानसिक शांति के लिए एक आरामदायक नंबर स्लाइड गेम",
      start: "शुरू करें",
      howToPlay: "📘 कैसे खेलें",
      tutorialStep1: "1. संख्याओं से भरा एक ग्रिड दिखाई देगा।",
      tutorialStep2: "2. एक टाइल गायब होगी।",
      tutorialStep3:
        "3. खाली स्थान के पास की संख्या पर टैप करें ताकि वह सरक सके।",
      tutorialStep4: "4. सभी टाइल्स को 1 से शुरू करके क्रम में लगाएं।",
      enjoyPuzzle: "🧩 शांति का आनंद लें और पज़ल हल करें!",
      chooseLevel: "स्तर चुनें",
      selectDifficulty: "कठिनाई स्तर चुनें",
      home: "↩ होम",

      //breathing game
      breathingExerciseTitle: "सांस लेने का व्यायाम",
      breatheInFor: "{{count}} सेकंड के लिए सांस लें...",
      breatheIn: "सांस लें",
      hold: "रोकें",
      breatheOut: "सांस छोड़ें",
      start: "शुरू करें",
      stop: "रोकें",
      focusOnBreathing: "अपनी सांस पर ध्यान केंद्रित करें!",
    },
  },
};

// Simpler initialization with flattened structure
i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  // Disable nesting feature to avoid potential issues
  nsSeparator: false,
  keySeparator: false,
});

export default i18n;
