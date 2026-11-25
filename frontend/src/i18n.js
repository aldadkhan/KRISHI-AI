import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    brand: 'KRISHI AI', subtitle: 'AI-Based Farmer Query Support & Advisory System',
    login: 'Sign in', register: 'Create account', yourName: 'Your name',
    email: 'Email address', password: 'Password',
    dashboard: 'Dashboard', ask: 'Ask Krishi AI', weather: 'Weather',
    schemes: 'Government Schemes', history: 'Query History', profile: 'Profile',
    question: 'Describe your farming problem...', crop: 'Crop', district: 'District',
    getAdvice: 'Get Advisory', logout: 'Sign out', language: 'Language',
    welcome: 'Farmer Dashboard', confidence: 'AI confidence', officer: 'Contact Agriculture Officer'
  }},
  ml: { translation: {
    brand: 'കൃഷി AI', subtitle: 'കർഷക ചോദ്യ സഹായവും കാർഷിക ഉപദേശ സംവിധാനവും',
    login: 'ലോഗിൻ', register: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക', yourName: 'നിങ്ങളുടെ പേര്',
    email: 'ഇമെയിൽ വിലാസം', password: 'പാസ്‌വേഡ്',
    dashboard: 'ഡാഷ്ബോർഡ്', ask: 'കൃഷി AI-യോട് ചോദിക്കുക', weather: 'കാലാവസ്ഥ',
    schemes: 'സർക്കാർ പദ്ധതികൾ', history: 'ചോദ്യ ചരിത്രം', profile: 'പ്രൊഫൈൽ',
    question: 'നിങ്ങളുടെ കാർഷിക പ്രശ്നം വിവരിക്കുക...', crop: 'വിള', district: 'ജില്ല',
    getAdvice: 'ഉപദേശം നേടുക', logout: 'പുറത്തിറങ്ങുക', language: 'ഭാഷ',
    welcome: 'കർഷക ഡാഷ്ബോർഡ്', confidence: 'AI വിശ്വാസ്യത', officer: 'കാർഷിക ഉദ്യോഗസ്ഥനെ ബന്ധപ്പെടുക'
  }},
  kn: { translation: {
    brand: 'ಕೃಷಿ AI', subtitle: 'ರೈತರ ಪ್ರಶ್ನೆ ಸಹಾಯ ಮತ್ತು ಕೃಷಿ ಸಲಹಾ ವ್ಯವಸ್ಥೆ',
    login: 'ಲಾಗಿನ್', register: 'ಖಾತೆ ರಚಿಸಿ', yourName: 'ನಿಮ್ಮ ಹೆಸರು',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ', password: 'ಪಾಸ್‌ವರ್ಡ್',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', ask: 'ಕೃಷಿ AI ಕೇಳಿ', weather: 'ಹವಾಮಾನ',
    schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', history: 'ಪ್ರಶ್ನೆ ಇತಿಹಾಸ', profile: 'ಪ್ರೊಫೈಲ್',
    question: 'ನಿಮ್ಮ ಕೃಷಿ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ...', crop: 'ಬೆಳೆ', district: 'ಜಿಲ್ಲೆ',
    getAdvice: 'ಸಲಹೆ ಪಡೆಯಿರಿ', logout: 'ಲಾಗ್‌ಔಟ್', language: 'ಭಾಷೆ',
    welcome: 'ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', confidence: 'AI ವಿಶ್ವಾಸ', officer: 'ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ'
  }}
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
