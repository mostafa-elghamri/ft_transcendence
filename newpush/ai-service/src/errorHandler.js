class appError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function badRequest(message) {
  return new appError('bad_request', message, 400);
}

function tooLong(message) {
  return new appError('too_long', message, 400);
}

function unauthorized(message) {
  return new appError('unauthorized', message, 401);
}

function forbidden(message) {
  return new appError('forbidden', message, 403);
}

function notFound(message) {
  return new appError('not_found', message, 404);
}

function rateLimited(message) {
  return new appError('rate_limited', message, 429);
}

function llmFailed(message) {
  return new appError('llm_failed', message, 502);
}

function serverError(message) {
  return new appError('server_error', message, 500);
}

function sendError(res, err) {
  let status = 500;
  let code = 'server_error';
  let message = 'Something went wrong.';

  if (err instanceof appError) {
    status = err.status;
    code = err.code;
    message = err.message;
  }

  console.log('[error] ' + code + ': ' + err.message);

  res.status(status).json({
    error: code,
    message: message
  });
}

function validateText(text, maxLen) {
  if (!text || typeof text !== 'string') {
    throw badRequest('Text field is required.');
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    throw badRequest('Text cannot be empty.');
  }

  if (trimmed.length > maxLen) {
    throw tooLong('Text too long. Max ' + maxLen + ' characters.');
  }

  return trimmed;
}

module.exports = {
  appError,
  badRequest,
  tooLong,
  unauthorized,
  forbidden,
  notFound,
  rateLimited,
  llmFailed,
  serverError,
  sendError,
  validateText
};