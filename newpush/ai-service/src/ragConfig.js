function getBm25Weight() {
  if (process.env.RAG_BM25_WEIGHT) {
    return parseFloat(process.env.RAG_BM25_WEIGHT);
  }

  return 0.5;
}

function getSemanticWeight() {
  if (process.env.RAG_SEMANTIC_WEIGHT) {
    return parseFloat(process.env.RAG_SEMANTIC_WEIGHT);
  }

  return 0.5;
}

function getTopK() {
  if (process.env.RAG_TOP_K) {
    return parseInt(process.env.RAG_TOP_K, 10);
  }

  return 5;
}

module.exports = {
  getBm25Weight,
  getSemanticWeight,
  getTopK
};