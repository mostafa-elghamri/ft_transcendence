var VectorUtils = require('./vectorUtils');
var textNormalizer = require('./textNormalizer');

var MIN_SCORE = 0.05;

class Retriever {

  constructor(vectorizer, chunks) {

    this.vectorizer = vectorizer;
    this.chunks = chunks;
    this.vectors = [];

    for (var i = 0; i < chunks.length; i++) {
      this.vectors.push(
        vectorizer.transform(chunks[i])
      );
    }
  }

  retrieve(query, topK) {

    if (topK === undefined || topK === null) {
      topK = 3;
    }

    query = textNormalizer.expandWithSynonyms(query);

    var queryVector = this.vectorizer.transform(query);
    var scores = [];

    for (var i = 0; i < this.vectors.length; i++) {

      var score = VectorUtils.cosineSimilarity(
        queryVector,
        this.vectors[i]
      );

      if (score >= MIN_SCORE) {
        scores.push({
          index: i,
          score: score
        });
      }
    }

    scores.sort(function (a, b) {
      return b.score - a.score;
    });

    var results = [];

    for (var i = 0; i < scores.length && i < topK; i++) {

      results.push({
        text: this.chunks[scores[i].index],
        score: Number(scores[i].score.toFixed(4))
      });
    }

    return results;
  }
}

module.exports = Retriever;