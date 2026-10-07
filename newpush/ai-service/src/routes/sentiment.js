const express = require('express');
const llmClient = require('../llmClient');
const authMiddleware = require('../authMiddleware');
const rateLimiter = require('../rateLimiter');
const errors = require('../errorHandler');

function buildSentimentRouter() {
  const router = express.Router();
  const llm = new llmClient(process.env.GROQ_API_KEY);

  router.post(
    '/sentiment',
    authMiddleware,
    rateLimiter.aiRateLimiter,
    function (req, res) {
      let text = null;

      try {
        text = errors.validateText(req.body.text, 2000);
      } catch (err) {
        return errors.sendError(res, err);
      }

      let prompt = '';
      prompt = prompt + 'Classify the sentiment of the text below into exactly one of these three labels: ';
      prompt = prompt + 'positive, negative, neutral.\n';
      prompt = prompt + 'Reply with JSON only in this exact shape:\n';
      prompt = prompt + '{"sentiment": "positive|negative|neutral", "confidence": 0.0}\n\n';
      prompt = prompt + 'Text: """' + text + '"""';

      llm.generate(prompt).then(function (raw) {
        const parsed = parseSentiment(raw);
        res.json(parsed);
      }).catch(function (err) {
        console.log('[sentiment] error:', err.message);
        errors.sendError(res, errors.llmFailed('Could not analyze sentiment.'));
      });
    }
  );

  return router;
}

function parseSentiment(raw) {
  let parsed = null;

  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    let slice = raw;

    if (start !== -1 && end !== -1 && end > start) {
      slice = raw.slice(start, end + 1);
    }

    parsed = JSON.parse(slice);
  } catch (e) {
    return { sentiment: 'neutral', confidence: 0 };
  }

  const label = parsed.sentiment;

  if (label !== 'positive' && label !== 'negative' && label !== 'neutral') {
    parsed.sentiment = 'neutral';
  }

  if (typeof parsed.confidence !== 'number') {
    parsed.confidence = 0;
  }

  return parsed;
}

module.exports = buildSentimentRouter;