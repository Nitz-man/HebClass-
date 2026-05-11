// Admin settings model
const adminSettings = {
  appTheme: {
    primaryColor: "#6366f1", // Indigo
    secondaryColor: "#ec4899", // Pink
    backgroundColor: "#f8fafc",
    textColor: "#1e293b",
    accentColor: "#f59e0b"
  },
  layout: {
    buttonSize: "large",
    fontSize: 16,
    buttonSpacing: 16
  },
  sounds: {
    enabled: true,
    correctAnswerSound: "correct.mp3",
    wrongAnswerSound: "wrong.mp3",
    backgroundMusic: "bg_music.mp3"
  },
  notifications: {
    whatsappEnabled: false,
    emailEnabled: false,
    inAppEnabled: true
  },
  gameSettings: {
    timeLimitPerQuestion: 30,
    memoryCardFlipTime: 2,
    crosswordHintCost: 5
  }
};

module.exports = adminSettings;
