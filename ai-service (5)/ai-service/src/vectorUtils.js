class VectorUtils {

  static cosineSimilarity(a, b) {

    var dot = 0;
    var normA = 0;
    var normB = 0;

    for (var i = 0; i < a.length; i++) {

      dot = dot + (a[i] * b[i]);

      normA = normA + (a[i] * a[i]);

      normB = normB + (b[i] * b[i]);
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    var denominator =
      Math.sqrt(normA) * Math.sqrt(normB);

    return dot / denominator;
  }
}

module.exports = VectorUtils;