var textNormalizer = require('./textNormalizer');

class TfidfVectorizer {
  constructor() {
    this.vocabulary = {};
    this.idfVector = [];
  }

  tokenize(text) {
    var lowerText = text.toLowerCase();
    var normalized = textNormalizer.normalizeArabic(lowerText);
    var cleaned = normalized.replace(/[^\w\s\u0600-\u06FF]/g, ' ');
    var pieces = cleaned.split(/\s+/);
    var tokens = [];

    for (var i = 0; i < pieces.length; i++) {
      if (pieces[i].length > 1) {
        tokens.push(pieces[i]);
      }
    }

    return tokens;
  }

  fit(documents) {
    var docTermCounts = [];

    for (var docIndex = 0; docIndex < documents.length; docIndex++) {
      var counts = {};
      var terms = this.tokenize(documents[docIndex]);

      for (var termIndex = 0; termIndex < terms.length; termIndex++) {
        var term = terms[termIndex];

        if (counts[term] === undefined) {
          counts[term] = 1;
        } else {
          counts[term] = counts[term] + 1;
        }

        if (this.vocabulary[term] === undefined) {
          var currentSize = Object.keys(this.vocabulary).length;
          this.vocabulary[term] = currentSize;
        }
      }

      docTermCounts.push(counts);
    }

    var vocabSize = Object.keys(this.vocabulary).length;
    var docFreq = [];

    for (var i = 0; i < vocabSize; i++) {
      docFreq.push(0);
    }

    for (var d = 0; d < docTermCounts.length; d++) {
      var currentCounts = docTermCounts[d];

      for (var term in currentCounts) {
        var termPosition = this.vocabulary[term];
        docFreq[termPosition] = docFreq[termPosition] + 1;
      }
    }

    this.idfVector = [];

    for (var f = 0; f < docFreq.length; f++) {
      var value = Math.log((documents.length + 1) / (docFreq[f] + 1)) + 1;
      this.idfVector.push(value);
    }
  }

  transform(text) {
    var counts = {};
    var terms = this.tokenize(text);

    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];

      if (this.vocabulary[term] !== undefined) {
        if (counts[term] === undefined) {
          counts[term] = 1;
        } else {
          counts[term] = counts[term] + 1;
        }
      }
    }

    var vocabSize = Object.keys(this.vocabulary).length;
    var vector = [];

    for (var v = 0; v < vocabSize; v++) {
      vector.push(0);
    }

    for (var term2 in counts) {
      var position = this.vocabulary[term2];
      vector[position] = counts[term2] * this.idfVector[position];
    }

    return vector;
  }
}

module.exports = TfidfVectorizer;
