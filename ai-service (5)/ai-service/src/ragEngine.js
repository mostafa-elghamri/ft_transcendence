var TextChunker = require('./chunker');
var TfidfVectorizer = require('./vectorizer');
var Retriever = require('./retriever');
var PromptBuilder = require('./promptBuilder');
var LLMClient = require('./llmClient');

class RAGEngine {

  constructor(key) {
    this.chunker = new TextChunker(300, 50);
    this.vectorizer = new TfidfVectorizer();
    this.prompt = new PromptBuilder();
    this.llm = new LLMClient(key);
    this.retriever = null;
  }

  ingest(docs) {

    var chunks = [];

    for (var i = 0; i < docs.length; i++) {

      var parts = this.chunker.split(docs[i]);

      for (var j = 0; j < parts.length; j++) {
        chunks.push(parts[j]);
      }
    }

    this.vectorizer.fit(chunks);

    this.retriever = new Retriever(
      this.vectorizer,
      chunks
    );

    console.log(
      '[RAG] تم استيعاب ' + chunks.length + ' مقطع نصي.'
    );
  }

  ask(query) {

    if (this.retriever === null) {
      return Promise.reject(
        new Error('يجب استدعاء ingest() قبل ask().')
      );
    }

    var docs = this.retriever.retrieve(query, 3);

    var p = this.prompt.build(query, docs);

    return this.llm.generate(p)
      .then(function (answer) {

        return {
          answer: answer,
          sources: docs
        };

      });
  }
}

module.exports = RAGEngine;