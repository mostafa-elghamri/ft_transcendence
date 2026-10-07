require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const buildChatRouter = require('./src/routes/chat');
const buildGroupsRouter = require('./src/routes/groups');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.GROQ_API_KEY) {
  console.log('warning: GROQ_API_KEY missing.');
}

if (!process.env.EMBEDDINGS_API_KEY) {
  console.log('warning: EMBEDDINGS_API_KEY missing. BM25 only.');
}

if (process.env.MOCK_AUTH === 'true') {
  console.log('warning: MOCK_AUTH enabled. Do not use in production.');
}

const PORT = process.env.PORT || 3002;

function start() {
  console.log('DEBUG: registering routes...');

  app.use('/api', buildChatRouter());
  app.use('/api', buildGroupsRouter());

  app.get('/health', function (req, res) {
    const dbConnected = mongoose.connection.readyState === 1;
    res.json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'mock_data',
      llm: process.env.GROQ_API_KEY ? 'configured' : 'not_configured',
      embeddings: process.env.EMBEDDINGS_API_KEY ? 'configured' : 'bm25_only',
      timestamp: new Date().toISOString()
    });
  });

  app.use(function (req, res) {
    res.status(404).json({ error: 'not_found', message: 'Route not found.' });
  });

  app.use(function (err, req, res, next) {
    console.log('[global] error: ' + err.message);
    if (res.headersSent) return next(err);
    res.status(500).json({ error: 'server_error', message: 'Something went wrong.' });
  });

  app.listen(PORT, function () {
    console.log('');
    console.log('Service listening on port ' + PORT);
    console.log('Open: http://localhost:' + PORT);
    console.log('');
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/splitwise';

mongoose.connect(MONGODB_URI)
  .then(function () {
    console.log('✅ MongoDB connected');
    start();
  })
  .catch(function (err) {
    console.error('❌ MongoDB failed: ' + err.message);
    console.log('⚠️  Falling back to mock data');
    start();
  });