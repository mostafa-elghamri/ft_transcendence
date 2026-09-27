var express = require('express');
var LLMClient = require('../llmClient');
var authenticateJWT = require('../authMiddleware');
var rateLimiter = require('../rateLimiter');

function buildSentimentRouter() {
  var router = express.Router();
  var llm = new LLMClient(process.env.GROQ_API_KEY);

  router.post('/sentiment', authenticateJWT, rateLimiter.chatRateLimiter, function (req, res) {
    var text = req.body.text;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'الرجاء إرسال حقل text نصي غير فارغ.' });
      return;
    }

    var prompt = '';
    prompt = prompt + 'صنّف مشاعر النص التالي إلى واحدة فقط من هذه الفئات بالضبط: positive أو negative أو neutral.\n';
    prompt = prompt + 'أجب بصيغة JSON فقط وبدون أي شرح إضافي، بهذا الشكل بالضبط:\n';
    prompt = prompt + '{"sentiment": "positive|negative|neutral", "confidence": 0.0}\n\n';
    prompt = prompt + 'النص: """' + text + '"""';

    llm.generate(prompt).then(function (raw) {
      var parsed;

      try {
        var match = raw.match(/\{[\s\S]*\}/);

        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          parsed = JSON.parse(raw);
        }
      } catch (parseError) {
        parsed = { sentiment: 'neutral', confidence: 0, raw: raw };
      }

      res.json(parsed);
    }).catch(function (error) {
      console.log('[sentiment] خطأ:', error);
      res.status(500).json({ error: 'تعذر تحليل المشاعر.' });
    });
  });

  return router;
}

module.exports = buildSentimentRouter;
