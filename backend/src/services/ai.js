import axios from 'axios';

export async function getAdvisory(payload) {
  try {
    const { data } = await axios.post(`${process.env.AI_URL}/advisory`, payload, { timeout: 15000 });
    return data;
  } catch (error) {
    return {
      answer: payload.language === 'ml'
        ? 'AI സേവനം ഇപ്പോൾ ലഭ്യമല്ല. ദയവായി കാർഷിക ഉദ്യോഗസ്ഥനെ ബന്ധപ്പെടുക.'
        : payload.language === 'kn'
          ? 'AI സേവനം ഇപ്പോൾ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.'
          : 'AI service is currently unavailable. Please contact an agriculture officer.',
      confidence: 0,
      needsOfficer: true,
      sources: []
    };
  }
}
