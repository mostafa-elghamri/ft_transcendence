class VectorUtils {
  static cosineSimilarity(vecA, vecB) {
    var dotProduct = 0;
    var normA = 0;
    var normB = 0;

    for (var i = 0; i < vecA.length; i++) {
      dotProduct = dotProduct + (vecA[i] * vecB[i]);
      normA = normA + (vecA[i] * vecA[i]);
      normB = normB + (vecB[i] * vecB[i]);
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    var denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return dotProduct / denominator;
  }
}

module.exports = VectorUtils;
