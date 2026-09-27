var rateLimit = require('express-rate-limit');

var chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: function (req) {
    if (req.user && req.user.id) {
      return 'user:' + req.user.id;
    } else {
      return req.ip;
    }
  },
  handler: function (req, res) {
    res.status(429).json({
      error: 'لقد تجاوزت الحد المسموح من الأسئلة (15 سؤال في الدقيقة). الرجاء الانتظار قليلاً.'
    });
  }
});

module.exports = { chatRateLimiter: chatRateLimiter };
