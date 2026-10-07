const express = require('express');
const mongoose = require('mongoose');
const ragEngine = require('../ragEngine');
const dataSource = require('../dataSource');
const mockData = require('../mockData');
const authMiddleware = require('../authMiddleware');
const rateLimiter = require('../rateLimiter');
const errors = require('../errorHandler');

function buildChatRouter() {
  const router = express.Router();

  function getDocs(userId) {
    if (mongoose.connection.readyState === 1) {
      return dataSource.loadUserDocuments(userId);
    }
    return mockData.loadMockDocuments(userId);
  }

  function makeRag() {
    return new ragEngine(
      process.env.GROQ_API_KEY,
      process.env.EMBEDDINGS_API_KEY,
      process.env.EMBEDDINGS_BASE_URL,
      process.env.EMBEDDINGS_MODEL,
      process.env.EMBEDDINGS_PATH
    );
  }

  router.post(
  '/chat/stream',
  authMiddleware,
  function (req, res, next) { next(); },  // ← middleware بسيط مؤقت
  function (req, res) {
      let question = null;

      try {
        question = errors.validateText(req.body.question, 2000);
      } catch (err) {
        return errors.sendError(res, err);
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      function send(name, data) {
        if (res.writableEnded) return;
        res.write('event: ' + name + '\n');
        res.write('data: ' + JSON.stringify(data) + '\n\n');
      }

      const userId = req.user.id;
      let closed = false;

      req.on('close', function () { closed = true; });

      getDocs(userId).then(function (docs) {
        if (docs.length === 0) {
          send('token', { text: 'Not enough data yet.' });
          send('done', {});
          return res.end();
        }

        const rag = makeRag();

        return rag.ingest(docs).then(function () {
          const onToken = function (token) {
            if (!closed) send('token', { text: token });
          };
          return rag.ask(question, onToken);
        }).then(function (result) {
          if (!closed) {
            send('sources', { sources: result.sources });
            send('done', {});
            res.end();
          }
        });
      }).catch(function (err) {
        console.log('[chat] error:', err.message);
        if (!closed) {
          send('error', {
            error: 'chat_failed',
            message: 'Could not generate answer. Please try again.'
          });
          res.end();
        }
      });
    }
  );

  return router;
}

module.exports = buildChatRouter;