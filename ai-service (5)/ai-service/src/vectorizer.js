var textNormalizer = require('./textNormalizer');

class TfidfVectorizer {

  constructor() {
    this.vocab = {};
    this.idf = [];
  }

  tokenize(text) {

    var text = textNormalizer.normalizeArabic(
      text.toLowerCase()
    );

    var clean = text.replace(
      /[^\w\s\u0600-\u06FF]/g,
      ' '
    );

    var words = clean.split(/\s+/);

    var result = [];

    for (var i = 0; i < words.length; i++) {

      if (words[i].length > 1) {
        result.push(words[i]);
      }
    }

    return result;
  }

  fit(docs) {

    var docCounts = [];

    for (var i = 0; i < docs.length; i++) {

      var counts = {};
      var words = this.tokenize(docs[i]);

      for (var j = 0; j < words.length; j++) {

        var word = words[j];

        counts[word] = (counts[word] || 0) + 1;

        if (this.vocab[word] === undefined) {
          this.vocab[word] =
            Object.keys(this.vocab).length;
        }
      }

      docCounts.push(counts);
    }

    var size = Object.keys(this.vocab).length;
    var docFreq = Array(size).fill(0);

    for (var i = 0; i < docCounts.length; i++) {

      var counts = docCounts[i];

      for (var word in counts) {

        var pos = this.vocab[word];

        docFreq[pos]++;
      }
    }

    this.idf = [];

    for (var i = 0; i < docFreq.length; i++) {

      var df = docFreq[i];

      this.idf.push(
        Math.log(
          (docs.length + 1) / (df + 1)
        ) + 1
      );
    }
  }

  transform(text) {

    var counts = {};
    var words = this.tokenize(text);

    for (var i = 0; i < words.length; i++) {

      var word = words[i];

      if (this.vocab[word] !== undefined) {
        counts[word] = (counts[word] || 0) + 1;
      }
    }

    var vector = Array(
      Object.keys(this.vocab).length
    ).fill(0);

    for (var word in counts) {

      var pos = this.vocab[word];

      vector[pos] =
        counts[word] * this.idf[pos];
    }

    return vector;
  }
}

module.exports = TfidfVectorizer;