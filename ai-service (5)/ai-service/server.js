require('dotenv').config();

var express = require('express');
var cors = require('cors');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;

var buildChatRouter = require('./src/routes/chat');
var buildSentimentRouter = require('./src/routes/sentiment');

var app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (
  !process.env.GROQ_API_KEY ||
  process.env.GROQ_API_KEY === 'ضع_مفتاحك_هنا'
) {
  console.log(
    'تحذير: GROQ_API_KEY غير موجود في .env. الشات سيعمل بوضع تجريبي فقط.'
  );
}

if (!process.env.JWT_SECRET) {
  console.log(
    'تحذير: JWT_SECRET غير موجود في .env.'
  );
}

var PORT = process.env.PORT || 3002;


function startServer(db) {

  app.use('/api', buildChatRouter(db));
  app.use('/api', buildSentimentRouter());

  app.get('/health', function (req, res) {

    var database = 'not_configured';

    if (db) {
      database = 'connected';
    }

    var llm = 'not_configured';

    if (process.env.GROQ_API_KEY) {
      llm = 'configured';
    }

    res.json({
      status: 'ok',
      database: database,
      llm: llm,
      timestamp: new Date().toISOString()
    });
  });


  app.listen(PORT, function () {
    console.log(
      'الخدمة تعمل الآن على المنفذ ' + PORT
    );
  });
}


if (process.env.MONGODB_URI) {

  var dbName = process.env.MONGODB_DB_NAME || 'splitwise';

  MongoClient
    .connect(process.env.MONGODB_URI)
    .then(function (client) {

      var db = client.db(dbName);

      console.log(
        'متصل بقاعدة بيانات MongoDB باسم ' + dbName
      );

      startServer(db);
    })
    .catch(function (error) {

      console.log(
        'فشل الاتصال بقاعدة بيانات MongoDB: ' +
        error.message
      );

      console.log(
        'سيتم تشغيل الخدمة بدون قاعدة بيانات.'
      );

      startServer(null);
    });

} else {

  console.log(
    'تحذير: لا توجد MONGODB_URI. سيتم استخدام بيانات تجريبية للشات.'
  );

  startServer(null);
}