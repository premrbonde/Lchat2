const { Translate } = require('@google-cloud/translate').v2;

// Initialize Google Translate client
let translate;
try {
  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    translate = new Translate({
      key: process.env.GOOGLE_TRANSLATE_API_KEY,
      projectId: 'lchat-translation' // Optional: set your project ID
    });
  }
} catch (error) {
  console.error('Google Translate initialization error:', error);
  translate = null;
}

// Mock translation service for development/testing
const mockTranslations = {
  'en': {
    'mr': {
      'hello': 'नमस्कार',
      'how are you': 'तू कसा आहेस',
      'good morning': 'सुप्रभात',
      'thank you': 'धन्यवाद',
      'i love you': 'मी तुझ्यावर प्रेम करतो'
    },
    'te': {
      'hello': 'హలో',
      'how are you': 'మీరు ఎలా ఉన్నారు',
      'good morning': 'శుభోదయం',
      'thank you': 'ధన్యవాదాలు',
      'i love you': 'నేను నిన్ను ప్రేమిస్తున్నాను'
    },
    'ta': {
      'hello': 'வணக்கம்',
      'how are you': 'நீங்கள் எப்படி இருக்கிறீர்கள்',
      'good morning': 'காலை வணக்கம்',
      'thank you': 'நன்றி',
      'i love you': 'நான் உன்னை காதலிக்கிறேன்'
    }
  }
};

// Language mappings
const languageMappings = {
  'en': 'English',
  'mr': 'Marathi',
  'te': 'Telugu',
  'ta': 'Tamil'
};

async function translateText(text, targetLanguage, sourceLanguage = 'auto') {
  try {
    // Use Google Translate API if available
    if (translate) {
      const [translation, metadata] = await translate.translate(text, {
        from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        to: targetLanguage
      });

      return {
        translatedText: translation,
        detectedLanguage: metadata?.detectedSourceLanguage || sourceLanguage,
        confidence: 0.95 // Google Translate doesn't provide confidence scores
      };
    } 
    
    // Fallback to mock translation for development
    else {
      console.log('Using mock translation service (Google API key not configured)');
      
      const lowerText = text.toLowerCase().trim();
      const mockData = mockTranslations['en']?.[targetLanguage];
      
      if (mockData && mockData[lowerText]) {
        return {
          translatedText: mockData[lowerText],
          detectedLanguage: 'en',
          confidence: 0.8
        };
      }
      
      // Simple mock translation by adding language prefix
      const langName = languageMappings[targetLanguage] || targetLanguage;
      return {
        translatedText: `[${langName}] ${text}`,
        detectedLanguage: 'en',
        confidence: 0.5
      };
    }

  } catch (error) {
    console.error('Translation error:', error);
    
    // Return original text on error
    return {
      translatedText: text,
      detectedLanguage: sourceLanguage,
      confidence: 0,
      error: error.message
    };
  }
}

async function detectLanguage(text) {
  try {
    if (translate) {
      const [detections] = await translate.detect(text);
      const detection = Array.isArray(detections) ? detections[0] : detections;
      
      return {
        language: detection.language,
        confidence: detection.confidence || 0.8
      };
    } else {
      // Simple language detection fallback
      const englishPattern = /^[a-zA-Z0-9\s.,!?'"()-]+$/;
      if (englishPattern.test(text)) {
        return { language: 'en', confidence: 0.7 };
      } else {
        return { language: 'unknown', confidence: 0.3 };
      }
    }
  } catch (error) {
    console.error('Language detection error:', error);
    return { language: 'en', confidence: 0 };
  }
}

async function getSupportedLanguages() {
  try {
    if (translate) {
      const [languages] = await translate.getLanguages();
      return languages.filter(lang => 
        ['en', 'mr', 'te', 'ta'].includes(lang.code)
      );
    } else {
      return [
        { code: 'en', name: 'English' },
        { code: 'mr', name: 'Marathi' },
        { code: 'te', name: 'Telugu' },
        { code: 'ta', name: 'Tamil' }
      ];
    }
  } catch (error) {
    console.error('Get languages error:', error);
    return [
      { code: 'en', name: 'English' },
      { code: 'mr', name: 'Marathi' },
      { code: 'te', name: 'Telugu' },
      { code: 'ta', name: 'Tamil' }
    ];
  }
}

// Batch translation for multiple texts
async function translateBatch(texts, targetLanguage, sourceLanguage = 'auto') {
  try {
    if (translate && texts.length > 1) {
      const [translations] = await translate.translate(texts, {
        from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        to: targetLanguage
      });

      return translations.map((translation, index) => ({
        original: texts[index],
        translated: translation,
        targetLanguage
      }));
    } else {
      // Fallback to individual translations
      const results = [];
      for (const text of texts) {
        const result = await translateText(text, targetLanguage, sourceLanguage);
        results.push({
          original: text,
          translated: result.translatedText,
          targetLanguage
        });
      }
      return results;
    }
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts.map(text => ({
      original: text,
      translated: text,
      targetLanguage,
      error: error.message
    }));
  }
}

// Test translation function
async function testTranslation() {
  const testCases = [
    { text: 'Hello, how are you?', target: 'mr' },
    { text: 'Good morning!', target: 'te' },
    { text: 'Thank you very much', target: 'ta' },
    { text: 'I hope you have a great day', target: 'mr' }
  ];

  console.log('Testing translation service:\n');

  for (const testCase of testCases) {
    try {
      const result = await translateText(testCase.text, testCase.target);
      console.log(`Original (${result.detectedLanguage}): ${testCase.text}`);
      console.log(`Translated (${testCase.target}): ${result.translatedText}`);
      console.log(`Confidence: ${result.confidence}`);
      console.log('---');
    } catch (error) {
      console.error(`Translation failed for "${testCase.text}":`, error.message);
    }
  }
}

module.exports = {
  translateText,
  detectLanguage,
  getSupportedLanguages,
  translateBatch,
  testTranslation
};