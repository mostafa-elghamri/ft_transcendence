const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' });
  }

  const token = authHeader.split(' ')[1];

  if (process.env.MOCK_AUTH === 'true') {
    const id = Number(token);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(401).json({
        error: 'MOCK_AUTH is enabled: send a numeric user id like 1 instead of a token'
      });
    }

    req.user = { id };
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id || payload.sub || payload.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token: user id missing' });
    }

    req.user = { id: userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticateJWT;