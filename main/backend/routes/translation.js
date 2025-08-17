const express = require('express');
const auth = require('../middleware/auth');
const { validateRequest, translateSchema } = require('../middleware/validation');
const { preprocessText } = require('../utils/preprocess');
const { translateText } = require('../utils/translate');

const router = express.Router();

// Translate text with preprocessing
router.post('/', auth, validateRequest(translateSchema), async (req, res) => {
  try {
    const { text, targetLanguage, enablePreprocessing = true } = req.body;
    
    let processedText = text;
    let preprocessingFlags = {
      hadShortforms: false,
      hadSlang: false,
      hadSarcasm: false
    };

    // Preprocess text if enabled
    if (enablePreprocessing) {
      const preprocessResult = await preprocessText(text);
      processedText = preprocessResult.processed;
      preprocessingFlags = preprocessResult.flags;
    }

    // Translate text
    const translationResult = await translateText(processedText, targetLanguage);

    res.json({
      original: text,
      preprocessed: processedText,
      translated: translationResult.translatedText,
      targetLanguage,
      confidence: translationResult.confidence,
      preprocessing: preprocessingFlags,
      detectedLanguage: translationResult.detectedLanguage
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      message: 'Translation failed', 
      error: error.message,
      // Fallback response
      original: req.body.text,
      preprocessed: req.body.text,
      translated: req.body.text,
      targetLanguage: req.body.targetLanguage,
      confidence: 0,
      preprocessing: {
        hadShortforms: false,
        hadSlang: false,
        hadSarcasm: false
      }
    });
  }
});

// Get supported languages
router.get('/languages', auth, async (req, res) => {
  try {
    const supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
    ];

    res.json({ languages: supportedLanguages });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Failed to get languages', error: error.message });
  }
});

// Detect language of text
router.post('/detect', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const { detectLanguage } = require('../utils/translate');
    const detectionResult = await detectLanguage(text);

    res.json({
      detectedLanguage: detectionResult.language,
      confidence: detectionResult.confidence
    });

  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({ 
      message: 'Language detection failed', 
      error: error.message,
      detectedLanguage: 'en',
      confidence: 0
    });
  }
});

module.exports = router;