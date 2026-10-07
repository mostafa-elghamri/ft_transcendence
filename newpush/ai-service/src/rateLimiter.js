const rateLimit = require('express-rate-limit');

function keyFn(req) {
  if (req.user && req.user.id) {
    return 'user:' + req.user.id;
  }
  return 'ip:' + req.ip;
}

function makeLimiter(max, message) {
  return rateLimit({
    windowMs: 60 * 1000,
    max: max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyFn,
    handler: function (req, res) {
      res.status(429).json({
        error: 'rate_limit_exceeded',
        message: message,
        retryAfter: 60
      });
    }
  });
}

const chatRateLimiter = makeLimiter(15, 'Too many chat requests. Max 15 per minute.');
const aiRateLimiter = makeLimiter(30, 'Too many AI requests. Max 30 per minute.');
const streamRateLimiter = makeLimiter(5, 'Too many stream requests. Max 5 per minute.');

module.exports = {
  chatRateLimiter,
  aiRateLimiter,
  streamRateLimiter
};