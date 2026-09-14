require('dotenv').config();

var express = require('express');
var cors = require('cors');
var path = require('path');

var db = null;

function validateEnvironment() {
  if (!process.env.GROQ_API_KEY) {
    console.log('Error: GROQ_API_KEY is missing in the .env file');
    console.log('A real key must be added from https://console.groq.com/keys before starting the service.');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.log('Error: JWT_SECRET is missing in the .env file');
    console.log('This value must exactly match the one used by the main backend.');
    process.exit(1);
  }
}

function connectDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('Warning: No DATABASE_URL found. Demo data will be used for the chat.');
    return null;
  }

  var Pool = require('pg').Pool;
  console.log('Connected to the real database.');
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

function createApp() {
  var app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  return app;
}

function registerRoutes(app) {
  var buildChatRouter = require('./src/routes/chat');
  var buildSentimentRouter = require('./src/routes/sentiment');

  app.use('/api', buildChatRouter(db));
  app.use('/api', buildSentimentRouter());

  app.get('/health', function (req, res) {
    var databaseStatus = db ? 'connected' : 'not_configured';

    res.json({
      status: 'ok',
      database: databaseStatus,
      llm: 'configured',
      timestamp: new Date().toISOString()
    });
  });
}

function startServer(app) {
  var PORT = process.env.PORT || 3002;

  app.listen(PORT, function () {
    console.log('Service is now running on port ' + PORT);
  });
}

function main() {
  validateEnvironment();

  db = connectDatabase();

  var app = createApp();
  registerRoutes(app);
  startServer(app);
}

main();