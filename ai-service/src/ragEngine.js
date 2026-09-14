var TextChunker = require('./chunker');
var TfidfVectorizer = require('./vectorizer');
var Retriever = require('./retriever');
var PromptBuilder = require('./promptBuilder');
var LLMClient = require('./llmClient');

class RAGEngine {
  constructor(llmApiKey) {
    this.chunker = new TextChunker(300, 50);
    this.vectorizer = new TfidfVectorizer();
    this.promptBuilder = new PromptBuilder();
    this.llmClient = new LLMClient(llmApiKey);
    this.retriever = null;
  }

  ingest(documents) {
    var allChunks = [];

    for (var i = 0; i < documents.length; i++) {
      var pieces = this.chunker.split(documents[i]);

      for (var j = 0; j < pieces.length; j++) {
        allChunks.push(pieces[j]);
      }
    }

    this.vectorizer.fit(allChunks);
    this.retriever = new Retriever(this.vectorizer, allChunks);

    console.log('[RAG] تم استيعاب ' + allChunks.length + ' مقطع نصي.');
  }

  ask(query) 
  {
    var self = this;

    if (self.retriever === null) {
      return Promise.reject(new Error('يجب استدعاء ingest() قبل ask().'));
    }

    var retrievedDocs = self.retriever.retrieve(query, 3);
    var prompt = self.promptBuilder.build(query, retrievedDocs);

    return self.llmClient.generate(prompt).then(function (answer) {
      return { answer: answer, sources: retrievedDocs };
    });
  }
}

module.exports = RAGEngine;
