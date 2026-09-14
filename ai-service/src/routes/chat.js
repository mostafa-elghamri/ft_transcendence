var express = require('express');
var RAGEngine = require('../ragEngine');
var LLMClient = require('../llmClient');
var PromptBuilder = require('../promptBuilder');
var dataSource = require('../dataSource');
var mockData = require('../mockData');
var authenticateJWT = require('../authMiddleware');
var rateLimiter = require('../rateLimiter');


function getUserDocuments(db, userId) {
  if (db) {
    return dataSource.loadUserDocuments(db, userId);
  }
  return mockData.loadMockDocuments(userId);
}


function isQuestionValid(question) {
  return question && typeof question === 'string' && question.trim().length > 0;
}


function setupEventStream(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
}


function sendEvent(res, eventName, data) {
  res.write('event: ' + eventName + '\n');
  res.write('data: ' + JSON.stringify(data) + '\n\n');
}

function trackClientConnection(req) {
  var clientDisconnected = false;

  req.on('close', function () {
    clientDisconnected = true;
  });

  return function isClientConnected() {
    return clientDisconnected === false;
  };
}


function streamLLMResponse(apiKey, prompt, res, isClientConnected) {
  var llm = new LLMClient(apiKey);

  return llm.generateStream(prompt, function (token) {
    if (isClientConnected()) {
      sendEvent(res, 'token', { text: token });
    }
  }).then(function () {
    if (isClientConnected()) {
      sendEvent(res, 'done', {});
      res.end();
    }
  }).catch(function (error) {
    console.log('[chat/stream] error:', error);
    sendEvent(res, 'error', { message: 'An unexpected error occurred.' });
    res.end();
  });
}


function respondWithDocuments(res, question, documents, apiKey, isClientConnected) {
  if (documents.length === 0) {
    sendEvent(res, 'token', { text: 'Not enough data available yet.' });
    sendEvent(res, 'done', {});
    res.end();
    return;
  }

  var rag = new RAGEngine(apiKey);
  rag.ingest(documents);

  var retrievedDocs = rag.retriever.retrieve(question, 3);
  sendEvent(res, 'sources', { sources: retrievedDocs });

  var promptBuilder = new PromptBuilder();
  var prompt = promptBuilder.build(question, retrievedDocs);

  streamLLMResponse(apiKey, prompt, res, isClientConnected);
}


function handleChatStream(db) {
  return function (req, res) {
    var question = req.body.question;

    if (!isQuestionValid(question)) {
      res.status(400).json({ error: 'Please provide a non-empty question field.' });
      return;
    }

    setupEventStream(res);

    var isClientConnected = trackClientConnection(req);

    getUserDocuments(db, req.user.id).then(function (documents) {
      respondWithDocuments(res, question, documents, process.env.GROQ_API_KEY, isClientConnected);
    }).catch(function (error) {
      console.log('[chat/stream] data fetch error:', error);
      sendEvent(res, 'error', { message: 'An unexpected error occurred.' });
      res.end();
    });
  };
}


function buildChatRouter(db) {
  var router = express.Router();

  router.post('/chat/stream', authenticateJWT, rateLimiter.chatRateLimiter, handleChatStream(db));

  return router;
}


module.exports = buildChatRouter;