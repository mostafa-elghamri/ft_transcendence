const express = require('express');
const llmClient = require('../llmClient');
const authMiddleware = require('../authMiddleware');
const rateLimiter = require('../rateLimiter');
const errors = require('../errorHandler');

function buildModerationRouter() {
  const router = express.Router();
  const llm = new llmClient(process.env.GROQ_API_KEY);

  router.post(
    '/moderate',
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
      prompt = prompt + 'Analyze the text below and decide if it contains abusive, violent, hateful or harassing content.\n';
      prompt = prompt + 'Reply with JSON only in this exact shape:\n';
      prompt = prompt + '{"safe": true, "category": "none", "reason": "..."}\n\n';
      prompt = prompt + 'Text: """' + text + '"""';

      llm.generate(prompt).then(function (raw) {
        const parsed = parseModeration(raw);
        res.json(parsed);
      }).catch(function (err) {
        console.log('[moderation] error:', err.message);
        errors.sendError(res, errors.llmFailed('Could not analyze content.'));
      });
    }
  );

  return router;
}

function parseModeration(raw) {
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
    return { safe: true, category: 'none', reason: 'parse failed' };
  }

  if (typeof parsed.safe !== 'boolean') {
    parsed.safe = true;
  }

  if (typeof parsed.category !== 'string') {
    parsed.category = 'none';
  }

  if (typeof parsed.reason !== 'string') {
    parsed.reason = '';
  }

  return parsed;
}

module.exports = buildModerationRouter;