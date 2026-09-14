var https = require('https');

var PREFERRED_MODEL_HINTS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant'
];

var MODEL_LIST_CACHE_MS = 10 * 60 * 1000;

class LLMClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('GROQ_API_KEY مطلوب. لا يمكن تشغيل LLMClient بدون مفتاح حقيقي.');
    }

    this.apiKey = apiKey;
    this._modelCache = { list: null, fetchedAt: 0 };
  }

  _request(path, method, body) {
    var self = this;

    return new Promise(function (resolve, reject) {
      var postData = null;

      if (body) {
        postData = JSON.stringify(body);
      }

      var headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + self.apiKey
      };

      if (postData !== null) {
        headers['Content-Length'] = Buffer.byteLength(postData);
      }

      var options = {
        hostname: 'api.groq.com',
        path: path,
        method: method,
        headers: headers
      };

      var request = https.request(options, function (response) {
        var raw = '';

        response.on('data', function (chunk) {
          raw = raw + chunk;
        });

        response.on('end', function () {
          try {
            var parsed = JSON.parse(raw);
            resolve(parsed);
          } catch (parseError) {
            reject(new Error('تعذر تحليل رد Groq: ' + raw));
          }
        });
      });

      request.on('error', function (connectionError) {
        reject(new Error('خطأ في الاتصال بـ Groq: ' + connectionError.message));
      });

      if (postData !== null) {
        request.write(postData);
      }

      request.end();
    });
  }

  _getActiveModels() {
    var self = this;
    var timeSinceFetch = Date.now() - self._modelCache.fetchedAt;
    var isFresh = timeSinceFetch < MODEL_LIST_CACHE_MS;

    if (self._modelCache.list !== null && isFresh === true) {
      return Promise.resolve(self._modelCache.list);
    }

    return self._request('/openai/v1/models', 'GET', null).then(function (data) {
      if (!data.data) {
        throw new Error('تعذر جلب قائمة الموديلات من Groq: ' + JSON.stringify(data));
      }

      var textModels = [];

      for (var i = 0; i < data.data.length; i++) {
        var model = data.data[i];
        var isActive = true;

        if (model.active === false) {
          isActive = false;
        }

        var isForbidden = /whisper|guard|tts|orpheus/i.test(model.id);

        if (isActive === true && isForbidden === false) {
          textModels.push(model.id);
        }
      }

      var preferred = [];

      for (var p = 0; p < PREFERRED_MODEL_HINTS.length; p++) {
        var hint = PREFERRED_MODEL_HINTS[p];

        if (textModels.indexOf(hint) !== -1) {
          preferred.push(hint);
        }
      }

      var rest = [];

      for (var r = 0; r < textModels.length; r++) {
        var modelId = textModels[r];

        if (preferred.indexOf(modelId) === -1) {
          rest.push(modelId);
        }
      }

      var ordered = preferred.concat(rest);

      self._modelCache = { list: ordered, fetchedAt: Date.now() };

      return ordered;
    });
  }

  _callModel(modelName, prompt) {
    var body = {
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    };

    return this._request('/openai/v1/chat/completions', 'POST', body).then(function (data) {
      if (data.error) {
        throw new Error('[' + modelName + '] ' + data.error.message);
      }

      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }

      throw new Error('[' + modelName + '] لم يتمكن النموذج من توليد إجابة.');
    });
  }

  generate(prompt) {
    var self = this;

    return self._getActiveModels().then(function (models) {
      if (models.length === 0) {
        return 'لا توجد موديلات نصية نشطة على هذا الحساب حالياً.';
      }

      var attempt = function (index, errors) {
        if (index >= models.length) {
          return 'فشلت كل الموديلات المتاحة:\n' + errors.join('\n');
        }

        return self._callModel(models[index], prompt).catch(function (err) {
          errors.push(err.message);
          return attempt(index + 1, errors);
        });
      };

      return attempt(0, []);
    }).catch(function (err) {
      return 'تعذر جلب قائمة الموديلات: ' + err.message;
    });
  }

  generateStream(prompt, onToken) {
    var self = this;

    return self._getActiveModels().then(function (models) {
      var tryModel = function (index) {
        if (index >= models.length) {
          var failMessage = 'تعذر توليد إجابة (فشلت كل النماذج المتاحة).';
          onToken(failMessage);
          return failMessage;
        }

        return self._streamModel(models[index], prompt, onToken).catch(function () {
          return tryModel(index + 1);
        });
      };

      return tryModel(0);
    }).catch(function (err) {
      var errorMessage = 'تعذر جلب قائمة الموديلات: ' + err.message;
      onToken(errorMessage);
      return errorMessage;
    });
  }

  _streamModel(modelName, prompt, onToken) {
    var self = this;

    return new Promise(function (resolve, reject) {
      var postData = JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        stream: true
      });

      var options = {
        hostname: 'api.groq.com',
        path: '/openai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + self.apiKey,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      var fullText = '';
      var buffer = '';
      var receivedAnyToken = false;

      var request = https.request(options, function (response) {
        if (response.statusCode >= 400) {
          var errorBody = '';

          response.on('data', function (chunk) {
            errorBody = errorBody + chunk;
          });

          response.on('end', function () {
            reject(new Error('[' + modelName + '] HTTP ' + response.statusCode + ': ' + errorBody));
          });

          return;
        }

        response.on('data', function (chunk) {
          buffer = buffer + chunk.toString();
          var lines = buffer.split('\n');
          buffer = lines.pop();

          for (var i = 0; i < lines.length; i++) {
            var trimmedLine = lines[i].trim();

            if (trimmedLine.indexOf('data:') !== 0) {
              continue;
            }

            var dataContent = trimmedLine.slice(5).trim();

            if (dataContent === '[DONE]') {
              continue;
            }

            try {
              var json = JSON.parse(dataContent);
              var token = null;

              if (json.choices && json.choices.length > 0) {
                if (json.choices[0].delta && json.choices[0].delta.content) {
                  token = json.choices[0].delta.content;
                }
              }

              if (token) {
                fullText = fullText + token;
                receivedAnyToken = true;
                onToken(token);
              }
            } catch (parseError) {
              continue;
            }
          }
        });

        response.on('end', function () {
          if (receivedAnyToken === false) {
            reject(new Error('[' + modelName + '] لم يُرجع أي محتوى.'));
          } else {
            resolve(fullText);
          }
        });
      });

      request.on('error', function (connectionError) {
        reject(new Error('خطأ اتصال streaming: ' + connectionError.message));
      });

      request.write(postData);
      request.end();
    });
  }
}

module.exports = LLMClient;
