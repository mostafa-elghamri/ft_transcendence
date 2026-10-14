const https = require('https');

const TIMEOUT = 30000;

class embeddingsClient {
  constructor(apiKey, model, baseUrl, path) {
    this.enabled = !!(apiKey && apiKey.trim());
    this.apiKey = apiKey;
    this.model = model || 'jina-embeddings-v3';
    this.host = baseUrl || 'api.jina.ai';
    this.path = path || '/v1/embeddings';
    this.cache = {};
  }

  isEnabled() {
    return this.enabled;
  }

  request(input) {
    const self = this;
    const body = JSON.stringify({ model: this.model, input: input });

    return new Promise(function (resolve, reject) {
      const req = https.request({
        hostname: self.host,
        path: self.path,
        method: 'POST',
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.apiKey,
          'Content-Length': Buffer.byteLength(body)
        }
      }, function (res) {
        let raw = '';
        res.on('data', function (c) { raw += c; });
        res.on('end', function () {
          if (res.statusCode >= 400) {
            return reject(new Error('[embeddings] HTTP ' + res.statusCode));
          }
          try {
            const json = JSON.parse(raw);
            if (!json.data || json.data.length !== input.length) {
              return reject(new Error('[embeddings] bad response'));
            }
            resolve(json.data.map(d => d.embedding));
          } catch (e) {
            reject(new Error('[embeddings] invalid JSON'));
          }
        });
      });

      req.on('timeout', function () { req.destroy(); reject(new Error('timeout')); });
      req.on('error', function (e) { reject(new Error(e.message)); });
      req.write(body);
      req.end();
    });
  }

  embed(text) {
    if (!this.enabled) return Promise.resolve(null);
    if (this.cache[text]) return Promise.resolve(this.cache[text]);

    return this.request([text]).then(data => {
      this.cache[text] = data[0];
      return data[0];
    });
  }

  embedBatch(texts) {
    if (!this.enabled) return Promise.resolve(null);
    return this.request(texts);
  }
}

module.exports = embeddingsClient;