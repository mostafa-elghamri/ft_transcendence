const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' });
  }

  const token = header.split(' ')[1];

  if (!token || token.trim().length === 0) {
    return res.status(401).json({ error: 'Empty token' });
  }

  if (process.env.MOCK_AUTH === 'true') {
    const id = token;

    if (!id || id.length < 1) {
      return res.status(401).json({ error: 'empty mock id' });
    }

    const asNumber = Number(id);

    if (Number.isInteger(asNumber) && asNumber > 0) {
      req.user = { id: asNumber };
    } else {
      req.user = { id: id };
    }

    return next();
  }

  if (!process.env.JWT_SECRET) {
    console.error('[auth] JWT_SECRET missing');
    return res.status(500).json({ error: 'Server auth misconfigured' });
  }

  let payload = null;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }

  let userId = payload.id || payload.sub || payload.userId;

  if (typeof userId === 'string') {
    const n = Number(userId);
    if (Number.isInteger(n) && n > 0) {
      userId = n;
    }
  }

  if (!userId) {
    return res.status(401).json({ error: 'user id missing' });
  }

  req.user = {
    id: userId,
    email: payload.email || null,
    role: payload.role || 'user'
  };

  next();
}

module.exports = authMiddleware;