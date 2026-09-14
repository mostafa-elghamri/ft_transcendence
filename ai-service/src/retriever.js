var VectorUtils = require('./vectorUtils');
var textNormalizer = require('./textNormalizer');

var MIN_RELEVANCE_SCORE = 0.05;

class Retriever {
  constructor(vectorizer, chunks) {
    this.vectorizer = vectorizer;
    this.chunks = chunks;
    this.chunkVectors = [];

    for (var i = 0; i < chunks.length; i++) {
      var vector = vectorizer.transform(chunks[i]);
      this.chunkVectors.push(vector);
    }
  }

  retrieve(query, topK) {
    if (topK === undefined || topK === null) {
      topK = 3;
    }

    var expandedQuery = textNormalizer.expandWithSynonyms(query);
    var queryVector = this.vectorizer.transform(expandedQuery);

    var scores = [];

    for (var i = 0; i < this.chunkVectors.length; i++) {
      var similarity = VectorUtils.cosineSimilarity(queryVector, this.chunkVectors[i]);
      scores.push({ index: i, score: similarity });
    }

    scores.sort(function (a, b) {
      return b.score - a.score;
    });

    var filtered = [];

    for (var j = 0; j < scores.length; j++) {
      if (scores[j].score >= MIN_RELEVANCE_SCORE) {
        filtered.push(scores[j]);
      }
    }

    var limited = filtered.slice(0, topK);
    var results = [];

    for (var k = 0; k < limited.length; k++) {
      var chunkText = this.chunks[limited[k].index];
      var roundedScore = Number(limited[k].score.toFixed(4));
      results.push({ text: chunkText, score: roundedScore });
    }

    return results;
  }
}

module.exports = Retriever;
